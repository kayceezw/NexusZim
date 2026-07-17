import { Link, Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth, dashboardPathForRoles, type AppRole } from "@/hooks/use-auth";

export function RequireAuth({
  children,
  roles,
  requireOnboarding = true,
}: {
  children: ReactNode;
  roles?: AppRole[];
  requireOnboarding?: boolean;
}) {
  const { user, loading, hasAnyRole, onboardingCompleted, roles: userRoles } = useAuth();

  if (loading) {
    return (
      <div className="bg-cream min-h-[60vh] grid place-items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 border-2 border-hairline border-t-forest rounded-full animate-spin" />
          <p className="font-mono text-[10px] uppercase tracking-widest text-text-soft/60">
            Checking access...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const isAdmin = userRoles.includes("admin") || userRoles.includes("super_admin");

  if (requireOnboarding && !onboardingCompleted && !isAdmin) {
    return <Navigate to={dashboardPathForRoles(userRoles, false)} />;
  }

  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    const dashTo = dashboardPathForRoles(userRoles, onboardingCompleted);
    return (
      <div className="bg-cream min-h-[70vh] grid place-items-center px-5">
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-gold/10 border border-gold/20 mx-auto">
            <span className="font-mono text-lg text-gold">✗</span>
          </div>
          <div>
            <p className="eyebrow text-text-soft mb-2">
              <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
              Restricted area
            </p>
            <h1 className="font-display text-2xl text-text">
              This page isn't for you — <em className="italic text-gold">yet.</em>
            </h1>
            <p className="mt-3 font-sans text-sm text-text-soft leading-relaxed">
              Your account doesn't have the right access level for this section.
              Head back to your dashboard.
            </p>
          </div>
          <Link
            to={dashTo}
            className="block w-full bg-gold py-3.5 text-center rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
          >
            Back to my dashboard
          </Link>
          <Link
            to="/"
            className="block w-full border border-hairline py-3 text-center rounded-[3px] font-sans text-sm text-text-soft hover:border-forest hover:text-forest transition-colors"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
