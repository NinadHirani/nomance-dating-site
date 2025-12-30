"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Sparkles } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="fixed top-0 w-full border-b border-border bg-background/80 backdrop-blur-xl z-50">
      <div className="max-w-2xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <img 
                src="/logo.svg" 
                alt="Nomance Logo" 
                className="w-8 h-8 md:w-10 md:h-10 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform" 
              />
              <span className="text-lg md:text-xl font-black tracking-tighter text-foreground">NOMANCE</span>
            </Link>

              <div className="flex items-center gap-2">
                <Link href="/coach">
                  <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 rounded-full border-primary/20 hover:bg-primary/5 text-[9px] font-black uppercase tracking-widest h-8 px-3">
                    <Sparkles className="w-3 h-3 text-primary" />
                    Ask AI
                  </Button>
                  <Button variant="ghost" size="icon" className="flex sm:hidden rounded-full h-8 w-8 text-primary">
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </Link>
                <ModeToggle />
              <Link href="/profile">
              <Button variant="ghost" size="icon" className="rounded-full overflow-hidden p-0 border border-border/50">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
