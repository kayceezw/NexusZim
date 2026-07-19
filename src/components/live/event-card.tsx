import { Link } from "@tanstack/react-router";
import { MapPin, CalendarDays } from "lucide-react";
import {
  type LiveEvent,
  STATUS_META,
  eventCity,
  eventPriceFrom,
  formatEventDate,
  formatEventTime,
  formatMoney,
  getVenue,
} from "@/lib/live-data";
import { EventPoster } from "./poster";

export function StatusPill({ status }: { status: LiveEvent["status"] }) {
  const meta = STATUS_META[status];
  const tone =
    meta.tone === "open"
      ? "border-emerald-600/25 text-emerald-700 bg-emerald-600/5"
      : meta.tone === "warn"
        ? "border-gold/40 text-gold-deep bg-gold/10"
        : meta.tone === "closed"
          ? "border-rose-500/30 text-rose-600 bg-rose-500/5"
          : "border-hairline text-text-soft bg-cream";
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-1 rounded-[2px] font-mono text-[9px] font-medium uppercase tracking-[0.12em] ${tone}`}
    >
      {meta.tone === "warn" && (
        <span className="inline-block h-1 w-1 rounded-full bg-gold animate-pulse" />
      )}
      {meta.label}
    </span>
  );
}

export function EventCard({ event, index = 0 }: { event: LiveEvent; index?: number }) {
  const venue = getVenue(event.venueId);
  const from = eventPriceFrom(event);
  const soldOut = event.status === "sold-out";

  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: event.id }}
      className="group flex flex-col overflow-hidden rounded-[6px] border border-hairline bg-cream-raised transition-all duration-300 hover:-translate-y-0.5 hover:border-forest/40 hover:shadow-[0_8px_28px_rgba(15,51,35,0.10)] animate-slide-up"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <EventPoster event={event} className="aspect-[16/10]" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-sans text-[15px] font-semibold leading-snug text-text group-hover:text-forest transition-colors">
            {event.title}
          </h3>
          <StatusPill status={event.status} />
        </div>

        <div className="mt-3 space-y-1.5">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">
            <CalendarDays className="h-3 w-3 text-gold shrink-0" strokeWidth={1.75} />
            {formatEventDate(event.date)} · {formatEventTime(event.date)}
          </p>
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">
            <MapPin className="h-3 w-3 text-gold shrink-0" strokeWidth={1.75} />
            <span className="truncate">
              {venue?.name} · {eventCity(event)}
            </span>
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-hairline pt-4 mt-4">
          <p className="font-sans text-sm text-text-soft">
            {soldOut ? (
              <span className="text-rose-600 font-medium">Sold out</span>
            ) : (
              <>
                From <span className="font-semibold text-text">{formatMoney(from)}</span>
              </>
            )}
          </p>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-forest opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
            {soldOut ? "View →" : "Get Tickets →"}
          </span>
        </div>
      </div>
    </Link>
  );
}
