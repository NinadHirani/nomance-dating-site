"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 w-full border-b border-border bg-background/80 backdrop-blur-xl z-50">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-center md:justify-start">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="text-lg md:text-xl font-black tracking-tighter text-foreground">NOMANCE</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
