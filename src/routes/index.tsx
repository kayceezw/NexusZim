import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES, PROVIDERS, type CategorySlug } from "@/lib/mock-data";
import { Hallmark } from "@/components/registry/hallmark";
import { Ledger, type LedgerEntry } from "@/components/registry/ledger";
import { CategoryCard } from "@/components/category-card";
import { HeroImageUpload } from "@/components/registry/photo-upload";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

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

const STATS = [
  { value: String(PROVIDERS.length), label: "Providers on register" },
  { value: String(CATEGORIES.length), label: "Service categories" },
  {
    value: String(PROVIDERS.filter((p) => p.tier >= 3).length),
    label: "Trust Certified",
  },
  { value: String(new Set(PROVIDERS.map((p) => p.city)).size), label: "Cities covered" },
];

const FEATURED = PROVIDERS.filter((p) => p.featured).slice(0, 3);

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

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    navigate({ to: "/search", search: q.trim() ? { q: q.trim() } : {} });
  }

  return (
    <div className="bg-cream pt-16 overflow-x-hidden">

      {/* ─── HERO ─── */}
      <section
        className="relative py-20 lg:py-28 border-b border-hairline overflow-hidden"
      >
        {/* Background image (renders only when loaded) */}
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
            {/* Semi-transparent cream overlay so text stays readable */}
            <div className="absolute inset-0 bg-cream/88" />
          </>
        )}

        {/* Admin hero image upload — bottom-left corner */}
        {isAdmin && (
          <div className="absolute bottom-4 left-4 z-20">
            <HeroImageUpload
              currentUrl={heroBg}
              onUpload={(url) => setHeroBg(url)}
            />
          </div>
        )}

        <div className="container-page relative z-10">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-start">

            {/* Left: editorial headline */}
            <div className="space-y-8 lg:pt-6">
              <p className="eyebrow text-text-soft">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                Zimbabwe Service Registry
              </p>

              <h1
                className="text-text"
                style={{ fontSize: "clamp(40px, 5.5vw, 68px)", lineHeight: "1.06", letterSpacing: "-0.02em" }}
              >
                Find providers.
                <br />
                <em className="italic text-gold-deep">Verify the record.</em>
                <br />
                Brief with confidence.
              </h1>

              <p className="font-sans text-base text-text-soft leading-relaxed max-w-[440px]">
                NexusZim maintains a public register of vetted service providers across Zimbabwe. Every listing shows what was checked, by whom, and when.
              </p>

              <form onSubmit={handleSearch} className="flex max-w-[480px]">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-soft/50" strokeWidth={1.5} />
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Service, city, or provider name..."
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
                  <span className="transition-transform group-hover:translate-x-[3px] duration-150">→</span>
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
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`py-8 px-4 text-center ${i < STATS.length - 1 ? "border-r border-cream/10" : ""}`}
              >
                <p className="font-display text-3xl text-cream" style={{ lineHeight: "1.1" }}>
                  {s.value}
                </p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-cream/50">
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
              <span className="transition-transform group-hover:translate-x-[3px] duration-150">→</span>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {CATEGORIES.slice(0, 6).map((c) => (
              <CategoryCard key={c.slug} category={c} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PROVIDERS ─── */}
      {FEATURED.length > 0 && (
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
                <span className="transition-transform group-hover:translate-x-[3px] duration-150">→</span>
              </Link>
            </div>

            <div className="space-y-3">
              {FEATURED.map((p) => {
                const idx = PROVIDERS.indexOf(p);
                const regId = `NX-2024-${String(idx + 147).padStart(5, "0")}`;
                return (
                  <article
                    key={p.id}
                    className="group bg-cream-raised border border-hairline rounded-[6px] hover:border-forest transition-all duration-150 hover:shadow-[0_1px_4px_rgba(15,51,35,0.08)] relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-150" />
                    <div className="flex gap-0 min-h-[96px]">
                      <div className={`flex-shrink-0 w-[72px] flex items-center justify-center font-sans text-lg font-bold border-r border-hairline ${p.avatarColor}`}>
                        {p.initials}
                      </div>
                      <div className="flex-1 px-4 py-3 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to="/providers/$providerId"
                            params={{ providerId: p.id }}
                            className="font-display text-lg text-text group-hover:text-forest transition-colors"
                          >
                            {p.business}
                          </Link>
                          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-soft/60 shrink-0 mt-0.5">
                            {regId}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3">
                          <Hallmark tier={p.tier} />
                          <span className="font-mono text-[11px] text-text-soft">{p.city}</span>
                        </div>
                        <p className="mt-1 font-mono text-[11px] text-text-soft line-clamp-1">
                          On file: {p.services.slice(0, 2).join(", ")}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

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
                Submit your business documents and complete the NexusZim verification process. Listed status is free. Verified and Trust Certified require document review.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                to="/onboarding/provider"
                className="bg-gold px-8 py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors flex items-center gap-2 group justify-center"
              >
                Apply as a provider
                <span className="transition-transform group-hover:translate-x-[3px] duration-150">→</span>
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
