"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
  import { Heart, Sparkles, Users, MessageCircle, Search, LayoutGrid } from "lucide-react";
  import { usePathname } from "next/navigation";
  
  export function Navbar() {
    const pathname = usePathname();
  
    const navLinks = [
      { href: "/social", label: "Social", icon: LayoutGrid },
      { href: "/messages", label: "Message", icon: MessageCircle },
      { href: "/search", label: "Search", icon: Search },
      { href: "/matches", label: "Matches", icon: Heart },
      { href: "/events", label: "Events", icon: Users },
    ];

    return (
      <nav className="fixed bottom-0 w-full border-t border-border bg-background/80 backdrop-blur-xl z-50">
        <div className="max-w-2xl mx-auto px-4">
            <div className="h-16 flex items-center justify-between">
              {/* Desktop Navigation Tabs */}
              <div className="hidden md:flex w-full items-center justify-between">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all hover:text-primary relative group ${
                      pathname === link.href || pathname.startsWith(link.href + '/') 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    {link.label === "Search" ? (
                      <div className="p-1.5 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#cc2366] shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                        <link.icon className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <>
                        <link.icon className="w-4 h-4" />
                        <span className="hidden lg:inline">{link.label}</span>
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
              <div className="flex md:hidden w-full h-full items-center">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className={`flex-1 h-full flex items-center justify-center transition-all ${
                      link.label === "Search" 
                        ? "" 
                        : pathname === link.href || pathname.startsWith(link.href + '/') 
                          ? "text-primary scale-110" 
                          : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label === "Search" ? (
                      <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#cc2366] shadow-xl shadow-pink-500/30 -translate-y-4 active:scale-95 transition-all">
                        <link.icon className="w-7 h-7 text-white" />
                      </div>
                    ) : (
                      <link.icon className="w-6 h-6" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
        </div>
      </nav>
    );
}
