"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Loader2, Heart, User, Users, UserPlus, LogOut, Edit3, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Account</h1>
          <Button 
            onClick={() => router.push("/profile/edit")}
            className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="space-y-6">
          {/* Account Management Card First */}
          <Card className="rounded-3xl border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-secondary/10 border-b border-border/50">
              <CardTitle className="text-xl">Account Settings</CardTitle>
              <CardDescription>Manage your authentication and active sessions.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {user?.email?.[0].toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-foreground truncate max-w-[200px]">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">Active Session</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shrink-0">Signed In</Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  type="button"
                  variant="outline" 
                  className="h-12 rounded-xl border-2 border-border font-bold text-muted-foreground hover:text-foreground"
                  onClick={handleSwitchAccount}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Switch Account
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="h-12 rounded-xl border-2 border-border font-bold text-muted-foreground hover:text-foreground"
                  onClick={handleAddAccount}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Account
                </Button>
              </div>
              
              <Button 
                type="button"
                variant="ghost" 
                className="w-full h-12 rounded-xl font-bold text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout Current Account
              </Button>
            </CardContent>
          </Card>

          {/* Profile Overview Card */}
          <Card className="rounded-3xl border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-secondary/10 border-b border-border/50">
              <CardTitle className="text-xl">Profile Preview</CardTitle>
              <CardDescription>How others see you on Nomance.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-secondary overflow-hidden border-2 border-border">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{profile?.full_name || "Nomance Member"}</h2>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>Global Community</span>
                  </div>
                </div>
              </div>

              {profile?.bio && (
                <div className="bg-secondary/20 p-4 rounded-2xl">
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    "{profile.bio}"
                  </p>
                </div>
              )}

              {profile?.values && profile.values.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Core Values</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.values.map((val: string) => (
                      <Badge key={val} variant="secondary" className="rounded-full px-3 py-1 font-medium bg-primary/5 text-primary border-primary/10">
                        {val}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={() => router.push("/profile/edit")}
                variant="outline"
                className="w-full h-12 rounded-xl border-2 border-primary/20 text-primary font-bold hover:bg-primary/5"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Full Profile
              </Button>
            </CardContent>
          </Card>

          <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Verified Status</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Complete your profile to unlock the verification badge and gain priority in match discovery.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
