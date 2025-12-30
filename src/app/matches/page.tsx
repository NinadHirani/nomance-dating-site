"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Heart, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [likedProfiles, setLikedProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const fetchMatchesData = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const activeUser = authUser || { id: "00000000-0000-0000-0000-000000000001", email: "guest@example.com" };
      setUser(activeUser);

      // Fetch mutual matches (accepted)
      const { data: mutualData, error: mutualError } = await supabase
        .from("matches")
        .select(`
          id,
          user_1,
          user_2,
          profiles_user_1:user_1 (id, full_name, avatar_url, intent),
          profiles_user_2:user_2 (id, full_name, avatar_url, intent)
        `)
        .or(`user_1.eq.${activeUser.id},user_2.eq.${activeUser.id}`)
        .eq("status", "accepted");

      if (mutualError) console.error("Mutual fetch error:", mutualError);
      
      const formattedMatches = (mutualData || []).map(m => {
        const otherProfile = m.user_1 === activeUser.id ? m.profiles_user_2 : m.profiles_user_1;
        return {
          id: m.id,
          profile: otherProfile
        };
      });
      setMatches(formattedMatches);

      // Fetch liked profiles (pending where user_1 is activeUser)
      const { data: likedData, error: likedError } = await supabase
        .from("matches")
        .select(`
          id,
          user_2,
          profiles:user_2 (id, full_name, avatar_url, intent)
        `)
        .eq("user_1", activeUser.id)
        .eq("status", "pending");

      if (likedError) console.error("Liked fetch error:", likedError);
      
      const formattedLiked = (likedData || []).map(l => ({
        id: l.id,
        profile: l.profiles
      }));
      setLikedProfiles(formattedLiked);

    } catch (error: any) {
      console.error("Matches fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchesData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="container mx-auto px-4 pt-24 max-w-4xl">
        <header className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-black tracking-tighter text-foreground italic flex items-center gap-3">
              Frequencies <Sparkles className="w-8 h-8 text-primary fill-current" />
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">Your hub for aligned intentions and sparked connections.</p>
          </motion.div>
        </header>

        <Tabs defaultValue="mutual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/20 p-1 rounded-2xl h-14 mb-8">
            <TabsTrigger value="mutual" className="rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg">
              Mutual Spark ({matches.length})
            </TabsTrigger>
            <TabsTrigger value="liked" className="rounded-xl font-black text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg">
              Sent Energy ({likedProfiles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mutual">
            {matches.length === 0 ? (
              <EmptyState 
                icon={<Heart className="w-12 h-12 text-primary" />}
                title="No mutual sparks yet"
                description="Keep sharing your energy and exploring frequencies. The right alignment is just one spark away."
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match) => (
                  <MatchCard key={match.id} profile={match.profile} id={match.id} isMutual={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="liked">
            {likedProfiles.length === 0 ? (
              <EmptyState 
                icon={<Sparkles className="w-12 h-12 text-primary" />}
                title="No sent energy yet"
                description="When you find a frequency that resonates, send a spark to see if your intentions align."
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {likedProfiles.map((liked) => (
                  <MatchCard key={liked.id} profile={liked.profile} id={liked.id} isMutual={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function MatchCard({ profile, id, isMutual }: { profile: any, id: string, isMutual: boolean }) {
  if (!profile) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
    >
      <Link href={isMutual ? `/messages/${id}` : "#"}>
        <Card className="overflow-hidden border-border bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 rounded-[2rem] group">
          <CardContent className="p-0">
            <div className="relative aspect-[4/5] overflow-hidden">
              <img 
                src={profile.avatar_url || `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop`} 
                alt={profile.full_name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-xl font-black text-white italic tracking-tighter">{profile.full_name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 backdrop-blur-md">
                    {profile.intent?.replace('_', ' ')}
                  </Badge>
                  {isMutual && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                      <MessageCircle className="w-4 h-4 fill-current" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-24 bg-secondary/10 rounded-[3rem] border border-dashed border-border/50"
    >
      <div className="w-24 h-24 bg-background rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
        {icon}
      </div>
      <h2 className="text-2xl font-black italic tracking-tighter mb-4 text-foreground">{title}</h2>
      <p className="text-muted-foreground max-w-xs mx-auto font-medium text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
