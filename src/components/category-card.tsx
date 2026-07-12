import { Link } from "@tanstack/react-router";
import type { Category } from "@/lib/mock-data";
import { PROVIDERS } from "@/lib/mock-data";

export function CategoryCard({ category }: { category: Category }) {
  const count = PROVIDERS.filter((p) => p.category === category.slug).length;

  return (
    <Link
      to="/categories/$slug"
      params={{ slug: category.slug }}
      className="group flex flex-col gap-4 bg-cream-raised border border-hairline p-6 rounded-[6px] transition-all duration-150 hover:border-forest hover:shadow-[0_1px_4px_rgba(15,51,35,0.08)] relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
    >
      {/* Gold left rule on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-150" />

      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-xl text-text group-hover:text-forest transition-colors leading-tight">
          {category.name}
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft/60 shrink-0 mt-1">
          {count} on register
        </span>
      </div>

      <p className="font-sans text-[13px] text-text-soft leading-relaxed line-clamp-2">
        {category.tagline}
      </p>

      <div className="mt-auto pt-3 border-t border-hairline flex items-center justify-between">
        <span className="eyebrow text-text-soft/50">
          <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
          Browse registry
        </span>
        <span
          aria-hidden
          className="font-sans text-xs text-forest opacity-0 group-hover:opacity-100 transition-opacity duration-150 translate-x-0 group-hover:translate-x-[3px] inline-block"
        >
          →
        </span>
      </div>
    </Link>
  );
}
