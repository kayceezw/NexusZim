import { Link } from "@tanstack/react-router";
import type { Provider } from "@/lib/mock-data";

export function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <Link
      to="/providers/$providerId"
      params={{ providerId: provider.id }}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-teal hover:shadow-elevated"
    >
      <div className="flex items-start gap-3">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl font-display text-sm font-bold ${provider.avatarColor}`}
        >
          {provider.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-display font-semibold text-foreground">
              {provider.business}
            </h3>
            {provider.verified && (
              <span className="shrink-0 rounded-full bg-teal/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal">
                Verified
              </span>
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {provider.name}
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
        {provider.bio}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {provider.services.slice(0, 3).map((s) => (
          <span
            key={s}
            className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-xs">
        <div className="text-foreground">
          <span className="font-semibold">{provider.rating}</span>
          <span className="text-muted-foreground"> ({provider.reviews})</span>
        </div>
        <div className="truncate text-muted-foreground">{provider.city}</div>
        <div className="truncate text-right text-muted-foreground">
          {provider.responseTime.replace("Replies in ~", "")}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">From</p>
          <p className="font-display text-lg font-bold text-foreground">
            ${provider.priceFrom}
          </p>
        </div>
        <span className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors group-hover:bg-accent">
          View profile
        </span>
      </div>
    </Link>
  );
}
