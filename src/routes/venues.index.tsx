import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Users, Star, ShieldCheck, ArrowRight, MapPin } from "lucide-react";
import {
  POSTER_PALETTES,
  VENUES,
  VENUE_TYPES,
  type Venue,
  type VenueType,
  formatMoney,
  venueTypeLabel,
} from "@/lib/live-data";

export const Route = createFileRoute("/venues/")({
  head: () => ({
    meta: [
      { title: "Venues — Book event spaces across Zimbabwe | NexusZim" },
      {
        name: "description",
        content:
          "Compare and book verified event venues in Zimbabwe — arenas, ballrooms, gardens, theatres and rooftops. Real capacities, real prices, direct enquiries.",
      },
    ],
  }),
  component: VenueMarketplace,
});

const CAPACITY_BANDS = [
  { key: "all", label: "Any size", min: 0, max: Infinity },
  { key: "s", label: "Up to 500", min: 0, max: 500 },
  { key: "m", label: "500 – 5,000", min: 500, max: 5000 },
  { key: "l", label: "5,000+", min: 5000, max: Infinity },
] as const;

function VenueCard({ venue, index }: { venue: Venue; index: number }) {
  const pal = POSTER_PALETTES[venue.palette];
  const capacity = Math.max(venue.capacitySeated, venue.capacityStanding);

  return (
    <Link
      to="/venues/$venueId"
      params={{ venueId: venue.id }}
      className="group flex flex-col overflow-hidden rounded-[6px] border border-hairline bg-cream-raised transition-all duration-300 hover:-translate-y-0.5 hover:border-forest/40 hover:shadow-[0_8px_28px_rgba(15,51,35,0.10)] animate-slide-up"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      {/* typographic venue plate */}
      <div
        className="relative flex aspect-[16/9] flex-col justify-between overflow-hidden p-5 select-none"
        style={{ backgroundColor: pal.bg, color: pal.fg }}
        aria-hidden
      >
        <span
          className="pointer-events-none absolute -right-2 -bottom-8 font-display text-[7rem] leading-none opacity-[0.07]"
          style={{ color: pal.fg }}
        >
          {capacity >= 1000 ? `${Math.round(capacity / 1000)}k` : capacity}
        </span>
        <p
          className="font-mono text-[10px] uppercase tracking-[0.16em]"
          style={{ color: pal.accent }}
        >
          {venueTypeLabel(venue.type)}
        </p>
        <p className="font-display text-[clamp(1.4rem,2vw,1.8rem)] leading-[1.05] tracking-tight">
          {venue.name}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">
            <MapPin className="h-3 w-3 text-gold shrink-0" strokeWidth={1.75} />
            {venue.area}, {venue.city}
          </p>
          {venue.verified && (
            <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-forest">
              <ShieldCheck className="h-3 w-3" strokeWidth={2} />
              Verified
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-hairline pt-4">
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-text-soft/50">
              Capacity
            </p>
            <p className="mt-0.5 flex items-center gap-1 font-sans text-sm font-semibold text-text">
              <Users className="h-3 w-3 text-gold" strokeWidth={1.75} />
              {capacity.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-text-soft/50">
              Rating
            </p>
            <p className="mt-0.5 flex items-center gap-1 font-sans text-sm font-semibold text-text">
              <Star className="h-3 w-3 fill-gold text-gold" />
              {venue.rating}
              <span className="font-normal text-text-soft">({venue.reviews})</span>
            </p>
          </div>
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-text-soft/50">
              From
            </p>
            <p className="mt-0.5 font-sans text-sm font-semibold text-text">
              {formatMoney(venue.priceFromPerDay)}
              <span className="font-normal text-text-soft">/day</span>
            </p>
          </div>
        </div>

        <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-forest opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
          View & enquire
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

function VenueMarketplace() {
  const [type, setType] = useState<VenueType | "all">("all");
  const [city, setCity] = useState("all");
  const [band, setBand] = useState<(typeof CAPACITY_BANDS)[number]["key"]>("all");

  const cities = useMemo(() => Array.from(new Set(VENUES.map((v) => v.city))).sort(), []);

  const filtered = useMemo(() => {
    const cap = CAPACITY_BANDS.find((b) => b.key === band)!;
    return VENUES.filter((v) => {
      if (type !== "all" && v.type !== type) return false;
      if (city !== "all" && v.city !== city) return false;
      const capacity = Math.max(v.capacitySeated, v.capacityStanding);
      return capacity >= cap.min && capacity <= cap.max;
    }).sort(
      (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false) || b.rating - a.rating,
    );
  }, [type, city, band]);

  return (
    <div className="bg-cream pt-16 animate-page-enter">
      {/* ─── HERO ─── */}
      <section className="border-b border-hairline">
        <div className="container-page py-14 lg:py-20">
          <p className="eyebrow text-text-soft">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            Venue marketplace
          </p>
          <h1 className="mt-5 font-display text-text leading-[1.02] tracking-tight text-[clamp(2.5rem,6vw,4.5rem)] max-w-3xl">
            The right room for
            <br />
            <em className="italic text-forest">every occasion.</em>
          </h1>
          <p className="mt-6 max-w-xl font-sans text-base lg:text-lg text-text-soft leading-relaxed">
            From a 400-seat theatre to a 25,000-capacity arena — verified capacities, transparent
            day rates, and enquiries that go straight to the venue's events desk.
          </p>
        </div>
      </section>

      {/* ─── FILTER BAR ─── */}
      <section className="sticky top-16 z-30 border-b border-hairline bg-cream-raised/95 backdrop-blur-md">
        <div className="container-page flex flex-wrap items-center gap-2 py-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as VenueType | "all")}
            className="rounded-[3px] border border-hairline bg-cream px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft outline-none focus:border-forest"
            aria-label="Venue type"
          >
            <option value="all">All types</option>
            {VENUE_TYPES.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-[3px] border border-hairline bg-cream px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft outline-none focus:border-forest"
            aria-label="City"
          >
            <option value="all">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1.5">
            {CAPACITY_BANDS.map((b) => (
              <button
                key={b.key}
                onClick={() => setBand(b.key)}
                className={`rounded-[3px] border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
                  band === b.key
                    ? "border-forest bg-forest text-cream"
                    : "border-hairline text-text-soft hover:border-forest/50 hover:text-forest"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
          <p className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft/60 sm:block">
            {filtered.length} venue{filtered.length === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      {/* ─── GRID ─── */}
      <section className="container-page py-12 lg:py-16">
        {filtered.length === 0 ? (
          <div className="rounded-[6px] border border-dashed border-hairline bg-cream-raised px-6 py-20 text-center">
            <p className="font-display text-2xl text-text">No venues match those filters.</p>
            <button
              onClick={() => {
                setType("all");
                setCity("all");
                setBand("all");
              }}
              className="mt-6 border border-forest px-6 py-2.5 rounded-[3px] font-sans text-sm font-semibold text-forest hover:bg-forest hover:text-cream transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v, i) => (
              <VenueCard key={v.id} venue={v} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ─── LIST-YOUR-VENUE CTA ─── */}
      <section className="border-t border-hairline bg-forest-ink text-cream">
        <div className="container-page flex flex-col gap-8 py-14 lg:flex-row lg:items-center lg:justify-between lg:py-20">
          <div className="max-w-xl">
            <p className="eyebrow text-gold">
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
              For venue owners
            </p>
            <h2 className="mt-4 font-display text-3xl lg:text-4xl leading-tight">
              Own a space? Put it in front of every organizer in the country.
            </h2>
            <p className="mt-4 font-sans text-base text-cream/60 leading-relaxed">
              Verified listings get priority placement, a direct enquiry inbox, and cross-selling on
              every event ticketed at your venue.
            </p>
          </div>
          <Link
            to="/onboarding/provider"
            className="btn-cta inline-flex shrink-0 items-center gap-2 self-start bg-gold px-8 py-4 rounded-[3px] font-sans text-sm font-semibold text-forest-ink"
          >
            List your venue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
