"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { LoadingScreen } from "@/components/loading-screen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageCircle, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MessagesListPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const activeUser = authUser || { id: "00000000-0000-0000-0000-000000000001", email: "guest@example.com" };
        setUser(activeUser);

        // Fetch accepted matches
        const { data: matches, error } = await supabase
          .from("matches")
          .select(`
            id,
            user_1,
            user_2,
            status,
            profiles_user_1:user_1 (*),
            profiles_user_2:user_2 (*)
          `)
          .or(`user_1.eq.${activeUser.id},user_2.eq.${activeUser.id}`)
          .eq("status", "accepted");

        if (error) throw error;

        // For each match, fetch the latest message
        const chatsWithLastMessage = await Promise.all(
          (matches || []).map(async (match) => {
            const otherProfile = match.user_1 === activeUser.id ? match.profiles_user_2 : match.profiles_user_1;
            
            const { data: lastMessage } = await supabase
              .from("messages")
              .select("*")
              .eq("match_id", match.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            return {
              ...match,
              otherProfile,
              lastMessage
            };
          })
        );

        // Sort by last message date or match creation date
        const sortedChats = chatsWithLastMessage.sort((a, b) => {
          const timeA = new Date(a.lastMessage?.created_at || a.created_at).getTime();
          const timeB = new Date(b.lastMessage?.created_at || b.created_at).getTime();
          return timeB - timeA;
        });

        setChats(sortedChats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    // Realtime for new messages to update the list
    const channel = supabase
      .channel('messages_list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchChats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
        fetchChats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      
      
      <main className="container mx-auto px-4 pt-12 pb-24 max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Messages</h1>
            <p className="text-muted-foreground">High-intent conversations with your matches.</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
        </header>

        <div className="space-y-3">
          {chats.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-foreground">No conversations yet</h2>
              <p className="text-muted-foreground max-w-xs mx-auto mb-8">
                Go to Discovery to find intentional connections and start chatting!
              </p>
              <Link href="/discovery">
                <Badge className="px-4 py-2 bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90">
                  Find Matches
                </Badge>
              </Link>
            </div>
          ) : (
            chats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                className="group"
              >
                <Link href={`/messages/${chat.id}`}>
                  <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all group-hover:border-primary/20">
                    <div className="relative">
                      <Avatar className="w-14 h-14 border-2 border-background shadow-sm">
                        <AvatarImage src={chat.otherProfile?.avatar_url || `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop`} />
                        <AvatarFallback className="bg-secondary text-primary">{chat.otherProfile?.full_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-full flex items-center justify-center shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-primary fill-primary" />
                      </div>
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {chat.otherProfile?.full_name}
                        </h3>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {chat.lastMessage 
                            ? new Date(chat.lastMessage.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
                            : "New match"}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${!chat.lastMessage || (chat.lastMessage.sender_id !== user?.id && !chat.lastMessage.read_at) ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                        {chat.lastMessage 
                          ? (chat.lastMessage.sender_id === user?.id ? `You: ${chat.lastMessage.content}` : chat.lastMessage.content)
                          : "Say something meaningful..."}
                      </p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
