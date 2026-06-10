"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function LayoutMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth" || pathname === "/onboarding";

  return (
    <main className={cn(
      "flex-1",
      !isAuthPage && "pt-16"
    )}>
      {children}
    </main>
  );
}
