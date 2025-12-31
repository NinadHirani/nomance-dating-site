"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      <div className="relative flex flex-col items-center justify-center">
        {/* Logo in the center with heartbeat animation */}
        <div className="relative z-10 mb-8 flex items-center justify-center">
          {/* Aesthetic Glow */}
          <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full animate-pulse" />
          
          <motion.div 
            animate={{
              scale: [1, 1.15, 1.05, 1.25, 1],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.2, 0.4, 0.6, 1],
            }}
            className="relative z-10 flex items-center justify-center"
          >
            <img
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/logo-1767110846410.png?width=8000&height=8000&resize=contain"
              alt="Nomance Logo"
              className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]"
            />
          </motion.div>
        </div>
        
        {/* Loading circle and text */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
            <Loader2 className="w-10 h-10 animate-spin text-primary absolute inset-0 [animation-duration:1.5s]" />
          </div>
          <motion.p 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]"
          >
            Nomance
          </motion.p>
        </div>
      </div>
    </div>
  );
}
