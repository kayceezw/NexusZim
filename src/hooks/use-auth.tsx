import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "client" | "service_provider" | "admin" | "super_admin";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  onboardingCompleted: boolean;
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadUserData(userId: string) {
    const [rolesRes, profileRes] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("profiles").select("onboarding_completed").eq("id", userId).maybeSingle(),
    ]);
    setRoles((rolesRes.data ?? []).map((r) => r.role as AppRole));
    setOnboardingCompleted(profileRes.data?.onboarding_completed ?? false);
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (s?.user) {
        // Defer DB call to avoid deadlocks
        setTimeout(() => {
          loadUserData(s.user.id);
          if (event === "SIGNED_IN") {
            // Log login event (fire-and-forget)
            supabase.from("login_events").insert({
              user_id: s.user.id,
              user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
            });
          }
        }, 0);
      } else {
        setRoles([]);
        setOnboardingCompleted(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        loadUserData(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    roles,
    onboardingCompleted,
    loading,
    hasRole: (r) => roles.includes(r),
    hasAnyRole: (rs) => rs.some((r) => roles.includes(r)),
    refreshProfile: async () => {
      if (session?.user) await loadUserData(session.user.id);
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/**
 * Returns the right post-auth landing path for the current user.
 * Routes to onboarding if not completed, otherwise to the role's dashboard.
 */
export function dashboardPathForRoles(roles: AppRole[], onboardingCompleted: boolean): string {
  const isAdmin = roles.includes("admin") || roles.includes("super_admin");
  const isProvider = roles.includes("service_provider");

  if (!onboardingCompleted && !isAdmin) {
    return isProvider ? "/onboarding/provider" : "/onboarding/client";
  }
  if (isAdmin) return "/admin";
  if (isProvider) return "/provider/dashboard";
  return "/dashboard";
}
