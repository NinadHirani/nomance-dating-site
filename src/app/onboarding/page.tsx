"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const STEPS = [
  { id: "basics", title: "The Basics", description: "Who are you?" },
  { id: "intent", title: "Your Intent", description: "Why are you here?" },
  { id: "values", title: "Your Values", description: "What matters to you?" },
  { id: "final", title: "Ready to go", description: "Let's find your match." },
];

const INTENTS = [
  { value: "life_partner", label: "Life Partner", description: "I'm looking for my forever person." },
  { value: "long_term", label: "Long-term Dating", description: "I want a serious relationship that lasts." },
  { value: "short_term_open", label: "Short-term, open to long", description: "Starting casual but with an open heart." },
  { value: "friendship", label: "Friendship First", description: "Building a connection through shared interests." },
];

const VALUES = ["Honesty", "Ambition", "Family", "Adventure", "Stability", "Creativity", "Kindness", "Growth"];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    birth_date: "",
    gender: "",
    intent: "",
    bio: "",
    selectedValues: [] as string[],
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
      } else {
        setUser(user);
      }
    };
    getUser();
  }, [router]);

  const handleNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const toggleValue = (val: string) => {
    setFormData(prev => ({
      ...prev,
      selectedValues: prev.selectedValues.includes(val) 
        ? prev.selectedValues.filter(v => v !== val)
        : [...prev.selectedValues, val]
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          birth_date: formData.birth_date,
          gender: formData.gender,
          intent: formData.intent,
          bio: formData.bio,
          values: formData.selectedValues,
          quality_score: 100,
        });

      if (error) throw error;
      toast.success("Profile created successfully!");
      router.push("/discovery");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="flex justify-between mb-8 px-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                i <= step ? "bg-primary border-primary text-white" : "bg-white border-slate-200 text-slate-400"
              }`}>
                {i < step ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i <= step ? "text-primary" : "text-slate-400"}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        <Card className="shadow-xl border-none">
          <CardHeader>
            <CardTitle className="text-2xl">{STEPS[step].title}</CardTitle>
            <CardDescription>{STEPS[step].description}</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {step === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Jane Doe" 
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Birth Date</Label>
                  <Input 
                    type="date" 
                    value={formData.birth_date}
                    onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select 
                    value={formData.gender}
                    onValueChange={(val) => setFormData({...formData, gender: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="woman">Woman</SelectItem>
                      <SelectItem value="man">Man</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4">
                {INTENTS.map((intent) => (
                  <button
                    key={intent.value}
                    onClick={() => setFormData({...formData, intent: intent.value})}
                    className={`p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50 ${
                      formData.intent === intent.value ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-100"
                    }`}
                  >
                    <div className="font-bold text-lg">{intent.label}</div>
                    <div className="text-sm text-muted-foreground">{intent.description}</div>
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea 
                    placeholder="Tell us about yourself and what you're looking for..." 
                    className="h-32"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Select 3-5 core values</Label>
                  <div className="flex flex-wrap gap-2">
                    {VALUES.map((val) => (
                      <Badge
                        key={val}
                        variant={formData.selectedValues.includes(val) ? "default" : "outline"}
                        className="px-4 py-2 text-sm cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => toggleValue(val)}
                      >
                        {val}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                  <Heart className="w-10 h-10 text-green-600 fill-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">You're all set!</h3>
                  <p className="text-muted-foreground">
                    We've captured your intent. Now we'll show you high-quality matches based on your values.
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-500 italic max-w-sm">
                  "Remember: Nomance only shows you a few matches per day. Take your time with each one."
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="ghost" onClick={handleBack} disabled={step === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {step === STEPS.length - 1 ? (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Creating Profile..." : "Start Discovery"}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={
                (step === 0 && (!formData.full_name || !formData.birth_date || !formData.gender)) ||
                (step === 1 && !formData.intent)
              }>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
