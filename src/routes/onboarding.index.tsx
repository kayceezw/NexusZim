import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth, dashboardPathForRoles } from "@/hooks/use-auth";

export const Route = createFileRoute("/onboarding/")({
  head: () => ({ meta: [{ title: "Getting started — NexusZim" }] }),
  component: OnboardingRedirect,
});

function OnboardingRedirect() {
  const { user, loading, roles, onboardingCompleted } = useAuth();

  if (loading) {
    return (
      <div className="container-page py-20 text-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  return <Navigate to={dashboardPathForRoles(roles, onboardingCompleted)} />;
}
