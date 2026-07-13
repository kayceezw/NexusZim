import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIES, PROVIDERS } from "@/lib/mock-data";
import { CategoryCard } from "@/components/category-card";
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
  const totalProviders = PROVIDERS.length;

  return (
    <div className="bg-background pt-20 min-h-screen">
      {/* Header strip */}
      <div className="bg-[#00301c] py-14">
        <div className="container-page">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50 mb-2">
            Service Network
          </p>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
            Browse by Category
          </h1>
          <p className="mt-3 max-w-lg text-base text-white/70 leading-relaxed">
            {CATEGORIES.length} service categories. {totalProviders} verified providers across
            Zimbabwe.
          </p>
        </div>
      </div>

      {/* Category grid */}
      <div className="container-page py-12 pb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <CategoryCard key={c.slug} category={c} />
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
              const count = PROVIDERS.filter((p) => p.category === cat.slug).length;
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
