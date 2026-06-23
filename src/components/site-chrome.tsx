import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useAuth, dashboardPathForRoles } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";

const NAV = [
  { to: "/", label: "Home", exact: true },
  { to: "/search", label: "Directory", exact: false },
  { to: "/intel", label: "Intel Hub", exact: false },
  { to: "/request", label: "Book a Fixer", exact: false },
] as const;

export function SiteHeader() {
  const { user, roles, onboardingCompleted, signOut } = useAuth();
  const { count: cartCount } = useCart();
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E7EB] shadow-sm">
        <div className="container-page flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" onClick={() => setMobileOpen(false)} className="shrink-0 flex items-center gap-2.5">
            <img src="/icon.png" alt="NexusZim" className="h-8 w-8 rounded object-contain" />
            <span className="font-display text-xl font-bold text-gold tracking-tight">
              NexusZim
            </span>
          </Link>

          {/* Centre nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-sm font-semibold text-[#414943] transition-colors hover:text-gold h-16 flex items-center border-b-2 border-transparent"
                activeProps={{ className: "text-gold border-b-2 border-gold" }}
                activeOptions={{ exact: n.exact }}
              >
                {n.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin/concierge"
                className="text-sm font-semibold text-gold/70 transition-colors hover:text-gold h-16 flex items-center border-b-2 border-transparent"
                activeProps={{ className: "text-gold border-b-2 border-gold" }}
              >
                Concierge
              </Link>
            )}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            <Link
              to="/cart"
              aria-label={`Cart (${cartCount})`}
              className="relative p-2 text-[#414943] transition-colors hover:text-gold"
            >
              <ShoppingBag strokeWidth={1.5} className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center bg-gold rounded-full px-1 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Desktop auth */}
            {user ? (
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  to={dashboardTo}
                  className="text-sm font-semibold text-[#414943] transition-colors hover:text-gold"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="border border-[#E5E7EB] px-4 py-2 rounded text-sm font-semibold text-[#414943] hover:border-gold hover:text-gold transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-[#414943] transition-colors hover:text-gold"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-gold px-5 py-2 rounded text-sm font-semibold text-white hover:bg-[#1a4731] transition-colors"
                >
                  Sign Up Free
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 text-[#414943] hover:text-gold transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden fixed top-16 inset-x-0 bottom-0 z-40 bg-white overflow-y-auto border-t border-[#E5E7EB]">
          <nav className="container-page py-6 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between border-b border-[#E5E7EB] py-4 text-base font-semibold text-[#414943] hover:text-gold transition-colors"
                activeProps={{ className: "border-b border-[#E5E7EB] py-4 text-base font-semibold text-gold" }}
                activeOptions={{ exact: n.exact }}
              >
                {n.label}
                <span className="text-[#c1c9c1]">→</span>
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin/concierge"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between border-b border-[#E5E7EB] py-4 text-base font-semibold text-gold/70 hover:text-gold transition-colors"
              >
                Concierge Mode
                <span className="text-[#c1c9c1]">→</span>
              </Link>
            )}

            <div className="mt-6 flex flex-col gap-3">
              {user ? (
                <>
                  <Link
                    to={dashboardTo}
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center border-2 border-gold py-3.5 rounded text-base font-semibold text-gold hover:bg-gold hover:text-white transition-colors"
                  >
                    My Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full border border-[#E5E7EB] py-3.5 rounded text-base font-semibold text-[#414943] hover:border-gold hover:text-gold transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center bg-gold py-3.5 rounded text-base font-semibold text-white hover:bg-[#1a4731] transition-colors"
                  >
                    Create Account
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center border border-[#E5E7EB] py-3.5 rounded text-base font-semibold text-[#414943] hover:border-gold hover:text-gold transition-colors"
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
    <footer className="bg-[#00301c] text-white">
      {/* CTA strip */}
      <div className="border-b border-white/10 py-12">
        <div className="container-page flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">Ready to find a provider?</p>
            <p className="mt-1 font-display text-3xl font-bold text-white">
              Find your perfect <span className="text-[#feb234]">Fixer</span> today.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/search"
              className="bg-[#feb234] px-7 py-3 rounded text-sm font-semibold text-[#1b1c19] hover:bg-[#fca100] transition-colors"
            >
              Browse Network
            </Link>
            <Link
              to="/request"
              className="border-2 border-white/30 px-7 py-3 rounded text-sm font-semibold text-white hover:border-white hover:bg-white/5 transition-colors"
            >
              Post a Brief
            </Link>
            <a
              href="https://tikheti.app"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-[#feb234]/40 px-7 py-3 rounded text-sm font-semibold text-[#feb234] hover:border-[#feb234] hover:bg-[#feb234]/10 transition-colors"
            >
              Buy Tickets via Tikheti
            </a>
          </div>
        </div>
      </div>

      {/* Links grid */}
      <div className="container-page grid gap-12 py-16 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <img src="/icon.png" alt="NexusZim" className="h-7 w-7 rounded object-contain" />
            <span className="font-display text-xl font-bold text-white">NexusZim</span>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
            Zimbabwe's verified service marketplace. Connecting clients with trusted providers across events, transport, business, and more.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-white/40 uppercase tracking-widest">Network Live</span>
          </div>
        </div>
        <FooterCol
          title="Intel Hub"
          links={[
            { to: "/intel/events", label: "Events Radar" },
            { to: "/intel/venues", label: "Venue Board" },
            { to: "/intel/rates", label: "Market Index" },
            { to: "/intel", label: "Subscribe to Alerts" },
            { href: "https://tikheti.app", label: "Buy Tickets → Tikheti" },
          ]}
        />
        <FooterCol
          title="Network"
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

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/30 sm:flex-row">
          <p>© {new Date().getFullYear()} NexusZim · Harare · Bulawayo · Victoria Falls · Mutare</p>
          <p>Zimbabwe's Premier Trust Registry</p>
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
      <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) =>
          l.href ? (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            </li>
          ) : (
            <li key={l.to}>
              <Link
                to={l.to!}
                className="text-sm text-white/60 transition-colors hover:text-white"
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
