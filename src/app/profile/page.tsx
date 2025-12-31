"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { LoadingScreen } from "@/components/loading-screen";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Loader2, Heart, User, Users, UserPlus, LogOut, Edit3, MapPin, Sparkles, LayoutGrid, Zap, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const activeUserId = authUser?.id || "00000000-0000-0000-0000-000000000001";
      setUser(authUser || { id: activeUserId, email: "guest@example.com" });

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", activeUserId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setProfile(data);

      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", activeUserId)
        .order("created_at", { ascending: false });
      
      setPosts(postsData || []);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      router.push("/auth");
    } catch (error: any) {
      toast.error("Logout failed");
    }
  };

  const handleSwitchAccount = async () => {
    toast.info("Logging out to switch account...");
    setTimeout(async () => {
      await supabase.auth.signOut();
      router.push("/auth");
    }, 1000);
  };

  const handleAddAccount = async () => {
    toast.info("Redirecting to create a new account...");
    setTimeout(async () => {
      await supabase.auth.signOut();
      router.push("/auth?mode=signup");
    }, 1000);
  };

  if (loading) {
    return <LoadingScreen />;
  }

    return (
      <div className="h-screen bg-background text-foreground overflow-hidden relative">
        {/* Extraordinary Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-accent/20 blur-[150px] rounded-full" />
        </div>
  
        <main className="h-full overflow-y-auto no-scrollbar scroll-smooth relative z-10">
          <div className="container mx-auto px-4 pt-12 pb-32 max-w-2xl">
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => router.push("/social")}
                className="group flex items-center gap-2 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all rounded-full px-6 py-6"
              >
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Feed</span>
              </Button>
            </div>
          <header className="mb-12 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 backdrop-blur-xl border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <User className="w-3 h-3 fill-current" />
                Identity Management
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-foreground">Account</h1>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/profile/edit")}
              className="h-14 px-8 rounded-2xl bg-foreground text-background font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3"
            >
              <Edit3 className="w-4 h-4" />
              Refine Profile
            </motion.button>
          </header>

          <div className="space-y-8">
            {/* Account Management Card */}
            <Card className="bg-card/50 backdrop-blur-3xl border-border shadow-2xl rounded-[3rem] overflow-hidden">
              <CardHeader className="p-10 pb-4">
                <CardTitle className="text-2xl font-black tracking-tighter">Settings</CardTitle>
                <CardDescription className="text-muted-foreground font-medium italic">Manage your authentication and active sessions.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 pt-4 space-y-6">
                <div className="flex items-center justify-between p-6 bg-secondary/5 rounded-[2rem] border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-foreground text-background flex items-center justify-center font-black italic text-2xl shadow-lg">
                      {user?.email?.[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black tracking-tight text-foreground text-lg truncate max-w-[200px]">{user?.email}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Active Session</p>
                    </div>
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/20">
                    Verified
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="h-14 rounded-2xl border-border bg-transparent font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
                    onClick={handleSwitchAccount}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Switch
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="h-14 rounded-2xl border-border bg-transparent font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
                    onClick={handleAddAccount}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
                
                <Button 
                  type="button"
                  variant="ghost" 
                  className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout Current Account
                </Button>
              </CardContent>
            </Card>

            {/* Profile Overview Card */}
            <Card className="bg-card/50 backdrop-blur-3xl border-border shadow-2xl rounded-[3rem] overflow-hidden">
              <CardHeader className="p-10 pb-4">
                <CardTitle className="text-2xl font-black tracking-tighter">Profile Preview</CardTitle>
                <CardDescription className="text-muted-foreground font-medium italic">How others see you on Nomance.</CardDescription>
              </CardHeader>
              <CardContent className="p-10 pt-4 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-[2rem] p-0.5 bg-gradient-to-tr from-primary to-accent shadow-xl overflow-hidden">
                    <div className="w-full h-full rounded-[1.8rem] border-2 border-background overflow-hidden relative">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                          <User className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter text-foreground">{profile?.full_name || "Nomance Member"}</h2>
                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1">
                      <MapPin className="w-3 h-3 mr-1 text-primary" />
                      <span>Global Community</span>
                    </div>
                  </div>
                </div>

                {profile?.bio && (
                  <div className="bg-secondary/5 p-8 rounded-[2rem] border border-border/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Sparkles className="w-16 h-16 text-primary" />
                    </div>
                    <p className="text-lg text-foreground italic font-medium leading-relaxed relative z-10">
                      &quot;{profile.bio}&quot;
                    </p>
                  </div>
                )}

                {profile?.values && profile.values.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 ml-4">Core Values</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.values.map((val: string) => (
                        <Badge key={val} variant="secondary" className="rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all cursor-default">
                          {val}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-primary/5 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-primary/10 flex items-start gap-6 shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -top-1/2 -left-1/4 w-1/2 h-full" />
              <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center flex-shrink-0 relative z-10">
                <Sparkles className="w-8 h-8 text-primary fill-current" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-black tracking-tighter text-foreground">Verified Status</h3>
                <p className="text-muted-foreground font-medium italic mt-1 leading-relaxed">
                  Complete your profile to unlock the verification badge and gain priority in match discovery.
                </p>
              </div>
            </div>

            {/* My Aura Section */}
            <div className="space-y-8 pt-8">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter">My Aura Feed</h2>
                </div>
                <div className="px-4 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest border border-accent/20">
                  {posts.length} CREATIONS
                </div>
              </div>

              {posts.length > 0 ? (
                <div className="grid grid-cols-2 gap-6">
                  {posts.map((post) => (
                    <motion.div
                      key={post.id}
                      whileHover={{ y: -5 }}
                      className="group"
                    >
                      <Card className="bg-card/50 backdrop-blur-3xl border-border rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:border-primary/30 transition-all duration-500">
                        <div className="aspect-square relative bg-secondary/5">
                          {post.image_url ? (
                            post.media_type === 'video' ? (
                              <video src={post.image_url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                            ) : (
                              <img src={post.image_url} alt="Aura" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            )
                          ) : (
                            <div className="w-full h-full flex items-center justify-center p-8">
                              <p className="text-sm font-medium italic text-center text-muted-foreground/60 line-clamp-4">
                                &quot;{post.content}&quot;
                              </p>
                            </div>
                          )}
                          <div className="absolute top-4 right-4 z-10">
                            <div className="px-3 py-1 bg-background/80 backdrop-blur-xl rounded-full text-foreground border border-border/50 text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                              {post.likes_count || 0} <Heart className="w-2.5 h-2.5 fill-primary text-primary" />
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <p className="text-xs font-medium italic line-clamp-2 text-muted-foreground leading-relaxed">
                            {post.content}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-card/30 backdrop-blur-xl rounded-[3rem] border border-dashed border-muted-foreground/20 shadow-inner">
                  <div className="w-16 h-16 bg-muted/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <p className="text-muted-foreground font-medium italic text-lg">You haven't shared your aura yet.</p>
                  <Button 
                    variant="link" 
                    onClick={() => router.push("/social")}
                    className="text-primary font-black uppercase tracking-widest text-[10px] mt-4 hover:text-primary/80"
                  >
                    Go to Feed
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
