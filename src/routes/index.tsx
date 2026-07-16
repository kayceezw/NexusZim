import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CATEGORIES, type CategorySlug } from "@/lib/mock-data";
import { Hallmark } from "@/components/registry/hallmark";
import { Ledger, type LedgerEntry } from "@/components/registry/ledger";
import { CategoryCard } from "@/components/category-card";
import { LiveProviderCard } from "@/components/provider-card";
import { HeroImageUpload } from "@/components/registry/photo-upload";
import { ProviderCardSkeleton, StatSkeleton } from "@/components/skeletons";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchFeaturedProviders,
  fetchPlatformStats,
  fetchCategories,
} from "@/lib/queries";

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
  const heroImgRef = useRef<HTMLImageElement>(null);
  const navigate = useNavigate();
  const { roles } = useAuth();
  const isAdmin = roles.includes("admin") || roles.includes("super_admin");

  useEffect(() => {
    const { data } = supabase.storage.from("site-assets").getPublicUrl("hero-bg.jpg");
    setHeroBg(data.publicUrl);
  }, []);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: fetchPlatformStats,
    staleTime: 5 * 60 * 1000,
  });

  const { data: featured, isLoading: featuredLoading } = useQuery({
    queryKey: ["featured-providers"],
    queryFn: fetchFeaturedProviders,
    staleTime: 5 * 60 * 1000,
  });

  const { data: dbCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
  });

  const categoryCountMap = Object.fromEntries(
    (dbCategories ?? []).map((c) => [c.slug, c.provider_count]),
  );

  const STATS = statsLoading || !stats
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
    <div className="bg-cream pt-16 overflow-x-hidden">
      {/* ─── HERO ─── */}
      <section className="relative py-20 lg:py-28 border-b border-hairline overflow-hidden">
        {heroBg && (
          <>
            <img
              ref={heroImgRef}
              src={heroBg}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setHeroBg(null)}
            />
            <div className="absolute inset-0 bg-cream/88" />
          </>
        )}

        {isAdmin && (
          <div className="absolute bottom-4 left-4 z-20">
            <HeroImageUpload currentUrl={heroBg} onUpload={(url) => setHeroBg(url)} />
          </div>
        )}

        <div className="container-page relative z-10">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-start">
            <div className="space-y-8 lg:pt-6">
              <p className="eyebrow text-text-soft animate-fade-up">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                Zimbabwe Service Registry
              </p>

              <h1
                className="text-text animate-fade-up delay-100"
                style={{
                  fontSize: "clamp(44px, 6vw, 76px)",
                  lineHeight: "1.04",
                  letterSpacing: "-0.025em",
                }}
              >
                Find providers.
                <br />
                <em className="italic text-gold-deep">Verify the record.</em>
                <br />
                Brief with confidence.
              </h1>

              <p className="font-sans text-base text-text-soft leading-relaxed max-w-[440px] animate-fade-up delay-200">
                NexusZim maintains a public register of vetted service providers across Zimbabwe.
                Every listing shows what was checked, by whom, and when.
              </p>

              <form onSubmit={handleSearch} className="flex max-w-[480px] animate-fade-up delay-300">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-soft/50"
                    strokeWidth={1.5}
                  />
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Service, city, or provider name..."
                    aria-label="Search for a service or provider"
                    className="w-full h-11 pl-10 pr-3 bg-cream-raised border border-hairline font-sans text-sm text-text placeholder:text-text-soft/50 outline-none focus:border-forest transition-colors"
                    style={{ borderRadius: "3px 0 0 3px" }}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gold px-5 h-11 font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors shrink-0"
                  style={{ borderRadius: "0 3px 3px 0" }}
                >
                  Search
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                {CATEGORIES.slice(0, 5).map((c) => (
                  <Link
                    key={c.slug}
                    to="/categories/$slug"
                    params={{ slug: c.slug as CategorySlug }}
                    className="border border-hairline bg-cream-raised px-3 py-1 rounded-[3px] font-sans text-[12px] font-medium text-text-soft hover:border-forest hover:text-forest transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: specimen registry card */}
            <div className="bg-cream-raised border border-hairline rounded-[6px] p-6 shadow-[0_2px_12px_rgba(15,51,35,0.08)]">
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-hairline">
                <div>
                  <p className="eyebrow text-text-soft/60">
                    <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
                    Registry record
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-soft mt-1">
                    NX-2024-00147
                  </p>
                </div>
                <Hallmark tier={3} />
              </div>

              <div className="py-4 border-b border-hairline">
                <p className="font-display text-2xl text-text leading-tight">
                  Peerless Events Group
                </p>
                <p className="font-sans text-[13px] text-text-soft mt-1">
                  Operated by Chiyedza Mutimba &middot; Harare
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Corporate Events", "AV Production", "Protocol Officers"].map((s) => (
                    <span
                      key={s}
                      className="font-mono text-[10px] uppercase tracking-[0.06em] text-text-soft px-2 py-0.5 border border-hairline rounded-[3px]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="py-4 border-b border-hairline">
                <p className="eyebrow text-text-soft/60 mb-3">
                  <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
                  Verification record
                </p>
                <Ledger entries={SPECIMEN_LEDGER} variant="condensed" />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <span className="font-mono text-[11px] text-text-soft/60 uppercase tracking-[0.08em]">
                  Next review: Apr 2025
                </span>
                <Link
                  to="/search"
                  className="font-sans text-[12px] font-semibold text-forest hover:text-gold-deep transition-colors flex items-center gap-1 group"
                >
                  Browse all records
                  <span className="transition-transform group-hover:translate-x-[3px] duration-150">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROOF STRIP ─── */}
      <section className="bg-forest border-b border-forest/20">
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
      <section className="py-20 border-b border-hairline">
        <div className="container-page">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
            <div className="space-y-2">
              <p className="eyebrow text-text-soft">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                Service categories
              </p>
              <h2 className="font-display text-3xl lg:text-4xl text-text">
                What's on the register
              </h2>
            </div>
            <Link
              to="/categories"
              className="font-sans text-sm font-semibold text-forest hover:text-gold-deep transition-colors mt-4 md:mt-0 flex items-center gap-1 group"
            >
              All categories
              <span className="transition-transform group-hover:translate-x-[3px] duration-150">
                →
              </span>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {CATEGORIES.slice(0, 6).map((c) => (
              <CategoryCard
                key={c.slug}
                category={c}
                count={categoryCountMap[c.slug]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PROVIDERS ─── */}
      <section className="py-20 border-b border-hairline">
        <div className="container-page">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
            <div className="space-y-2">
              <p className="eyebrow text-text-soft">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                Featured records
              </p>
              <h2 className="font-display text-3xl lg:text-4xl text-text">
                Providers from the register
              </h2>
            </div>
            <Link
              to="/search"
              className="font-sans text-sm font-semibold text-forest hover:text-gold-deep transition-colors mt-4 md:mt-0 flex items-center gap-1 group"
            >
              Full directory
              <span className="transition-transform group-hover:translate-x-[3px] duration-150">
                →
              </span>
            </Link>
          </div>

          <div className="space-y-3">
            {featuredLoading
              ? [0, 1, 2].map((i) => <ProviderCardSkeleton key={i} />)
              : featured && featured.length > 0
                ? featured.map((p) => <LiveProviderCard key={p.user_id} provider={p} />)
                : (
                  <div className="border border-dashed border-hairline rounded-[6px] p-12 text-center bg-cream-raised">
                    <p className="font-display text-xl text-text">Building the register</p>
                    <p className="mt-2 font-sans text-[13px] text-text-soft">
                      Verified providers will appear here as they join NexusZim.
                    </p>
                    <Link
                      to="/onboarding/provider"
                      className="mt-5 inline-flex items-center gap-2 bg-gold px-6 py-2.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
                    >
                      Apply as a provider →
                    </Link>
                  </div>
                )}
          </div>
        </div>
      </section>

      {/* ─── PROVIDER CTA ─── */}
      <section className="bg-forest py-20">
        <div className="container-page">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-3">
              <p className="eyebrow text-cream/40">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                For service providers
              </p>
              <h2 className="font-display text-3xl lg:text-4xl text-cream">
                Apply to join the register
              </h2>
              <p className="font-sans text-sm text-cream/60 max-w-md leading-relaxed">
                Submit your business documents and complete the NexusZim verification process.
                Listed status is free. Verified and Trust Certified require document review.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                to="/onboarding/provider"
                className="bg-gold px-8 py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors flex items-center gap-2 group justify-center"
              >
                Apply as a provider
                <span className="transition-transform group-hover:translate-x-[3px] duration-150">
                  →
                </span>
              </Link>
              <Link
                to="/about"
                className="border border-cream/20 px-8 py-3.5 rounded-[3px] font-sans text-sm font-semibold text-cream hover:border-cream/60 hover:bg-cream/5 transition-colors text-center"
              >
                About NexusZim
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
