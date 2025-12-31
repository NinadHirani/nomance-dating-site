"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Heart, Loader2, AlertCircle, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/social");
      }
      setCheckingSession(false);
    };
    checkUser();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        toast.success("Frequency initialized! Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Frequency aligned! Welcome back.");
        router.push("/social");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
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
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Background Aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-gradient-to-tr from-primary via-purple-600 to-pink-500 shadow-2xl shadow-primary/20 mb-6"
          >
            <Heart className="w-10 h-10 text-white fill-current" />
          </motion.div>
          <h1 className="text-4xl font-black italic tracking-tighter text-foreground mb-2">NOMANCE</h1>
          <p className="text-muted-foreground font-medium tracking-tight uppercase text-[10px] tracking-[0.3em]">Align Your Frequency</p>
        </div>

        <Card className="bg-card/50 border-border backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-2xl font-black tracking-tighter italic">
              {isSignUp ? "Create Aura" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="font-medium">
              {isSignUp ? "Join the intentional connection space" : "Continue your journey of depth"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Frequency</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="aura@nomance.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50 border-border rounded-2xl h-14 backdrop-blur-xl font-bold focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Secure Core</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50 border-border rounded-2xl h-14 backdrop-blur-xl font-bold focus:ring-primary/20"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-foreground text-background font-black text-[12px] uppercase tracking-[0.2em] shadow-xl hover:shadow-primary/10 transition-all group"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    {isSignUp ? "Initialize Frequency" : "Establish Connection"}
                    <Zap className="w-4 h-4 fill-current group-hover:scale-125 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="p-8 pt-0 flex flex-col gap-6">
            <div className="flex items-center gap-4 w-full">
              <div className="h-px bg-border flex-1" />
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Transition</span>
              <div className="h-px bg-border flex-1" />
            </div>
            
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              {isSignUp ? "Already have an aura? Establish connection" : "New frequency? Create your aura"}
            </button>
          </CardFooter>
        </Card>

        <div className="mt-8 flex items-center justify-center gap-8 px-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-[8px] font-black uppercase tracking-widest">End-to-End Intent</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[8px] font-black uppercase tracking-widest">Authentic Souls</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
