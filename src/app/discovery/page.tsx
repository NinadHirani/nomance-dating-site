"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, X, Info, ShieldCheck, MapPin, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function DiscoveryPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // Check daily discovery count
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from("discovery_history")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id)
        .eq("discovered_at", today);

      if (count && count >= 5) {
        setDailyLimitReached(true);
        setLoading(false);
        return;
      }

      // Fetch potential matches
      const { data: userProfile } = await supabase.from("profiles").select("intent").eq("id", user.id).single();
      
      const { data: discoveredIds } = await supabase
        .from("discovery_history")
        .select("discovered_user_id")
        .eq("user_id", user.id);

      const excludedIds = [user.id, ...(discoveredIds?.map(d => d.discovered_user_id) || [])];

      const { data: potentialMatches, error } = await supabase
        .from("profiles")
        .select("*")
        .not("id", "in", `(${excludedIds.join(',')})`)
        .eq("intent", userProfile?.intent)
        .limit(5);

      if (error) {
        console.error(error);
      } else {
        setProfiles(potentialMatches || []);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleAction = async (action: 'like' | 'skip') => {
    const targetProfile = profiles[currentIndex];
    if (!targetProfile || !user) return;

    const today = new Date().toISOString().split('T')[0];
    await supabase.from("discovery_history").insert({
      user_id: user.id,
      discovered_user_id: targetProfile.id,
      discovered_at: today
    });

    if (action === 'like') {
      const { error } = await supabase.from("matches").insert({
        user_1: user.id,
        user_2: targetProfile.id,
        status: 'pending'
      });
      
      if (error) {
        const { data: reverseLike } = await supabase
          .from("matches")
          .select("*")
          .eq("user_1", targetProfile.id)
          .eq("user_2", user.id)
          .single();

        if (reverseLike) {
          await supabase.from("matches").update({ status: 'accepted' }).eq("id", reverseLike.id);
          toast.success("It's a mutual match! Intentional connection formed.");
        }
      } else {
        toast.info("Interest sent. High-intent signals are valued here.");
      }
    }

    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setDailyLimitReached(true);
    }
  };

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
      
      <main className="container mx-auto px-4 pt-24 pb-12 flex flex-col items-center">
        <div className="max-w-xl w-full">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Daily Batch</h1>
            <p className="text-muted-foreground">Focus on quality. You have {5 - (dailyLimitReached ? 5 : currentIndex)} matches left today.</p>
          </header>

          <AnimatePresence mode="wait">
            {dailyLimitReached || profiles.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-card rounded-3xl border border-dashed border-border"
              >
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-foreground">You've reached your limit</h2>
                <p className="text-muted-foreground max-w-xs mx-auto mb-8">
                  Taking time to reflect on matches leads to better outcomes. Check back tomorrow for your next batch.
                </p>
                <Button variant="outline" className="rounded-full px-8 border-primary text-primary hover:bg-primary/10">View My Matches</Button>
              </motion.div>
            ) : (
              <motion.div
                key={profiles[currentIndex].id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden border-none shadow-2xl rounded-3xl bg-card">
                  <div className="aspect-[4/5] bg-secondary/30 relative overflow-hidden">
                    <img 
                      src={profiles[currentIndex].avatar_url || `https://images.unsplash.com/photo-${profiles[currentIndex].gender === 'woman' ? '1494790108377-be9c29b29330' : '1500648767791-00dcc994a43e'}?q=80&w=800&auto=format&fit=crop`}
                      alt={profiles[currentIndex].full_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-background/90 text-foreground backdrop-blur-md border-none px-3 py-1">
                        <ShieldCheck className="w-3 h-3 mr-1 text-primary fill-primary" /> Verified
                      </Badge>
                      <Badge className="bg-primary text-primary-foreground backdrop-blur-md border-none px-3 py-1">
                        {profiles[currentIndex].intent.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-3xl font-bold text-foreground">
                          {profiles[currentIndex].full_name}, {new Date().getFullYear() - new Date(profiles[currentIndex].birth_date).getFullYear()}
                        </CardTitle>
                        <div className="flex items-center text-muted-foreground mt-1 gap-1">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>San Francisco, CA</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                        <Info className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">About Me</h4>
                      <p className="text-foreground leading-relaxed">
                        {profiles[currentIndex].bio}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Core Values</h4>
                      <div className="flex flex-wrap gap-2">
                        {profiles[currentIndex].values?.map((val: string) => (
                          <Badge key={val} variant="secondary" className="bg-secondary/30 text-primary border-none px-3 py-1">
                            {val}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="grid grid-cols-2 gap-4 p-6 pt-0">
                    <Button 
                      variant="outline" 
                      className="h-16 rounded-2xl border-2 border-border text-muted-foreground hover:bg-secondary/10 hover:text-foreground"
                      onClick={() => handleAction('skip')}
                    >
                      <X className="w-8 h-8" />
                    </Button>
                    <Button 
                      className="h-16 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                      onClick={() => handleAction('like')}
                    >
                      <Heart className="w-8 h-8 fill-current" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="mt-12 text-center text-sm text-muted-foreground">
            <p>Trust Score: 98% • Active Community</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
