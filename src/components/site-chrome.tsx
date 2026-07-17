import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, ChevronDown, LayoutDashboard, Shield, Building2, User } from "lucide-react";
import { useAuth, dashboardPathForRoles, type AppRole } from "@/hooks/use-auth";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NexusZimLogo } from "./registry/logo";

const NAV = [
  { to: "/", label: "Home", exact: true },
  { to: "/search", label: "Directory", exact: false },
  { to: "/intel", label: "Intel Hub", exact: false },
  { to: "/request", label: "Post a Brief", exact: false },
] as const;

export function SiteHeader() {
  const { user, roles, onboardingCompleted, signOut } = useAuth();
  const navigate = useNavigate();
  const dashboardTo = dashboardPathForRoles(roles, onboardingCompleted);
  const isAdmin = roles.includes("admin") || roles.includes("super_admin");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Pending provider count — only fetched for admins
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
    setMobileOpen(false);
    navigate({ to: "/" });
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "bg-cream-raised/95 backdrop-blur-md border-hairline shadow-[0_1px_12px_rgba(15,51,35,0.08)]"
            : "bg-cream-raised border-hairline"
        }`}
      >
        <div className="container-page flex h-16 items-center justify-between gap-6">
          <NexusZimLogo variant="color" size="sm" />

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="font-sans text-[13px] font-medium text-text-soft transition-colors hover:text-forest h-16 flex items-center border-b-2 border-transparent hover:border-forest/40"
                activeProps={{ className: "font-sans text-[13px] font-medium text-forest h-16 flex items-center border-b-2 border-forest" }}
                activeOptions={{ exact: n.exact }}
              >
                {n.label}
              </Link>
            ))}
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  className="relative font-sans text-[13px] font-medium text-gold transition-colors hover:text-gold-deep h-16 flex items-center border-b-2 border-transparent"
                  activeProps={{ className: "relative font-sans text-[13px] font-medium text-gold border-b-2 border-gold h-16 flex items-center" }}
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
                  className="font-sans text-[13px] font-medium text-gold transition-colors hover:text-gold-deep h-16 flex items-center border-b-2 border-transparent"
                  activeProps={{ className: "font-sans text-[13px] font-medium text-gold border-b-2 border-gold h-16 flex items-center" }}
                >
                  Concierge
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden lg:flex items-center gap-3">
                <UserMenu onSignOut={handleSignOut} />
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  to="/login"
                  className="font-sans text-[13px] font-medium text-text-soft transition-colors hover:text-forest"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-gold px-5 py-2 rounded-[3px] font-sans text-[13px] font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
                >
                  List Your Business
                </Link>
              </div>
            )}

            <button
              className="lg:hidden p-2 text-text-soft hover:text-forest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest rounded-sm"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="lg:hidden fixed top-16 inset-x-0 bottom-0 z-40 bg-cream-raised overflow-y-auto border-t border-hairline">
          <nav className="container-page py-6 flex flex-col gap-1" aria-label="Mobile navigation">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between border-b border-hairline py-4 font-sans text-base font-medium text-text-soft hover:text-forest transition-colors"
                activeProps={{ className: "flex items-center justify-between border-b border-hairline py-4 font-sans text-base font-medium text-forest" }}
                activeOptions={{ exact: n.exact }}
              >
                {n.label}
                <span className="text-hairline">→</span>
              </Link>
            ))}
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between border-b border-hairline py-4 font-sans text-base font-medium text-gold hover:text-gold-deep transition-colors"
                  activeOptions={{ exact: true }}
                >
                  <span className="flex items-center gap-2">
                    Admin Panel
                    {pendingCount > 0 && (
                      <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-amber-500 text-white font-mono text-[9px] font-bold">
                        {pendingCount > 9 ? "9+" : pendingCount}
                      </span>
                    )}
                  </span>
                  <span className="text-hairline">→</span>
                </Link>
                <Link
                  to="/admin/concierge"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between border-b border-hairline py-4 font-sans text-base font-medium text-gold hover:text-gold-deep transition-colors"
                >
                  Concierge Mode
                  <span className="text-hairline">→</span>
                </Link>
              </>
            )}

            <div className="mt-6 flex flex-col gap-3">
              {user ? (
                <>
                  <MobileDashboardLinks onClose={() => setMobileOpen(false)} onSignOut={handleSignOut} />
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center bg-gold py-3.5 rounded-[3px] font-sans text-base font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
                  >
                    List Your Business
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center border border-hairline py-3.5 rounded-[3px] font-sans text-base font-medium text-text-soft hover:border-forest hover:text-forest transition-colors"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
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
  if (roles.includes("client") || (!roles.includes("service_provider") && !roles.includes("admin") && !roles.includes("super_admin"))) {
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
  const primaryRole = roles.includes("super_admin") ? "super_admin"
    : roles.includes("admin") ? "admin"
    : roles.includes("service_provider") ? "service_provider"
    : "client";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 border border-hairline pl-1 pr-3 py-1 rounded-[3px] hover:border-forest transition-colors"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <span className="h-7 w-7 rounded-[2px] bg-forest flex items-center justify-center font-mono text-[11px] font-bold text-gold shrink-0">
          {initials}
        </span>
        <div className="text-left hidden xl:block">
          <p className="font-mono text-[10px] uppercase tracking-widest text-text leading-none">
            {ROLE_LABELS[primaryRole]}
          </p>
          <p className="font-sans text-[11px] text-text-soft/60 leading-tight truncate max-w-[120px]">
            {email}
          </p>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-text-soft/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-cream-raised border border-hairline rounded-[6px] shadow-[0_4px_24px_rgba(15,51,35,0.12)] z-50 overflow-hidden">
          {/* Identity */}
          <div className="px-4 py-4 border-b border-hairline">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-[3px] bg-forest flex items-center justify-center font-mono text-[13px] font-bold text-gold shrink-0">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="font-sans text-[13px] text-text font-medium truncate">{email}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {roles.map((r) => (
                    <span key={r} className="font-mono text-[8px] uppercase tracking-widest text-forest border border-forest/20 bg-forest/5 px-1.5 py-0.5 rounded-[2px]">
                      {ROLE_LABELS[r]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard links */}
          <div className="py-1">
            <p className="px-4 pt-2 pb-1 font-mono text-[9px] uppercase tracking-widest text-text-soft/40">
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
                  <Icon className="h-3.5 w-3.5 text-text-soft/50 group-hover:text-cream/70 shrink-0 transition-colors" strokeWidth={1.5} />
                  <span className="font-sans text-[13px] text-text group-hover:text-cream transition-colors">{d.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Sign out */}
          <div className="border-t border-hairline py-1">
            <button
              onClick={() => { setOpen(false); onSignOut(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 transition-colors group"
            >
              <X className="h-3.5 w-3.5 text-text-soft/50 group-hover:text-rose-500 shrink-0 transition-colors" strokeWidth={1.5} />
              <span className="font-sans text-[13px] text-text-soft group-hover:text-rose-600 transition-colors">Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileDashboardLinks({ onClose, onSignOut }: { onClose: () => void; onSignOut: () => void }) {
  const { user, roles, onboardingCompleted } = useAuth();
  const email = user?.email ?? "";
  const dashboards = dashboardsForRoles(roles, onboardingCompleted);

  return (
    <>
      <div className="border border-hairline rounded-[6px] px-4 py-3 mb-1">
        <p className="font-mono text-[10px] uppercase tracking-widest text-text-soft/50">Signed in as</p>
        <p className="font-sans text-[13px] text-text mt-0.5 truncate">{email}</p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {roles.map((r) => (
            <span key={r} className="font-mono text-[8px] uppercase tracking-widest text-forest border border-forest/20 bg-forest/5 px-1.5 py-0.5 rounded-[2px]">
              {ROLE_LABELS[r]}
            </span>
          ))}
        </div>
      </div>
      {dashboards.map((d) => {
        const Icon = d.icon;
        return (
          <Link
            key={d.to}
            to={d.to}
            onClick={onClose}
            className="w-full flex items-center gap-3 border border-forest py-3.5 px-5 rounded-[3px] font-sans text-base font-semibold text-forest hover:bg-forest hover:text-cream transition-colors"
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            {d.label}
          </Link>
        );
      })}
      <button
        onClick={onSignOut}
        className="w-full border border-hairline py-3.5 rounded-[3px] font-sans text-base font-medium text-text-soft hover:border-rose-300 hover:text-rose-600 transition-colors"
      >
        Sign out
      </button>
    </>
  );
}

export function SiteFooter() {
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
              Excellence, <em className="italic text-gold">Delivered.</em>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/search"
              className="bg-gold px-7 py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
            >
              Browse Directory
            </Link>
            <Link
              to="/request"
              className="border border-cream/20 px-7 py-3 rounded-[3px] font-sans text-sm font-semibold text-cream hover:border-cream/60 hover:bg-cream/5 transition-colors"
            >
              Post a Brief
            </Link>
            <a
              href="https://tikheti.app"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gold/30 px-7 py-3 rounded-[3px] font-sans text-sm font-semibold text-gold hover:border-gold hover:bg-gold/10 transition-colors"
            >
              Tickets via Tikheti
            </a>
          </div>
        </div>
      </div>

      {/* Links grid */}
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:py-16 md:grid-cols-4">
        <div>
          <NexusZimLogo variant="reversed" size="sm" asLink={false} />
          <p className="mt-5 max-w-xs font-sans text-sm leading-relaxed text-cream/50">
            Zimbabwe's service registry. Connecting clients with verified providers across events, transport, business, and more.
          </p>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-cream/30">
            A ZimDataPulse company
          </p>
        </div>

        <FooterCol
          title="Intel Hub"
          links={[
            { to: "/intel/events", label: "Events Radar" },
            { to: "/intel/venues", label: "Venue Board" },
            { to: "/intel/rates", label: "Market Index" },
            { to: "/intel", label: "Subscribe to Alerts" },
            { href: "https://tikheti.app", label: "Tikheti Ticketing" },
          ]}
        />
        <FooterCol
          title="Registry"
          links={[
            { to: "/search", label: "Browse Directory" },
            { to: "/categories", label: "All Categories" },
            { to: "/request", label: "Post a Brief" },
            { to: "/onboarding/provider", label: "Apply as Provider" },
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
            &copy; {new Date().getFullYear()} NexusZim. Harare &middot; Bulawayo &middot; Victoria Falls &middot; Mutare
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
          )
        )}
      </ul>
    </div>
  );
}
