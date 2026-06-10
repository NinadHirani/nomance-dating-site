"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  const isHidden = ["/auth", "/onboarding"].includes(pathname);
  if (isHidden) return null;

  return (
    <footer className="w-full py-4 px-4 border-t border-border bg-card/30 backdrop-blur-sm relative z-10">
      <div className="max-w-2xl mx-auto flex items-center justify-center gap-2">
        <img
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/logo-1767110846410.png?width=8000&height=8000&resize=contain"
          alt="Nomance"
          className="w-5 h-5 object-contain"
        />
        <span className="text-xs font-bold text-muted-foreground/70">
          © {new Date().getFullYear()} NOMANCE
        </span>
      </div>
    </footer>
  );
}
