"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Sparkles, ShieldCheck, AlertCircle, Loader2, MapPin, Coffee, Film, Utensils, Music, X, Calendar, Star } from "lucide-react";
import { toast } from "sonner";

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

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select(`
          id,
          user_1,
          user_2,
          profiles_user_1:user_1 (*),
          profiles_user_2:user_2 (*)
        `)
        .eq("id", matchId)
        .single();

      if (matchError) {
        toast.error("Could not load match info");
      } else {
        const otherProfile = matchData.user_1 === user.id ? matchData.profiles_user_2 : matchData.profiles_user_1;
        setMatchInfo({ ...matchData, otherProfile });
      }

      const { data: msgData } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      setMessages(msgData || []);
      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel(`match:${matchId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` }, payload => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const { error } = await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: user.id,
      content: newMessage.trim()
    });

    if (error) {
      toast.error("Failed to send message");
    } else {
      setNewMessage("");
    }
  };

  const suggestDate = (spot: typeof DATE_SPOTS[0]) => {
    setNewMessage(`Hey! I found this great spot - ${spot.name} (${spot.vibe}). Would you be up for meeting there sometime this week?`);
    setShowDatePlanner(false);
    toast.success("Date suggestion ready to send!");
  };

  const suggestActivity = (activity: typeof ACTIVITY_IDEAS[0]) => {
    setNewMessage(`I had an idea - how about we try ${activity.name}? It's about ${activity.duration} and could be a fun way to get to know each other better!`);
    setShowDatePlanner(false);
    toast.success("Activity suggestion ready to send!");
  };

  const starters = matchInfo?.otherProfile?.values ? [
    `I saw you value ${matchInfo.otherProfile.values[0]}. How does that show up in your life?`,
    `Your intent is ${matchInfo.otherProfile.intent.replace('_', ' ')}. What's been your biggest learning in dating so far?`,
    `What's one thing that always makes you feel like you can trust someone?`
  ] : ["Tell me something real about your day."];

  const shouldShowDatePlanner = messages.length >= 3;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-6 flex flex-col container mx-auto px-4 max-w-6xl">
        <div className="flex gap-6 flex-grow">
          {/* Main Chat Area */}
          <div className="flex-grow flex flex-col">
            {/* Chat Header */}
            <header className="bg-card p-4 rounded-2xl shadow-sm border border-border flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-primary/10">
                  <AvatarImage src={matchInfo?.otherProfile?.avatar_url || `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop`} />
                  <AvatarFallback className="bg-secondary text-primary">{matchInfo?.otherProfile?.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-bold text-foreground flex items-center gap-1">
                    {matchInfo?.otherProfile?.full_name}
                    <ShieldCheck className="w-3 h-3 text-primary fill-primary" />
                  </h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    Looking for: <span className="font-bold text-primary uppercase tracking-tighter">{matchInfo?.otherProfile?.intent?.replace('_', ' ')}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {shouldShowDatePlanner && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full border-primary text-primary hover:bg-primary/10"
                    onClick={() => setShowDatePlanner(!showDatePlanner)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Plan a Date
                  </Button>
                )}
                <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
                  High Intent Match
                </Badge>
              </div>
            </header>

            {/* Message Bubble Area */}
            <div className="flex-grow bg-card rounded-3xl shadow-sm border border-border overflow-hidden flex flex-col mb-4">
              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto">
                    <div className="p-4 bg-accent/20 rounded-2xl">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-foreground">Break the shallow ice</h3>
                      <p className="text-sm text-muted-foreground">
                        Meaningful conversations start with curiosity. Try one of these context-aware starters:
                      </p>
                    </div>
                    <div className="space-y-2 w-full">
                      {starters.map((s, i) => (
                          <button 
                            key={i}
                            onClick={() => setNewMessage(s)}
                            className="w-full text-left p-3 text-sm rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-colors border border-border text-foreground"
                          >
                            &quot;{s}&quot;
                          </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${
                      msg.sender_id === user?.id 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-secondary/30 text-foreground rounded-tl-none border border-border"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Date Planner Prompt */}
                {shouldShowDatePlanner && !showDatePlanner && messages.length >= 5 && (
                  <div className="flex justify-center">
                    <button 
                      onClick={() => setShowDatePlanner(true)}
                      className="px-4 py-2 rounded-full bg-accent/20 border border-primary/20 text-primary text-sm font-medium hover:bg-accent/30 transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Ready to meet? Get date suggestions
                    </button>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border bg-secondary/10">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input 
                    placeholder="Message with intent..." 
                    className="bg-background rounded-xl h-12 border-border shadow-inner"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button type="submit" size="icon" className="h-12 w-12 rounded-xl shrink-0 bg-primary hover:bg-primary/90">
                    <Send className="w-5 h-5 text-primary-foreground" />
                  </Button>
                </form>
                <div className="flex items-center gap-1 mt-2 px-1">
                  <AlertCircle className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground italic">Respectful behavior increases your Quality Score.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Date Planner Sidebar */}
          {showDatePlanner && (
            <div className="w-80 shrink-0 space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Date Planner
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowDatePlanner(false)} className="h-8 w-8">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Move offline. Build real connection.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1">
                      <Coffee className="w-3 h-3" /> Coffee Spots Nearby
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
                              <p className="font-medium text-foreground group-hover:text-primary transition-colors">{spot.name}</p>
                              <p className="text-xs text-muted-foreground">{spot.address}</p>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-primary">
                              <Star className="w-3 h-3 fill-primary" />
                              {spot.rating}
                            </div>
                          </div>
                          <Badge variant="secondary" className="mt-2 bg-secondary/30 text-primary text-[10px]">
                            {spot.vibe}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Activity Ideas
                    </h4>
                    <div className="space-y-2">
                      {ACTIVITY_IDEAS.map((activity) => (
                        <button
                          key={activity.id}
                          onClick={() => suggestActivity(activity)}
                          className="w-full p-3 rounded-xl bg-secondary/10 border border-border hover:border-primary/30 transition-all text-left group flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <activity.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors text-sm">{activity.name}</p>
                            <p className="text-xs text-muted-foreground">{activity.duration}</p>
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
