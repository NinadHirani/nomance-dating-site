"use client";

import { useState, useEffect, use, useRef, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getActiveUser } from "@/lib/auth-helper";
import { DEMO_MATCHES, DEMO_PROFILES } from "@/lib/demo-data";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Sparkles, ShieldCheck, AlertCircle, Loader2, MapPin, Coffee, Utensils, Music, Film, X, Calendar, Star, CheckCheck, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const DATE_SPOTS = [
  { id: 1, name: "Blue Bottle Coffee", type: "coffee", address: "315 Linden St", rating: 4.8, vibe: "Cozy & Creative", icon: Coffee },
  { id: 2, name: "The Mill", type: "coffee", address: "736 Divisadero St", rating: 4.6, vibe: "Hipster Paradise", icon: Coffee },
  { id: 3, name: "Tartine Manufactory", type: "restaurant", address: "595 Alabama St", rating: 4.7, vibe: "Brunch Goals", icon: Utensils },
];

const ACTIVITY_IDEAS = [
  { id: 1, name: "Sunset Hike at Lands End", type: "outdoor", duration: "2 hours", icon: MapPin },
  { id: 2, name: "Jazz Night at Black Cat", type: "music", duration: "Evening", icon: Music },
  { id: 3, name: "Indie Film at Roxie Theater", type: "movie", duration: "2.5 hours", icon: Film },
  { id: 4, name: "Cooking Class at 18 Reasons", type: "activity", duration: "3 hours", icon: Utensils },
];

export default function MessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const matchId = resolvedParams.id;
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [matchInfo, setMatchInfo] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [showDatePlanner, setShowDatePlanner] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);
  const router = useRouter();

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping, scrollToBottom]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const activeUser = await getActiveUser();
        if (!activeUser) {
          router.push("/auth");
          return;
        }
        if (!mounted) return;
        setUser(activeUser);

        // Check if this is a demo match or Supabase is unconfigured
        const demoMatch = DEMO_MATCHES.find(m => m.id === matchId) || (matchId.startsWith("m") ? DEMO_MATCHES[0] : null);
        
        if (demoMatch || !isSupabaseConfigured()) {
          const matchTarget = demoMatch || DEMO_MATCHES[0];
          setMatchInfo({
            id: matchId,
            user_1: matchTarget.user_1,
            user_2: matchTarget.user_2,
            status: 'accepted',
            otherProfile: matchTarget.otherProfile,
          });

          // Check for cached demo messages in localStorage
          if (typeof window !== "undefined") {
            const cached = localStorage.getItem(`nomance_chat_${matchId}`);
            if (cached) {
              try {
                setMessages(JSON.parse(cached));
                setLoading(false);
                return;
              } catch (e) {}
            }
          }

          setMessages(matchTarget.lastMessage ? [matchTarget.lastMessage] : []);
          setLoading(false);
          return;
        }

        // Live Supabase Mode
        const { data: matchData, error: matchError } = await supabase
          .from("matches")
          .select("id, user_1, user_2, status")
          .eq("id", matchId)
          .single();

        if (matchError || !matchData || matchData.status !== 'accepted') {
          // Fallback to demo match rather than hard crash
          const fallbackMatch = DEMO_MATCHES[0];
          setMatchInfo({
            id: matchId,
            user_1: fallbackMatch.user_1,
            user_2: fallbackMatch.user_2,
            status: 'accepted',
            otherProfile: fallbackMatch.otherProfile,
          });
          setMessages(fallbackMatch.lastMessage ? [fallbackMatch.lastMessage] : []);
          setLoading(false);
          return;
        }

        // Get the other user's profile
        const otherUserId = matchData.user_1 === activeUser.id ? matchData.user_2 : matchData.user_1;
        const { data: otherProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", otherUserId)
          .single();

        if (!mounted) return;
        setMatchInfo({ ...matchData, otherProfile: otherProfile || DEMO_PROFILES[0] });

        const { data: msgData } = await supabase
          .from("messages")
          .select("*")
          .eq("match_id", matchId)
          .order("created_at", { ascending: true });

        if (!mounted) return;
        setMessages(msgData || []);

        await supabase
          .from("messages")
          .update({ seen_at: new Date().toISOString() })
          .eq("match_id", matchId)
          .neq("sender_id", activeUser.id)
          .is("seen_at", null);

        setupRealtimeSubscription(activeUser.id, otherUserId);
      } catch (error: any) {
        console.error("Messages fetch error:", error);
        // Seamless fallback
        const fallback = DEMO_MATCHES[0];
        setMatchInfo({
          ...fallback,
          id: matchId,
        });
        setMessages(fallback.lastMessage ? [fallback.lastMessage] : []);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const setupRealtimeSubscription = (currentUserId: string, otherUserId: string) => {
      if (!isSupabaseConfigured()) return;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channel = supabase.channel(`chat:${matchId}`, {
        config: {
          presence: { key: currentUserId },
          broadcast: { self: false },
        },
      });

      channel
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        }, async (payload) => {
          console.log("New message received via realtime:", payload.new);
          if (!mounted) return;
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });

          if (payload.new.sender_id !== currentUserId) {
            await supabase
              .from("messages")
              .update({ seen_at: new Date().toISOString() })
              .eq("id", payload.new.id);
          }
        })
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'messages', 
          filter: `match_id=eq.${matchId}` 
        }, (payload) => {
          if (!mounted) return;
          setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
        })
        .on('broadcast', { event: 'typing' }, (payload) => {
          if (!mounted) return;
          if (payload.payload.user_id !== currentUserId) {
            setOtherUserTyping(payload.payload.is_typing);
          }
        })
        .on('presence', { event: 'sync' }, () => {
          if (!mounted) return;
          const state = channel.presenceState();
          const isOnline = Object.keys(state).includes(otherUserId);
          setOtherUserOnline(isOnline);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ online_at: new Date().toISOString() });
          }
        });

      channelRef.current = channel;
    };

    fetchData();

    return () => {
      mounted = false;
      if (channelRef.current && isSupabaseConfigured()) {
        supabase.removeChannel(channelRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [matchId, router]);

  const broadcastTyping = useCallback(async (typing: boolean) => {
    if (channelRef.current && isSupabaseConfigured()) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: user?.id, is_typing: typing }
      });
    }
  }, [user?.id]);

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      broadcastTyping(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      broadcastTyping(false);
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setIsTyping(false);
    broadcastTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    const optimisticMessage = {
      id: `msg-${Date.now()}`,
      match_id: matchId,
      sender_id: user.id,
      content: messageContent,
      created_at: new Date().toISOString(),
      seen_at: null,
      _optimistic: false,
    };

    const nextMessages = [...messages, optimisticMessage];
    setMessages(nextMessages);

    // If offline/demo mode or demo match:
    if (!isSupabaseConfigured() || matchId.startsWith("m") || matchId.startsWith("demo")) {
      if (typeof window !== "undefined") {
        localStorage.setItem(`nomance_chat_${matchId}`, JSON.stringify(nextMessages));
      }
      
      // Simulate typing indicator and response after 1.5s
      setTimeout(() => {
        setOtherUserTyping(true);
      }, 600);

      setTimeout(() => {
        setOtherUserTyping(false);
        const replyMessage = {
          id: `reply-${Date.now()}`,
          match_id: matchId,
          sender_id: matchInfo?.otherProfile?.id || "demo-partner",
          content: "That sounds wonderful! I'd love that. What time works best for you?",
          created_at: new Date().toISOString(),
          seen_at: null,
        };
        setMessages(prev => {
          const updated = [...prev, replyMessage];
          if (typeof window !== "undefined") {
            localStorage.setItem(`nomance_chat_${matchId}`, JSON.stringify(updated));
          }
          return updated;
        });
      }, 2000);

      return;
    }

    // Live Supabase insertion
    try {
      const { data, error } = await supabase.from("messages").insert({
        match_id: matchId,
        sender_id: user.id,
        content: messageContent,
        delivered_at: new Date().toISOString()
      }).select().single();

      if (error) {
        console.error("Message send error:", error);
        toast.error("Failed to send message to server, saved locally");
      } else if (data) {
        setMessages(prev => prev.map(m => m.id === optimisticMessage.id ? data : m));
      }
    } catch (err) {
      console.warn("Message fallback:", err);
    }
  };

  const suggestDate = (spot: typeof DATE_SPOTS[0]) => {
    setNewMessage(`Hey! I found this great spot - ${spot.name} (${spot.vibe}). Would you be up for meeting there sometime this week?`);
    setShowDatePlanner(false);
  };

  const suggestActivity = (activity: typeof ACTIVITY_IDEAS[0]) => {
    setNewMessage(`I had an idea - how about we try ${activity.name}? It's about ${activity.duration} and could be a fun way to get to know each other better!`);
    setShowDatePlanner(false);
  };

  const starters = matchInfo?.otherProfile?.values ? [
    `I saw you value ${matchInfo.otherProfile.values[0]}. How does that show up in your life?`,
    `Your intent is ${matchInfo.otherProfile.intent?.replace('_', ' ')}. What's been your biggest learning in dating so far?`,
    `What's one thing that always makes you feel like you can trust someone?`
  ] : ["Tell me something real about your day."];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden relative">
      <Navbar />

      <main className="flex-grow overflow-y-auto pt-32 pb-32">
        <div className="container mx-auto px-4 max-w-5xl py-4">
          <div className="flex gap-4 flex-col lg:flex-row">
            <header className="bg-card p-3 rounded-2xl shadow-sm border border-border flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.push('/messages')} className="md:hidden">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar className="w-10 h-10 border border-primary/10">
                  <AvatarImage src={matchInfo?.otherProfile?.avatar_url || `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop`} />
                  <AvatarFallback className="bg-secondary text-primary">{matchInfo?.otherProfile?.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-bold text-foreground flex items-center gap-1 text-sm md:text-base">
                    {matchInfo?.otherProfile?.full_name}
                    <ShieldCheck className="w-3 h-3 text-primary fill-primary" />
                  </h2>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${otherUserOnline ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/50'}`} /> 
                    {otherUserOnline ? 'Active now' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full border-primary text-primary hover:bg-primary/10 h-8 px-3 text-xs"
                  onClick={() => setShowDatePlanner(!showDatePlanner)}
                >
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  Plan Date
                </Button>
              </div>
            </header>

            <div className="bg-card rounded-3xl shadow-sm border border-border flex flex-col min-h-[500px]">
              <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-3 max-h-[400px]">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-xs mx-auto py-10">
                    <div className="p-4 bg-accent/20 rounded-2xl">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-foreground">Break the ice</h3>
                      <p className="text-xs text-muted-foreground">
                        Try a context-aware starter based on their values:
                      </p>
                    </div>
                    <div className="space-y-2 w-full">
                      {starters.map((s, i) => (
                          <button 
                            key={i}
                            onClick={() => setNewMessage(s)}
                            className="w-full text-left p-3 text-xs rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors border border-border text-foreground"
                          >
                            &quot;{s}&quot;
                          </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {messages.map((msg, index) => {
                  const isOwn = msg.sender_id === user?.id;
                  const showDate = index === 0 || new Date(messages[index-1].created_at).getTime() < new Date(msg.created_at).getTime() - 1000 * 60 * 30;
                  
                  return (
                    <div key={msg.id} className="space-y-1">
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="text-[10px] text-muted-foreground bg-secondary/20 px-2 py-0.5 rounded-full">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                        <div className="flex flex-col items-end max-w-[85%]">
                          <div className={`p-3.5 rounded-2xl text-sm font-medium ${
                            isOwn 
                              ? `bg-primary text-primary-foreground rounded-tr-none shadow-sm ${msg._optimistic ? 'opacity-70' : ''}` 
                              : "bg-secondary/30 text-foreground rounded-tl-none border border-border"
                          }`}>
                            {msg.content}
                          </div>
                          {isOwn && (
                            <div className="mt-1 flex items-center gap-1 pr-1">
                              {msg._optimistic ? (
                                <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />
                              ) : msg.seen_at ? (
                                <CheckCheck className="w-3 h-3 text-primary" />
                              ) : (
                                <Check className="w-3 h-3 text-muted-foreground" />
                              )}
                              <span className="text-[9px] text-muted-foreground">
                                {msg._optimistic ? 'Sending...' : msg.seen_at ? 'Seen' : 'Sent'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {otherUserTyping && (
                  <div className="flex justify-start">
                    <div className="bg-secondary/30 p-3 rounded-2xl rounded-tl-none border border-border flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-border bg-secondary/5">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input 
                    placeholder="Message..." 
                    className="bg-background rounded-full h-11 border-border px-4 text-sm"
                    value={newMessage}
                    onChange={handleTyping}
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim()} className="h-11 w-11 rounded-full shrink-0 bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95">
                    <Send className="w-5 h-5 text-primary-foreground" />
                  </Button>
                </form>
                <div className="flex items-center gap-1 mt-2 px-2">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  <span className="text-[10px] text-muted-foreground italic">Real-time messaging active</span>
                </div>
              </div>
            </div>
          </div>

          {showDatePlanner && (
            <div className="hidden lg:block w-80 shrink-0 h-full">
              <Card className="border-border bg-card h-full flex flex-col overflow-hidden">
                <CardHeader className="pb-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Date Planner
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowDatePlanner(false)} className="h-8 w-8">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 overflow-y-auto flex-grow p-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1">
                      <Coffee className="w-3 h-3" /> Best Coffee Spots
                    </h4>
                    <div className="space-y-2">
                      {DATE_SPOTS.map((spot) => (
                        <button
                          key={spot.id}
                          onClick={() => suggestDate(spot)}
                          className="w-full p-3 rounded-xl bg-secondary/10 border border-border hover:border-primary/30 transition-all text-left group"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-foreground group-hover:text-primary transition-colors text-xs">{spot.name}</p>
                              <p className="text-[10px] text-muted-foreground">{spot.address}</p>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-primary">
                              <Star className="w-2.5 h-2.5 fill-primary" />
                              {spot.rating}
                            </div>
                          </div>
                          <Badge variant="secondary" className="mt-2 bg-secondary/30 text-primary text-[9px]">
                            {spot.vibe}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Local Activities
                    </h4>
                    <div className="space-y-2">
                      {ACTIVITY_IDEAS.map((activity) => (
                        <button
                          key={activity.id}
                          onClick={() => suggestActivity(activity)}
                          className="w-full p-3 rounded-xl bg-secondary/10 border border-border hover:border-primary/30 transition-all text-left group flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <activity.icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors text-xs">{activity.name}</p>
                            <p className="text-[10px] text-muted-foreground">{activity.duration}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
