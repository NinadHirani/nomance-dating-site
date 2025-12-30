"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
  import { Heart, Sparkles, Users, MessageCircle, Search, LayoutGrid } from "lucide-react";
  import { usePathname } from "next/navigation";
  
  export function Navbar() {
    const pathname = usePathname();
  
    const navLinks = [
      { href: "/matches", label: "Matches", icon: Heart },
      { href: "/search", label: "Search", icon: Search },
      { href: "/events", label: "Events", icon: Users },
      { href: "/social", label: "Social", icon: LayoutGrid },
    ];

  return (
    <nav className="fixed bottom-0 w-full border-t border-border bg-background/80 backdrop-blur-xl z-50">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-all hover:text-primary relative group ${
                  pathname === link.href || pathname.startsWith(link.href + '/') 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                {link.label === "Search" ? (
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#cc2366] shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                    <link.icon className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <>
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </>
                )}
                {link.label !== "Search" && (
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full ${
                    pathname === link.href || pathname.startsWith(link.href + '/') ? 'w-full' : ''
                  }`} />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Navigation Tabs (Icons only) */}
          <div className="flex md:hidden flex-1 items-center justify-around">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`transition-all ${
                  link.label === "Search" 
                    ? "" 
                    : pathname === link.href || pathname.startsWith(link.href + '/') 
                      ? "text-primary scale-110" 
                      : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label === "Search" ? (
                  <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#cc2366] shadow-xl shadow-pink-500/30 -translate-y-2 active:scale-95 transition-all">
                    <link.icon className="w-7 h-7 text-white" />
                  </div>
                ) : (
                  <link.icon className="w-6 h-6" />
                )}
              </Link>
            ))}
          </div>

            <div className="flex items-center gap-3">
              <Link href="/coach">
                <Button variant="default" size="sm" className="hidden lg:flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-primary hover:opacity-90 border-none shadow-lg shadow-primary/20 font-black px-6 text-[10px] tracking-widest uppercase">
                  <Sparkles className="w-3 h-3" />
                  Ask AI
                </Button>
              </Link>
            </div>
        </div>
      </div>
    </nav>
  );
}
