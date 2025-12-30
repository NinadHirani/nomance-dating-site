"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, User, Sparkles, Users, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
      { href: "/discovery", label: "Discovery" },
      { href: "/messages", label: "Messages" },
      { href: "/matches", label: "Matches" },
      { href: "/events", label: "Events" },
    ];

  return (
    <nav className="fixed top-0 w-full border-b border-border bg-background/80 backdrop-blur-md z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Heart className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
          </div>
          <span className="text-xl font-black tracking-tighter text-foreground">NOMANCE</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className={`text-sm font-bold transition-all hover:text-primary relative group ${
                pathname === link.href || pathname.startsWith(link.href + '/') 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              {link.label}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full ${
                pathname === link.href || pathname.startsWith(link.href + '/') ? 'w-full' : ''
              }`} />
            </Link>
          ))}
        </div>

            <div className="flex items-center gap-3">
                <Link href="/coach">
                  <Button variant="default" size="sm" className="hidden md:flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-primary hover:opacity-90 border-none shadow-lg shadow-primary/20 font-bold px-6">
                    <Sparkles className="w-4 h-4" />
                    ASK AI
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/20 border border-border">
                    <User className="w-5 h-5 text-foreground" />
                  </Button>
                </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 px-4 rounded-xl text-sm font-bold transition-colors ${
                    pathname === link.href || pathname.startsWith(link.href + '/') 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-foreground hover:bg-secondary/20'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    );
  }
