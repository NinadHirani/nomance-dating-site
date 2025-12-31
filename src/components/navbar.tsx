"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutGrid, MessageCircle, Heart, Users, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/social", label: "Social", icon: LayoutGrid },
    { href: "/messages", label: "Chat", icon: MessageCircle },
    { href: "/search", label: "Search", icon: Search, isAction: true },
    { href: "/matches", label: "Matches", icon: Heart },
    { href: "/events", label: "Events", icon: Users },
  ];

  return (
    <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center pointer-events-none px-6">
      <nav className="bg-background/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem] p-2 flex items-center gap-1 pointer-events-auto max-w-lg w-full">
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
                    className="absolute inset-0 bg-primary/10 rounded-[2rem]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <link.icon className={cn("w-6 h-6 relative z-10", isActive && "fill-current")} />
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-tighter mt-1 relative z-10 transition-all",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                )}>
                  {link.label}
                </span>

                {isActive && (
                  <motion.div 
                    layoutId="active-dot"
                    className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
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
