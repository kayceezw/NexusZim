import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CATEGORIES, CITIES, PROVIDERS, type CategorySlug } from "@/lib/mock-data";
import { ProviderCard } from "@/components/provider-card";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Find providers — NexusZim" },
      {
        name: "description",
        content:
          "Search and filter vetted service providers in Zimbabwe by category, city, price and rating.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState<string>("all");
  const [category, setCategory] = useState<"all" | CategorySlug>("all");
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [minRating, setMinRating] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return PROVIDERS.filter((p) => {
      if (city !== "all" && p.city !== city) return false;
      if (category !== "all" && p.category !== category) return false;
      if (p.priceFrom > maxPrice) return false;
      if (p.rating < minRating) return false;
      if (verifiedOnly && !p.verified) return false;
      if (term) {
        const hay = [
          p.name,
          p.business,
          p.bio,
          p.city,
          ...p.services,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [q, city, category, maxPrice, minRating, verifiedOnly]);

  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
        Find a provider
      </h1>
      <p className="mt-2 text-muted-foreground">
        Filter by category, city, price and rating.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Filters */}
        <aside className="space-y-5 rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-20 lg:self-start">
          <h2 className="font-display font-semibold">Filters</h2>

          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as "all" | CategorySlug)}
              className="select-base"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="City">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="select-base"
            >
              <option value="all">All cities</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label={`Max starting price: $${maxPrice}`}>
            <input
              type="range"
              min={20}
              max={1000}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-teal"
            />
          </Field>

          <Field label={`Min rating: ${minRating.toFixed(1)}`}>
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full accent-teal"
            />
          </Field>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="h-4 w-4 accent-teal"
            />
            Verified providers only
          </label>
        </aside>

        {/* Results */}
        <section>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by service, name or city…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {results.length} result{results.length === 1 ? "" : "s"}
          </p>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {results.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>

          {results.length === 0 && (
            <div className="mt-10 rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="font-display text-lg font-semibold">
                No providers match those filters
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try widening your search or post a request to receive quotes.
              </p>
            </div>
          )}
        </section>
      </div>

      <style>{`
        .select-base {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--border);
          background: var(--background);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: var(--foreground);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
