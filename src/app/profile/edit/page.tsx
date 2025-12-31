"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, ImageIcon, Info, Heart, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { PhotoUpload } from "@/components/profile-photos";

const INTENTS = [
  { value: "life_partnership", label: "Life Partnership" },
  { value: "dating", label: "Dating" },
  { value: "friendship", label: "Friendship" },
];

const AVAILABLE_VALUES = [
  "Kindness", "Ambition", "Family", "Adventure", "Creativity", 
  "Honesty", "Growth", "Freedom", "Stability", "Humor"
];

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({
    full_name: "",
    bio: "",
    intent: "life_partnership",
    gender: "other",
    birth_date: "",
    values: [],
    avatar_url: "",
    photos: []
  });

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

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          bio: data.bio || "",
          intent: data.intent || "life_partnership",
          gender: data.gender || "other",
          birth_date: data.birth_date || "",
          values: data.values || [],
          avatar_url: data.avatar_url || "",
          photos: data.photos || []
        });
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      
      const avatar_url = profile.photos && profile.photos.length > 0 
        ? profile.photos[0] 
        : profile.avatar_url;

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...profile,
          avatar_url,
          last_active: new Date().toISOString()
        });

      if (error) throw error;
      toast.success("Profile updated successfully!");
      router.push("/profile");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const toggleValue = (value: string) => {
    setProfile((prev: any) => ({
      ...prev,
      values: prev.values.includes(value)
        ? prev.values.filter((v: string) => v !== value)
        : [...prev.values, value].slice(0, 5)
    }));
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
      
      <main className="container mx-auto px-4 pt-24 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => router.push("/profile")}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-8">
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <ImageIcon className="w-4 h-4" />
              Profile Photos
            </div>
            
            <PhotoUpload 
              userId={user.id} 
              initialPhotos={profile.photos} 
              onPhotosChange={(photos) => setProfile({ ...profile, photos })} 
            />
            
            <div className="flex items-center gap-2 text-muted-foreground text-xs bg-secondary/20 p-3 rounded-xl">
              <Info className="w-4 h-4 text-primary" />
              <span>Drag to reorder. The first photo is your main profile image.</span>
            </div>
          </section>

          <Card className="rounded-3xl border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-secondary/10 border-b border-border/50">
              <CardTitle className="text-xl">Basic Information</CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Full Name</label>
                  <Input 
                    placeholder="Enter your name" 
                    value={profile.full_name}
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                    className="rounded-xl border-border focus:ring-primary h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Birth Date</label>
                  <Input 
                    type="date"
                    value={profile.birth_date}
                    onChange={(e) => setProfile({...profile, birth_date: e.target.value})}
                    className="rounded-xl border-border focus:ring-primary h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Gender</label>
                  <Select 
                    value={profile.gender} 
                    onValueChange={(value) => setProfile({...profile, gender: value})}
                  >
                    <SelectTrigger className="rounded-xl h-11 border-border">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      <SelectItem value="man">Man</SelectItem>
                      <SelectItem value="woman">Woman</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground">Intent</label>
                  <Select 
                    value={profile.intent} 
                    onValueChange={(value) => setProfile({...profile, intent: value})}
                  >
                    <SelectTrigger className="rounded-xl h-11 border-border">
                      <SelectValue placeholder="What are you looking for?" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border">
                      {INTENTS.map((intent) => (
                        <SelectItem key={intent.value} value={intent.value}>
                          {intent.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-semibold text-muted-foreground flex justify-between">
                  Bio <span>{profile.bio.length}/500</span>
                </label>
                <Textarea 
                  placeholder="Share your story..." 
                  className="rounded-xl border-border min-h-[120px] resize-none"
                  maxLength={500}
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-secondary/10 border-b border-border/50">
              <CardTitle className="text-xl">Values & Beliefs</CardTitle>
              <CardDescription>Select up to 5 core values.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_VALUES.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => toggleValue(val)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${
                      profile.values.includes(val)
                        ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "bg-background border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              disabled={saving}
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
              Save Profile Changes
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="h-14 px-8 rounded-2xl border-2 border-border font-bold text-muted-foreground"
              onClick={() => router.push("/profile")}
            >
              Cancel
            </Button>
          </div>
        </form>

        <section className="mt-12 pt-8 border-t border-border">
          <div className="bg-secondary/20 rounded-3xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Pro-Tip</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Authentic profiles with clear values attract high-intent partners.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
