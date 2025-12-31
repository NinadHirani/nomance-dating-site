"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        // Handle initial redirect if not logged in and not on auth page
        if (!session && pathname !== "/auth" && !pathname.startsWith("/auth/")) {
          router.replace("/auth");
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(false);

        if (!currentUser && pathname !== "/auth" && !pathname.startsWith("/auth/")) {
          router.replace("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
