"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, User, MessageCircle, Search } from "lucide-react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary fill-primary" />
          <span className="text-xl font-bold tracking-tighter">NOMANCE</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/discovery" className={`text-sm font-medium ${pathname === '/discovery' ? 'text-primary' : 'text-muted-foreground'}`}>
            Discovery
          </Link>
          <Link href="/matches" className={`text-sm font-medium ${pathname === '/matches' ? 'text-primary' : 'text-muted-foreground'}`}>
            Matches
          </Link>
          <Link href="/messages" className={`text-sm font-medium ${pathname === '/messages' ? 'text-primary' : 'text-muted-foreground'}`}>
            Messages
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/auth">
            <Button variant="default">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
