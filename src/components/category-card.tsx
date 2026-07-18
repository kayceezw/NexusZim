import { Link } from "@tanstack/react-router";
import type { Category, CategorySlug } from "@/lib/mock-data";

/**
 * Per-slug accent palette — each category gets a distinct colour.
 * Values are raw Tailwind / inline-style values to avoid purging issues.
 * border-left colour uses inline style; icon bg + text use utility classes.
 */
const SLUG_ACCENT: Record<
  CategorySlug,
  {
    borderColor: string; // CSS color for the left-border accent stripe
    iconBg: string;      // Tailwind bg utility
    iconText: string;    // Tailwind text utility
    badgeBg: string;     // Tailwind bg for sub-category chips
    badgeBorder: string; // Tailwind border for sub-category chips
  }
> = {
  "elite-concierge": {
    borderColor: "#e7a020", // amber gold
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
    badgeBg: "bg-amber-50/60",
    badgeBorder: "border-amber-200",
  },
  "events-production": {
    borderColor: "#7c3aed", // violet
    iconBg: "bg-violet-50",
    iconText: "text-violet-600",
    badgeBg: "bg-violet-50/60",
    badgeBorder: "border-violet-200",
  },
  "visa-immigration": {
    borderColor: "#0f3323", // forest (primary brand)
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-700",
    badgeBg: "bg-emerald-50/60",
    badgeBorder: "border-emerald-200",
  },
  "company-registration": {
    borderColor: "#4338ca", // indigo
    iconBg: "bg-indigo-50",
    iconText: "text-indigo-600",
    badgeBg: "bg-indigo-50/60",
    badgeBorder: "border-indigo-200",
  },
  "transport-logistics": {
    borderColor: "#0284c7", // sky blue
    iconBg: "bg-sky-50",
    iconText: "text-sky-600",
    badgeBg: "bg-sky-50/60",
    badgeBorder: "border-sky-200",
  },
  "beauty-grooming-wellness": {
    borderColor: "#db2777", // pink
    iconBg: "bg-pink-50",
    iconText: "text-pink-600",
    badgeBg: "bg-pink-50/60",
    badgeBorder: "border-pink-200",
  },
  "fitness-personal-training": {
    borderColor: "#dc2626", // red
    iconBg: "bg-red-50",
    iconText: "text-red-600",
    badgeBg: "bg-red-50/60",
    badgeBorder: "border-red-200",
  },
  "fashion-tailoring-styling": {
    borderColor: "#9333ea", // purple
    iconBg: "bg-purple-50",
    iconText: "text-purple-600",
    badgeBg: "bg-purple-50/60",
    badgeBorder: "border-purple-200",
  },
  "business-professional": {
    borderColor: "#0369a1", // dark blue
    iconBg: "bg-blue-50",
    iconText: "text-blue-700",
    badgeBg: "bg-blue-50/60",
    badgeBorder: "border-blue-200",
  },
  "property-services": {
    borderColor: "#92400e", // copper/brown
    iconBg: "bg-orange-50",
    iconText: "text-orange-700",
    badgeBg: "bg-orange-50/60",
    badgeBorder: "border-orange-200",
  },
  "health-medical": {
    borderColor: "#0891b2", // cyan
    iconBg: "bg-cyan-50",
    iconText: "text-cyan-700",
    badgeBg: "bg-cyan-50/60",
    badgeBorder: "border-cyan-200",
  },
  "education-tutoring": {
    borderColor: "#15803d", // green
    iconBg: "bg-green-50",
    iconText: "text-green-700",
    badgeBg: "bg-green-50/60",
    badgeBorder: "border-green-200",
  },
  "food-catering": {
    borderColor: "#b45309", // amber-brown
    iconBg: "bg-yellow-50",
    iconText: "text-yellow-700",
    badgeBg: "bg-yellow-50/60",
    badgeBorder: "border-yellow-200",
  },
  "repairs-home-services": {
    borderColor: "#475569", // slate
    iconBg: "bg-slate-100",
    iconText: "text-slate-600",
    badgeBg: "bg-slate-50/60",
    badgeBorder: "border-slate-200",
  },
};

// Fallback for categories not in the slug map
const FALLBACK_ACCENT = {
  borderColor: "#e7a020",
  iconBg: "bg-gold/10",
  iconText: "text-gold",
  badgeBg: "bg-gold/5",
  badgeBorder: "border-gold/20",
};

export function CategoryCard({
  category,
  count: countProp,
  animationDelay = 0,
}: {
  category: Category;
  count?: number;
  animationDelay?: number;
}) {
  const count = countProp ?? 0;
  const accent = SLUG_ACCENT[category.slug as CategorySlug] ?? FALLBACK_ACCENT;
  const visibleSubs = category.subCategories.slice(0, 3);

  return (
    <Link
      to="/categories/$slug"
      params={{ slug: category.slug }}
      className="group flex flex-col gap-4 bg-cream-raised border border-hairline p-6 rounded-[6px] relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest animate-fade-up"
      style={{
        animationDelay: `${animationDelay}ms`,
        transition: "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
      }}
      // Hover lift is applied via CSS in the className approach below
    >
      {/* Coloured left-border accent stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-200"
        style={{ backgroundColor: accent.borderColor }}
      />

      {/* Hover lift — applied via a wrapper trick using group-hover on the Link */}
      <div className="flex flex-col gap-4 h-full transition-transform duration-200 group-hover:-translate-y-1">
        {/* Name + tagline */}
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft/50 block mb-1.5">
            {count} on register
          </span>
          <h3
            className="font-display text-xl text-text leading-tight transition-colors duration-200"
            style={{ ["--tw-text-opacity" as string]: "1" }}
          >
            <span className="group-hover:text-forest transition-colors duration-200">
              {category.name}
            </span>
          </h3>
          <p className="mt-1.5 font-sans text-[13px] text-text-soft leading-relaxed line-clamp-2">
            {category.tagline}
          </p>
        </div>

        {/* Sub-category tags */}
        <div className="flex flex-wrap gap-1.5">
          {visibleSubs.map((sub) => (
            <span
              key={sub}
              className={`font-mono text-[9px] uppercase tracking-[0.06em] text-text-soft/70 ${accent.badgeBg} border ${accent.badgeBorder} px-2 py-0.5 rounded-[3px]`}
            >
              {sub}
            </span>
          ))}
          {category.subCategories.length > 3 && (
            <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-text-soft/40 px-1 py-0.5">
              +{category.subCategories.length - 3} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-hairline flex items-center justify-between">
          <span className="eyebrow text-text-soft/50">
            <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
            Browse registry
          </span>
          <span
            aria-hidden
            className="font-sans text-xs opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-[3px] inline-block transition-all duration-150"
            style={{ color: accent.borderColor }}
          >
            →
          </span>
        </div>
      </div>

      {/* Shadow lift on hover — overlaid element for box-shadow since Tailwind group-hover shadow needs inline style */}
      <div
        className="absolute inset-0 rounded-[6px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ boxShadow: `0 8px 24px rgba(15,51,35,0.12)` }}
        aria-hidden
      />
    </Link>
  );
}
