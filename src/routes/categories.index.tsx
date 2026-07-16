import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CATEGORIES } from "@/lib/mock-data";
import { CategoryCard } from "@/components/category-card";
import { fetchCategories } from "@/lib/queries";
import {
  Crown,
  PartyPopper,
  Stamp,
  Building2,
  Car,
  Scissors,
  Dumbbell,
  Shirt,
  Briefcase,
  Home,
  Stethoscope,
  GraduationCap,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Crown, PartyPopper, Stamp, Building2, Car, Scissors,
  Dumbbell, Shirt, Briefcase, Home, Stethoscope,
  GraduationCap, UtensilsCrossed, Wrench,
};

export const Route = createFileRoute("/categories/")({
  head: () => ({
    meta: [
      { title: "Service categories — NexusZim" },
      {
        name: "description",
        content:
          "Browse all service categories on NexusZim — events, visa & docs, transport, beauty, business services and more.",
      },
    ],
  }),
  component: CategoriesPage,
});

type ViewMode = "grid" | "list";

function CategoriesPage() {
  const { data: dbCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
  });

  const countMap = Object.fromEntries(
    (dbCategories ?? []).map((c) => [c.slug, c.provider_count]),
  );
  const totalProviders = (dbCategories ?? []).reduce((s, c) => s + c.provider_count, 0);

  return (
    <div className="bg-cream pt-16 min-h-screen">
      {/* Forest header */}
      <div className="bg-forest border-b border-cream/10 py-12">
        <div className="container-page">
          <p className="eyebrow text-cream/40 mb-3">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            Service network
          </p>
          <h1 className="font-display text-cream" style={{ fontSize: "clamp(32px, 4.5vw, 56px)", lineHeight: "1.06", letterSpacing: "-0.02em" }}>
            Browse by Category
          </h1>
          <p className="mt-3 max-w-lg font-sans text-sm text-cream/60 leading-relaxed">
            {dbCategories?.length ?? CATEGORIES.length} service categories · {totalProviders} verified providers across Zimbabwe.
          </p>
        </div>
      </div>

      {/* Category grid */}
      <div className="container-page py-12 pb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <CategoryCard key={c.slug} category={c} count={countMap[c.slug]} />
          ))}
        </div>
      </div>

      {/* Two-tier reference — all categories with sub-categories listed */}
      <div className="border-t border-gold/10 mt-8">
        <div className="container-page py-16 pb-24">
          <div className="flex items-center gap-4 mb-10">
            <span className="h-px w-8 bg-gold/40" />
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
              Full Service Index
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const count = countMap[cat.slug] ?? 0;
              const Icon = ICON_MAP[cat.icon];
              return (
                <div
                  key={cat.slug}
                  className="border border-hairline bg-cream-raised rounded-[6px] overflow-hidden"
                >
                  {/* Parent header */}
                  <Link
                    to="/categories/$slug"
                    params={{ slug: cat.slug }}
                    className="group flex items-center gap-3 px-5 py-4 border-b border-hairline hover:bg-forest hover:border-forest transition-colors"
                  >
                    {Icon && (
                      <Icon
                        className="h-4 w-4 shrink-0 text-gold group-hover:text-gold transition-colors"
                        strokeWidth={1.5}
                      />
                    )}
                    <span className="font-display text-base font-bold text-text group-hover:text-white transition-colors flex-1 leading-tight">
                      {cat.name}
                    </span>
                    <span className="font-mono text-[9px] text-text-soft/50 group-hover:text-white/50 transition-colors shrink-0">
                      {count} on register
                    </span>
                  </Link>

                  {/* Sub-categories */}
                  <ul className="divide-y divide-hairline/60">
                    {cat.subCategories.map((sub) => (
                      <li key={sub}>
                        <Link
                          to="/categories/$slug"
                          params={{ slug: cat.slug }}
                          className="group/sub flex items-center justify-between px-5 py-2.5 hover:bg-gold/5 transition-colors"
                        >
                          <span className="font-sans text-[13px] text-text-soft group-hover/sub:text-text transition-colors leading-snug">
                            {sub}
                          </span>
                          <span
                            aria-hidden
                            className="font-sans text-xs text-forest opacity-0 group-hover/sub:opacity-100 transition-opacity shrink-0 ml-2"
                          >
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
