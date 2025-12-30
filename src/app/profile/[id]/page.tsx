"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Loader2, ArrowLeft, Heart, Zap, Sparkles, 
  Moon, Dumbbell, Wine, Cigarette, Info,
  Trophy, Target, UserCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (params?.id) {
      fetchProfile(params.id as string);
    }
  }, [params?.id]);

  const fetchProfile = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Profile not found");
      router.push("/social");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!profile) return null;

  const strength = profile.profile_strength || 80;
  
  const lifestyleItems = [
    { icon: <Moon className="w-4 h-4" />, label: "Sleep", value: profile.lifestyle?.sleep || "Not specified" },
    { icon: <Dumbbell className="w-4 h-4" />, label: "Fitness", value: profile.lifestyle?.fitness || "Not specified" },
    { icon: <Wine className="w-4 h-4" />, label: "Drinking", value: profile.lifestyle?.drinking || "Not specified" },
    { icon: <Cigarette className="w-4 h-4" />, label: "Smoking", value: profile.lifestyle?.smoking || "Not specified" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navbar />
      
      {/* Extraordinary Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
      </div>

        <main className="container mx-auto px-4 pt-24 max-w-4xl relative z-10">
          {/* Header Navigation */}
          <div className="flex items-center justify-between mb-12">
            <Button 
              variant="ghost" 
              onClick={() => router.back()} 
              className="rounded-full gap-2 hover:bg-secondary/50 text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-full border-border">Report</Button>
              <Button variant="outline" className="rounded-full border-border">Share</Button>
            </div>
          </div>

          <div className="space-y-12">
            {/* New Compact Profile Header */}
            <div className="relative">
              {/* Profile Banner/Backdrop */}
              <div className="h-48 w-full rounded-[3rem] bg-gradient-to-r from-primary/20 via-purple-600/10 to-pink-500/20 backdrop-blur-md border border-border overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
              </div>
              
              {/* Profile Picture - Small & Normal Size */}
              <div className="absolute -bottom-12 left-12 flex items-end gap-6">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-8 border-background shadow-2xl bg-card">
                    <img 
                      src={profile.avatar_url || "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800&q=80"} 
                      alt={profile.full_name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-foreground text-background p-2 rounded-2xl shadow-xl flex items-center justify-center border-4 border-background">
                    <Zap className="w-4 h-4 fill-current text-primary" />
                  </div>
                </div>
                
                <div className="pb-4">
                  <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-black italic tracking-tighter text-foreground">{profile.full_name}</h1>
                    <UserCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-none">
                      {profile.gender || "Human"}
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-600/10 text-purple-600 border-none">
                      {profile.birth_date ? `${new Date().getFullYear() - new Date(profile.birth_date).getFullYear()} Years` : "Ageless"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
              {/* Left Column: Stats & Depth */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-foreground text-background p-6 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center gap-2 border-4 border-background relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
                  <span className="text-4xl font-black italic tracking-tighter relative z-10">9.8</span>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60 relative z-10 text-center">Compatibility Frequency</span>
                  <Zap className="w-8 h-8 fill-current text-primary absolute -bottom-2 -right-2 opacity-20" />
                </div>

                {/* Profile Depth Meter */}
                <Card className="rounded-[2.5rem] bg-card/50 backdrop-blur-xl border-border overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Depth</span>
                      </div>
                      <span className="font-black text-xs text-primary">{strength}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${strength}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-purple-600"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Bio & Details */}
              <div className="lg:col-span-8 space-y-10">
                {/* Intent Tags */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="font-black uppercase text-[10px] tracking-widest text-foreground">Intention</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(profile.intents && profile.intents.length > 0 ? profile.intents : ["serious", "casual", "explore", "marriage", "friends"]).map((intent: string) => (
                      <Badge 
                        key={intent}
                        className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-card border-2 border-border text-foreground hover:border-primary transition-all cursor-default"
                      >
                        {intent}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    <span className="font-black uppercase text-[10px] tracking-widest text-foreground">Aura</span>
                  </div>
                  <p className="text-lg leading-relaxed text-muted-foreground italic font-medium">
                    &quot;{profile.bio || "This intentional user prefers to let their frequency speak for itself."}&quot;
                  </p>
                </div>

                {/* Lifestyle & Values (Horizontal Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-black uppercase text-[10px] tracking-widest text-foreground">Lifestyle</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {lifestyleItems.map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-1 p-3 rounded-2xl bg-card/40 border border-border">
                          <div className="text-primary">{item.icon}</div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</p>
                          <p className="text-[10px] font-bold text-foreground truncate">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-primary" />
                      <span className="font-black uppercase text-[10px] tracking-widest text-foreground">Values</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(profile.values || ["Honesty", "Growth", "Adventure"]).map((val: string) => (
                        <span key={val} className="px-4 py-1.5 rounded-full bg-secondary/20 text-foreground font-bold text-xs">
                          {val}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="pt-8 relative flex gap-4">
                   <Button className="flex-1 h-16 rounded-[2rem] bg-foreground text-background font-black text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex gap-3 shadow-xl group">
                     <Heart className="w-6 h-6 fill-current text-primary" />
                     Send Spark
                   </Button>
                   <Button variant="outline" className="w-16 h-16 rounded-[2rem] border-2 border-border flex items-center justify-center hover:bg-secondary/20">
                    <Zap className="w-6 h-6" />
                   </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}
