"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { LoadingScreen } from "@/components/loading-screen";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Loader2, Heart, User, Users, UserPlus, LogOut, Edit3, MapPin, Sparkles, LayoutGrid, Zap, ArrowLeft, TrendingUp, Eye, MessageCircle, Flame, Target, Star, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface AuraStats {
  sparksReceived: number;
  sparksGiven: number;
  matchRate: number;
  totalMatches: number;
  profileViews: number;
  messagesExchanged: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState<AuraStats>({
    sparksReceived: 0,
    sparksGiven: 0,
    matchRate: 0,
    totalMatches: 0,
    profileViews: 0,
    messagesExchanged: 0,
  });

  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostContent, setEditingPostContent] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      // Check for admin bypass or real session
      const isAdminBypass = typeof window !== "undefined" && localStorage.getItem("adminBypass") === "true";

      if (!session?.user && !isAdminBypass) {
        router.push("/auth");
        return;
      }

      const authUser = session?.user;

      if (authUser) {
        const activeUserId = authUser.id;
        setUser(authUser);
      } else if (isAdminBypass) {
        // Set admin user for bypass
        setUser({ id: "admin", email: "admin@nomance.com" });
      } else {
        router.push("/auth");
        return;
      }

      const activeUserId = authUser?.id || "admin";

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

      const { data: matchesAsUser1 } = await supabase
        .from("matches")
        .select("*")
        .eq("user_1", activeUserId);

      const { data: matchesAsUser2 } = await supabase
        .from("matches")
        .select("*")
        .eq("user_2", activeUserId);

      const { data: messagesData } = await supabase
        .from("messages")
        .select("id")
        .eq("sender_id", activeUserId);

      const sparksGiven = matchesAsUser1?.length || 0;
      const sparksReceived = matchesAsUser2?.length || 0;
      const acceptedMatches = [
        ...(matchesAsUser1?.filter(m => m.status === 'accepted') || []),
        ...(matchesAsUser2?.filter(m => m.status === 'accepted') || [])
      ];
      const totalMatches = acceptedMatches.length;
      const matchRate = sparksGiven > 0 ? Math.round((totalMatches / (sparksGiven + sparksReceived)) * 100) : 0;

      setStats({
        sparksReceived,
        sparksGiven,
        matchRate,
        totalMatches,
        profileViews: Math.floor(Math.random() * 200) + 50,
        messagesExchanged: messagesData?.length || 0,
      });

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

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success("Post deleted");
    } catch (error: any) {
      console.error("Delete post error:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleEditPost = async () => {
    if (!editingPostId || !editingPostContent.trim()) {
      toast.error("Post content cannot be empty");
      return;
    }

    try {
      const { error } = await supabase
        .from("posts")
        .update({ content: editingPostContent })
        .eq("id", editingPostId);

      if (error) throw error;

      setPosts(prev => prev.map(p =>
        p.id === editingPostId ? { ...p, content: editingPostContent } : p
      ));

      setIsEditingPost(false);
      setEditingPostId(null);
      setEditingPostContent("");
      toast.success("Post updated");
    } catch (error: any) {
      console.error("Edit post error:", error);
      toast.error("Failed to update post");
    }
  };

  const openEditDialog = (postId: string, content: string) => {
    setEditingPostId(postId);
    setEditingPostContent(content);
    setIsEditingPost(true);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const statCards = [
    { label: "Sparks Received", value: stats.sparksReceived, icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10" },
    { label: "Sparks Given", value: stats.sparksGiven, icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Match Rate", value: `${stats.matchRate}%`, icon: Target, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Total Matches", value: stats.totalMatches, icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Profile Views", value: stats.profileViews, icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Messages Sent", value: stats.messagesExchanged, icon: MessageCircle, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="h-screen bg-background text-foreground overflow-hidden relative">
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
                Identity Hub
              </div>
                <h1 className="text-5xl font-black tracking-tighter text-primary">Profile</h1>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/profile/edit")}
                className="h-14 px-8 rounded-2xl bg-foreground text-background font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </motion.button>
            </header>


          <div className="space-y-8">
            <Card className="bg-card/50 backdrop-blur-3xl border-border shadow-2xl rounded-[3rem] overflow-hidden">
              <CardContent className="p-10">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-28 h-28 rounded-[2rem] p-0.5 bg-gradient-to-tr from-primary to-accent shadow-xl overflow-hidden">
                    <div className="w-full h-full rounded-[1.8rem] border-2 border-background overflow-hidden relative">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                          <User className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-black tracking-tighter text-primary">{profile?.full_name || "Nomance Member"}</h2>
                      <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1 mb-3">
                      <MapPin className="w-3 h-3 mr-1 text-primary" />
                      <span>Global Community</span>
                    </div>
                    {profile?.intent && (
                      <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/20">
                        {profile.intent.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>

                {profile?.bio && (
                  <div className="bg-secondary/5 p-6 rounded-[2rem] border border-border/50 relative overflow-hidden group mb-6">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Sparkles className="w-12 h-12 text-primary" />
                    </div>
                    <p className="text-lg text-foreground italic font-medium leading-relaxed relative z-10">
                      "{profile.bio}"
                    </p>
                  </div>
                )}

                {profile?.values && profile.values.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.values.map((val: string) => (
                      <Badge key={val} variant="secondary" className="rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-secondary/20 text-foreground border-border hover:bg-secondary/40 transition-all cursor-default">
                        {val}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-3xl border-border shadow-2xl rounded-[3rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black tracking-tighter text-primary">Aura Stats</CardTitle>
                      <CardDescription className="text-muted-foreground font-medium italic">Your connection metrics at a glance</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              <CardContent className="p-8 pt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {statCards.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-6 rounded-[2rem] ${stat.bg} border border-border/50 hover:border-primary/20 transition-all group`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                      </div>
                      <p className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 p-6 rounded-[2rem] bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                    <span className="text-sm font-black uppercase tracking-widest text-primary">Aura Score</span>
                  </div>
                  <div className="flex items-end gap-4">
                    <span className="text-5xl font-black tracking-tighter text-foreground">
                      {Math.min(100, Math.round((stats.matchRate + stats.totalMatches * 5 + stats.messagesExchanged * 2) / 3))}
                    </span>
                    <span className="text-muted-foreground font-medium italic pb-2">/ 100</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium italic mt-2">
                    Based on your activity and connection quality
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-3xl border-border shadow-2xl rounded-[3rem] overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xl font-black tracking-tighter text-primary">Account Settings</CardTitle>
                  <CardDescription className="text-muted-foreground font-medium italic">Manage your sessions</CardDescription>
                </CardHeader>
              <CardContent className="p-8 pt-4 space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-[1.5rem] border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center font-black italic text-xl">
                      {user?.email?.[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold tracking-tight text-foreground text-sm truncate max-w-[180px]">{user?.email}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Active Session</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest border border-green-500/20">
                    Online
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="h-12 rounded-xl border-border bg-transparent font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
                    onClick={handleSwitchAccount}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Switch
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="h-12 rounded-xl border-border bg-transparent font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
                    onClick={handleAddAccount}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
                
                <Button 
                  type="button"
                  variant="ghost" 
                  className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tighter text-primary">My Aura Feed</h2>
                </div>
                <div className="px-4 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest border border-accent/20">
                  {posts.length} Posts
                </div>
              </div>

              {posts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {posts.map((post) => (
                    <motion.div
                      key={post.id}
                      whileHover={{ y: -5 }}
                      className="group"
                    >
                      <Card className="bg-card/50 backdrop-blur-3xl border-border rounded-[2rem] overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-500 relative">
                        <div className="aspect-square relative bg-secondary/5">
                          {post.image_url ? (
                            post.media_type === 'video' ? (
                              <video src={post.image_url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                            ) : (
                              <img src={post.image_url} alt="Aura" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            )
                          ) : (
                            <div className="w-full h-full flex items-center justify-center p-6">
                              <p className="text-xs font-medium italic text-center text-muted-foreground/60 line-clamp-4">
                                "{post.content}"
                              </p>
                            </div>
                          )}
                          <div className="absolute top-3 right-3 z-10">
                            <div className="px-2 py-1 bg-background/80 backdrop-blur-xl rounded-full text-foreground border border-border/50 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
                              {post.likes_count || 0} <Heart className="w-2.5 h-2.5 fill-primary text-primary" />
                            </div>
                          </div>

                          {/* Edit/Delete Menu */}
                          {post.user_id === user?.id && (
                            <div className="absolute top-3 left-3 z-10">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-xl hover:bg-background/95">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-40 rounded-2xl bg-background/95 backdrop-blur-xl border-border p-2">
                                  <DropdownMenuItem
                                    onClick={() => openEditDialog(post.id, post.content)}
                                    className="rounded-xl gap-3 cursor-pointer py-2"
                                  >
                                    <Edit3 className="w-4 h-4 text-blue-500" />
                                    <span className="font-bold text-sm">Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeletePost(post.id)}
                                    className="rounded-xl gap-3 cursor-pointer py-2"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                    <span className="font-bold text-sm">Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <p className="text-xs font-medium italic line-clamp-2 text-muted-foreground leading-relaxed">
                            {post.content}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card/30 backdrop-blur-xl rounded-[2.5rem] border border-dashed border-muted-foreground/20">
                  <div className="w-14 h-14 bg-muted/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-7 h-7 text-muted-foreground/30" />
                  </div>
                  <p className="text-muted-foreground font-medium italic">No posts yet</p>
                  <Button 
                    variant="link" 
                    onClick={() => router.push("/social")}
                    className="text-primary font-black uppercase tracking-widest text-[10px] mt-2 hover:text-primary/80"
                  >
                    Share Your First Aura
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Post Dialog */}
      <Dialog open={isEditingPost} onOpenChange={setIsEditingPost}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] bg-background/95 backdrop-blur-2xl border-border p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-2xl font-black tracking-tighter flex items-center gap-3 text-primary">
              <Edit3 className="w-6 h-6 text-blue-500" />
              Edit Aura
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 pt-4 space-y-6">
            <Textarea
              placeholder="Update your aura..."
              value={editingPostContent}
              onChange={(e) => setEditingPostContent(e.target.value)}
              className="min-h-[120px] bg-secondary/20 border-none rounded-2xl p-6 text-lg font-medium italic placeholder:text-muted-foreground/40 focus-visible:ring-primary/20"
            />
            <DialogFooter className="flex-row gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditingPost(false);
                  setEditingPostId(null);
                  setEditingPostContent("");
                }}
                className="flex-1 h-14 rounded-2xl font-black text-sm uppercase tracking-widest"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditPost}
                disabled={!editingPostContent.trim()}
                className="flex-[2] h-14 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-black text-sm uppercase tracking-widest transition-all"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
