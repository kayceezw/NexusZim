import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CATEGORIES, CITIES, PROVIDERS, type CategorySlug } from "@/lib/mock-data";
import { ProviderCard } from "@/components/provider-card";
import { Search, X } from "lucide-react";

interface SearchParams {
  q?: string;
}

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Service Directory — NexusZim" },
      {
        name: "description",
        content:
          "Search and filter vetted service providers in Zimbabwe by verification tier, category, and city.",
      },
    ],
  }),
  component: SearchPage,
});

type SortKey = "rating" | "price_asc" | "price_desc" | "response";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "rating", label: "Highest rated" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "response", label: "Fastest response" },
];

const TIER_OPTIONS = [
  { value: 1, label: "Listed" },
  { value: 2, label: "Verified" },
  { value: 3, label: "Trust Certified" },
];

function parseResponseMinutes(s: string): number {
  const num = parseInt(s.match(/\d+/)?.[0] ?? "999", 10);
  if (s.includes("hr")) return num * 60;
  return num;
}

function tierCount(tier: number) {
  return PROVIDERS.filter((p) => p.tier >= tier).length;
}

function cityCount(city: string) {
  return PROVIDERS.filter((p) => p.city === city).length;
}

function categoryCount(slug: string) {
  return PROVIDERS.filter((p) => p.category === slug).length;
}

function SearchPage() {
  const { q: initialQ } = Route.useSearch();
  const [q, setQ] = useState(initialQ ?? "");
  const [city, setCity] = useState<string>("all");
  const [category, setCategory] = useState<"all" | CategorySlug>("all");
  const [minTier, setMinTier] = useState<number>(1);
  const [sortBy, setSortBy] = useState<SortKey>("rating");
  const [availableOnly, setAvailableOnly] = useState(false);

  const activeFilterCount = [
    city !== "all",
    category !== "all",
    minTier > 1,
    availableOnly,
  ].filter(Boolean).length;

  function resetFilters() {
    setQ("");
    setCity("all");
    setCategory("all");
    setMinTier(1);
    setAvailableOnly(false);
  }

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = PROVIDERS.filter((p) => {
      if (availableOnly && p.availability !== "available") return false;
      if (city !== "all" && p.city !== city) return false;
      if (category !== "all" && p.category !== category) return false;
      if (p.tier < minTier) return false;
      if (term) {
        const hay = [p.name, p.business, p.bio, p.city, ...p.services].join(" ").toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price_asc") return a.priceFrom - b.priceFrom;
      if (sortBy === "price_desc") return b.priceFrom - a.priceFrom;
      if (sortBy === "response")
        return parseResponseMinutes(a.responseTime) - parseResponseMinutes(b.responseTime);
      return 0;
    });
  }, [q, city, category, minTier, sortBy, availableOnly]);

  return (
    <div className="bg-cream pt-16 min-h-screen">

      {/* Forest header with search */}
      <div className="bg-forest border-b border-cream/10">
        <div className="container-page py-8">
          <p className="eyebrow text-cream/40 mb-3">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            Verified Directory
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="font-display text-3xl lg:text-4xl text-cream">
              Service providers on register
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-cream/40">
              {results.length} record{results.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Search bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); }}
            className="mt-6 flex max-w-xl"
          >
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cream/40"
                strokeWidth={1.5}
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, service, or city..."
                className="w-full h-11 pl-10 pr-4 bg-forest-soft border border-cream/20 font-sans text-sm text-cream placeholder:text-cream/40 outline-none focus:border-cream/60 transition-colors"
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
        </div>
      </div>

      <div className="container-page py-8">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">

          {/* ─── FILTER RAIL ─── */}
          <aside className="space-y-0 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-cream-raised border border-hairline rounded-[6px] divide-y divide-hairline">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4">
                <span className="eyebrow text-text-soft">
                  <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1.5 font-mono text-[10px] text-gold">
                      ({activeFilterCount})
                    </span>
                  )}
                </span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="font-sans text-[12px] text-text-soft hover:text-forest transition-colors flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>

              {/* Verification tier */}
              <div className="px-5 py-4 space-y-2">
                <p className="eyebrow text-text-soft/60 mb-3">
                  Verification tier
                </p>
                {TIER_OPTIONS.map((t) => (
                  <label key={t.value} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="tier"
                        checked={minTier === t.value}
                        onChange={() => setMinTier(t.value)}
                        className="accent-forest"
                      />
                      <span className="font-sans text-[13px] text-text-soft group-hover:text-text transition-colors">
                        {t.label}+
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-text-soft/50">
                      {tierCount(t.value)}
                    </span>
                  </label>
                ))}
              </div>

              {/* City */}
              <div className="px-5 py-4 space-y-2">
                <p className="eyebrow text-text-soft/60 mb-3">City</p>
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="city"
                      checked={city === "all"}
                      onChange={() => setCity("all")}
                      className="accent-forest"
                    />
                    <span className="font-sans text-[13px] text-text-soft group-hover:text-text transition-colors">
                      All cities
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-text-soft/50">{PROVIDERS.length}</span>
                </label>
                {CITIES.filter((c) => cityCount(c) > 0).map((c) => (
                  <label key={c} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="city"
                        checked={city === c}
                        onChange={() => setCity(c)}
                        className="accent-forest"
                      />
                      <span className="font-sans text-[13px] text-text-soft group-hover:text-text transition-colors">
                        {c}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-text-soft/50">{cityCount(c)}</span>
                  </label>
                ))}
              </div>

              {/* Category */}
              <div className="px-5 py-4 space-y-2">
                <p className="eyebrow text-text-soft/60 mb-3">Specialty</p>
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="category"
                      checked={category === "all"}
                      onChange={() => setCategory("all")}
                      className="accent-forest"
                    />
                    <span className="font-sans text-[13px] text-text-soft group-hover:text-text transition-colors">
                      All specialties
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-text-soft/50">{PROVIDERS.length}</span>
                </label>
                {CATEGORIES.map((c) => (
                  <label key={c.slug} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="category"
                        checked={category === c.slug}
                        onChange={() => setCategory(c.slug as CategorySlug)}
                        className="accent-forest"
                      />
                      <span className="font-sans text-[13px] text-text-soft group-hover:text-text transition-colors">
                        {c.name}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-text-soft/50">{categoryCount(c.slug)}</span>
                  </label>
                ))}
              </div>

              {/* Available now */}
              <div className="px-5 py-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-sans text-[13px] text-text-soft">Available now only</span>
                  <button
                    role="switch"
                    aria-checked={availableOnly}
                    onClick={() => setAvailableOnly((v) => !v)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${availableOnly ? "bg-forest" : "bg-hairline"}`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${availableOnly ? "left-4" : "left-0.5"}`}
                    />
                  </button>
                </label>
              </div>
            </div>

            <div className="mt-4 border border-hairline rounded-[6px] p-4">
              <p className="font-sans text-[12px] text-text-soft leading-relaxed">
                All NexusZim providers have completed identity verification. Trust Certified providers have passed an on-site audit by the NexusZim desk.
              </p>
            </div>
          </aside>

          {/* ─── RESULTS ─── */}
          <section className="space-y-4">
            {/* Sort row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-soft">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-soft shrink-0">
                  Sort:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="bg-cream-raised border border-hairline rounded-[3px] px-3 py-1.5 font-sans text-[13px] text-text outline-none focus:border-forest transition-colors cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableOnly && (
                  <FilterChip label="Available Now" onRemove={() => setAvailableOnly(false)} />
                )}
                {city !== "all" && (
                  <FilterChip label={city} onRemove={() => setCity("all")} />
                )}
                {category !== "all" && (
                  <FilterChip
                    label={CATEGORIES.find((c) => c.slug === category)?.name ?? category}
                    onRemove={() => setCategory("all")}
                  />
                )}
                {minTier > 1 && (
                  <FilterChip
                    label={`Min: ${TIER_OPTIONS.find((t) => t.value === minTier)?.label}`}
                    onRemove={() => setMinTier(1)}
                  />
                )}
              </div>
            )}

            {/* Registry rows */}
            <div className="space-y-3">
              {results.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>

            {results.length === 0 && (
              <div className="border border-dashed border-hairline rounded-[6px] p-16 text-center bg-cream-raised">
                <p className="font-display text-xl text-text">No records found</p>
                <p className="mt-3 font-sans text-[13px] text-text-soft max-w-sm mx-auto">
                  Try broadening your search or removing filters to see more results.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 border border-forest px-7 py-2.5 rounded-[3px] font-sans text-sm font-semibold text-forest hover:bg-forest hover:text-cream transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 border border-forest/30 bg-forest/5 text-forest px-3 py-1 rounded-[3px] font-mono text-[10px] uppercase tracking-[0.06em] hover:bg-forest/10 transition-colors"
    >
      {label}
      <X className="h-3 w-3" />
    </button>
  );
}
