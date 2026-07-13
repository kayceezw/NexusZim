import { Link } from "@tanstack/react-router";
import type { Category } from "@/lib/mock-data";
import { PROVIDERS } from "@/lib/mock-data";
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
};

const ACCENT_MAP = {
  gold: {
    icon: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/30",
  },
  primary: {
    icon: "text-forest",
    bg: "bg-forest/8",
    border: "border-forest/20",
  },
  teal: {
    icon: "text-teal",
    bg: "bg-teal/10",
    border: "border-teal/20",
  },
  accent: {
    icon: "text-text-soft",
    bg: "bg-hairline/60",
    border: "border-hairline",
  },
} as const;

export function CategoryCard({ category }: { category: Category }) {
  const count = PROVIDERS.filter((p) => p.category === category.slug).length;
  const accent = ACCENT_MAP[category.accent] ?? ACCENT_MAP.accent;
  const Icon = ICON_MAP[category.icon];
  const visibleSubs = category.subCategories.slice(0, 3);

  return (
    <Link
      to="/categories/$slug"
      params={{ slug: category.slug }}
      className="group flex flex-col gap-4 bg-cream-raised border border-hairline p-6 rounded-[6px] transition-all duration-200 hover:border-forest hover:shadow-[0_4px_20px_rgba(15,51,35,0.1)] relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
    >
      {/* Hover gold rule */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-200" />

      {/* Icon + count */}
      <div className="flex items-start justify-between">
        <div
          className={`p-2.5 rounded-[6px] border ${accent.bg} ${accent.border} transition-transform duration-200 group-hover:scale-110`}
        >
          {Icon && (
            <Icon className={`h-5 w-5 ${accent.icon}`} strokeWidth={1.5} />
          )}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft/50 mt-1">
          {count} on register
        </span>
      </div>

      {/* Name + tagline */}
      <div>
        <h3 className="font-display text-xl text-text group-hover:text-forest transition-colors leading-tight">
          {category.name}
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
            className="font-mono text-[9px] uppercase tracking-[0.06em] text-text-soft/60 bg-hairline/50 border border-hairline px-2 py-0.5 rounded-[3px]"
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
          className="font-sans text-xs text-forest opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-[3px] inline-block transition-all duration-150"
        >
          →
        </span>
      </div>
    </Link>
  );
}
