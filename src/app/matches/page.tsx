"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Heart, Loader2 } from "lucide-react";
import Link from "next/link";

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // Fetch mutual matches (accepted)
      const { data, error } = await supabase
        .from("matches")
        .select(`
          id,
          user_1,
          user_2,
          profiles_user_1:user_1 (id, full_name, avatar_url, intent),
          profiles_user_2:user_2 (id, full_name, avatar_url, intent)
        `)
        .or(`user_1.eq.${user.id},user_2.eq.${user.id}`)
        .eq("status", "accepted");

      if (error) {
        console.error(error);
      } else {
        const formattedMatches = data.map(m => {
          const otherProfile = m.user_1 === user.id ? m.profiles_user_2 : m.profiles_user_1;
          return {
            id: m.id,
            profile: otherProfile
          };
        });
        setMatches(formattedMatches);
      }
      setLoading(false);
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Your Matches</h1>
          <p className="text-muted-foreground mt-1">Meaningful connections founded on shared intent.</p>
        </header>

        {matches.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-foreground">No matches yet</h2>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Keep discovering and expressing interest in profiles that align with your values.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <Link key={match.id} href={`/messages/${match.id}`}>
                <Card className="hover:shadow-lg transition-all cursor-pointer border-border shadow-sm overflow-hidden group bg-card">
                  <CardContent className="p-0">
                    <div className="flex items-center p-6 gap-4">
                      <Avatar className="w-16 h-16 border-2 border-primary/10">
                        <AvatarImage src={match.profile.avatar_url || `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop`} />
                        <AvatarFallback className="bg-secondary text-primary">{match.profile.full_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors text-foreground">{match.profile.full_name}</h3>
                        <Badge variant="secondary" className="bg-secondary text-primary border-none text-[10px] px-2 py-0 mt-1 uppercase tracking-wider font-bold">
                          {match.profile.intent?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <MessageCircle className="w-5 h-5 text-primary group-hover:text-primary-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
