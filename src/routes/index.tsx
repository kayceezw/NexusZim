import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Hallmark } from "@/components/registry/hallmark";
import { Ledger, type LedgerEntry } from "@/components/registry/ledger";
import { CategoryCard } from "@/components/category-card";
import { HeroImageUpload, CategoryBgUpload } from "@/components/registry/photo-upload";
import { StatSkeleton } from "@/components/skeletons";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchPlatformStats, fetchCategories, type ProviderListing } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NexusZim — Zimbabwe's Verified Service Directory" },
      {
        name: "description",
        content:
          "Find, compare, and brief verified service providers in Zimbabwe. Events, transport, business services, personal care, and more.",
      },
    ],
  }),
  component: LandingPage,
});

const SPECIMEN_LEDGER: LedgerEntry[] = [
  { key: "CR14 registration", value: "Confirmed", date: "Apr 2024", verified: true },
  { key: "Identity documents", value: "Verified", date: "Apr 2024", verified: true },
  { key: "Positive rating history", value: "Cleared", date: "Apr 2024", verified: true },
  { key: "Portfolio audit", value: "Passed", date: "Apr 2024", verified: true },
];

function LandingPage() {
  const [q, setQ] = useState("");
  const [heroBg, setHeroBg] = useState<string | null>(null);
  const [categoryBg, setCategoryBg] = useState<string | null>(null);
  const [heroProviderId, setHeroProviderId] = useState<string | null>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const navigate = useNavigate();
  const { roles } = useAuth();
  const isAdmin = roles.includes("admin") || roles.includes("super_admin");

  useEffect(() => {
    const { data: bgData } = supabase.storage.from("site-assets").getPublicUrl("hero-bg.jpg");
    setHeroBg(bgData.publicUrl);

    const { data: catBgData } = supabase.storage
      .from("site-assets")
      .getPublicUrl("category-bg.jpg");
    setCategoryBg(catBgData.publicUrl);

    const { data: cfgData } = supabase.storage.from("site-assets").getPublicUrl("config.json");
    fetch(`${cfgData.publicUrl}?t=${Date.now()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg) => {
        if (cfg?.featuredProviderId) setHeroProviderId(cfg.featuredProviderId);
      })
      .catch(() => {});
  }, []);

  const { data: heroProvider } = useQuery({
    queryKey: ["hero-provider", heroProviderId],
    queryFn: async () => {
      const { data } = await supabase
        .from("provider_profiles")
        .select("*, categories(id, name, slug)")
        .eq("user_id", heroProviderId!)
        .maybeSingle();
      return data as ProviderListing | null;
    },
    enabled: !!heroProviderId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: fetchPlatformStats,
    staleTime: 5 * 60 * 1000,
  });

  const { data: dbCategories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
  });

  const STATS =
    statsLoading || !stats
      ? null
      : [
          { value: String(stats.totalProviders), label: "Providers on register" },
          { value: String(stats.totalCategories), label: "Service categories" },
          { value: String(stats.trustCertified), label: "Trust Certified" },
          { value: String(stats.citiesCount), label: "Cities covered" },
        ];

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    navigate({ to: "/search", search: q.trim() ? { q: q.trim() } : {} });
  }

  return (
    <div className="bg-background pt-16 overflow-x-hidden animate-page-enter">
      {/* ─── HERO ─── */}
      <section className="relative py-20 lg:py-28 border-b border-border overflow-hidden">
        {heroBg && (
          <>
            <img
              ref={heroImgRef}
              src={heroBg}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover opacity-30 pointer-events-none select-none"
              onError={() => setHeroBg(null)}
            />
          </>
        )}

        {/* Ambient premium wash — warm cream base with a soft gold + forest glow */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 55% at 78% 8%, rgba(212,166,60,0.14), transparent 62%), radial-gradient(52% 48% at 5% 100%, rgba(15,51,35,0.08), transparent 60%)",
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
          <div className="grid gap-14 lg:grid-cols-2 lg:items-start">
            <div className="space-y-8 lg:pt-6">
              <p className="eyebrow text-muted-foreground animate-fade-up">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                Zimbabwe's Verified Service Marketplace
              </p>

              <h1
                className="text-foreground animate-fade-up delay-100"
                style={{
                  fontSize: "clamp(44px, 6vw, 76px)",
                  lineHeight: "1.04",
                  letterSpacing: "-0.025em",
                }}
              >
                Find the right provider.
                <br />
                <em className="italic text-gold-deep dark:text-gold">Vetted, verified,</em>
                <br />
                ready to deliver.
              </h1>

              <p className="font-sans text-base text-muted-foreground leading-relaxed max-w-[440px] animate-fade-up delay-200">
                NexusZim is Zimbabwe's verified service directory — find, compare, and brief vetted
                providers across transport, business services, personal care, and more.
              </p>

              <div className="flex flex-wrap gap-3 animate-fade-up delay-250">
                <Link
                  to="/search"
                  className="btn-cta gold-metal px-6 py-3 rounded-[4px] font-sans text-sm font-semibold text-gold-foreground shadow-[var(--elev-sm)]"
                >
                  Browse Service Providers →
                </Link>
                <Link
                  to="/request"
                  className="border border-primary/80 bg-card px-6 py-3 rounded-[4px] font-sans text-sm font-semibold text-primary shadow-[var(--elev-sm)] hover:bg-forest hover:text-cream hover:shadow-[var(--elev-md)] hover:-translate-y-px transition-all duration-150"
                >
                  Request a Quote
                </Link>
              </div>

              <form
                onSubmit={handleSearch}
                className="flex max-w-[480px] animate-fade-up delay-300"
              >
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50"
                    strokeWidth={1.5}
                  />
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Service, city, or provider name..."
                    aria-label="Search for a service or provider"
                    className="w-full h-11 pl-10 pr-3 bg-card border border-border font-sans text-sm text-foreground placeholder:text-muted-foreground/50 outline-none shadow-[var(--elev-sm)] focus:border-primary focus:ring-2 focus:ring-primary/12 transition-all"
                    style={{ borderRadius: "4px 0 0 4px" }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-cta gold-metal px-5 h-11 font-sans text-sm font-semibold text-gold-foreground shrink-0"
                  style={{ borderRadius: "0 4px 4px 0" }}
                >
                  Search
                </button>
              </form>
            </div>

            {/* Right: featured registry card */}
            <HeroRegistryCard provider={heroProvider ?? null} />
          </div>
        </div>
      </section>

      {/* ─── PROOF STRIP ─── */}
      <section className="bg-forest-ink border-b border-forest-ink/20">
        <div className="container-page">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {statsLoading || !STATS
              ? [0, 1, 2, 3].map((i) => (
                  <div key={i} className={i < 3 ? "border-r border-cream/10" : ""}>
                    <StatSkeleton />
                  </div>
                ))
              : STATS.map((s, i) => (
                  <div
                    key={s.label}
                    className={`py-10 px-4 text-center animate-fade-in ${i < STATS.length - 1 ? "border-r border-cream/10" : ""}`}
                  >
                    <p
                      className="font-display text-cream"
                      style={{ fontSize: "clamp(40px, 5vw, 64px)", lineHeight: "1.0" }}
                    >
                      {s.value}
                    </p>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-cream/40">
                      {s.label}
                    </p>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORY INDEX ─── */}
      <section className="relative py-20 border-b border-border overflow-hidden">
        {categoryBg && (
          <img
            src={categoryBg}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-30 pointer-events-none select-none"
            onError={() => setCategoryBg(null)}
          />
        )}
        {isAdmin && (
          <div className="absolute bottom-4 left-4 z-20">
            <CategoryBgUpload currentUrl={categoryBg} onUpload={(url) => setCategoryBg(url)} />
          </div>
        )}
        <div className="container-page relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
            <div className="space-y-2">
              <p className="eyebrow text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                Service categories
              </p>
              <h2 className="font-display font-bold text-3xl lg:text-4xl text-foreground">
                What's on the register
              </h2>
            </div>
            <Link
              to="/categories"
              className="font-sans text-sm font-semibold text-primary hover:text-gold-deep transition-colors mt-4 md:mt-0 flex items-center gap-1 group"
            >
              All categories
              <span className="transition-transform group-hover:translate-x-[3px] duration-150">
                →
              </span>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {dbCategories.slice(0, 6).map((c, i) => (
              <CategoryCard
                key={c.id}
                category={c}
                count={c.provider_count}
                animationDelay={i * 60}
              />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

function HeroRegistryCard({ provider }: { provider: ProviderListing | null }) {
  const name = provider?.business_name ?? "NexusZim";
  const categoryName = (provider?.categories as { name: string } | null)?.name ?? null;
  const city = provider?.city ?? "Zimbabwe";
  const tier = provider?.tier ?? 4;
  const registryId = provider
    ? `NX-${provider.user_id.slice(0, 4).toUpperCase()}-${provider.user_id.slice(4, 9).toUpperCase()}`
    : "NX-0000-00001";
  const tags = categoryName
    ? [categoryName, "Verified Business", "Trust Record"]
    : ["Verified Providers", "Business Records", "Trust Certificates"];

  const linkProps = provider
    ? ({ to: "/providers/$providerId", params: { providerId: provider.user_id } } as const)
    : ({ to: "/search" } as const);

  return (
    <Link
      {...linkProps}
      className="group relative block cursor-pointer bg-forest-ink border border-cream/10 rounded-[8px] p-6 shadow-[var(--elev-xl)] hover:border-primary hover:shadow-[var(--elev-xl),var(--glow-gold)] hover:-translate-y-1 transition-all duration-300 animate-fade-up delay-200 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px animate-shimmer-gold"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(240,205,122,0.25), rgba(240,205,122,0.75), rgba(240,205,122,0.25), transparent)",
          backgroundSize: "200% 100%",
        }}
      />
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-cream/10">
        <div>
          <p className="eyebrow text-cream/40">
            <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
            Registry record
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-cream/50 mt-1">
            {registryId}
          </p>
        </div>
        <Hallmark tier={tier} />
      </div>

      <div className="py-4 border-b border-cream/10">
        <p className="font-display text-2xl leading-tight bg-gradient-to-r from-gold-hi via-gold to-gold-deep bg-clip-text text-transparent transition-[filter] duration-300 group-hover:brightness-110">
          {name}
        </p>
        <p className="font-sans text-[13px] text-cream/60 mt-1">
          {provider ? `${city}` : "Zimbabwe's Verified Service Registry · Harare"}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((s) => (
            <span
              key={s}
              className="font-mono text-[10px] uppercase tracking-[0.06em] text-cream/60 px-2 py-0.5 border border-cream/20 rounded-[3px]"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="py-4 border-b border-cream/10">
        <p className="eyebrow text-cream/40 mb-3">
          <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
          Verification record
        </p>
        <Ledger entries={SPECIMEN_LEDGER} variant="condensed" />
      </div>

      <div className="pt-4 flex items-center justify-between">
        <span className="font-mono text-[11px] text-cream/40 uppercase tracking-[0.08em]">
          {provider ? `Tier ${tier} · Verified` : "NexusZim Platform · Est. 2024"}
        </span>
        <span className="font-sans text-[12px] font-semibold text-gold group-hover:text-gold-hi transition-colors flex items-center gap-1">
          {provider ? "View full record" : "Browse all records"}
          <span className="transition-transform group-hover:translate-x-[3px] duration-150">→</span>
        </span>
      </div>
    </Link>
  );
}
