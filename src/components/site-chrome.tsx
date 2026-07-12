import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useAuth, dashboardPathForRoles } from "@/hooks/use-auth";
import { useState } from "react";
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

  async function handleSignOut() {
    await signOut();
    setMobileOpen(false);
    navigate({ to: "/" });
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-cream-raised border-b border-hairline">
        <div className="container-page flex h-16 items-center justify-between gap-6">
          <NexusZimLogo variant="color" size="sm" />

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="font-sans text-[13px] font-medium text-text-soft transition-colors hover:text-forest h-16 flex items-center border-b-2 border-transparent"
                activeProps={{
                  className:
                    "font-sans text-[13px] font-medium text-forest border-b-2 border-forest h-16 flex items-center",
                }}
                activeOptions={{ exact: n.exact }}
              >
                {n.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin/concierge"
                className="font-sans text-[13px] font-medium text-gold transition-colors hover:text-gold-deep h-16 flex items-center border-b-2 border-transparent"
                activeProps={{
                  className:
                    "font-sans text-[13px] font-medium text-gold border-b-2 border-gold h-16 flex items-center",
                }}
              >
                Concierge
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  to={dashboardTo}
                  className="font-sans text-[13px] font-medium text-text-soft transition-colors hover:text-forest"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="border border-hairline px-4 py-2 rounded-[3px] font-sans text-[13px] font-medium text-text-soft hover:border-forest hover:text-forest transition-colors"
                >
                  Sign Out
                </button>
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
                activeProps={{
                  className:
                    "flex items-center justify-between border-b border-hairline py-4 font-sans text-base font-medium text-forest",
                }}
                activeOptions={{ exact: n.exact }}
              >
                {n.label}
                <span className="text-hairline">→</span>
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin/concierge"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between border-b border-hairline py-4 font-sans text-base font-medium text-gold hover:text-gold-deep transition-colors"
              >
                Concierge Mode
                <span className="text-hairline">→</span>
              </Link>
            )}

            <div className="mt-6 flex flex-col gap-3">
              {user ? (
                <>
                  <Link
                    to={dashboardTo}
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center border border-forest py-3.5 rounded-[3px] font-sans text-base font-semibold text-forest hover:bg-forest hover:text-cream transition-colors"
                  >
                    My Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full border border-hairline py-3.5 rounded-[3px] font-sans text-base font-medium text-text-soft hover:border-forest hover:text-forest transition-colors"
                  >
                    Sign Out
                  </button>
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

export function SiteFooter() {
  return (
    <footer className="bg-forest-ink text-cream">
      {/* CTA strip */}
      <div className="border-b border-cream/10 py-14">
        <div className="container-page flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
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
      <div className="container-page grid gap-12 py-16 md:grid-cols-4">
        <div>
          <NexusZimLogo variant="reversed" size="sm" asLink={false} />
          <p className="mt-5 max-w-xs font-sans text-sm leading-relaxed text-cream/50">
            Zimbabwe's service registry. Connecting clients with verified providers across events,
            transport, business, and more.
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
