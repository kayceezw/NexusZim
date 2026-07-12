import { Link } from "@tanstack/react-router";
import type { Provider } from "@/lib/mock-data";
import { PROVIDERS } from "@/lib/mock-data";
import { Hallmark } from "./registry/hallmark";
import { MapPin } from "lucide-react";

function registryId(provider: Provider): string {
  const idx = PROVIDERS.findIndex((p) => p.id === provider.id);
  return `NX-2024-${String(idx + 147).padStart(5, "0")}`;
}

export function ProviderCard({ provider }: { provider: Provider }) {
  const regId = registryId(provider);

  return (
    <article className="group bg-cream-raised border border-hairline rounded-[6px] hover:border-forest transition-all duration-150 hover:shadow-[0_1px_4px_rgba(15,51,35,0.08)] relative overflow-hidden">
      {/* Gold left rule on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-150" />

      <div className="flex gap-0 min-h-[100px]">
        {/* Logo slot — 64px square */}
        <Link
          to="/providers/$providerId"
          params={{ providerId: provider.id }}
          className={`flex-shrink-0 w-[72px] flex items-center justify-center font-sans text-lg font-bold tracking-tight border-r border-hairline ${provider.avatarColor}`}
          aria-label={`View ${provider.business} profile`}
        >
          {provider.initials}
        </Link>

        {/* Main content */}
        <div className="flex-1 px-4 py-3 min-w-0">
          {/* Top row: name + registry number */}
          <div className="flex items-start justify-between gap-2">
            <Link
              to="/providers/$providerId"
              params={{ providerId: provider.id }}
              className="font-display text-lg leading-tight text-text group-hover:text-forest transition-colors"
            >
              {provider.business}
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-soft/60 shrink-0 mt-0.5">
              {regId}
            </span>
          </div>

          {/* Meta line */}
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <Hallmark tier={provider.tier} />
            <span className="flex items-center gap-1 font-mono text-[11px] text-text-soft">
              <MapPin className="h-3 w-3" strokeWidth={1.5} />
              {provider.city}
            </span>
            <span className="font-mono text-[11px] text-text-soft">From ${provider.priceFrom}</span>
          </div>

          {/* On-file condensed ledger */}
          <p className="mt-2 font-mono text-[11px] text-text-soft leading-relaxed line-clamp-1">
            On file:{" "}
            {provider.verifiedAt
              ? `Identity confirmed ✓ ${provider.verifiedAt}`
              : "Identity confirmed ✓"}
          </p>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  provider.availability === "available"
                    ? "bg-emerald-500"
                    : provider.availability === "busy"
                      ? "bg-yellow-400"
                      : "bg-rose-500"
                }`}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-text-soft">
                {provider.availability === "available"
                  ? "Available"
                  : provider.availability === "busy"
                    ? "Busy"
                    : "Fully Booked"}
              </span>
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
