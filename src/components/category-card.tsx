import { Link } from "@tanstack/react-router";
import type { Category } from "@/lib/mock-data";
import {
  Crown,
  PartyPopper,
  FileCheck2,
  Car,
  Scissors,
  Briefcase,
  ArrowRight,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Crown,
  PartyPopper,
  FileCheck2,
  Car,
  Scissors,
  Briefcase,
};

export function CategoryCard({ category }: { category: Category }) {
  const Icon = iconMap[category.icon] ?? Briefcase;

  return (
    <Link
      to="/categories/$slug"
      params={{ slug: category.slug }}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-lg border p-6 transition-all duration-300 hover:-translate-y-[3px]"
      style={{
        backgroundColor: "var(--navy-mid)",
        borderColor: "rgba(196,154,42,0.2)",
        boxShadow: "0 0 0 rgba(0,0,0,0)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(196,154,42,0.6)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(196,154,42,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(196,154,42,0.2)";
        e.currentTarget.style.boxShadow = "0 0 0 rgba(0,0,0,0)";
      }}
    >
      {/* Gold left accent bar */}
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ backgroundColor: "var(--gold)" }}
      />

      {/* Icon + name */}
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gold">
          <Icon className="h-5 w-5 text-gold-foreground" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-display text-[22px] font-semibold leading-tight text-gold">
            {category.name}
          </h3>
          <p className="mt-1 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-cream/60">
            {category.tagline}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-[13px] font-light leading-relaxed text-cream/70">
        {category.description}
      </p>

      {/* Tags */}
      <div className="mt-auto flex flex-wrap gap-1.5">
        {category.services.slice(0, 3).map((s) => (
          <span
            key={s}
            className="rounded-sm border bg-transparent px-2 py-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-cream/80"
            style={{ borderColor: "rgba(196,154,42,0.4)" }}
          >
            {s}
          </span>
        ))}
        {category.services.length > 3 && (
          <span className="px-1.5 py-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-cream/55">
            +{category.services.length - 3} more
          </span>
        )}
      </div>

      {/* CTA text link */}
      <div className="pt-1">
        <span className="inline-flex items-center gap-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-gold group-hover:underline group-hover:underline-offset-[6px]">
          Browse providers
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} />
        </span>
      </div>
    </Link>
  );
}
