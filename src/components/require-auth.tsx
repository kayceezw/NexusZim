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
      <div className="container-page py-20 text-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const isAdmin = userRoles.includes("admin") || userRoles.includes("super_admin");

  // Force onboarding before granting access to dashboards
  if (requireOnboarding && !onboardingCompleted && !isAdmin) {
    return <Navigate to={dashboardPathForRoles(userRoles, false)} />;
  }

  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    return (
      <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
        <div className="max-w-md">
          <h1 className="font-display text-2xl font-bold">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You don't have permission to view this page.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
