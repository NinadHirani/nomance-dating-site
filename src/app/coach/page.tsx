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
    <div className="min-h-screen bg-background">
      

      <main className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-primary text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Insights
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">Profile Coach</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Get personalized suggestions to make your profile more authentic and attractive.
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { id: "photos", label: "Photos", icon: Camera },
            { id: "bio", label: "Bio", icon: FileText },
            { id: "tone", label: "Tone", icon: MessageSquare },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id as any)}
              className={`rounded-full px-6 ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Photos Tab */}
        {activeTab === "photos" && (
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Photo Suggestions
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  A diverse photo set tells your story better than any bio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {PHOTO_TIPS.map((tip, index) => (
                  <div 
                    key={tip.id}
                    className="flex items-start gap-4 p-4 rounded-xl bg-secondary/10 border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-grow">
                      <p className="text-foreground font-medium">{tip.tip}</p>
                      <Badge variant="secondary" className="mt-2 bg-secondary/30 text-primary text-xs">
                        {tip.category}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-primary">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border bg-card border-dashed">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground">Upload Photos for Analysis</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Get AI-powered feedback on lighting, composition, and appeal.
                </p>
                <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary/10">
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bio Tab */}
        {activeTab === "bio" && (
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Bio Optimizer
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Transform generic descriptions into magnetic storytelling.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Your Current Bio</label>
                  <Textarea
                    value={currentBio}
                    onChange={(e) => setCurrentBio(e.target.value)}
                    placeholder="Enter your bio here..."
                    className="min-h-[120px] bg-background border-border"
                  />
                </div>

                <Button 
                  onClick={analyzeBio} 
                  disabled={analyzing}
                  className="w-full rounded-full font-bold"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze & Improve
                    </>
                  )}
                </Button>

                {improvedBio && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-primary">Suggested Improvement</span>
                    </div>
                    <p className="text-foreground mb-4">{improvedBio}</p>
                    <Button 
                      onClick={applyImprovement}
                      variant="secondary" 
                      className="rounded-full"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Apply This Bio
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Before & After Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {BIO_SUGGESTIONS.map((example, index) => (
                  <div key={index} className="p-4 rounded-xl bg-secondary/10 border border-border">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Before</span>
                        <p className="text-foreground/60 mt-1 line-through">{example.original}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">After</span>
                        <p className="text-foreground mt-1">{example.improved}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="mt-3 text-xs border-primary/30 text-primary">
                      {example.reason}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tone Tab */}
        {activeTab === "tone" && (
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Tone Analysis
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  How your profile comes across to potential matches.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {TONE_ANALYSIS.map((item) => (
                  <div key={item.aspect} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">{item.aspect}</span>
                      <span className="text-sm font-bold text-primary">{item.score}%</span>
                    </div>
                    <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">{item.suggestion}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="py-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">Overall Assessment</h3>
                    <p className="text-muted-foreground text-sm">
                      Your profile radiates authenticity. Focus on adding more specific stories and 
                      conversation hooks to increase engagement. Consider starting your bio with a 
                      surprising fact or question.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
