import { supabase } from "@/lib/supabase";

export interface CurrentUser {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  is_guest?: boolean;
}

export const DEMO_USER: CurrentUser = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "demo@nomance.com",
  full_name: "Alex River",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  is_guest: true,
};

/**
 * Returns the currently authenticated Supabase user or falls back to
 * guest/demo user if guest mode is enabled or in development.
 */
export async function getActiveUser(): Promise<CurrentUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
        is_guest: false,
      };
    }
  } catch (err) {
    console.warn("Supabase auth check encountered error:", err);
  }

  // Check guest / demo mode in browser
  if (typeof window !== "undefined") {
    const isGuest = 
      localStorage.getItem("nomance_guest_mode") === "true" ||
      document.cookie.includes("nomance_guest_mode=true") ||
      localStorage.getItem("adminBypass") === "true";

    if (isGuest) {
      const stored = localStorage.getItem("nomance_guest_user");
      if (stored) {
        try {
          return { ...JSON.parse(stored), is_guest: true };
        } catch (_) {}
      }
      return DEMO_USER;
    }
  }

  return null;
}
