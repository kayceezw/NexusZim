import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LiveProviderCard } from "@/components/provider-card";
import { ProviderCardSkeleton } from "@/components/skeletons";
import { Search, X, Loader2, SlidersHorizontal } from "lucide-react";
import {
  fetchProviders,
  fetchCitiesWithCounts,
  fetchCategories,
  fetchRatingsForProviders,
} from "@/lib/queries";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";

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

type SortKey = "tier" | "name" | "city" | "newest";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "tier", label: "Highest tier" },
  { value: "name", label: "Name A–Z" },
  { value: "city", label: "By city" },
  { value: "newest", label: "Newest first" },
];

const TIER_OPTIONS = [
  { value: 1, label: "Listed" },
  { value: 2, label: "Verified" },
  { value: 3, label: "Trust Certified" },
];

const PAGE_SIZE = 20;

function SearchPage() {
  const { q: initialQ } = Route.useSearch();
  const [q, setQ] = useState(initialQ ?? "");
  const [debouncedQ, setDebouncedQ] = useState(initialQ ?? "");
  const [city, setCity] = useState<string>("all");
  const [categorySlug, setCategorySlug] = useState<string>("all");
  const [minTier, setMinTier] = useState<number>(1);
  const [sortBy, setSortBy] = useState<SortKey>("tier");
  const [page, setPage] = useState(0);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Auto-focus search on mount
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Debounce search query — 300ms, results filter immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  // Reset page when filters change
  useEffect(() => setPage(0), [city, categorySlug, minTier, sortBy]);

  const activeFilterCount = [city !== "all", categorySlug !== "all", minTier > 1].filter(
    Boolean,
  ).length;

  function resetFilters() {
    setQ("");
    setDebouncedQ("");
    setCity("all");
    setCategorySlug("all");
    setMinTier(1);
    setPage(0);
  }

  // isTyping tracks whether the user has typed something that hasn't finished debouncing
  const isTyping = q !== debouncedQ;

  const { data: results, isLoading, isFetching } = useQuery({
    queryKey: ["providers", debouncedQ, city, categorySlug, minTier, sortBy, page],
    queryFn: () =>
      fetchProviders({
        search: debouncedQ || undefined,
        city: city !== "all" ? city : undefined,
        categorySlug: categorySlug !== "all" ? categorySlug : undefined,
        minTier,
        sortBy,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    staleTime: 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // Reputation for the visible providers — earned review aggregates, shown on cards.
  const resultIds = (results ?? []).map((p) => p.user_id);
  const { data: ratings } = useQuery({
    queryKey: ["provider-ratings", resultIds],
    queryFn: () => fetchRatingsForProviders(resultIds),
    enabled: resultIds.length > 0,
    staleTime: 60 * 1000,
  });

  const { data: citiesData } = useQuery({
    queryKey: ["cities-with-counts"],
    queryFn: fetchCitiesWithCounts,
    staleTime: 5 * 60 * 1000,
  });

  const { data: dbCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
  });

  const activeCities = citiesData ?? [];
  const activeCategories = dbCategories ?? [];

  // Filtered categories for the drawer's search input
  const filteredDrawerCategories = categorySearch
    ? activeCategories.filter((c) =>
        c.name.toLowerCase().includes(categorySearch.toLowerCase()),
      )
    : activeCategories;

  const hasMore = (results?.length ?? 0) === PAGE_SIZE;
  // Show spinner when debouncing OR when a new fetch is in flight
  const showSpinner = isTyping || (isFetching && !isLoading);

  return (
    <div className="bg-background pt-16 min-h-screen animate-page-enter">
      {/* ─── STICKY SEARCH BAR ─── */}
      <div className="sticky top-16 z-30 bg-forest-ink border-b border-cream/10 shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
        <div className="container-page py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-xl">
              <form onSubmit={(e) => e.preventDefault()} className="flex">
                <div className="relative flex-1">
                  {showSpinner ? (
                    <Loader2
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold animate-spin"
                      strokeWidth={2}
                    />
                  ) : (
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cream/40"
                      strokeWidth={1.5}
                    />
                  )}
                  <input
                    ref={searchRef}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by name, category, or city..."
                    aria-label="Search providers"
                    className="w-full h-11 pl-10 pr-10 bg-forest-soft border border-cream/20 font-sans text-sm text-cream placeholder:text-cream/40 outline-none focus:border-gold transition-colors"
                    style={{ borderRadius: "3px 0 0 3px" }}
                  />
                  {q && (
                    <button
                      type="button"
                      onClick={() => { setQ(""); searchRef.current?.focus(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-gold px-5 h-11 font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-all hover:brightness-110 active:scale-[0.98] shrink-0"
                  style={{ borderRadius: "0 3px 3px 0" }}
                >
                  Search
                </button>
              </form>
            </div>

            {/* Record count — visible in sticky bar */}
            <div className="shrink-0">
              {!isLoading && !showSpinner && results !== undefined ? (
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-cream/50 animate-fade-in">
                  {results.length === PAGE_SIZE ? `${PAGE_SIZE}+` : results.length} record
                  {results.length !== 1 ? "s" : ""}
                </p>
              ) : showSpinner ? (
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-cream/40 animate-pulse">
                  Searching...
                </p>
              ) : null}
            </div>
          </div>

          {/* Eyebrow label */}
          <p className="eyebrow text-cream/30 mt-2 text-[10px]">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            NexusZim Verified Directory
          </p>
        </div>
      </div>

      <div className="container-page py-6">
        {/* ─── MOBILE FILTER BAR (hidden on lg+) ─── */}
        <div className="lg:hidden mb-4 flex items-center gap-3 overflow-x-auto pb-2">
          {/* Filters button */}
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            className="border border-gold/60 text-gold-deep dark:text-gold bg-forest-soft hover:border-gold transition-colors px-4 h-9 rounded-[3px] font-mono text-[11px] uppercase tracking-[0.08em] flex items-center gap-2 shrink-0"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="font-mono text-[10px] text-gold">
                ({activeFilterCount})
              </span>
            )}
          </button>

          {/* Active filter chips — horizontally scrollable */}
          {city !== "all" && <FilterChip label={city} onRemove={() => setCity("all")} />}
          {categorySlug !== "all" && (
            <FilterChip
              label={
                activeCategories.find((c) => c.slug === categorySlug)?.name ?? categorySlug
              }
              onRemove={() => setCategorySlug("all")}
            />
          )}
          {minTier > 1 && (
            <FilterChip
              label={`Min: ${TIER_OPTIONS.find((t) => t.value === minTier)?.label}`}
              onRemove={() => setMinTier(1)}
            />
          )}

          {/* Sort select */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <label
              htmlFor="sort-select-mobile"
              className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground shrink-0"
            >
              Sort:
            </label>
            <select
              id="sort-select-mobile"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="bg-card border border-border rounded-[3px] px-3 py-1.5 font-sans text-[13px] text-foreground outline-none focus:border-primary transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ─── MOBILE FILTER DRAWER ─── */}
        <Drawer open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="flex items-center justify-between px-5 py-4 border-b border-border">
              <DrawerTitle className="font-display text-base text-foreground">
                Refine Results
              </DrawerTitle>
              <DrawerClose asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4" />
                </button>
              </DrawerClose>
            </DrawerHeader>

            <div className="overflow-y-auto divide-y divide-border">
              {/* Verification tier */}
              <div className="px-5 py-4 space-y-2">
                <p className="eyebrow text-muted-foreground/60 mb-3">Verification tier</p>
                {TIER_OPTIONS.map((t) => (
                  <label
                    key={t.value}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="drawer-tier"
                        checked={minTier === t.value}
                        onChange={() => setMinTier(t.value)}
                        className="accent-forest"
                      />
                      <span className="font-sans text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">
                        {t.label}+
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {/* City */}
              <div className="px-5 py-4 space-y-2">
                <p className="eyebrow text-muted-foreground/60 mb-3">City</p>
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="drawer-city"
                      checked={city === "all"}
                      onChange={() => setCity("all")}
                      className="accent-forest"
                    />
                    <span className="font-sans text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">
                      All cities
                    </span>
                  </div>
                </label>
                {activeCities.length === 0 ? (
                  <p className="font-sans text-[12px] text-muted-foreground/50 italic">No cities yet</p>
                ) : (
                  activeCities.slice(0, 10).map((c) => (
                    <label
                      key={c.city}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="drawer-city"
                          checked={city === c.city}
                          onChange={() => setCity(c.city)}
                          className="accent-forest"
                        />
                        <span className="font-sans text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">
                          {c.city}
                        </span>
                      </div>
                      {c.count > 0 && (
                        <span className="font-mono text-[10px] text-muted-foreground/50">{c.count}</span>
                      )}
                    </label>
                  ))
                )}
              </div>

              {/* Category / Specialty */}
              <div className="px-5 py-4 space-y-2">
                <p className="eyebrow text-muted-foreground/60 mb-3">Specialty</p>
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search specialties..."
                  className="w-full h-9 px-3 bg-background border border-border rounded-[3px] font-sans text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary transition-colors mb-3"
                />
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="drawer-category"
                      checked={categorySlug === "all"}
                      onChange={() => setCategorySlug("all")}
                      className="accent-forest"
                    />
                    <span className="font-sans text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">
                      All specialties
                    </span>
                  </div>
                </label>
                {filteredDrawerCategories.map((c) => (
                  <label
                    key={c.slug}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="drawer-category"
                        checked={categorySlug === c.slug}
                        onChange={() => setCategorySlug(c.slug)}
                        className="accent-forest"
                      />
                      <span className="font-sans text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">
                        {c.name}
                      </span>
                    </div>
                    {c.provider_count > 0 && (
                      <span className="font-mono text-[10px] text-muted-foreground/50">
                        {c.provider_count}
                      </span>
                    )}
                  </label>
                ))}
                {filteredDrawerCategories.length === 0 && categorySearch && (
                  <p className="font-sans text-[12px] text-muted-foreground/50 italic">
                    No specialties match "{categorySearch}"
                  </p>
                )}
              </div>
            </div>

            <DrawerFooter className="px-5 py-4 border-t border-border gap-2">
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                className="w-full bg-gold text-forest-ink font-sans text-sm font-semibold py-3 rounded-[3px] hover:bg-gold-deep transition-colors"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={() => { resetFilters(); setFilterDrawerOpen(false); }}
                className="w-full border border-border text-muted-foreground font-sans text-sm py-2.5 rounded-[3px] hover:border-primary hover:text-primary transition-colors"
              >
                Clear all
              </button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* ─── FILTER RAIL (desktop only) ─── */}
          <aside className="hidden lg:block space-y-0 lg:sticky lg:top-[calc(4rem+6.5rem)] lg:self-start">
            <div className="bg-card border border-border rounded-[6px] divide-y divide-hairline">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4">
                <span className="eyebrow text-muted-foreground">
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
                    className="font-sans text-[12px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>

              {/* Verification tier */}
              <div className="px-5 py-4 space-y-2">
                <p className="eyebrow text-muted-foreground/60 mb-3">Verification tier</p>
                {TIER_OPTIONS.map((t) => (
                  <label
                    key={t.value}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="tier"
                        checked={minTier === t.value}
                        onChange={() => setMinTier(t.value)}
                        className="accent-forest"
                      />
                      <span className="font-sans text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">
                        {t.label}+
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {/* City */}
              <div className="px-5 py-4 space-y-2">
                <p className="eyebrow text-muted-foreground/60 mb-3">City</p>
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="city"
                      checked={city === "all"}
                      onChange={() => setCity("all")}
                      className="accent-forest"
                    />
                    <span className="font-sans text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">
                      All cities
                    </span>
                  </div>
                </label>
                {activeCities.length === 0 ? (
                  <p className="font-sans text-[12px] text-muted-foreground/50 italic">No cities yet</p>
                ) : (
                  activeCities.slice(0, 10).map((c) => (
                    <label
                      key={c.city}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="city"
                          checked={city === c.city}
                          onChange={() => setCity(c.city)}
                          className="accent-forest"
                        />
                        <span className="font-sans text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">
                          {c.city}
                        </span>
                      </div>
                      {c.count > 0 && (
                        <span className="font-mono text-[10px] text-muted-foreground/50">{c.count}</span>
                      )}
                    </label>
                  ))
                )}
              </div>

              {/* Category */}
              <div className="px-5 py-4 space-y-2">
                <p className="eyebrow text-muted-foreground/60 mb-3">Specialty</p>
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="category"
                      checked={categorySlug === "all"}
                      onChange={() => setCategorySlug("all")}
                      className="accent-forest"
                    />
                    <span className="font-sans text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">
                      All specialties
                    </span>
                  </div>
                </label>
                {activeCategories.map((c) => (
                  <label
                    key={c.slug}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="category"
                        checked={categorySlug === c.slug}
                        onChange={() => setCategorySlug(c.slug)}
                        className="accent-forest"
                      />
                      <span className="font-sans text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">
                        {c.name}
                      </span>
                    </div>
                    {c.provider_count > 0 && (
                      <span className="font-mono text-[10px] text-muted-foreground/50">
                        {c.provider_count}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 border border-border rounded-[6px] p-4">
              <p className="font-sans text-[12px] text-muted-foreground leading-relaxed">
                All NexusZim providers have completed identity verification. Trust Certified
                providers have passed an on-site audit by the NexusZim desk.
              </p>
            </div>
          </aside>

          {/* ─── RESULTS ─── */}
          <section className="space-y-4">
            {/* Sort row (desktop) */}
            <div className="hidden lg:flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                {isLoading ? (
                  <span className="animate-pulse">Searching...</span>
                ) : (
                  <>
                    {(results?.length ?? 0) === PAGE_SIZE
                      ? `${PAGE_SIZE}+`
                      : results?.length ?? 0}{" "}
                    result{(results?.length ?? 0) !== 1 ? "s" : ""}
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort-select"
                  className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground shrink-0"
                >
                  Sort:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="bg-card border border-border rounded-[3px] px-3 py-1.5 font-sans text-[13px] text-foreground outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Result count on mobile (below the filter bar) */}
            <p className="lg:hidden font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              {isLoading ? (
                <span className="animate-pulse">Searching...</span>
              ) : (
                <>
                  {(results?.length ?? 0) === PAGE_SIZE
                    ? `${PAGE_SIZE}+`
                    : results?.length ?? 0}{" "}
                  result{(results?.length ?? 0) !== 1 ? "s" : ""}
                </>
              )}
            </p>

            {/* Active filter chips (desktop only — mobile shows these in the scrollable bar) */}
            {activeFilterCount > 0 && (
              <div className="hidden lg:flex flex-wrap gap-2">
                {city !== "all" && <FilterChip label={city} onRemove={() => setCity("all")} />}
                {categorySlug !== "all" && (
                  <FilterChip
                    label={
                      activeCategories.find((c) => c.slug === categorySlug)?.name ?? categorySlug
                    }
                    onRemove={() => setCategorySlug("all")}
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

            {/* Results grid — skeletons while loading initial fetch */}
            <div className="space-y-3">
              {isLoading ? (
                [0, 1, 2, 3, 4].map((i) => <ProviderCardSkeleton key={i} />)
              ) : results && results.length > 0 ? (
                results.map((p, i) => (
                  <div
                    key={p.user_id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <LiveProviderCard provider={p} rating={ratings?.[p.user_id]} />
                  </div>
                ))
              ) : null}
            </div>

            {/* Empty state */}
            {!isLoading && !showSpinner && results?.length === 0 && (
              <div className="border border-dashed border-border rounded-[6px] p-16 text-center bg-card animate-fade-in">
                <div className="mb-4 flex justify-center">
                  <span className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center">
                    <Search className="h-5 w-5 text-gold" strokeWidth={1.5} />
                  </span>
                </div>
                <p className="font-display text-xl text-foreground">No records found</p>
                <p className="mt-3 font-sans text-[13px] text-muted-foreground max-w-sm mx-auto">
                  {q
                    ? `No providers match "${q}". Try a different term or remove filters.`
                    : "Try broadening your search or removing filters to see more results."}
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 border border-primary px-7 py-2.5 rounded-[3px] font-sans text-sm font-semibold text-primary hover:bg-forest hover:text-cream transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Load more */}
            {!isLoading && hasMore && (
              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => setPage((n) => n + 1)}
                  className="border border-primary px-8 py-2.5 rounded-[3px] font-sans text-sm font-semibold text-primary hover:bg-forest hover:text-cream transition-colors"
                >
                  Load more providers
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
      className="inline-flex items-center gap-1.5 border border-primary/30 bg-primary/10 text-primary px-3 py-1 rounded-[3px] font-mono text-[10px] uppercase tracking-[0.06em] hover:bg-primary/15 transition-colors"
    >
      {label}
      <X className="h-3 w-3" />
    </button>
  );
}
