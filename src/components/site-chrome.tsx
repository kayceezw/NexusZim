import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useAuth, dashboardPathForRoles } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";

const NAV = [
  { to: "/", label: "Home", exact: true },
  { to: "/categories", label: "Categories", exact: false },
  { to: "/search", label: "Find Providers", exact: false },
  { to: "/request", label: "Post a Request", exact: false },
] as const;

export function SiteHeader() {
  const { user, roles, onboardingCompleted, signOut } = useAuth();
  const { count: cartCount } = useCart();
  const navigate = useNavigate();
  const dashboardTo = dashboardPathForRoles(roles, onboardingCompleted);

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        backgroundColor: "rgba(13,27,42,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderColor: "rgba(196,154,42,0.18)",
      }}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6 md:h-[72px]">
        {/* Wordmark */}
        <Link to="/" className="shrink-0">
          <span className="font-display text-2xl font-semibold tracking-tight text-gold md:text-[26px]">
            NexusZim
          </span>
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-cream/80 transition-colors hover:text-gold"
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: n.exact }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-3 md:gap-5">
          <Link
            to="/cart"
            aria-label={`Cart (${cartCount})`}
            className="relative text-cream/80 transition-colors hover:text-gold"
          >
            <ShoppingBag strokeWidth={1.5} className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-medium text-gold-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link
                to={dashboardTo}
                className="hidden font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-cream/80 transition-colors hover:text-gold sm:inline"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="rounded-full bg-gold px-4 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-gold-foreground transition-colors hover:bg-cream"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-cream/80 transition-colors hover:text-gold"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-gold px-4 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-gold-foreground transition-colors hover:bg-cream"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t" style={{ borderColor: "rgba(196,154,42,0.18)", backgroundColor: "var(--navy-mid)" }}>
      <div className="container-page grid gap-10 py-16 md:grid-cols-4">
        <div>
          <span className="font-display text-2xl font-semibold tracking-tight text-gold">
            NexusZim
          </span>
          <p className="mt-4 max-w-xs text-sm font-light leading-relaxed text-cream/65">
            Zimbabwe's trusted marketplace for booking professional services.
          </p>
        </div>
        <FooterCol
          title="Marketplace"
          links={[
            { to: "/categories", label: "Categories" },
            { to: "/search", label: "Find providers" },
            { to: "/request", label: "Post a request" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { to: "/about", label: "About" },
            { to: "/contact", label: "Contact" },
            { to: "/provider/dashboard", label: "Become a provider" },
          ]}
        />
        <FooterCol
          title="Legal"
          links={[
            { to: "/terms", label: "Terms & conditions" },
            { to: "/privacy", label: "Privacy policy" },
            { to: "/policies/cancellation", label: "Cancellation & refunds" },
          ]}
        />
      </div>
      <div className="border-t" style={{ borderColor: "rgba(196,154,42,0.15)" }}>
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-[11px] uppercase tracking-[0.18em] text-cream/50 sm:flex-row">
          <p>© {new Date().getFullYear()} NexusZim. All rights reserved.</p>
          <p>Built in Zimbabwe.</p>
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
  links: { to: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-gold">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="text-sm font-light text-cream/70 transition-colors hover:text-gold"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
