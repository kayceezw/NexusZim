import { Link } from "@tanstack/react-router";
import type { Provider } from "@/lib/mock-data";
import { PROVIDERS } from "@/lib/mock-data";
import { Hallmark } from "./registry/hallmark";
import { MapPin, Clock, Phone } from "lucide-react";
import type { ProviderListing } from "@/lib/queries";
import { providerAvatarColor, providerInitials, providerRegistryId } from "@/lib/queries";

type CardData =
  | { kind: "mock"; provider: Provider }
  | { kind: "live"; provider: ProviderListing };

type NormalizedCard = {
  id: string;
  businessName: string;
  categoryName: string | null;
  city: string | null;
  tier: number;
  verified: boolean;
  initials: string;
  avatarColor: string;
  firstPhoto: string | null;
  whatsapp: string | null;
  phone: string | null;
  rating: number | null;
  reviews: number | null;
  priceFrom: number | null;
  services: string[];
  availability: string | null;
  responseTime: string | null;
  regId: string;
};

function normalize(input: CardData): NormalizedCard {
  if (input.kind === "mock") {
    const p = input.provider;
    const idx = PROVIDERS.findIndex((x) => x.id === p.id);
    return {
      id: p.id,
      businessName: p.business,
      categoryName: null,
      city: p.city,
      tier: p.tier,
      verified: p.tier >= 2,
      initials: p.initials,
      avatarColor: p.avatarColor,
      firstPhoto: p.portfolioUrls?.[0] ?? null,
      whatsapp: null,
      phone: null,
      rating: p.rating,
      reviews: p.reviews,
      priceFrom: p.priceFrom,
      services: p.services,
      availability: p.availability,
      responseTime: p.responseTime,
      regId: `NX-2024-${String(idx + 147).padStart(5, "0")}`,
    };
  } else {
    const p = input.provider;
    return {
      id: p.user_id,
      businessName: p.business_name,
      categoryName: p.categories?.name ?? null,
      city: p.city,
      tier: p.tier,
      verified: p.verified,
      initials: providerInitials(p.business_name),
      avatarColor: providerAvatarColor(p.user_id),
      firstPhoto: p.photos?.[0] ?? null,
      whatsapp: p.whatsapp,
      phone: p.phone,
      rating: null,
      reviews: null,
      priceFrom: null,
      services: [],
      availability: null,
      responseTime: null,
      regId: providerRegistryId(p.user_id),
    };
  }
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function AvailabilityDot({ availability }: { availability: string }) {
  const color =
    availability === "available"
      ? "bg-emerald-500"
      : availability === "busy"
        ? "bg-yellow-400"
        : "bg-rose-500";
  const label =
    availability === "available" ? "Available" : availability === "busy" ? "Busy" : "Fully Booked";
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${color}`} />
      <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-text-soft">
        {label}
      </span>
    </div>
  );
}

function ProviderCardInner({ data }: { data: NormalizedCard }) {
  return (
    <article className="group bg-cream-raised border border-hairline rounded-[6px] hover:border-forest hover:shadow-[0_8px_28px_rgba(15,51,35,0.12)] hover:-translate-y-1 transition-all duration-200 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-200" />

      <div className="flex flex-col sm:flex-row gap-0">
        {/* Avatar */}
        <Link
          to="/providers/$providerId"
          params={{ providerId: data.id }}
          aria-label={`View ${data.businessName} profile`}
          className="flex-shrink-0 sm:w-[80px] h-20 sm:h-auto flex items-center justify-center border-b sm:border-b-0 sm:border-r border-hairline transition-opacity group-hover:opacity-90 overflow-hidden"
          style={{ minHeight: 120 }}
        >
          {data.firstPhoto ? (
            <img
              src={data.firstPhoto}
              alt={data.businessName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              className={`w-full h-full flex items-center justify-center font-sans text-xl font-bold tracking-tight ${data.avatarColor}`}
            >
              {data.initials}
            </span>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 px-4 py-3.5 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <Link
              to="/providers/$providerId"
              params={{ providerId: data.id }}
              className="font-display text-[18px] leading-tight text-text group-hover:text-forest transition-colors"
            >
              {data.businessName}
            </Link>
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-text-soft/40 shrink-0 mt-0.5">
              {data.regId}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            <Hallmark tier={data.tier} />
            {data.categoryName && (
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-text-soft/60 px-1.5 py-0.5 border border-hairline rounded-[2px]">
                {data.categoryName}
              </span>
            )}
            {data.city && (
              <span className="flex items-center gap-1 font-mono text-[11px] text-text-soft">
                <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                {data.city}
              </span>
            )}
            {data.priceFrom != null && (
              <span className="font-mono text-[11px] text-forest font-medium">
                From ${data.priceFrom}
              </span>
            )}
          </div>

          {data.rating != null && data.reviews != null && (
            <div className="mt-2">
              <Stars rating={data.rating} reviews={data.reviews} />
            </div>
          )}

          {data.services.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {data.services.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="font-mono text-[9px] uppercase tracking-[0.04em] text-text-soft/70 px-1.5 py-0.5 border border-hairline rounded-[2px]"
                >
                  {s.length > 22 ? s.slice(0, 20) + "…" : s}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {data.availability && <AvailabilityDot availability={data.availability} />}
              {data.responseTime && (
                <div className="flex items-center gap-1 font-mono text-[10px] text-text-soft/50">
                  <Clock className="h-2.5 w-2.5 shrink-0" strokeWidth={1.5} />
                  {data.responseTime}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {data.whatsapp && (
                <a
                  href={`https://wa.me/${data.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp ${data.businessName}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center h-7 w-7 rounded-full bg-gold/10 text-gold hover:bg-gold hover:text-forest-ink transition-colors"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" />
                </a>
              )}
              {data.phone && !data.whatsapp && (
                <a
                  href={`tel:${data.phone}`}
                  aria-label={`Call ${data.businessName}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center h-7 w-7 rounded-full bg-forest/8 text-forest hover:bg-forest hover:text-cream transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                </a>
              )}
              <Link
                to="/providers/$providerId"
                params={{ providerId: data.id }}
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
      </div>
    </article>
  );
}

export function ProviderCard({ provider }: { provider: Provider }) {
  return <ProviderCardInner data={normalize({ kind: "mock", provider })} />;
}

export function LiveProviderCard({ provider }: { provider: ProviderListing }) {
  return <ProviderCardInner data={normalize({ kind: "live", provider })} />;
}
