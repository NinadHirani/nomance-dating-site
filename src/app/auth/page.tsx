"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Zap, ShieldCheck, Sparkles, Heart } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { SparkTrail } from "@/components/spark-trail";

function FallingHearts() {
  const hearts = [...Array(30)];
  const colors = ["#ff4d4d", "#e63946", "#d62828", "#9b2226", "#b91c1c"];

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((_, i) => {
        const size = Math.random() * 20 + 10;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const delay = Math.random() * 20;
        const duration = Math.random() * 10 + 10;
        const startX = Math.random() * 100;

        return (
          <motion.div
            key={i}
            initial={{ 
              top: "-10%", 
              left: `${startX}%`, 
              opacity: 0, 
              scale: 0,
              rotate: Math.random() * 360 
            }}
            animate={{ 
              top: "110%", 
              opacity: [0, 0.6, 0.6, 0],
              scale: [1, 1.1, 1],
              rotate: Math.random() * 360 + 360
            }}
            transition={{ 
              duration: duration, 
              repeat: Infinity, 
              delay: delay,
              ease: "linear"
            }}
            className="absolute"
            style={{ width: size, height: size }}
          >
            <svg
              viewBox="0 0 24 24"
              fill={color}
              className="w-full h-full drop-shadow-[0_0_8px_rgba(230,57,70,0.4)]"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>
        );
      })}
    </div>
  );
}

function AuthContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
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
        toast.success("Welcome! Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back! Real people, real intentions.");
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
      <div className="min-h-screen flex items-center justify-center bg-[#FFD1DC]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFD1DC] relative overflow-hidden px-4 py-12 perspective-[1500px]">
      <SparkTrail />
      <FallingHearts />
      
      {/* Big Rotating Hearts in Corners */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-32 -left-32 w-[600px] h-[600px] opacity-[0.12] text-[#ff4d4d]"
        >
          <Heart className="w-full h-full fill-current" />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-32 -right-32 w-[700px] h-[700px] opacity-[0.12] text-[#ff4d4d]"
        >
          <Heart className="w-full h-full fill-current" />
        </motion.div>
      </div>

      {/* Aura Blobs adjusted for light background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[5%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[5%] w-[60%] h-[60%] bg-pink-400/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Ambient 3D Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%", 
              opacity: 0 
            }}
            animate={{ 
              y: ["0%", "100%"],
              opacity: [0, 0.4, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              delay: Math.random() * 10 
            }}
            className="absolute w-1 h-1 bg-primary/30 rounded-full blur-[1px]"
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          {/* 3D Rotating Logo Wrapper */}
          <div className="relative inline-flex items-center justify-center mb-8 perspective-[1000px]">
            {/* Logo Shadow/Reflection on Floor */}
            <div className="absolute -bottom-12 w-32 h-8 bg-primary/10 blur-[20px] rounded-full scale-y-50 z-0" />
            
            <motion.div
              animate={{
                rotateY: [0, 360],
                y: [0, -15, 0]
              }}
              transition={{
                rotateY: { duration: 15, repeat: Infinity, ease: "linear" },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="relative z-10 preserve-3d"
            >
              {/* Glowing Aura around rotating logo */}
              <div className="absolute inset-0 bg-primary/5 blur-[50px] rounded-full" />
              
              <img
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/logo-1767110846410.png?width=8000&height=8000&resize=contain"
                alt="Nomance Logo"
                className="w-28 h-28 object-contain drop-shadow-[0_0_30px_rgba(var(--primary),0.3)]"
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl font-black italic tracking-tighter text-foreground mb-2 drop-shadow-sm">NOMANCE</h1>
            <p className="text-primary/60 font-black tracking-tight uppercase text-[8px] tracking-[0.3em] italic">"Real people. Real intentions."</p>
          </motion.div>
        </div>

        <div className="relative">
          {/* 3D Card Edge Shadow */}
          <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/30 to-purple-600/30 rounded-[3rem] blur opacity-20" />
          
          <Card className="bg-card/80 border-border backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] relative z-10 border-[1px]">
            {/* Animated Light Sweep */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent skew-x-12 pointer-events-none"
            />
            
            <CardHeader className="p-10 pb-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Heart className="w-24 h-24 rotate-12" />
              </div>
              <CardTitle className="text-3xl font-black tracking-tighter italic text-foreground">
                {isSignUp ? "Initialize" : "Connect"}
              </CardTitle>
              <CardDescription className="font-bold text-muted-foreground mt-2">
                {isSignUp ? "Join a community of intentional people" : "Welcome back to Nomance"}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-10 pt-6 relative">
              <form onSubmit={handleAuth} className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background/50 border-border rounded-2xl h-16 px-6 font-bold text-foreground focus:border-primary/50 focus:ring-primary/20 transition-all text-lg"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background/50 border-border rounded-2xl h-16 px-6 font-bold text-foreground focus:border-primary/50 focus:ring-primary/20 transition-all text-lg"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[14px] uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(var(--primary),0.2)] transition-all group overflow-hidden relative"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center gap-3 relative z-10">
                      {isSignUp ? "Sign Up" : "Sign In"}
                      <Zap className="w-5 h-5 fill-current" />
                    </span>
                  )}
                  {/* Subtle 3D Depth on Button */}
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10 pointer-events-none" />
                </Button>
              </form>
            </CardContent>

            <CardFooter className="p-10 pt-0 flex flex-col gap-8">
              <div className="flex items-center gap-4 w-full opacity-20">
                <div className="h-px bg-foreground flex-1" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">OR</span>
                <div className="h-px bg-foreground flex-1" />
              </div>
              
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-xs font-black text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                {isSignUp ? "Already have an account? Sign In" : "New here? Create account"}
              </button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 flex items-center justify-center gap-10 px-4 opacity-40">
          <div className="flex flex-col items-center gap-2 group cursor-default">
            <ShieldCheck className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-center">Secure<br/>Auth</span>
          </div>
          <div className="flex flex-col items-center gap-2 group cursor-default">
            <Sparkles className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-center">Verified<br/>Profiles</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FFD1DC]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
