import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DiamondField } from "@/components/registry";
import { HeroImageUpload } from "@/components/registry/photo-upload";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchPlatformStats } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NexusZim - Zimbabwe's Verified Service Directory" },
      {
        name: "description",
        content:
          "Find, compare, and brief verified service providers in Zimbabwe. Events, transport, business services, personal care, and more.",
      },
    ],
  }),
  component: LandingPage,
});

const REGISTRY_DISCLAIMER =
  "NexusZim is an accreditation registry and does not handle or intermediate client funds.";

function LandingPage() {
  const [q, setQ] = useState("");
  const [heroBg, setHeroBg] = useState<string | null>(null);
  const navigate = useNavigate();
  const { roles } = useAuth();
  const isAdmin = roles.includes("admin") || roles.includes("super_admin");

  useEffect(() => {
    const { data: bgData } = supabase.storage.from("site-assets").getPublicUrl("hero-bg.jpg");
    setHeroBg(bgData.publicUrl);
  }, []);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: fetchPlatformStats,
    staleTime: 5 * 60 * 1000,
  });


  const STATS =
    statsLoading || !stats
      ? null
      : [
          { value: String(stats.totalProviders), label: "Providers on register", to: "/search" },
          { value: String(stats.totalCategories), label: "Service categories", to: "/categories" },
          { value: String(stats.trustCertified), label: "Trust Certified", to: "/search" },
          { value: String(stats.citiesCount), label: "Cities covered", to: "/search" },
        ];

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    navigate({ to: "/search", search: q.trim() ? { q: q.trim() } : {} });
  }

  return (
    <div className="bg-background pt-16 overflow-x-hidden animate-page-enter">
      {/* ─── 1. HERO ─── */}
      <section className="relative overflow-hidden border-b border-border py-20 lg:py-28">
        {heroBg && (
          <img
            src={heroBg}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full select-none object-cover opacity-30 pointer-events-none"
            onError={() => setHeroBg(null)}
          />
        )}
        <DiamondField tone="forest" className="opacity-[0.6]" />

        {/* Ambient premium wash - warm cream base with a soft gold + forest glow */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 55% at 78% 8%, rgba(212,166,60,0.12), transparent 62%), radial-gradient(52% 48% at 5% 100%, rgba(15,51,35,0.07), transparent 60%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px pointer-events-none animate-shimmer-gold"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(212,166,60,0.2), rgba(240,205,122,0.7), rgba(212,166,60,0.2), transparent)",
            backgroundSize: "200% 100%",
          }}
        />

        {isAdmin && (
          <div className="absolute bottom-4 left-4 z-20">
            <HeroImageUpload currentUrl={heroBg} onUpload={(url) => setHeroBg(url)} />
          </div>
        )}

        <div className="container-page relative z-10">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            {/* Eyebrow chip */}
            <span className="inline-flex items-center gap-2 rounded-[3px] border border-gold/40 bg-gold/[0.06] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-gold-deep animate-fade-up">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rotate-45 bg-gold" />
              Official Registry
            </span>

            <h1
              className="mt-6 font-display text-foreground animate-fade-up delay-100"
              style={{
                fontSize: "clamp(40px, 6vw, 72px)",
                lineHeight: "1.05",
                letterSpacing: "-0.025em",
              }}
            >
              The Standard of Service Excellence.
            </h1>

            <p className="mt-5 max-w-xl font-sans text-base leading-relaxed text-muted-foreground animate-fade-up delay-200">
              Search Zimbabwe's official register of verified service providers by name, category,
              or NX registry number. Every record is traceable, checked, and independently
              accredited.
            </p>

            {/* Search — routes to /search on submit */}
            <form
              onSubmit={handleSearch}
              className="mt-8 flex w-full max-w-xl animate-fade-up delay-300"
            >
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search registry by name, category, or NX- number..."
                  aria-label="Search the registry by name, category, or NX number"
                  className="h-12 w-full border border-border bg-card pl-11 pr-3 font-sans text-sm text-foreground shadow-[var(--elev-sm)] outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/12"
                  style={{ borderRadius: "var(--radius) 0 0 var(--radius)" }}
                />
              </div>
              <button
                type="submit"
                className="btn-cta gold-metal h-12 shrink-0 px-6 font-sans text-sm font-semibold text-gold-foreground"
                style={{ borderRadius: "0 var(--radius) var(--radius) 0" }}
              >
                Search
              </button>
            </form>

            {/* Registry disclaimer */}
            <p className="mt-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground/70 animate-fade-up delay-300">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary/70" strokeWidth={1.75} aria-hidden />
              {REGISTRY_DISCLAIMER}
            </p>
          </div>
        </div>
      </section>

      {/* ─── REGISTER WIRE (live platform stats, breaking-news ticker) ─── */}
      <section
        className="relative overflow-hidden border-y border-cream/10 bg-forest-ink"
        aria-label="Live registry statistics"
      >
        {statsLoading || !STATS ? (
          <div className="container-page flex items-center gap-3 py-3.5">
            <RegisterWireTag />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream/50">
              Register initializing…
            </span>
          </div>
        ) : (
          <div className="flex items-stretch">
            {/* Wire tag pinned left */}
            <div className="relative z-10 hidden shrink-0 items-center border-r border-cream/10 bg-forest-ink py-3.5 pl-6 pr-4 sm:flex">
              <RegisterWireTag />
            </div>
            {/* Fade edge where segments emerge behind the tag */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12"
              style={{ background: "linear-gradient(90deg, transparent, var(--color-forest-ink))" }}
            />
            {/* Scrolling clickable track - pauses on hover so segments can be clicked */}
            <div className="group flex-1 overflow-hidden py-3.5">
              <div className="flex w-max animate-ticker group-hover:[animation-play-state:paused]">
                <StatWireRun stats={STATS} interactive />
                <StatWireRun stats={STATS} interactive={false} />
              </div>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}

type StatItem = { value: string; label: string; to: string };

/** Live-wire tag with a pulsing gold dot, echoing the market wire. */
function RegisterWireTag() {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-gold/60 animate-ping-slow" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
      </span>
      The Register
    </span>
  );
}

function WireDiamond() {
  return (
    <span
      aria-hidden
      className="mx-5 inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0 align-middle"
    />
  );
}

/**
 * One run of the stats wire. Rendered twice by the caller for a seamless -50%
 * loop: the first run is interactive (clickable links), the second is an
 * aria-hidden, non-focusable visual duplicate. The small stat set is repeated so
 * the wire reads as continuous rather than sparse.
 */
function StatWireRun({ stats, interactive }: { stats: StatItem[]; interactive: boolean }) {
  const items = [...stats, ...stats, ...stats];
  return (
    <div className="flex shrink-0 items-center" aria-hidden={!interactive}>
      {items.map((s, i) => (
        <span key={`${s.label}-${i}`} className="flex items-center">
          {interactive ? (
            <Link
              to={s.to}
              className="group/seg inline-flex items-baseline gap-2 whitespace-nowrap rounded-[3px] px-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            >
              <span className="font-display text-xl font-semibold text-cream transition-colors group-hover/seg:text-gold sm:text-2xl">
                {s.value}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-cream/70 transition-colors group-hover/seg:text-gold-hi">
                {s.label}
              </span>
            </Link>
          ) : (
            <span className="inline-flex items-baseline gap-2 whitespace-nowrap px-1" tabIndex={-1}>
              <span className="font-display text-xl font-semibold text-cream sm:text-2xl">
                {s.value}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-cream/70">
                {s.label}
              </span>
            </span>
          )}
          <WireDiamond />
        </span>
      ))}
    </div>
  );
}
