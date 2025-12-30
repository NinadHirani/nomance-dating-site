"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send, Plus, Camera, Loader2, MoreHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const activeUser = authUser || { id: "00000000-0000-0000-0000-000000000001" };
        setUser(activeUser);

        // Fetch posts with profile info
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*, profiles(full_name, avatar_url)")
          .order("created_at", { ascending: false });

        if (postsError) throw postsError;
        setPosts(postsData || []);

        // Fetch active stories (within last 24h)
        const { data: storiesData, error: storiesError } = await supabase
          .from("stories")
          .select("*, profiles(full_name, avatar_url)")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: true });

        if (storiesError) throw storiesError;
        
        // Group stories by user for the reel
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
        console.error("Fetch social error:", error);
        toast.error("Failed to load feed");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLike = async (postId: string, currentLikes: number) => {
    // Optimistic update
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
    
    const { error } = await supabase
      .from("posts")
      .update({ likes_count: currentLikes + 1 })
      .eq("id", postId);

    if (error) {
      toast.error("Failed to like post");
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: currentLikes } : p));
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
      toast.error("Failed to create post");
    } else {
      setPosts([data, ...posts]);
      setNewPostContent("");
      setNewPostImage("");
      setIsCreatingPost(false);
      toast.success("Post shared!");
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 max-w-xl">
        {/* Stories Reel */}
        <div className="flex gap-4 overflow-x-auto pb-6 mb-6 no-scrollbar">
          <button 
            onClick={() => toast.info("Story upload coming soon!")}
            className="flex flex-col items-center gap-1 shrink-0"
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center p-0.5">
              <div className="w-full h-full rounded-full bg-secondary/20 flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">Your Story</span>
          </button>

          {stories.map((group, idx) => (
            <button 
              key={idx}
              onClick={() => {
                setSelectedStory(group);
                setStoryIndex(0);
              }}
              className="flex flex-col items-center gap-1 shrink-0"
            >
              <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                <div className="w-full h-full rounded-full border-2 border-background overflow-hidden">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={group.user?.avatar_url} />
                    <AvatarFallback>{group.user?.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-[10px] font-medium text-foreground truncate w-16 text-center">
                {group.user?.full_name?.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Create Post Trigger */}
        <Card className="mb-8 border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <Avatar>
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{user?.email?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <Dialog open={isCreatingPost} onOpenChange={setIsCreatingPost}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="flex-1 justify-start text-muted-foreground hover:bg-secondary/10 rounded-full h-10 px-4">
                  What&apos;s on your mind?
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Post</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Textarea 
                    placeholder="Share something with your connections..." 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Image URL (Optional)</label>
                    <Input 
                      placeholder="https://images.unsplash.com/..." 
                      value={newPostImage}
                      onChange={(e) => setNewPostImage(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={createPost} className="w-full rounded-full">Share Post</Button>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" className="rounded-full text-primary">
              <Camera className="w-5 h-5" />
            </Button>
          </CardContent>
        </Card>

        {/* Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="border-border overflow-hidden shadow-sm">
              <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.profiles?.avatar_url} />
                    <AvatarFallback>{post.profiles?.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-foreground">{post.profiles?.full_name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at))} ago
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </CardHeader>
              
              {post.image_url && (
                <div className="aspect-square bg-secondary/20 relative">
                  <img 
                    src={post.image_url} 
                    alt="Post content" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              )}

              <CardContent className="p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">{post.content}</p>
              </CardContent>

              <CardFooter className="p-4 pt-0 flex flex-col items-start gap-3">
                <div className="flex items-center gap-4 w-full">
                  <button 
                    onClick={() => handleLike(post.id, post.likes_count)}
                    className="flex items-center gap-1.5 group"
                  >
                    <Heart className="w-6 h-6 text-foreground group-hover:text-red-500 transition-colors" />
                    <span className="text-xs font-bold">{post.likes_count}</span>
                  </button>
                  <button className="flex items-center gap-1.5 group">
                    <MessageCircle className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
                    <span className="text-xs font-bold">{post.comments_count}</span>
                  </button>
                  <button className="flex items-center gap-1.5 ml-auto">
                    <Send className="w-5 h-5 text-foreground" />
                  </button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      {/* Story Viewer Overlay */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg aspect-[9/16] bg-secondary/10 overflow-hidden">
              {/* Progress Bars */}
              <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
                {selectedStory.items.map((_: any, i: number) => (
                  <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-white"
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
              <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8 border border-white/20">
                    <AvatarImage src={selectedStory.user?.avatar_url} />
                    <AvatarFallback>{selectedStory.user?.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-bold text-white shadow-sm">
                    {selectedStory.user?.full_name}
                  </span>
                </div>
                <button onClick={() => setSelectedStory(null)} className="text-white p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Story Image */}
              <img 
                src={selectedStory.items[storyIndex].image_url} 
                className="w-full h-full object-cover"
                alt="Story"
              />

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
