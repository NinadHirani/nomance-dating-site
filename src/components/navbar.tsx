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
      { href: "/social", label: "Social" },
      { href: "/matches", label: "Matches" },
      { href: "/events", label: "Events" },
    ];

  return (
    <nav className="fixed top-0 w-full border-b border-border bg-background/80 backdrop-blur-md z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary fill-primary" />
          <span className="text-xl font-bold tracking-tighter text-foreground">NOMANCE</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className={`text-sm font-bold transition-colors hover:text-primary ${
                pathname === link.href || pathname.startsWith(link.href + '/') 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

          <div className="flex items-center gap-3">
            <Link href="/coach" className="hidden sm:flex">
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-primary hover:bg-secondary/20">
                <Sparkles className="w-4 h-4 mr-1" />
                AI Coach
              </Button>
            </Link>
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/20">
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
