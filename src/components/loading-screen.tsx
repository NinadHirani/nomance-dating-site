import Image from "next/image";
import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      <div className="relative flex flex-col items-center justify-center">
        {/* Logo in the center */}
        <div className="relative z-10 mb-6">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center animate-pulse">
            <Image
              src="/logo.svg"
              alt="Nomance Logo"
              width={60}
              height={60}
              className="drop-shadow-md"
              priority
            />
          </div>
        </div>
        
        {/* Loading circle and text */}
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs font-bold text-primary/60 uppercase tracking-[0.2em] animate-pulse">
            Nomance
          </p>
        </div>
      </div>
    </div>
  );
}
