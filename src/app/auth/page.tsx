"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Zap, ShieldCheck, Sparkles, Box } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

function FallingHearts() {
  const hearts = [...Array(30)];
  const colors = ["#fb7185", "#f43f5e", "#e11d48", "#be123c", "#9f1239", "#ff4d4d"];

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

function BigRotatingHearts() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Top Left Heart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          rotate: 360,
          scale: [0.9, 1, 0.9],
          opacity: 0.1
        }}
        transition={{ 
          rotate: { duration: 25, repeat: Infinity, ease: "linear" },
          scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 2 }
        }}
        className="absolute -top-32 -left-32"
      >
        <svg
          viewBox="0 0 24 24"
          fill="#fb7185"
          className="w-[500px] h-[500px] blur-[1px] drop-shadow-[0_0_50px_rgba(251,113,133,0.3)]"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </motion.div>

      {/* Bottom Right Heart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          rotate: -360,
          scale: [0.9, 1.05, 0.9],
          opacity: 0.1
        }}
        transition={{ 
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 2 }
        }}
        className="absolute -bottom-48 -right-48"
      >
        <svg
          viewBox="0 0 24 24"
          fill="#f43f5e"
          className="w-[600px] h-[600px] blur-[1px] drop-shadow-[0_0_50px_rgba(244,63,94,0.3)]"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </motion.div>
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
    <div className="min-h-screen flex items-center justify-center bg-[#FFE4E6] relative overflow-hidden px-4 py-12 perspective-[1500px]">
      <BigRotatingHearts />
      <FallingHearts />
      {/* 3D Perspective Grid Floor */}
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          background: `
            linear-gradient(to bottom, transparent 0%, #FFE4E6 100%),
            linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 50px 50px, 50px 50px',
          transform: 'rotateX(60deg) translateY(100px) scale(3)',
          transformOrigin: 'top center'
        }}
      />

      {/* Ambient 3D Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%", 
              z: Math.random() * -1000,
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
            className="absolute w-1.5 h-1.5 bg-primary/20 rounded-full blur-[1px]"
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
                className="w-28 h-28 object-contain drop-shadow-[0_0_20px_rgba(var(--primary),0.3)]"
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl font-black italic tracking-tighter text-zinc-900 mb-2 drop-shadow-sm">NOMANCE</h1>
            <p className="text-primary font-black tracking-tight uppercase text-[10px] tracking-[0.4em] opacity-80 mb-4">Frequency Integration</p>
            <p className="text-zinc-900/60 font-bold italic tracking-tight text-sm">&quot;Real people. Real intentions.&quot;</p>
          </motion.div>
        </div>

        <div className="relative">
          {/* 3D Card Edge Shadow */}
          <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/30 to-rose-400/30 rounded-[3rem] blur opacity-20" />
          
          <Card className="bg-white/80 border-black/5 backdrop-blur-xl rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] relative z-10 border-[1px]">
            {/* Animated Light Sweep */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent skew-x-12 pointer-events-none"
            />
            
            <CardHeader className="p-10 pb-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Box className="w-24 h-24 rotate-12 text-zinc-900" />
              </div>
              <CardTitle className="text-3xl font-black tracking-tighter italic text-zinc-900">
                {isSignUp ? "Initialize" : "Connect"}
              </CardTitle>
              <CardDescription className="font-bold text-zinc-500 mt-2">
                {isSignUp ? "Sync your aura with the network" : "Re-establish your neural frequency"}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-10 pt-6 relative">
              <form onSubmit={handleAuth} className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Vocal ID / Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="aura@nomance.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-black/5 border-black/10 rounded-2xl h-16 px-6 font-bold text-zinc-900 focus:border-primary/50 focus:ring-primary/20 transition-all text-lg placeholder:text-zinc-400"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Encryption Core</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-black/5 border-black/10 rounded-2xl h-16 px-6 font-bold text-zinc-900 focus:border-primary/50 focus:ring-primary/20 transition-all text-lg placeholder:text-zinc-400"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-[14px] uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(var(--primary),0.3)] transition-all group overflow-hidden relative"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center gap-3 relative z-10">
                      {isSignUp ? "Start Initialization" : "Enter Network"}
                      <Zap className="w-5 h-5 fill-current" />
                    </span>
                  )}
                  {/* Subtle 3D Depth on Button */}
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10 pointer-events-none" />
                </Button>
              </form>
            </CardContent>

            <CardFooter className="p-10 pt-0 flex flex-col gap-8">
              <div className="flex items-center gap-4 w-full opacity-10">
                <div className="h-px bg-black flex-1" />
                <span className="text-[10px] font-black uppercase tracking-widest text-black">OR</span>
                <div className="h-px bg-black flex-1" />
              </div>
              
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-xs font-black text-zinc-500 hover:text-primary transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                {isSignUp ? "Existing Frequency? Sign In" : "New Signal? Initialize Aura"}
              </button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 flex items-center justify-center gap-10 px-4 opacity-40">
          <div className="flex flex-col items-center gap-2 group cursor-default text-zinc-900">
            <ShieldCheck className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-center">Encrypted<br/>Intent</span>
          </div>
          <div className="flex flex-col items-center gap-2 group cursor-default text-zinc-900">
            <Sparkles className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-[7px] font-black uppercase tracking-[0.3em] text-center">Verified<br/>Consciousness</span>
          </div>
        </div>
      </motion.div>

      {/* Floating 3D Geometric Objects in background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            rotate: 360,
            y: [0, -40, 0],
            x: [0, 20, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-64 h-64 border border-black/5 rounded-[4rem] rotate-12"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            y: [0, 60, 0],
            x: [0, -30, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -right-40 w-96 h-96 border border-black/5 rounded-full"
        />
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FFE4E6]">
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
