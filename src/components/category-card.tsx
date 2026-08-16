import { Link } from "@tanstack/react-router";
import type { CategoryWithCount } from "@/lib/queries";

/**
 * Per-slug accent palette — each category gets a distinct colour.
 * Values are raw Tailwind / inline-style values to avoid purging issues.
 * border-left colour uses inline style; icon bg + text use utility classes.
 */
const SLUG_ACCENT: Record<
  string,
  {
    borderColor: string; // CSS color for the left-border accent stripe
    iconBg: string;      // Tailwind bg utility
    iconText: string;    // Tailwind text utility
    badgeBg: string;     // Tailwind bg for sub-category chips
    badgeBorder: string; // Tailwind border for sub-category chips
  }
> = {
  "elite-concierge": {
    borderColor: "#d4a63c", // champagne gold
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-600",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/30",
  },
  "events-production": {
    borderColor: "#7c3aed", // violet
    iconBg: "bg-violet-500/10",
    iconText: "text-violet-600 dark:text-violet-400",
    badgeBg: "bg-violet-500/15",
    badgeBorder: "border-violet-500/30",
  },
  "visa-immigration": {
    borderColor: "#0f3323", // forest (primary brand)
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/30",
  },
  "company-registration": {
    borderColor: "#4338ca", // indigo
    iconBg: "bg-indigo-500/10",
    iconText: "text-indigo-600 dark:text-indigo-400",
    badgeBg: "bg-indigo-500/15",
    badgeBorder: "border-indigo-500/30",
  },
  "transport-logistics": {
    borderColor: "#0284c7", // sky blue
    iconBg: "bg-sky-500/10",
    iconText: "text-sky-600",
    badgeBg: "bg-sky-500/10",
    badgeBorder: "border-sky-500/30",
  },
  "beauty-grooming-wellness": {
    borderColor: "#db2777", // pink
    iconBg: "bg-pink-500/10",
    iconText: "text-pink-600 dark:text-pink-400",
    badgeBg: "bg-pink-500/15",
    badgeBorder: "border-pink-500/30",
  },
  "fitness-personal-training": {
    borderColor: "#dc2626", // red
    iconBg: "bg-red-500/10",
    iconText: "text-red-600 dark:text-red-400",
    badgeBg: "bg-red-500/10",
    badgeBorder: "border-red-500/30",
  },
  "fashion-tailoring-styling": {
    borderColor: "#9333ea", // purple
    iconBg: "bg-purple-500/10",
    iconText: "text-purple-600 dark:text-purple-400",
    badgeBg: "bg-purple-500/15",
    badgeBorder: "border-purple-500/30",
  },
  "business-professional": {
    borderColor: "#0369a1", // dark blue
    iconBg: "bg-blue-500/10",
    iconText: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-500/10",
    badgeBorder: "border-blue-500/30",
  },
  "property-services": {
    borderColor: "#92400e", // copper/brown
    iconBg: "bg-orange-500/10",
    iconText: "text-orange-600",
    badgeBg: "bg-orange-500/10",
    badgeBorder: "border-orange-500/30",
  },
  "health-medical": {
    borderColor: "#0891b2", // cyan
    iconBg: "bg-cyan-500/10",
    iconText: "text-cyan-600 dark:text-cyan-400",
    badgeBg: "bg-cyan-500/10",
    badgeBorder: "border-cyan-500/30",
  },
  "education-tutoring": {
    borderColor: "#15803d", // green
    iconBg: "bg-green-500/10",
    iconText: "text-green-600",
    badgeBg: "bg-green-500/10",
    badgeBorder: "border-green-500/30",
  },
  "food-catering": {
    borderColor: "#b45309", // amber-brown
    iconBg: "bg-yellow-500/10",
    iconText: "text-yellow-600",
    badgeBg: "bg-yellow-500/10",
    badgeBorder: "border-yellow-500/30",
  },
  "repairs-home-services": {
    borderColor: "#475569", // slate
    iconBg: "bg-slate-500/15",
    iconText: "text-slate-600 dark:text-slate-400",
    badgeBg: "bg-slate-500/10",
    badgeBorder: "border-slate-500/30",
  },
};

// Fallback for categories not in the slug map
const FALLBACK_ACCENT = {
  borderColor: "#d4a63c",
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
  category: CategoryWithCount;
  count?: number;
  animationDelay?: number;
}) {
  const count = countProp ?? category.provider_count ?? 0;
  const accent = SLUG_ACCENT[category.slug] ?? FALLBACK_ACCENT;

  return (
    <Link
      to="/categories/$slug"
      params={{ slug: category.slug }}
      className="group flex flex-col gap-4 bg-card border border-border p-6 rounded-[8px] relative overflow-hidden shadow-[var(--elev-sm)] hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary animate-fade-up"
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
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/50 block mb-1.5">
            {count} on register
          </span>
          <h3
            className="font-display text-xl text-foreground leading-tight transition-colors duration-200"
            style={{ ["--tw-text-opacity" as string]: "1" }}
          >
            <span className="group-hover:text-primary transition-colors duration-200">
              {category.name}
            </span>
          </h3>
          {category.description && (
            <p className="mt-1.5 font-sans text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
              {category.description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
          <span className="eyebrow text-muted-foreground/50">
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
        className="absolute inset-0 rounded-[8px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ boxShadow: "var(--elev-lg)" }}
        aria-hidden
      />
    </Link>
  );
}
