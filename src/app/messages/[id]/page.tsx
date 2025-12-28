"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const matchId = resolvedParams.id;
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [matchInfo, setMatchInfo] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // Fetch match and other user profile
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

      // Fetch messages
      const { data: msgData } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      setMessages(msgData || []);
      setLoading(false);
    };

    fetchData();

    // Realtime subscription (simplified)
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

  const starters = matchInfo?.otherProfile?.values ? [
    `I saw you value ${matchInfo.otherProfile.values[0]}. How does that show up in your life?`,
    `Your intent is ${matchInfo.otherProfile.intent.replace('_', ' ')}. What's been your biggest learning in dating so far?`,
    `What's one thing that always makes you feel like you can trust someone?`
  ] : ["Tell me something real about your day."];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-6 flex flex-col container mx-auto px-4 max-w-4xl">
        {/* Chat Header */}
        <header className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={matchInfo?.otherProfile?.avatar_url || `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop`} />
              <AvatarFallback>{matchInfo?.otherProfile?.full_name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-slate-900 flex items-center gap-1">
                {matchInfo?.otherProfile?.full_name}
                <ShieldCheck className="w-3 h-3 text-blue-500" />
              </h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                Looking for: <span className="font-medium text-primary uppercase tracking-tighter">{matchInfo?.otherProfile?.intent.replace('_', ' ')}</span>
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200">
            High Intent Match
          </Badge>
        </header>

        {/* Message Bubble Area */}
        <div className="flex-grow bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col mb-4">
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto">
                <div className="p-4 bg-primary/5 rounded-2xl">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Break the shallow ice</h3>
                  <p className="text-sm text-muted-foreground">
                    Meaningful conversations start with curiosity. Try one of these context-aware starters based on their values:
                  </p>
                </div>
                <div className="space-y-2 w-full">
                  {starters.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => setNewMessage(s)}
                      className="w-full text-left p-3 text-sm rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-slate-700"
                    >
                      "{s}"
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
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                  msg.sender_id === user?.id 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-slate-100 text-slate-900 rounded-tl-none"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-slate-50">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input 
                placeholder="Message with intent..." 
                className="bg-white rounded-xl h-12 border-none shadow-inner"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button type="submit" size="icon" className="h-12 w-12 rounded-xl shrink-0">
                <Send className="w-5 h-5" />
              </Button>
            </form>
            <div className="flex items-center gap-1 mt-2 px-1">
              <AlertCircle className="w-3 h-3 text-slate-300" />
              <span className="text-[10px] text-slate-400 italic">Respectful behavior increases your Quality Score.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
