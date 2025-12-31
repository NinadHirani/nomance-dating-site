"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutGrid, MessageCircle, Heart, Users, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const isHidden = ["/auth", "/onboarding"].includes(pathname);
  if (isHidden) return null;

  const navLinks = [
    { href: "/social", label: "Social", icon: LayoutGrid },
    { href: "/messages", label: "Chat", icon: MessageCircle },
    { href: "/search", label: "Search", icon: Search, isAction: true },
    { href: "/matches", label: "Matches", icon: Heart },
    { href: "/events", label: "Events", icon: Users },
  ];

  return (
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center pointer-events-none px-6">
      <nav className="bg-background/40 backdrop-blur-2xl border border-pink-500/10 shadow-[0_20px_50px_rgba(219,39,119,0.04)] rounded-[2.5rem] p-2 flex items-center gap-1 pointer-events-auto max-w-lg w-full relative overflow-hidden group/nav">
        {/* Subtle pink glow effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/[0.02] via-transparent to-purple-500/[0.02] pointer-events-none" />
        
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          
          if (link.isAction) {
            return (
              <Link key={link.href} href={link.href} className="relative group flex-1">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "flex flex-col items-center justify-center py-3 rounded-[2rem] transition-all relative overflow-hidden",
                    "bg-gradient-to-br from-primary via-purple-600 to-pink-500 text-white shadow-lg shadow-primary/20"
                  )}
                >
                  <link.icon className="w-6 h-6" />
                  <span className="text-[9px] font-black uppercase tracking-tighter mt-1 opacity-80">{link.label}</span>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link key={link.href} href={link.href} className="relative group flex-1">
              <div className={cn(
                "flex flex-col items-center justify-center py-3 rounded-[2rem] transition-all relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-pink-500/10 rounded-[2rem]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <link.icon className={cn("w-6 h-6 relative z-10", isActive && "text-pink-600 fill-pink-600/20")} />
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-tighter mt-1 relative z-10 transition-all",
                    isActive ? "text-pink-600 opacity-100" : "opacity-0 group-hover:opacity-60"
                  )}>
                    {link.label}
                  </span>

                    {isActive && (
                      <motion.div 
                        layoutId="active-dot"
                          className="absolute -bottom-1 w-1 h-1 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(219,39,119,0.2)]"
                      />
                    )}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
