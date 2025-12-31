"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/loading-screen";
import { Sparkles, Camera, FileText, MessageSquare, Check, RefreshCw, Loader2, ChevronRight, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const PHOTO_TIPS = [
  { id: 1, tip: "Add a photo showing you doing your favorite hobby", category: "activity" },
  { id: 2, tip: "Include a clear headshot with natural lighting", category: "headshot" },
  { id: 3, tip: "Show yourself in a social setting with friends", category: "social" },
  { id: 4, tip: "Add a full-body photo in a casual setting", category: "fullbody" },
  { id: 5, tip: "Include a photo that shows your smile", category: "expression" },
];

const BIO_SUGGESTIONS = [
  { original: "I like hiking", improved: "Weekend warrior who's summited 12 peaks this year. Always chasing the next sunrise view.", reason: "Specificity creates intrigue" },
  { original: "Looking for someone nice", improved: "Seeking a partner who values deep conversations over small talk and spontaneous adventures over Netflix marathons.", reason: "Clarity signals intent" },
  { original: "I work in tech", improved: "Building the future of healthcare AI by day, perfecting my homemade pasta by night.", reason: "Balance shows dimension" },
];

const TONE_ANALYSIS = [
  { aspect: "Warmth", score: 72, suggestion: "Add a personal anecdote to increase approachability" },
  { aspect: "Authenticity", score: 85, suggestion: "Great! Your unique voice comes through clearly" },
  { aspect: "Specificity", score: 58, suggestion: "Replace generic phrases with concrete examples" },
  { aspect: "Openness", score: 90, suggestion: "Your willingness to connect is evident" },
];

export default function CoachPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentBio, setCurrentBio] = useState("");
  const [improvedBio, setImprovedBio] = useState("");
  const [activeTab, setActiveTab] = useState<"photos" | "bio" | "tone">("photos");
  const router = useRouter();

    useEffect(() => {
      const fetchProfile = async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          const activeUser = authUser || { id: "00000000-0000-0000-0000-000000000001", email: "guest@example.com" };
          setUser(activeUser);

          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", activeUser.id)
            .single();

          if (error) {
            console.error(error);
            toast.error("Failed to load profile data");
          } else if (profileData) {
            setProfile(profileData);
            setCurrentBio(profileData.bio || "");
          }
        } catch (error: any) {
          console.error("Coach fetch error:", error);
          toast.error("An error occurred while loading coach");
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }, [router]);

  const analyzeBio = async () => {
    if (!currentBio.trim()) {
      toast.error("Please enter a bio to analyze");
      return;
    }

    setAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const improvements = [
      "Start with a hook that sparks curiosity",
      "Add specific details about your passions",
      "Include what makes you unique",
      "End with a conversation starter",
    ];

    const improved = `${currentBio.split('.')[0]}—and I'm just getting started. ${currentBio.includes('love') ? 'What I love most is the journey of discovery.' : 'Always curious about what makes people tick.'} Let's swap stories over coffee?`;
    
    setImprovedBio(improved);
    setAnalyzing(false);
    toast.success("Bio analyzed! See suggestions below.");
  };

  const applyImprovement = async () => {
    if (!improvedBio || !user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ bio: improvedBio })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update bio");
    } else {
      setCurrentBio(improvedBio);
      setProfile({ ...profile, bio: improvedBio });
      toast.success("Bio updated successfully!");
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

return (
<div className="h-screen bg-background text-foreground overflow-hidden relative">
{/* Extraordinary Background Elements */}
<div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
<div className="absolute -top-[30%] -left-[20%] w-[80%] h-[80%] bg-primary/10 blur-[250px] rounded-full" />
<div className="absolute -bottom-[30%] -right-[20%] w-[80%] h-[80%] bg-accent/10 blur-[250px] rounded-full" />
</div>

<main className="h-full overflow-y-auto no-scrollbar scroll-smooth relative z-10">
<div className="container mx-auto px-4 pt-24 pb-32 max-w-4xl">
<header className="mb-12 text-center">
<div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 backdrop-blur-xl border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
<Sparkles className="w-3 h-3 fill-current" />
Intentional Growth
</div>
<h1 className="text-6xl font-black tracking-tighter text-foreground mb-4">Profile Coach</h1>
<p className="text-muted-foreground/80 max-w-lg mx-auto font-medium italic text-lg leading-relaxed">
Refine your digital presence with AI-powered insights designed for meaningful connection.
</p>
</header>

{/* Tab Navigation */}
<div className="flex justify-center p-2 bg-card/50 backdrop-blur-3xl border border-border rounded-[2.5rem] max-w-md mx-auto mb-12 shadow-2xl">
{[
{ id: "photos", label: "Photos", icon: Camera },
{ id: "bio", label: "Bio", icon: FileText },
{ id: "tone", label: "Tone", icon: MessageSquare },
].map((tab) => (
<button
key={tab.id}
onClick={() => setActiveTab(tab.id as any)}
className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${
activeTab === tab.id 
? "bg-foreground text-background shadow-xl" 
: "text-muted-foreground hover:text-foreground"
}`}
>
<tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "fill-current" : ""}`} />
{tab.label}
</button>
))}
</div>

{/* Photos Tab */}
{activeTab === "photos" && (
<div className="space-y-8">
<Card className="bg-card/50 backdrop-blur-3xl border-border shadow-2xl rounded-[3rem] overflow-hidden">
<CardHeader className="p-10 pb-4">
<div className="flex items-center gap-4 mb-2">
<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
<Camera className="w-6 h-6" />
</div>
<div>
<CardTitle className="text-3xl font-black tracking-tighter">Photo Strategy</CardTitle>
<CardDescription className="text-muted-foreground font-medium italic">
A diverse photo set tells your story better than any bio.
</CardDescription>
</div>
</div>
</CardHeader>
<CardContent className="p-10 pt-4 space-y-4">
{PHOTO_TIPS.map((tip, index) => (
<div 
key={tip.id}
className="flex items-center gap-6 p-6 rounded-[2rem] bg-secondary/5 border border-border/50 hover:border-primary/30 transition-all group"
>
<div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center shrink-0 font-black italic text-lg shadow-lg">
{index + 1}
</div>
<div className="flex-grow">
<p className="text-foreground font-bold text-lg tracking-tight italic">"{tip.tip}"</p>
<div className="mt-2 inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
{tip.category}
</div>
</div>
<div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/50 transition-all">
<ChevronRight className="w-5 h-5" />
</div>
</div>
))}
</CardContent>
</Card>

<Card className="bg-card/30 backdrop-blur-xl border-dashed border-muted-foreground/30 rounded-[3rem] overflow-hidden">
<CardContent className="p-16 text-center">
<div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
<Camera className="w-10 h-10 text-primary" />
</div>
<h3 className="text-2xl font-black tracking-tighter mb-2">Visual Aura Analysis</h3>
<p className="text-muted-foreground font-medium italic mb-8 max-w-sm mx-auto">
Get AI-powered feedback on lighting, composition, and intentional appeal.
</p>
<Button disabled className="h-14 px-10 rounded-2xl bg-foreground/10 text-foreground font-black text-xs uppercase tracking-widest border border-border">
Calibrating AI...
</Button>
</CardContent>
</Card>
</div>
)}

{/* Bio Tab */}
{activeTab === "bio" && (
<div className="space-y-8">
<Card className="bg-card/50 backdrop-blur-3xl border-border shadow-2xl rounded-[3rem] overflow-hidden">
<CardHeader className="p-10 pb-4">
<div className="flex items-center gap-4 mb-2">
<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
<FileText className="w-6 h-6" />
</div>
<div>
<CardTitle className="text-3xl font-black tracking-tighter">Bio Optimizer</CardTitle>
<CardDescription className="text-muted-foreground font-medium italic">
Transform generic descriptions into magnetic storytelling.
</CardDescription>
</div>
</div>
</CardHeader>
<CardContent className="p-10 pt-4 space-y-8">
<div className="space-y-4">
<label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-4">Current Narrative</label>
<Textarea
value={currentBio}
onChange={(e) => setCurrentBio(e.target.value)}
placeholder="Describe your essence..."
className="min-h-[160px] bg-secondary/5 border-border rounded-[2rem] p-8 text-lg font-medium italic placeholder:text-muted-foreground/30 focus-visible:ring-primary/20"
/>
</div>

<Button 
onClick={analyzeBio} 
disabled={analyzing}
className="w-full h-16 rounded-[2rem] bg-foreground text-background font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
>
{analyzing ? (
<>
<Loader2 className="w-5 h-5 mr-3 animate-spin" />
Distilling Essence...
</>
) : (
<>
<Sparkles className="w-5 h-5 mr-3 fill-current group-hover:scale-125 transition-transform" />
Analyze & Improve
</>
)}
</Button>

{improvedBio && (
<div className="p-10 rounded-[2.5rem] bg-primary/5 border border-primary/20 shadow-inner relative overflow-hidden group">
<div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
<Sparkles className="w-24 h-24 text-primary" />
</div>
<div className="relative z-10">
<div className="flex items-center gap-3 mb-6">
<div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
<Lightbulb className="w-4 h-4 text-primary fill-current" />
</div>
<span className="text-[10px] font-black uppercase tracking-widest text-primary">Evolutionary Suggestion</span>
</div>
<p className="text-2xl font-medium italic leading-relaxed text-foreground mb-8">
&quot;{improvedBio}&quot;
</p>
<Button 
onClick={applyImprovement}
className="h-12 px-8 rounded-full bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
>
<Check className="w-4 h-4 mr-2" />
Adopt this Aura
</Button>
</div>
</div>
)}
</CardContent>
</Card>

<Card className="bg-card/50 backdrop-blur-3xl border-border shadow-2xl rounded-[3rem] overflow-hidden">
<CardHeader className="p-10 pb-4">
<CardTitle className="text-2xl font-black tracking-tighter">Evolutionary Examples</CardTitle>
</CardHeader>
<CardContent className="p-10 pt-4 space-y-6">
{BIO_SUGGESTIONS.map((example, index) => (
<div key={index} className="p-8 rounded-[2rem] bg-secondary/5 border border-border/50">
<div className="grid md:grid-cols-2 gap-8 relative">
<div className="space-y-2">
<span className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.3em]">Ordinary</span>
<p className="text-muted-foreground/60 italic font-medium line-through decoration-muted-foreground/30">{example.original}</p>
</div>
<div className="space-y-2">
<span className="text-[8px] font-black text-primary uppercase tracking-[0.3em]">Extraordinary</span>
<p className="text-foreground italic font-bold leading-tight">&quot;{example.improved}&quot;</p>
</div>
<div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center">
<Zap className="w-3 h-3 text-primary fill-current" />
</div>
</div>
<div className="mt-6 pt-6 border-t border-border/50">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[8px] font-black uppercase tracking-widest">
<Sparkles className="w-2 h-2" />
{example.reason}
</div>
</div>
</div>
))}
</CardContent>
</Card>
</div>
)}

{/* Tone Tab */}
{activeTab === "tone" && (
<div className="space-y-8">
<Card className="bg-card/50 backdrop-blur-3xl border-border shadow-2xl rounded-[3rem] overflow-hidden">
<CardHeader className="p-10 pb-4">
<div className="flex items-center gap-4 mb-2">
<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
<MessageSquare className="w-6 h-6" />
</div>
<div>
<CardTitle className="text-3xl font-black tracking-tighter">Tone Spectrum</CardTitle>
<CardDescription className="text-muted-foreground font-medium italic">
How your profile resonates with potential matches.
</CardDescription>
</div>
</div>
</CardHeader>
<CardContent className="p-10 pt-4 space-y-10">
{TONE_ANALYSIS.map((item) => (
<div key={item.aspect} className="space-y-4">
<div className="flex justify-between items-end">
<div className="space-y-1">
<span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Metric</span>
<h4 className="text-2xl font-black tracking-tighter text-foreground">{item.aspect}</h4>
</div>
<span className="text-3xl font-black tracking-tighter text-primary">{item.score}%</span>
</div>
<div className="h-4 bg-secondary/10 rounded-full overflow-hidden shadow-inner border border-border/50">
<motion.div 
initial={{ width: 0 }}
animate={{ width: `${item.score}%` }}
transition={{ duration: 1.5, ease: "easeOut" }}
className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full relative"
>
<div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
</motion.div>
</div>
<div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
<Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
<p className="text-sm font-medium italic text-muted-foreground leading-relaxed">{item.suggestion}</p>
</div>
</div>
))}
</CardContent>
</Card>

<Card className="bg-card/50 backdrop-blur-3xl border-border shadow-2xl rounded-[3rem] overflow-hidden">
<CardContent className="p-12">
<div className="flex flex-col md:flex-row items-center gap-8">
<div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl relative group">
<div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-75 group-hover:scale-100 transition-transform" />
<Sparkles className="w-10 h-10 text-primary relative z-10 fill-current" />
</div>
<div className="text-center md:text-left">
<h3 className="text-2xl font-black tracking-tighter mb-3">Holistic Essence</h3>
<p className="text-muted-foreground font-medium italic text-lg leading-relaxed">
Your profile radiates authenticity. Focus on adding more specific stories and 
intentional conversation hooks to increase engagement. Consider starting your bio with a 
surprising fact or question.
</p>
</div>
</div>
</CardContent>
</Card>
</div>
)}
</div>
</main>
</div>
);
}

