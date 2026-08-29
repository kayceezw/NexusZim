import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  DiamondField,
  RegistryChip,
  SectionHeading,
} from "@/components/registry";
import {
  VerificationStandard,
  CertificateOfAccreditation,
  CategoryExcellenceGrid,
} from "@/components/registry/home-sections";
import { HeroImageUpload, CategoryBgUpload } from "@/components/registry/photo-upload";
import { StatSkeleton } from "@/components/skeletons";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchPlatformStats,
  fetchCategories,
  providerRegistryId,
  type ProviderListing,
} from "@/lib/queries";

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
  const [categoryBg, setCategoryBg] = useState<string | null>(null);
  const [heroProviderId, setHeroProviderId] = useState<string | null>(null);
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

  // Registry identifier used in the Certificate-of-Accreditation specimen. Derived
  // from the featured provider when configured; otherwise a stable house record.
  const certificateRegistryId = heroProvider
    ? providerRegistryId(heroProvider.user_id)
    : "NX-2024-8492A";

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
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/[0.06] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-gold-deep animate-fade-up">
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

      {/* ─── PROOF STRIP (real platform stats) ─── */}
      <section className="border-b border-forest-ink/20 bg-forest-ink">
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
                    className={`animate-fade-in px-4 py-10 text-center ${i < STATS.length - 1 ? "border-r border-cream/10" : ""}`}
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

      {/* ─── 2. THE VERIFICATION STANDARD ─── */}
      <section className="border-b border-border py-20 lg:py-24">
        <div className="container-page">
          <SectionHeading
            align="center"
            eyebrow="Accreditation Tiers"
            title="The Verification Standard"
            subcopy="Every provider on the register holds one of three verification tiers. Each tier reflects the depth of checks completed against their record."
            className="mx-auto mb-12"
          />
          <VerificationStandard />
        </div>
      </section>

      {/* ─── 3. TRACEABLE TRUST ─── */}
      <section className="relative overflow-hidden border-b border-border py-20 lg:py-24">
        <DiamondField tone="forest" className="opacity-[0.4]" />
        <div className="container-page relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: copy + verification example */}
            <div>
              <SectionHeading
                eyebrow="Traceable Trust"
                title="One number. A complete, permanent record."
                subcopy="Every accredited provider is issued a unique NX registry number. It never changes, it cannot be reassigned, and it links directly to the provider's verification history on the official register."
              />

              <div className="mt-8 rounded-[var(--radius)] border border-border bg-card p-6 shadow-[var(--elev-sm)]">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Verification Example
                </p>
                <div className="mt-4">
                  <RegistryChip value="NX-2024-8492A" copyable tone="default" size="md" />
                </div>
                <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">
                  Copy any NX number and check it in the Verification Center to confirm a provider's
                  current tier, status, and accreditation history.
                </p>
              </div>
            </div>

            {/* Right: decorative certificate */}
            <CertificateOfAccreditation registryId={certificateRegistryId} />
          </div>
        </div>
      </section>

      {/* ─── 4. CATEGORIES OF EXCELLENCE ─── */}
      <section className="relative overflow-hidden py-20 lg:py-24">
        {categoryBg && (
          <img
            src={categoryBg}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full select-none object-cover opacity-20 pointer-events-none"
            onError={() => setCategoryBg(null)}
          />
        )}
        {isAdmin && (
          <div className="absolute bottom-4 left-4 z-20">
            <CategoryBgUpload currentUrl={categoryBg} onUpload={(url) => setCategoryBg(url)} />
          </div>
        )}
        <div className="container-page relative z-10">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Service Categories"
              title="Categories of Excellence"
              subcopy="Browse the register by discipline. Each category lists only providers whose credentials have been recorded."
            />
            <Link
              to="/categories"
              className="group flex shrink-0 items-center gap-1 font-sans text-sm font-semibold text-primary transition-colors hover:text-gold-deep"
            >
              All categories
              <span className="transition-transform duration-150 group-hover:translate-x-[3px]">
                →
              </span>
            </Link>
          </div>

          <CategoryExcellenceGrid categories={dbCategories} />
        </div>
      </section>
    </div>
  );
}
