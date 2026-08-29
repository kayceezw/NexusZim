import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { DiamondField, RegistryChip, TierMarker } from "@/components/registry";
import type { ProviderListing, ProviderRating } from "@/lib/queries";
import {
  providerAvatarColor,
  providerInitials,
  providerRegistryId,
} from "@/lib/queries";

/**
 * Registry-styled provider card for SCREEN 3 (Registry Search).
 * Screen-scoped to /search — does not affect other routes. Uses only the real
 * ProviderListing data layer and the shared registry primitives.
 */
export function SearchProviderCard({
  provider,
  rating,
}: {
  provider: ProviderListing;
  rating?: ProviderRating;
}) {
  const regId = providerRegistryId(provider.user_id);
  const initials = providerInitials(provider.business_name);
  const avatarColor = providerAvatarColor(provider.user_id);
  const photo = provider.photos?.[0] ?? null;
  const role = provider.categories?.name ?? "Registered Provider";
  const isCertified = provider.tier >= 3;

  // "Verified Since" — the registry admission date, from the real record.
  const verifiedSince = formatVerifiedSince(provider.created_at);

  // Description: the provider bio, clamped to two lines in the layout.
  const description =
    provider.bio?.trim() ||
    "No public record summary has been filed for this entity.";

  // Mono tag chips: category + city, derived from the real record.
  const tags = [provider.categories?.name, provider.city].filter(
    (t): t is string => Boolean(t),
  );

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-card transition-colors duration-200 hover:border-primary">
      <DiamondField
        tone={isCertified ? "gold" : "forest"}
        className="opacity-60"
      />

      {/* Absolute mono NX registry chip, top-right */}
      <div className="pointer-events-none absolute right-4 top-4 z-10">
        <RegistryChip
          value={regId}
          tone={isCertified ? "gold" : "default"}
          size="sm"
        />
      </div>

      <div className="relative flex flex-1 flex-col p-5">
        {/* Identity row: avatar + serif name + uppercase role */}
        <div className="flex items-start gap-4 pr-24">
          <Link
            to="/providers/$providerId"
            params={{ providerId: provider.user_id }}
            aria-label={`View ${provider.business_name} profile`}
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] border border-border bg-surface"
          >
            {photo ? (
              <img
                src={photo}
                alt={provider.business_name}
                className="h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
              />
            ) : (
              <span
                className={`flex h-full w-full items-center justify-center font-sans text-xl font-bold tracking-tight ${avatarColor}`}
              >
                {initials}
              </span>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <Link
              to="/providers/$providerId"
              params={{ providerId: provider.user_id }}
              className="block truncate font-display text-[20px] leading-tight text-foreground transition-colors group-hover:text-primary"
            >
              {provider.business_name}
            </Link>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {role}
            </p>
          </div>
        </div>

        {/* Tier badge + Verified Since */}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <TierMarker tier={provider.tier} variant="compact" />
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            Verified Since {verifiedSince}
          </span>
        </div>

        {/* Description */}
        <p className="mt-3 line-clamp-2 font-sans text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>

        {/* Mono tag chips */}
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-[2px] border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer — View Full Registry Profile */}
        <div className="mt-5 border-t border-hairline pt-4">
          <Link
            to="/providers/$providerId"
            params={{ providerId: provider.user_id }}
            className="group/link inline-flex items-center gap-1.5 font-sans text-[13px] font-semibold text-primary transition-colors hover:text-gold-deep"
          >
            View Full Registry Profile
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-150 group-hover/link:translate-x-[3px]"
              strokeWidth={2}
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

/**
 * Format a registry admission timestamp as a stable "Mon YYYY" label.
 * Falls back gracefully when the timestamp is missing or unparseable.
 */
function formatVerifiedSince(iso: string | null | undefined): string {
  if (!iso) return "On File";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "On File";
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}
