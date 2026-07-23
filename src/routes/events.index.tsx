import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ArrowRight, Building2, Users, Ticket } from "lucide-react";
import {
  EVENT_CATEGORIES,
  LIVE_EVENTS,
  type EventCategory,
  eventCity,
  eventPriceFrom,
  formatEventDate,
  formatEventTime,
  formatMoney,
  getVenue,
} from "@/lib/live-data";
import { EventCard, StatusPill } from "@/components/live/event-card";
import { EventPoster } from "@/components/live/poster";

type EventsSearch = {
  q?: string;
  category?: EventCategory;
  city?: string;
};

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "NexusZim Live — Tickets to everything on in Zimbabwe" },
      {
        name: "description",
        content:
          "Discover and book tickets to concerts, festivals, theatre, sport and business events across Zimbabwe. Transparent pricing, instant QR e-tickets.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): EventsSearch => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
    category: EVENT_CATEGORIES.some((c) => c.slug === search.category)
      ? (search.category as EventCategory)
      : undefined,
    city: typeof search.city === "string" && search.city ? search.city : undefined,
  }),
  component: EventsDiscovery,
});

const DATE_WINDOWS = [
  { key: "all", label: "Any date" },
  { key: "30", label: "Next 30 days" },
  { key: "90", label: "Next 3 months" },
] as const;

function EventsDiscovery() {
  const { q = "", category, city } = Route.useSearch();
  const navigate = useNavigate({ from: "/events/" });
  const [query, setQuery] = useState(q);
  const [dateWindow, setDateWindow] = useState<(typeof DATE_WINDOWS)[number]["key"]>("all");

  const cities = useMemo(
    () => Array.from(new Set(LIVE_EVENTS.map((e) => eventCity(e)).filter(Boolean))).sort(),
    [],
  );

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const horizon =
      dateWindow === "all" ? null : Date.now() + Number(dateWindow) * 24 * 60 * 60 * 1000;
    return LIVE_EVENTS.filter((e) => {
      // Drop events whose date has already passed
      if (new Date(e.date) < today) return false;
      if (category && e.category !== category) return false;
      if (city && eventCity(e) !== city) return false;
      if (horizon && new Date(e.date).getTime() > horizon) return false;
      if (needle) {
        const venue = getVenue(e.venueId);
        const haystack = [e.title, e.tagline, venue?.name ?? "", ...e.tags, ...(e.lineup ?? [])]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [q, category, city, dateWindow, today]);

  const spotlight = useMemo(
    () =>
      [...LIVE_EVENTS]
        .filter((e) => e.featured && e.status !== "sold-out" && new Date(e.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0],
    [today],
  );
  const hasActiveFilters = Boolean(q || category || city || dateWindow !== "all");

  function patchSearch(patch: Partial<EventsSearch>) {
    navigate({
      search: (prev: EventsSearch) => {
        const next = { ...prev, ...patch };
        (Object.keys(next) as (keyof EventsSearch)[]).forEach((k) => {
          if (!next[k]) delete next[k];
        });
        return next;
      },
    });
  }

  return (
    <div className="bg-cream pt-16 animate-page-enter">
      {/* ─── HERO ─── */}
      <section className="border-b border-hairline bg-forest-ink text-cream overflow-hidden relative">
        <span className="pointer-events-none absolute -right-10 -bottom-24 font-display text-[22rem] leading-none text-cream/[0.04] select-none hidden lg:block">
          Live
        </span>
        <div className="container-page py-16 lg:py-24 relative">
          <p className="eyebrow text-gold">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            NexusZim Live — Official Ticketing
          </p>
          <h1 className="mt-6 font-display text-cream leading-[1.02] tracking-tight text-[clamp(2.75rem,7vw,5.5rem)] max-w-3xl">
            What's on. <em className="italic text-gold">Everywhere.</em>
          </h1>
          <p className="mt-6 max-w-xl font-sans text-base lg:text-lg text-cream/60 leading-relaxed">
            Every concert, festival, summit and showpiece in Zimbabwe — with transparent all-in
            pricing and instant QR e-tickets. No queues, no paper, no surprises.
          </p>

          <form
            className="mt-10 flex max-w-2xl overflow-hidden rounded-[4px] border border-cream/15 bg-cream-raised focus-within:border-gold transition-colors"
            onSubmit={(e) => {
              e.preventDefault();
              patchSearch({ q: query.trim() || undefined });
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-soft/50" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search artists, events or venues…"
                className="w-full bg-transparent py-4 pl-11 pr-4 font-sans text-sm text-text outline-none placeholder:text-text-soft/50"
                aria-label="Search events"
              />
            </div>
            <button
              type="submit"
              className="btn-cta bg-gold px-6 lg:px-8 font-sans text-sm font-semibold text-forest-ink"
            >
              Search
            </button>
          </form>

          {/* category pills */}
          <div className="mt-8 flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0 lg:flex-wrap">
            <button
              onClick={() => patchSearch({ category: undefined })}
              className={`shrink-0 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                !category
                  ? "border-gold bg-gold text-forest-ink font-semibold"
                  : "border-cream/20 text-cream/60 hover:border-cream/50 hover:text-cream"
              }`}
            >
              All
            </button>
            {EVENT_CATEGORIES.map((c) => (
              <button
                key={c.slug}
                onClick={() => patchSearch({ category: c.slug })}
                className={`shrink-0 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                  category === c.slug
                    ? "border-gold bg-gold text-forest-ink font-semibold"
                    : "border-cream/20 text-cream/60 hover:border-cream/50 hover:text-cream"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SPOTLIGHT ─── */}
      {spotlight && !hasActiveFilters && (
        <section className="border-b border-hairline">
          <div className="container-page py-14 lg:py-20">
            <div className="flex items-end justify-between gap-4">
              <p className="eyebrow text-text-soft">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                Spotlight
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-soft/50">
                Hand-picked by the desk
              </p>
            </div>

            <Link
              to="/events/$eventId"
              params={{ eventId: spotlight.id }}
              className="group mt-6 grid overflow-hidden rounded-[8px] border border-hairline bg-cream-raised transition-shadow hover:shadow-[0_12px_40px_rgba(15,51,35,0.12)] lg:grid-cols-[1.5fr_1fr]"
            >
              <EventPoster
                event={spotlight}
                size="hero"
                className="min-h-[280px] lg:min-h-[380px]"
              />
              <div className="flex flex-col justify-between p-7 lg:p-10">
                <div>
                  <StatusPill status={spotlight.status} />
                  <h2 className="mt-4 font-display text-3xl lg:text-4xl text-text leading-tight">
                    {spotlight.title}
                  </h2>
                  <p className="mt-3 font-sans text-sm lg:text-base text-text-soft leading-relaxed">
                    {spotlight.tagline}
                  </p>
                  <dl className="mt-6 space-y-2 font-mono text-[11px] uppercase tracking-[0.1em] text-text-soft">
                    <div className="flex gap-3">
                      <dt className="text-text-soft/50 w-14">When</dt>
                      <dd>
                        {formatEventDate(spotlight.date)} · doors {formatEventTime(spotlight.date)}
                      </dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="text-text-soft/50 w-14">Where</dt>
                      <dd>
                        {getVenue(spotlight.venueId)?.name} · {eventCity(spotlight)}
                      </dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="text-text-soft/50 w-14">From</dt>
                      <dd className="text-text font-semibold">
                        {formatMoney(eventPriceFrom(spotlight))}
                      </dd>
                    </div>
                  </dl>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 self-start bg-gold px-6 py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink btn-cta">
                  Get Tickets
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ─── LISTINGS ─── */}
      <section className="container-page py-14 lg:py-20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-text-soft">
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
              {hasActiveFilters ? "Results" : "All events"}
            </p>
            <h2 className="mt-3 font-display text-3xl lg:text-4xl text-text">
              {filtered.length} event{filtered.length === 1 ? "" : "s"}
              {city ? ` in ${city}` : " across Zimbabwe"}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {DATE_WINDOWS.map((w) => (
              <button
                key={w.key}
                onClick={() => setDateWindow(w.key)}
                className={`rounded-[3px] border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
                  dateWindow === w.key
                    ? "border-forest-ink bg-forest-ink text-cream"
                    : "border-hairline text-text-soft hover:border-forest/50 hover:text-forest"
                }`}
              >
                {w.label}
              </button>
            ))}
            <select
              value={city ?? ""}
              onChange={(e) => patchSearch({ city: e.target.value || undefined })}
              className="rounded-[3px] border border-hairline bg-cream-raised px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft outline-none focus:border-forest"
              aria-label="Filter by city"
            >
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-[6px] border border-dashed border-hairline bg-cream-raised px-6 py-20 text-center">
            <p className="font-display text-2xl text-text">Nothing matches those filters.</p>
            <p className="mt-3 font-sans text-sm text-text-soft">
              Try a different city or date window — or clear everything and browse the full listing.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setDateWindow("all");
                navigate({ search: {} });
              }}
              className="mt-6 border border-forest px-6 py-2.5 rounded-[3px] font-sans text-sm font-semibold text-forest hover:bg-forest hover:text-cream transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event, i) => {
              const daysAway = Math.ceil(
                (new Date(event.date).getTime() - Date.now()) / 86_400_000,
              );
              return (
                <div key={event.id} className="relative">
                  {daysAway >= 0 && daysAway <= 7 && (
                    <span className="absolute top-2 right-2 z-10 bg-gold text-forest-ink font-mono text-[9px] uppercase tracking-widest px-2 py-1 rounded-[3px] shadow-sm">
                      {daysAway === 0 ? "Today!" : `${daysAway}d away`}
                    </span>
                  )}
                  <EventCard event={event} index={i} />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── ONE-STOP CROSS-SELL ─── */}
      <section className="border-t border-hairline bg-cream-raised">
        <div className="container-page py-14 lg:py-20">
          <p className="eyebrow text-text-soft">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            Beyond the ticket
          </p>
          <h2 className="mt-3 font-display text-3xl lg:text-4xl text-text max-w-xl">
            Putting on your own event? Everything you need is already here.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                to: "/venues",
                icon: Building2,
                title: "Book a venue",
                copy: "From 400-seat theatres to 25,000-capacity arenas — compare, enquire, and lock in your date.",
                cta: "Browse venues",
              },
              {
                to: "/search",
                icon: Users,
                title: "Hire verified providers",
                copy: "Sound, stage, catering, security, décor — every supplier tier-verified on the NexusZim registry.",
                cta: "Open the directory",
              },
              {
                to: "/organizer",
                icon: Ticket,
                title: "Sell your tickets",
                copy: "List your event, set your tiers, and watch sales live from the organizer suite. Payouts in 48h.",
                cta: "Start selling",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.to}
                  to={card.to}
                  className="group flex flex-col rounded-[6px] border border-hairline bg-cream p-7 transition-all hover:-translate-y-0.5 hover:border-forest/40 hover:shadow-[0_8px_28px_rgba(15,51,35,0.10)]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-forest text-gold">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-5 font-sans text-base font-semibold text-text">{card.title}</h3>
                  <p className="mt-2 flex-1 font-sans text-sm leading-relaxed text-text-soft">
                    {card.copy}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-forest">
                    {card.cta}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
