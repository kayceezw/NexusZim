import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Users,
  BadgeCheck,
  CalendarDays,
} from "lucide-react";
import {
  POSTER_PALETTES,
  eventsAtVenue,
  formatMoney,
  getVenue,
  venueTypeLabel,
} from "@/lib/live-data";
import { EventCard } from "@/components/live/event-card";

export const Route = createFileRoute("/venues/$venueId")({
  loader: ({ params }) => {
    const venue = getVenue(params.venueId);
    if (!venue) throw notFound();
    return { venue };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.venue.name ?? "Venue"} — Book on NexusZim` },
      { name: "description", content: loaderData?.venue.description.slice(0, 150) ?? "" },
    ],
  }),
  component: VenueDetail,
});

function VenueDetail() {
  const { venue } = Route.useLoaderData();
  const pal = POSTER_PALETTES[venue.palette];
  const upcoming = eventsAtVenue(venue.id).filter((e) => new Date(e.date) >= new Date());

  const [enquiry, setEnquiry] = useState({ name: "", email: "", date: "", guests: "", notes: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submitEnquiry(e: React.FormEvent) {
    e.preventDefault();
    if (
      enquiry.name.trim().length < 2 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email.trim())
    ) {
      setError("Add your name and a valid email so the venue can reply.");
      return;
    }
    setError(null);
    setSent(true);
  }

  return (
    <div className="bg-cream pt-16 animate-page-enter">
      {/* ─── HERO PLATE ─── */}
      <section
        className="relative overflow-hidden border-b border-hairline"
        style={{ backgroundColor: pal.bg, color: pal.fg }}
      >
        <span
          className="pointer-events-none absolute -right-6 -bottom-16 font-display text-[18rem] leading-none opacity-[0.06] select-none hidden lg:block"
          style={{ color: pal.fg }}
        >
          {Math.max(venue.capacitySeated, venue.capacityStanding) >= 1000
            ? `${Math.round(Math.max(venue.capacitySeated, venue.capacityStanding) / 1000)}k`
            : Math.max(venue.capacitySeated, venue.capacityStanding)}
        </span>
        <div className="container-page relative py-14 lg:py-20">
          <Link
            to="/venues"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] opacity-60 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="h-3 w-3" />
            All venues
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span
              className="font-mono text-[10px] uppercase tracking-[0.14em] border px-2 py-1 rounded-[2px]"
              style={{ borderColor: `${pal.accent}66`, color: pal.accent }}
            >
              {venueTypeLabel(venue.type)}
            </span>
            {venue.verified && (
              <span
                className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] border px-2 py-1 rounded-[2px]"
                style={{ borderColor: `${pal.fg}33` }}
              >
                <ShieldCheck className="h-3 w-3" strokeWidth={2} />
                NexusZim Verified
              </span>
            )}
          </div>
          <h1 className="mt-5 font-display leading-[1.02] tracking-tight text-[clamp(2.5rem,6vw,4.5rem)] max-w-3xl">
            {venue.name}
          </h1>
          <p className="mt-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] opacity-70">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
            {venue.area}, {venue.city}
          </p>

          <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { label: "Seated", value: venue.capacitySeated.toLocaleString() },
              { label: "Standing", value: venue.capacityStanding.toLocaleString() },
              { label: "From / day", value: formatMoney(venue.priceFromPerDay) },
              { label: "Rating", value: `${venue.rating} ★ (${venue.reviews})` },
            ].map((stat) => (
              <div key={stat.label}>
                <dt
                  className="font-mono text-[9px] uppercase tracking-[0.16em]"
                  style={{ color: pal.accent }}
                >
                  {stat.label}
                </dt>
                <dd className="mt-1 font-display text-2xl lg:text-3xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ─── BODY ─── */}
      <section className="container-page grid gap-10 py-12 lg:grid-cols-[1.4fr_1fr] lg:gap-14 lg:py-16">
        <div className="min-w-0">
          <p className="eyebrow text-text-soft">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            About the venue
          </p>
          <p className="mt-5 font-sans text-[15px] leading-relaxed text-text-soft">
            {venue.description}
          </p>

          <div className="mt-10">
            <p className="eyebrow text-text-soft">
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
              Amenities & infrastructure
            </p>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {venue.amenities.map((a) => (
                <li
                  key={a}
                  className="flex items-center gap-2.5 rounded-[3px] border border-hairline bg-cream-raised px-3.5 py-2.5 font-sans text-sm text-text"
                >
                  <BadgeCheck className="h-4 w-4 shrink-0 text-forest" strokeWidth={1.75} />
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <p className="eyebrow text-text-soft">
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
              Ideal for
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {venue.idealFor.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-hairline bg-cream-raised px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          {/* provider cross-sell */}
          <div className="mt-10 rounded-[6px] border border-hairline bg-cream-raised p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="flex items-center gap-2 font-sans text-base font-semibold text-text">
                  <Users className="h-4 w-4 text-gold" strokeWidth={1.75} />
                  Staff your event here
                </h3>
                <p className="mt-2 max-w-md font-sans text-sm leading-relaxed text-text-soft">
                  Sound, staging, catering, security and décor teams that already know this venue —
                  all tier-verified on the NexusZim registry.
                </p>
              </div>
              <Link
                to="/search"
                search={{ q: venue.city }}
                className="shrink-0 border border-forest px-5 py-2.5 rounded-[3px] font-sans text-sm font-semibold text-forest hover:bg-forest hover:text-cream transition-colors"
              >
                Find providers in {venue.city}
              </Link>
            </div>
          </div>
        </div>

        {/* ─── ENQUIRY PANEL ─── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[8px] border border-hairline bg-cream-raised shadow-[0_4px_24px_rgba(15,51,35,0.06)]">
            <div className="border-b border-hairline px-5 py-4">
              <h2 className="font-sans text-sm font-semibold text-text">Check availability</h2>
              <p className="mt-1 font-sans text-xs text-text-soft">
                Direct to the venue's events desk — typical reply within one business day.
              </p>
            </div>

            {sent ? (
              <div className="flex flex-col items-center px-6 py-12 text-center animate-fade-in">
                <CheckCircle2 className="h-10 w-10 text-forest" strokeWidth={1.5} />
                <p className="mt-4 font-display text-xl text-text">Enquiry sent.</p>
                <p className="mt-2 font-sans text-sm leading-relaxed text-text-soft">
                  {venue.name} will reply to{" "}
                  <span className="font-medium text-text">{enquiry.email}</span>. We've logged the
                  request in your dashboard too.
                </p>
                <Link
                  to="/venues"
                  className="mt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-forest hover:underline underline-offset-4"
                >
                  Browse more venues →
                </Link>
              </div>
            ) : (
              <form onSubmit={submitEnquiry} className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label
                      className="block font-sans text-[13px] font-semibold text-text"
                      htmlFor="vq-name"
                    >
                      Your name
                    </label>
                    <input
                      id="vq-name"
                      value={enquiry.name}
                      onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })}
                      className="field-input mt-1.5"
                      autoComplete="name"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label
                      className="block font-sans text-[13px] font-semibold text-text"
                      htmlFor="vq-email"
                    >
                      Email
                    </label>
                    <input
                      id="vq-email"
                      type="email"
                      value={enquiry.email}
                      onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })}
                      className="field-input mt-1.5"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label
                      className="block font-sans text-[13px] font-semibold text-text"
                      htmlFor="vq-date"
                    >
                      Event date
                    </label>
                    <input
                      id="vq-date"
                      type="date"
                      value={enquiry.date}
                      onChange={(e) => setEnquiry({ ...enquiry, date: e.target.value })}
                      className="field-input mt-1.5"
                    />
                  </div>
                  <div>
                    <label
                      className="block font-sans text-[13px] font-semibold text-text"
                      htmlFor="vq-guests"
                    >
                      Guests
                    </label>
                    <input
                      id="vq-guests"
                      type="number"
                      min={1}
                      value={enquiry.guests}
                      onChange={(e) => setEnquiry({ ...enquiry, guests: e.target.value })}
                      placeholder={`Up to ${Math.max(venue.capacitySeated, venue.capacityStanding).toLocaleString()}`}
                      className="field-input mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block font-sans text-[13px] font-semibold text-text"
                    htmlFor="vq-notes"
                  >
                    Tell them about your event
                  </label>
                  <textarea
                    id="vq-notes"
                    rows={3}
                    value={enquiry.notes}
                    onChange={(e) => setEnquiry({ ...enquiry, notes: e.target.value })}
                    placeholder="Type of event, timings, production needs…"
                    className="field-input mt-1.5 resize-none"
                  />
                </div>
                {error && <p className="font-sans text-xs text-rose-600">{error}</p>}
                <button
                  type="submit"
                  className="btn-cta flex w-full items-center justify-center gap-2 rounded-[3px] bg-gold py-3.5 font-sans text-sm font-semibold text-forest-ink"
                >
                  Send enquiry
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-center font-mono text-[9px] uppercase tracking-[0.1em] text-text-soft/60">
                  Free to enquire · no platform booking fee for venues
                </p>
              </form>
            )}
          </div>
        </aside>
      </section>

      {/* ─── UPCOMING AT THIS VENUE ─── */}
      {upcoming.length > 0 && (
        <section className="border-t border-hairline bg-cream-raised">
          <div className="container-page py-12 lg:py-16">
            <p className="eyebrow text-text-soft">
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
              <CalendarDays className="h-3 w-3 text-gold" />
              On sale at {venue.name}
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((e, i) => (
                <EventCard key={e.id} event={e} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
