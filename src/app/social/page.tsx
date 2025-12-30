"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Plus, Camera, Loader2, MoreHorizontal, X, Sparkles, Flame, Zap, ShieldAlert, Heart, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, subYears } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";

export default function SocialPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [storyIndex, setStoryIndex] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const activeUser = authUser || { id: "00000000-0000-0000-0000-000000000001" };
      setUser(activeUser);

      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id!inner (
            id, 
            full_name, 
            avatar_url, 
            birth_date, 
            intent, 
            location_lat, 
            location_lng
          )
        `)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);

      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("*, profiles(full_name, avatar_url)")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: true });

      if (storiesError) throw storiesError;
      
      const groupedStories = (storiesData || []).reduce((acc: any, story: any) => {
        if (!acc[story.user_id]) {
          acc[story.user_id] = {
            user: story.profiles,
            items: []
          };
        }
        acc[story.user_id].items.push(story);
        return acc;
      }, {});
      
      setStories(Object.values(groupedStories));

    } catch (error: any) {
      console.error("Fetch social error details:", error.message || error);
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    fetchData();
  }, []); 

  const handleMatchAction = async (targetUserId: string, action: 'spark' | 'pass', postId: string) => {
    if (!user || user.id === targetUserId) {
        toast.info("Energy check: This is your own creation!");
        return;
    }

    if (action === 'pass') {
        setPosts(prev => prev.filter(p => p.id !== postId));
        toast.info("Vibe check: Moving forward.");
        return;
    }

    // Remove from feed immediately for 'spark' too
    setPosts(prev => prev.filter(p => p.id !== postId));

    const { error } = await supabase.from("matches").insert({
      user_1: user.id,
      user_2: targetUserId,
      status: 'pending'
    });

    // Update likes count on the post
    await supabase.rpc('increment_likes_count', { post_id: postId });
    
    if (error) {
      const { data: reverseLike } = await supabase
        .from("matches")
        .select("*")
        .eq("user_1", targetUserId)
        .eq("user_2", user.id)
        .single();

      if (reverseLike) {
        await supabase.from("matches").update({ status: 'accepted' }).eq("id", reverseLike.id);
        toast.success("Connection Sparked! Mutual energy detected.");
      } else {
        toast.info("Energy already sent. Patiently waiting for the spark.");
      }
    } else {
      toast.success("Spark sent! Intentionality is the new frequency.");
    }
  };

  const createPost = async () => {
    if (!newPostContent.trim() && !newPostImage.trim()) return;

    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        content: newPostContent,
        image_url: newPostImage || "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800&q=80",
      })
      .select("*, profiles(full_name, avatar_url)")
      .single();

    if (error) {
      toast.error("Failed to share energy");
    } else {
      setPosts([data, ...posts]);
      setNewPostContent("");
      setNewPostImage("");
      setIsCreatingPost(false);
      toast.success("Frequency shared!");
    }
  };

  const nextStory = () => {
    if (storyIndex < selectedStory.items.length - 1) {
      setStoryIndex(storyIndex + 1);
    } else {
      setSelectedStory(null);
    }
  };

  const prevStory = () => {
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
    } else {
      setSelectedStory(null);
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

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden">
      {/* Extraordinary Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <main className="container mx-auto px-4 pt-12 pb-24 max-w-2xl relative z-10">
        {/* Stories & Quick Emit */}
        <div className="mb-12 space-y-8">
          {/* Stories */}
          <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toast.info("Coming soon: Shared Moments")}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className="w-16 h-16 rounded-3xl bg-secondary/20 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center p-1 transition-all group-hover:border-primary/50 group-hover:bg-primary/5">
                <div className="w-full h-full rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Add Vibe</span>
            </motion.button>

            {stories.map((group, idx) => (
              <motion.button 
                key={idx}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1 + idx * 0.1 
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setSelectedStory(group);
                  setStoryIndex(0);
                }}
                className="flex flex-col items-center gap-2 shrink-0 group"
              >
                <div className="w-16 h-16 rounded-3xl p-1 bg-gradient-to-tr from-primary via-purple-600 to-pink-500 shadow-xl shadow-primary/10">
                  <div className="w-full h-full rounded-2xl border-4 border-background overflow-hidden">
                    <Avatar className="w-full h-full rounded-none">
                      <AvatarImage src={group.user?.avatar_url} className="object-cover" />
                      <AvatarFallback className="bg-secondary rounded-none">{group.user?.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-foreground truncate w-16 text-center">
                  {group.user?.full_name?.split(' ')[0]}
                </span>
              </motion.button>
            ))}
            </div>
          </div>


        {/* Feed: Extraordinary "Asymmetric" Design */}
        <div className="space-y-12">
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-card/50 border-border backdrop-blur-md rounded-[3rem] overflow-hidden shadow-2xl group hover:border-primary/20 transition-all duration-500">
                <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-4">
                    <Link href={`/profile/${post.profiles?.id}`} className="relative group/avatar">
                      <Avatar className="w-10 h-10 ring-2 ring-primary/30 transition-all group-hover/avatar:ring-primary">
                        <AvatarImage src={post.profiles?.avatar_url} />
                        <AvatarFallback className="bg-secondary">{post.profiles?.full_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                        <Zap className="w-2 h-2 text-primary-foreground fill-current" />
                      </div>
                    </Link>
                    <div>
                      <Link href={`/profile/${post.profiles?.id}`} className="text-sm font-black italic tracking-tighter text-foreground hover:text-primary transition-colors">
                        {post.profiles?.full_name}
                      </Link>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        {formatDistanceToNow(new Date(post.created_at))} AGO
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-accent">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </CardHeader>
                
                {post.image_url && (
                  <div className="px-4 pb-4">
                    <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden relative shadow-inner">
                      <img 
                        src={post.image_url} 
                        alt="Aura" 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>
                )}

                <CardContent className="p-8 pt-2">
                  <p className="text-lg font-medium leading-relaxed tracking-tight text-foreground/90 italic">
                    &quot;{post.content}&quot;
                  </p>
                </CardContent>

                  <CardFooter className="p-6 pt-0 flex flex-col gap-6">
                    <div className="flex flex-col items-center justify-center w-full gap-4">
                      {/* Interaction Hub Label */}
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Align Frequencies</span>
                      
                      {/* Extraordinary Interaction Hub */}
                      <div className="flex items-center gap-6 p-2 bg-card/80 rounded-[2.5rem] border border-border backdrop-blur-3xl shadow-2xl">
                        <motion.button
                          whileHover={{ scale: 1.05, x: -5, backgroundColor: "hsl(var(--accent))" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleMatchAction(post.profiles?.id, 'pass', post.id)}
                          className="h-14 px-8 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all flex items-center gap-3 border border-transparent hover:border-border"
                        >
                          <X className="w-4 h-4" />
                          Not Interested
                        </motion.button>
                        
                        <div className="w-px h-8 bg-border" />

                        <motion.button
                          whileHover={{ scale: 1.05, x: 5, boxShadow: "0 0 40px rgba(var(--primary), 0.2)" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleMatchAction(post.profiles?.id, 'spark', post.id)}
                          className="h-14 px-10 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.2em] bg-foreground text-background flex items-center gap-3 group/interest"
                        >
                          <Heart className="w-5 h-5 fill-current transition-transform group-hover/interest:scale-125" />
                          Interested
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-3 px-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-5 h-5 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center overflow-hidden">
                           <Avatar className="w-full h-full">
                             <AvatarImage src={`https://i.pravatar.cc/100?u=${post.id}${i}`} />
                           </Avatar>
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-black italic tracking-tight text-muted-foreground">
                      {post.likes_count || 0} FREQUENCIES ALIGNED
                    </span>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Story Viewer: Extraordinary Immersive Design */}
      <AnimatePresence>
          {selectedStory && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStory(null)}
              className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl flex items-center justify-center p-4 cursor-pointer"
            >
              <div 
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg aspect-[9/16] bg-card/50 rounded-[3rem] overflow-hidden shadow-2xl border border-border cursor-default"
              >
                {/* Progress Bars */}
                <div className="absolute top-8 left-8 right-8 flex gap-2 z-20">
                  {selectedStory.items.map((_: any, i: number) => (
                    <div key={i} className="h-1 flex-1 bg-foreground/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-foreground"
                        initial={{ width: 0 }}
                        animate={{ width: i === storyIndex ? "100%" : i < storyIndex ? "100%" : "0%" }}
                        transition={{ duration: i === storyIndex ? 5 : 0, ease: "linear" }}
                        onAnimationComplete={() => {
                          if (i === storyIndex) nextStory();
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Header */}
                <div className="absolute top-14 left-8 right-8 flex items-center justify-between z-20">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-primary ring-4 ring-primary/20">
                      <AvatarImage src={selectedStory.user?.avatar_url} />
                      <AvatarFallback>{selectedStory.user?.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-black italic tracking-tighter text-foreground">
                        {selectedStory.user?.full_name}
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-primary">LIVE FREQUENCY</span>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedStory(null)} 
                    className="w-10 h-10 rounded-2xl bg-foreground/10 flex items-center justify-center text-foreground backdrop-blur-md border border-foreground/10 hover:bg-foreground/20 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                {/* Story Image */}
                <img 
                  src={selectedStory.items[storyIndex].image_url} 
                  className="w-full h-full object-cover"
                  alt="Story"
                />

                {/* Interaction Overlay */}
                <div className="absolute bottom-12 left-8 right-8 z-20">
                   <div className="flex items-center gap-4">
                      <Input className="flex-1 bg-background/50 border-border rounded-2xl h-14 backdrop-blur-xl text-foreground placeholder:text-muted-foreground placeholder:italic font-bold" placeholder="Send a spark..." />
                      <Button className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/10">
                         <Zap className="w-6 h-6 fill-current" />
                      </Button>
                   </div>
                </div>

              {/* Navigation Controls */}
              <div className="absolute inset-0 flex z-10">
                <div className="w-1/3 h-full" onClick={prevStory} />
                <div className="w-2/3 h-full" onClick={nextStory} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
