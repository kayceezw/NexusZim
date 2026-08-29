import { Link, useNavigate } from "@tanstack/react-router";
import { X, ChevronDown, LayoutDashboard, Shield, Building2, User } from "lucide-react";
import { useAuth, dashboardPathForRoles, type AppRole } from "@/hooks/use-auth";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NexusZimLogo } from "./registry/logo";
import { ThemeToggle } from "./theme-toggle";
import { useTheme } from "@/hooks/use-theme";

const NAV = [
  { to: "/", label: "Home", exact: true },
  { to: "/search", label: "Service Providers", exact: false },
  { to: "/verify", label: "Verify", exact: false },
  { to: "/intel", label: "Intelligence", exact: false },
  { to: "/request", label: "Request a Quote", exact: false },
] as const;

export function SiteHeader() {
  const { user, roles, onboardingCompleted, signOut } = useAuth();
  const navigate = useNavigate();
  const dashboardTo = dashboardPathForRoles(roles, onboardingCompleted);
  const isAdmin = roles.includes("admin") || roles.includes("super_admin");
  const [scrolled, setScrolled] = useState(false);
  const { resolvedTheme } = useTheme();

  // Pending provider count - only fetched for admins
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["admin", "pending-count"],
    queryFn: async () => {
      const { data } = await supabase
        .from("provider_profiles")
        .select("user_id, tier, verified")
        .eq("tier", 1)
        .eq("verified", false);
      return data?.length ?? 0;
    },
    enabled: isAdmin,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "bg-card/95 backdrop-blur-md border-border shadow-[0_1px_12px_rgba(15,51,35,0.08)]"
            : "bg-card border-border"
        }`}
      >
        <div className="container-page flex h-16 items-center justify-between gap-3 lg:gap-6">
          <NexusZimLogo variant={resolvedTheme === "dark" ? "reversed" : "color"} size="sm" />

          {/* Primary nav - always visible; scrolls horizontally on small screens so
              the mobile layout mirrors desktop rather than collapsing to a drawer. */}
          <nav
            className="flex flex-1 min-w-0 items-center gap-3 sm:gap-4 lg:gap-6 overflow-x-auto no-scrollbar lg:flex-none lg:justify-start"
            aria-label="Primary"
          >
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="shrink-0 font-sans text-[11px] sm:text-[12px] lg:text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary h-16 flex items-center border-b-2 border-transparent hover:border-primary/40"
                activeProps={{
                  className:
                    "shrink-0 font-sans text-[11px] sm:text-[12px] lg:text-[13px] font-medium text-primary h-16 flex items-center border-b-2 border-primary",
                }}
                activeOptions={{ exact: n.exact }}
              >
                {n.label}
              </Link>
            ))}
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  className="relative shrink-0 font-sans text-[11px] sm:text-[12px] lg:text-[13px] font-medium text-primary transition-colors hover:opacity-70 h-16 flex items-center border-b-2 border-transparent"
                  activeProps={{
                    className:
                      "relative shrink-0 font-sans text-[11px] sm:text-[12px] lg:text-[13px] font-medium text-gold-deep dark:text-gold border-b-2 border-gold h-16 flex items-center",
                  }}
                  activeOptions={{ exact: true }}
                >
                  Admin
                  {pendingCount > 0 && (
                    <span className="absolute -top-0.5 -right-3.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white font-mono text-[8px] font-bold">
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/admin/concierge"
                  className="shrink-0 font-sans text-[11px] sm:text-[12px] lg:text-[13px] font-medium text-primary transition-colors hover:opacity-70 h-16 flex items-center border-b-2 border-transparent"
                  activeProps={{
                    className:
                      "shrink-0 font-sans text-[11px] sm:text-[12px] lg:text-[13px] font-medium text-gold-deep dark:text-gold border-b-2 border-gold h-16 flex items-center",
                  }}
                >
                  Premium
                </Link>
              </>
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-2 lg:gap-3">
            <ThemeToggle />
            {user ? (
              <UserMenu onSignOut={handleSignOut} />
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline font-sans text-[12px] lg:text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-gold px-3 py-1.5 lg:px-5 lg:py-2 rounded-[3px] font-sans text-[11px] lg:text-[13px] font-semibold text-forest-ink hover:bg-gold-deep transition-colors whitespace-nowrap"
                >
                  <span className="sm:hidden">List Business</span>
                  <span className="hidden sm:inline">List Your Business</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  super_admin: "Super Admin",
  service_provider: "Provider",
  client: "Client",
};

const ROLE_ICON: Record<AppRole, typeof Shield> = {
  admin: Shield,
  super_admin: Shield,
  service_provider: Building2,
  client: User,
};

function dashboardsForRoles(roles: AppRole[], onboardingCompleted: boolean) {
  const dashboards: { label: string; to: string; icon: typeof Shield }[] = [];
  if (roles.includes("super_admin") || roles.includes("admin")) {
    dashboards.push({ label: "Admin Panel", to: "/admin", icon: Shield });
  }
  if (roles.includes("service_provider")) {
    dashboards.push({ label: "Provider Dashboard", to: "/provider/dashboard", icon: Building2 });
  }
  if (
    roles.includes("client") ||
    (!roles.includes("service_provider") &&
      !roles.includes("admin") &&
      !roles.includes("super_admin"))
  ) {
    dashboards.push({ label: "Client Dashboard", to: "/dashboard", icon: LayoutDashboard });
  }
  return dashboards;
}

function UserMenu({ onSignOut }: { onSignOut: () => void }) {
  const { user, roles, onboardingCompleted } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const email = user?.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();
  const dashboards = dashboardsForRoles(roles, onboardingCompleted);
  const primaryRole = roles.includes("super_admin")
    ? "super_admin"
    : roles.includes("admin")
      ? "admin"
      : roles.includes("service_provider")
        ? "service_provider"
        : "client";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 border border-border pl-1 pr-3 py-1 rounded-[3px] hover:border-primary transition-colors"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <span className="h-7 w-7 rounded-[2px] bg-forest flex items-center justify-center font-mono text-[11px] font-bold text-gold shrink-0">
          {initials}
        </span>
        <div className="text-left hidden xl:block">
          <p className="font-mono text-[10px] uppercase tracking-widest text-foreground leading-none">
            {ROLE_LABELS[primaryRole]}
          </p>
          <p className="font-sans text-[11px] text-muted-foreground/60 leading-tight truncate max-w-[120px]">
            {email}
          </p>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-[6px] shadow-[0_4px_24px_rgba(15,51,35,0.12)] z-50 overflow-hidden">
          {/* Identity */}
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-[3px] bg-forest flex items-center justify-center font-mono text-[13px] font-bold text-gold shrink-0">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="font-sans text-[13px] text-foreground font-medium truncate">{email}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {roles.map((r) => (
                    <span
                      key={r}
                      className="font-mono text-[8px] uppercase tracking-widest text-primary border border-primary/20 bg-primary/10 px-1.5 py-0.5 rounded-[2px]"
                    >
                      {ROLE_LABELS[r]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard links */}
          <div className="py-1">
            <p className="px-4 pt-2 pb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40">
              My Dashboards
            </p>
            {dashboards.map((d) => {
              const Icon = d.icon;
              return (
                <Link
                  key={d.to}
                  to={d.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-forest hover:text-cream transition-colors group"
                >
                  <Icon
                    className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-cream/70 shrink-0 transition-colors"
                    strokeWidth={1.5}
                  />
                  <span className="font-sans text-[13px] text-foreground group-hover:text-cream transition-colors">
                    {d.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Sign out */}
          <div className="border-t border-border py-1">
            <button
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-rose-500/10 transition-colors group"
            >
              <X
                className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-rose-500 shrink-0 transition-colors"
                strokeWidth={1.5}
              />
              <span className="font-sans text-[13px] text-muted-foreground group-hover:text-rose-600 transition-colors">
                Sign out
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteFooter() {
  const [zdpLogo, setZdpLogo] = useState<string | null>(null);

  useEffect(() => {
    const { data } = supabase.storage.from("site-assets").getPublicUrl("zdp-logo.png");
    setZdpLogo(data.publicUrl);
  }, []);

  return (
    <footer className="bg-forest-ink text-cream">
      {/* CTA strip */}
      <div className="border-b border-cream/10 py-10 lg:py-14">
        <div className="container-page flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="eyebrow text-cream/40">
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
              Ready to find a provider?
            </p>
            <p className="font-display text-3xl text-cream">
              Excellence, <span className="text-gold">Delivered.</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/request"
              className="bg-gold px-7 py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
            >
              Request a Quote
            </Link>
            <Link
              to="/onboarding/provider"
              className="border border-cream/20 px-7 py-3 rounded-[3px] font-sans text-sm font-semibold text-cream hover:border-cream/60 hover:bg-background/5 transition-colors"
            >
              Apply as a Provider
            </Link>
            <Link
              to="/about"
              className="border border-cream/20 px-7 py-3 rounded-[3px] font-sans text-sm font-semibold text-cream hover:border-cream/60 hover:bg-background/5 transition-colors"
            >
              About NexusZim
            </Link>
          </div>
        </div>
      </div>

      {/* Links grid */}
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:py-16 md:grid-cols-4">
        <div>
          <NexusZimLogo variant="reversed" size="sm" asLink={false} />
          <p className="mt-5 max-w-xs font-sans text-sm leading-relaxed text-cream/50">
            Zimbabwe's marketplace for trusted services. Find, compare, and brief verified
            providers on a single register.
          </p>
          <div className="mt-6 flex items-center gap-3">
            {zdpLogo ? (
              <img
                src={zdpLogo}
                alt="ZimDataPulse"
                className="h-7 w-auto object-contain"
                style={{ filter: "invert(1)", mixBlendMode: "screen", opacity: 0.75 }}
                onError={() => setZdpLogo(null)}
              />
            ) : (
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-cream/30">
                A ZimDataPulse company
              </span>
            )}
          </div>
        </div>

        <FooterCol
          title="Registry"
          links={[
            { to: "/search", label: "Service Providers" },
            { to: "/categories", label: "All Categories" },
            { to: "/request", label: "Request a Quote" },
            { to: "/onboarding/provider", label: "Apply as Provider" },
          ]}
        />
        <FooterCol
          title="Intelligence"
          links={[
            { to: "/intel", label: "Intelligence Hub" },
            { to: "/intel/rates", label: "Market Rates" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { to: "/about", label: "About NexusZim" },
            { to: "/contact", label: "Contact Us" },
            { to: "/terms", label: "Terms of Service" },
            { to: "/privacy", label: "Privacy Policy" },
          ]}
        />
      </div>

      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-cream/25">
            &copy; {new Date().getFullYear()} NexusZim. Harare &middot; Bulawayo &middot; Victoria
            Falls &middot; Mutare
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-cream/25">
            You pay the provider directly. NexusZim never holds your money.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to?: string; href?: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-cream/35">
        {title}
      </h4>
      <ul className="mt-4 space-y-3">
        {links.map((l) =>
          l.href ? (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-sm text-cream/55 transition-colors hover:text-cream"
              >
                {l.label}
              </a>
            </li>
          ) : (
            <li key={l.to}>
              <Link
                to={l.to!}
                className="font-sans text-sm text-cream/55 transition-colors hover:text-cream"
              >
                {l.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
