import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Users,
  BadgeCheck,
  Info,
} from "lucide-react";
import {
  type TicketTier,
  STATUS_META,
  allInPrice,
  categoryLabel,
  eventCity,
  formatEventDate,
  formatEventTime,
  formatMoney,
  getEvent,
  getOrganizer,
  getVenue,
  relatedEvents,
  ticketFee,
} from "@/lib/live-data";
import { useTickets } from "@/hooks/use-tickets";
import { EventCard, StatusPill } from "@/components/live/event-card";
import { EventPoster } from "@/components/live/poster";

export const Route = createFileRoute("/events/$eventId")({
  loader: ({ params }) => {
    const event = getEvent(params.eventId);
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.event.title ?? "Event"} — Tickets on NexusZim Live` },
      { name: "description", content: loaderData?.event.tagline ?? "" },
    ],
  }),
  component: EventDetail,
});

function TierRow({
  tier,
  qty,
  showAllIn,
  onChange,
}: {
  tier: TicketTier;
  qty: number;
  showAllIn: boolean;
  onChange: (qty: number) => void;
}) {
  const soldOut = tier.remaining === 0;
  const low = !soldOut && tier.remaining <= 50;
  const max = Math.min(tier.maxPerOrder, tier.remaining);
  const display = showAllIn ? allInPrice(tier.price) : tier.price;

  return (
    <div
      className={`rounded-[4px] border p-4 transition-colors ${
        soldOut
          ? "border-hairline bg-cream opacity-60"
          : qty > 0
            ? "border-forest bg-forest/[0.04]"
            : "border-hairline bg-cream-raised hover:border-forest/40"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-sans text-sm font-semibold text-text">{tier.name}</h4>
            {soldOut ? (
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-rose-600 border border-rose-500/30 bg-rose-500/5 px-1.5 py-0.5 rounded-[2px]">
                Sold Out
              </span>
            ) : low ? (
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-gold-deep border border-gold/40 bg-gold/10 px-1.5 py-0.5 rounded-[2px]">
                Only {tier.remaining} left
              </span>
            ) : null}
          </div>
          <p className="mt-1 font-sans text-xs leading-relaxed text-text-soft">
            {tier.description}
          </p>
          {tier.perks && tier.perks.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {tier.perks.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-forest/80"
                >
                  <BadgeCheck className="h-3 w-3 text-gold shrink-0" strokeWidth={1.75} />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2.5">
          <p className="font-sans text-base font-semibold text-text tabular-nums">
            {formatMoney(display)}
            {showAllIn && tier.price > 0 && (
              <span className="ml-1 font-mono text-[9px] uppercase tracking-[0.08em] text-text-soft/60 font-normal">
                all-in
              </span>
            )}
          </p>
          {!soldOut && (
            <div className="flex items-center rounded-[3px] border border-hairline bg-cream-raised">
              <button
                onClick={() => onChange(Math.max(0, qty - 1))}
                disabled={qty === 0}
                className="flex h-8 w-8 items-center justify-center text-text-soft transition-colors hover:text-forest disabled:opacity-30"
                aria-label={`Remove one ${tier.name}`}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center font-mono text-sm text-text tabular-nums">
                {qty}
              </span>
              <button
                onClick={() => onChange(Math.min(max, qty + 1))}
                disabled={qty >= max}
                className="flex h-8 w-8 items-center justify-center text-text-soft transition-colors hover:text-forest disabled:opacity-30"
                aria-label={`Add one ${tier.name}`}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EventDetail() {
  const { event } = Route.useLoaderData();
  const navigate = useNavigate();
  const { setSelection } = useTickets();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showAllIn, setShowAllIn] = useState(true);

  const venue = getVenue(event.venueId);
  const organizer = getOrganizer(event.organizerId);
  const related = useMemo(() => relatedEvents(event), [event]);

  const lines = event.tiers
    .map((t) => ({ tier: t, qty: quantities[t.id] ?? 0 }))
    .filter((l) => l.qty > 0);
  const ticketCount = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.tier.price * l.qty, 0);
  const fees = lines.reduce((s, l) => s + ticketFee(l.tier.price) * l.qty, 0);
  const total = subtotal + fees;
  const purchasable = event.status === "on-sale" || event.status === "selling-fast";

  function proceed() {
    if (ticketCount === 0) return;
    setSelection({ eventId: event.id, quantities });
    navigate({ to: "/events/checkout" });
  }

  return (
    <div className="bg-cream pt-16 animate-page-enter">
      {/* ─── HERO ─── */}
      <section className="border-b border-hairline">
        <div className="container-page pt-6">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-text-soft hover:text-forest transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            All events
          </Link>
        </div>
        <div className="container-page grid gap-8 py-8 lg:grid-cols-[1.4fr_1fr] lg:py-12">
          <EventPoster
            event={event}
            size="hero"
            className="rounded-[8px] min-h-[300px] lg:min-h-[420px]"
          />
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={event.status} />
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-soft border border-hairline px-2 py-1 rounded-[2px]">
                {categoryLabel(event.category)}
              </span>
              {event.ageRestriction && (
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-soft border border-hairline px-2 py-1 rounded-[2px]">
                  {event.ageRestriction}
                </span>
              )}
            </div>
            <h1 className="mt-5 font-display text-4xl lg:text-5xl text-text leading-[1.05] tracking-tight">
              {event.title}
            </h1>
            <p className="mt-4 font-sans text-base text-text-soft leading-relaxed">
              {event.tagline}
            </p>

            <dl className="mt-8 space-y-3">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-gold shrink-0" strokeWidth={1.5} />
                <dd className="font-sans text-sm text-text">{formatEventDate(event.date)}</dd>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gold shrink-0" strokeWidth={1.5} />
                <dd className="font-sans text-sm text-text">
                  Doors {event.doors} · starts {formatEventTime(event.date)}
                </dd>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gold shrink-0" strokeWidth={1.5} />
                <dd className="font-sans text-sm text-text">
                  {venue ? (
                    <Link
                      to="/venues/$venueId"
                      params={{ venueId: venue.id }}
                      className="underline decoration-hairline underline-offset-4 hover:decoration-forest hover:text-forest transition-colors"
                    >
                      {venue.name}
                    </Link>
                  ) : (
                    "Venue TBA"
                  )}
                  <span className="text-text-soft"> · {eventCity(event)}</span>
                </dd>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-gold shrink-0" strokeWidth={1.5} />
                <dd className="font-sans text-sm text-text">{event.expectedAttendance} expected</dd>
              </div>
            </dl>

            {organizer && (
              <div className="mt-8 flex items-center gap-3 rounded-[4px] border border-hairline bg-cream-raised px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-[3px] bg-forest font-mono text-[11px] font-bold text-gold">
                  {organizer.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-sans text-[13px] font-semibold text-text">
                    {organizer.name}
                    {organizer.verified && (
                      <ShieldCheck className="h-3.5 w-3.5 text-forest" strokeWidth={2} />
                    )}
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-text-soft">
                    {organizer.eventsHosted} events hosted · {organizer.followers.toLocaleString()}{" "}
                    followers
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── BODY: description + tickets ─── */}
      <section className="container-page grid gap-10 py-12 lg:grid-cols-[1.4fr_1fr] lg:gap-14 lg:py-16">
        <div className="min-w-0">
          <p className="eyebrow text-text-soft">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            About this event
          </p>
          <div className="mt-5 space-y-4">
            {event.description.map((para, i) => (
              <p key={i} className="font-sans text-[15px] leading-relaxed text-text-soft">
                {para}
              </p>
            ))}
          </div>

          {event.lineup && event.lineup.length > 0 && (
            <div className="mt-10">
              <p className="eyebrow text-text-soft">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                Line-up
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {event.lineup.map((artist) => (
                  <li
                    key={artist}
                    className="rounded-[3px] border border-hairline bg-cream-raised px-3.5 py-2 font-sans text-sm text-text"
                  >
                    {artist}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {venue && (
            <div className="mt-10 rounded-[6px] border border-hairline bg-cream-raised p-6">
              <p className="eyebrow text-text-soft">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                The venue
              </p>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-display text-2xl text-text">{venue.name}</h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">
                    {venue.area}, {venue.city} · up to{" "}
                    {Math.max(venue.capacitySeated, venue.capacityStanding).toLocaleString()} guests
                  </p>
                  <p className="mt-3 max-w-lg font-sans text-sm leading-relaxed text-text-soft line-clamp-3">
                    {venue.description}
                  </p>
                </div>
                <Link
                  to="/venues/$venueId"
                  params={{ venueId: venue.id }}
                  className="shrink-0 border border-forest px-5 py-2.5 rounded-[3px] font-sans text-sm font-semibold text-forest hover:bg-forest hover:text-cream transition-colors"
                >
                  Venue profile
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ─── STICKY TICKET PANEL ─── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[8px] border border-hairline bg-cream-raised shadow-[0_4px_24px_rgba(15,51,35,0.06)]">
            <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
              <h2 className="font-sans text-sm font-semibold text-text">Tickets</h2>
              <button
                onClick={() => setShowAllIn((v) => !v)}
                className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-text-soft hover:text-forest transition-colors"
                title="Toggle between base and all-in pricing"
              >
                <Info className="h-3 w-3" />
                {showAllIn ? "Showing all-in prices" : "Showing base prices"}
              </button>
            </div>

            <div className="space-y-3 p-5">
              {!purchasable && (
                <div className="rounded-[4px] border border-hairline bg-cream px-4 py-3">
                  <p className="font-sans text-sm text-text-soft">
                    {event.status === "sold-out"
                      ? "This event has sold out. Join the waitlist from the organizer's page."
                      : `Tickets are not on sale yet — sales open soon. Status: ${STATUS_META[event.status].label}.`}
                  </p>
                </div>
              )}
              {event.tiers.map((tier) => (
                <TierRow
                  key={tier.id}
                  tier={tier}
                  qty={quantities[tier.id] ?? 0}
                  showAllIn={showAllIn}
                  onChange={(qty) =>
                    purchasable && setQuantities((prev) => ({ ...prev, [tier.id]: qty }))
                  }
                />
              ))}
            </div>

            <div className="border-t border-hairline p-5">
              {ticketCount > 0 ? (
                <dl className="space-y-1.5">
                  <div className="flex justify-between font-sans text-sm text-text-soft">
                    <dt>
                      Subtotal · {ticketCount} ticket{ticketCount === 1 ? "" : "s"}
                    </dt>
                    <dd className="tabular-nums">{formatMoney(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between font-sans text-sm text-text-soft">
                    <dt>Service fee</dt>
                    <dd className="tabular-nums">{formatMoney(Math.round(fees * 100) / 100)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-hairline pt-2.5 font-sans text-base font-semibold text-text">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{formatMoney(Math.round(total * 100) / 100)}</dd>
                  </div>
                </dl>
              ) : (
                <p className="font-sans text-sm text-text-soft">
                  {purchasable
                    ? "Select your tickets above — prices include everything, no surprises at checkout."
                    : "Browse other events while you wait."}
                </p>
              )}

              <button
                onClick={proceed}
                disabled={ticketCount === 0}
                className="btn-cta mt-4 flex w-full items-center justify-center gap-2 rounded-[3px] bg-gold py-3.5 font-sans text-sm font-semibold text-forest-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:filter-none"
              >
                Continue to checkout
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="mt-3 flex items-center justify-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-text-soft/60">
                <ShieldCheck className="h-3 w-3" />
                Secure checkout · instant QR e-tickets
              </p>
            </div>
          </div>
        </aside>
      </section>

      {/* ─── RELATED ─── */}
      {related.length > 0 && (
        <section className="border-t border-hairline bg-cream-raised">
          <div className="container-page py-12 lg:py-16">
            <p className="eyebrow text-text-soft">
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
              You might also like
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((e, i) => (
                <EventCard key={e.id} event={e} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
