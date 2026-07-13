import { Link } from "@tanstack/react-router";
import type { Provider } from "@/lib/mock-data";
import { PROVIDERS } from "@/lib/mock-data";
import { Hallmark } from "./registry/hallmark";
import { MapPin, Clock } from "lucide-react";

function registryId(provider: Provider): string {
  const idx = PROVIDERS.findIndex((p) => p.id === provider.id);
  return `NX-2024-${String(idx + 147).padStart(5, "0")}`;
}

function Stars({ rating, reviews }: { rating: number; reviews: number }) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-[2px]">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} width="11" height="11" viewBox="0 0 24 24">
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              fill={i <= filled ? "#e7a020" : "none"}
              stroke={i <= filled ? "#e7a020" : "#dedacb"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ))}
      </div>
      <span className="font-mono text-[11px] font-medium text-text">{rating.toFixed(1)}</span>
      <span className="font-mono text-[10px] text-text-soft/50">({reviews})</span>
    </div>
  );
}

export function ProviderCard({ provider }: { provider: Provider }) {
  const regId = registryId(provider);
  const availColor =
    provider.availability === "available"
      ? "bg-emerald-500"
      : provider.availability === "busy"
        ? "bg-yellow-400"
        : "bg-rose-500";
  const availLabel =
    provider.availability === "available"
      ? "Available"
      : provider.availability === "busy"
        ? "Busy"
        : "Fully Booked";

  return (
    <article className="group bg-cream-raised border border-hairline rounded-[6px] hover:border-forest hover:shadow-[0_4px_20px_rgba(15,51,35,0.1)] transition-all duration-200 relative overflow-hidden">
      {/* Gold left rule — slides in from top on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-200" />

      <div className="flex gap-0">
        {/* Avatar column */}
        <Link
          to="/providers/$providerId"
          params={{ providerId: provider.id }}
          aria-label={`View ${provider.business} profile`}
          className={`flex-shrink-0 w-[80px] flex flex-col items-center justify-center border-r border-hairline transition-opacity group-hover:opacity-90 ${provider.avatarColor}`}
          style={{ minHeight: 120 }}
        >
          <span className="font-sans text-xl font-bold tracking-tight">{provider.initials}</span>
        </Link>

        {/* Content */}
        <div className="flex-1 px-4 py-3.5 min-w-0">
          {/* Name + registry ID */}
          <div className="flex items-start justify-between gap-3">
            <Link
              to="/providers/$providerId"
              params={{ providerId: provider.id }}
              className="font-display text-[18px] leading-tight text-text group-hover:text-forest transition-colors"
            >
              {provider.business}
            </Link>
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-text-soft/40 shrink-0 mt-0.5">
              {regId}
            </span>
          </div>

          {/* Meta — hallmark + city + price */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            <Hallmark tier={provider.tier} />
            <span className="flex items-center gap-1 font-mono text-[11px] text-text-soft">
              <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.5} />
              {provider.city}
            </span>
            <span className="font-mono text-[11px] text-text-soft">From ${provider.priceFrom}</span>
          </div>

          {/* Rating */}
          <div className="mt-2">
            <Stars rating={provider.rating} reviews={provider.reviews} />
          </div>

          {/* Service tags */}
          <div className="mt-2 flex flex-wrap gap-1">
            {provider.services.slice(0, 3).map((s) => (
              <span
                key={s}
                className="font-mono text-[9px] uppercase tracking-[0.04em] text-text-soft/70 px-1.5 py-0.5 border border-hairline rounded-[2px]"
              >
                {s.length > 22 ? s.slice(0, 20) + "…" : s}
              </span>
            ))}
          </div>

          {/* Footer — availability + response time + CTA */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${availColor}`} />
                <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-text-soft">
                  {availLabel}
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[10px] text-text-soft/50">
                <Clock className="h-2.5 w-2.5 shrink-0" strokeWidth={1.5} />
                {provider.responseTime}
              </div>
            </div>
            <Link
              to="/providers/$providerId"
              params={{ providerId: provider.id }}
              className="font-sans text-[12px] font-semibold text-forest hover:text-gold-deep transition-colors group/link flex items-center gap-1"
            >
              Open record
              <span
                aria-hidden
                className="transition-transform group-hover/link:translate-x-[3px] duration-150"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
