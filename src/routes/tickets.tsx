import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, Ticket as TicketIcon, CalendarDays, MapPin } from "lucide-react";
import {
  eventCity,
  formatEventDate,
  formatEventTime,
  formatMoney,
  getEvent,
  getVenue,
} from "@/lib/live-data";
import { useTickets, type TicketOrder, type IssuedTicket } from "@/hooks/use-tickets";
import { QRCode } from "@/components/live/qr-ticket";
import { EventPoster } from "@/components/live/poster";

export const Route = createFileRoute("/tickets")({
  head: () => ({
    meta: [{ title: "My Tickets — NexusZim Live" }],
  }),
  component: TicketWallet,
});

function TicketStub({ order, ticket }: { order: TicketOrder; ticket: IssuedTicket }) {
  const event = getEvent(order.eventId);
  if (!event) return null;
  const venue = getVenue(event.venueId);

  return (
    <div className="overflow-hidden rounded-[8px] border border-hairline bg-cream-raised shadow-[0_2px_16px_rgba(15,51,35,0.06)]">
      <div className="grid sm:grid-cols-[1fr_auto]">
        {/* left: event info */}
        <div className="p-6">
          <p className="eyebrow text-text-soft">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            {ticket.tierName}
          </p>
          <h3 className="mt-3 font-display text-2xl text-text leading-tight">{event.title}</h3>
          <div className="mt-4 space-y-1.5">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">
              <CalendarDays className="h-3 w-3 text-gold shrink-0" strokeWidth={1.75} />
              {formatEventDate(event.date)} · doors {event.doors} · starts{" "}
              {formatEventTime(event.date)}
            </p>
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">
              <MapPin className="h-3 w-3 text-gold shrink-0" strokeWidth={1.75} />
              {venue?.name} · {eventCity(event)}
            </p>
          </div>
          <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-hairline pt-4">
            <div>
              <dt className="font-mono text-[8px] uppercase tracking-[0.14em] text-text-soft/50">
                Admit
              </dt>
              <dd className="mt-0.5 font-sans text-sm font-semibold text-text">One</dd>
            </div>
            <div>
              <dt className="font-mono text-[8px] uppercase tracking-[0.14em] text-text-soft/50">
                Holder
              </dt>
              <dd className="mt-0.5 truncate font-sans text-sm font-semibold text-text">
                {order.buyerName}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[8px] uppercase tracking-[0.14em] text-text-soft/50">
                Order
              </dt>
              <dd className="mt-0.5 font-mono text-xs text-text">{order.id}</dd>
            </div>
          </dl>
        </div>

        {/* right: perforated QR stub */}
        <div className="relative flex items-center justify-between gap-4 border-t border-dashed border-hairline bg-cream px-6 py-5 sm:w-56 sm:flex-col sm:justify-center sm:border-t-0 sm:border-l sm:py-6">
          {/* punch holes on the perforation */}
          <span className="absolute -top-2.5 left-1/2 hidden h-5 w-5 -translate-x-1/2 rounded-full bg-cream border border-hairline sm:block sm:left-0 sm:top-1/2 sm:-translate-y-1/2 sm:-translate-x-1/2" />
          <span className="absolute -bottom-2.5 left-1/2 hidden h-5 w-5 -translate-x-1/2 rounded-full bg-cream border-hairline sm:block sm:left-auto sm:hidden" />
          <QRCode
            value={ticket.code}
            className="h-28 w-28 sm:h-32 sm:w-32 rounded-[4px] border border-hairline"
          />
          <div className="text-right sm:text-center">
            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-text-soft/50">
              Scan at gate
            </p>
            <p className="mt-1 font-mono text-[11px] font-medium text-text break-all">
              {ticket.code}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderGroup({ order, index }: { order: TicketOrder; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const event = getEvent(order.eventId);
  if (!event) return null;

  return (
    <div className="animate-slide-up" style={{ animationDelay: `${Math.min(index, 6) * 80}ms` }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full items-center gap-4 rounded-[6px] border border-hairline bg-cream-raised p-4 text-left transition-colors hover:border-forest/40"
        aria-expanded={open}
      >
        <EventPoster event={event} size="mini" className="h-16 w-24 shrink-0 rounded-[4px]" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-sans text-[15px] font-semibold text-text">{event.title}</h2>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">
            {formatEventDate(event.date)} · {order.tickets.length} ticket
            {order.tickets.length === 1 ? "" : "s"} · {formatMoney(order.total)}
          </p>
        </div>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft/60 sm:block">
          {order.id}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-text-soft transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-3 space-y-4 pl-0 sm:pl-6 animate-fade-in">
          {order.tickets.map((t) => (
            <TicketStub key={t.code} order={order} ticket={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function TicketWallet() {
  const { orders } = useTickets();

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const up: TicketOrder[] = [];
    const pa: TicketOrder[] = [];
    for (const o of orders) {
      const event = getEvent(o.eventId);
      if (event && new Date(event.date).getTime() >= now) up.push(o);
      else pa.push(o);
    }
    const byDate = (a: TicketOrder, b: TicketOrder) => {
      const da = getEvent(a.eventId)?.date ?? "";
      const db = getEvent(b.eventId)?.date ?? "";
      return da.localeCompare(db);
    };
    return { upcoming: up.sort(byDate), past: pa.sort(byDate).reverse() };
  }, [orders]);

  return (
    <div className="bg-cream pt-16 animate-page-enter">
      <section className="border-b border-hairline">
        <div className="container-page py-12 lg:py-16">
          <p className="eyebrow text-text-soft">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            NexusZim Live wallet
          </p>
          <h1 className="mt-4 font-display text-4xl lg:text-5xl text-text">
            My <em className="italic text-forest">tickets.</em>
          </h1>
          <p className="mt-4 max-w-lg font-sans text-base text-text-soft leading-relaxed">
            Every ticket you buy lives here — offline-ready QR codes, no printing, no app download.
            Just open this page at the gate.
          </p>
        </div>
      </section>

      <section className="container-page py-12 lg:py-16">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center rounded-[6px] border border-dashed border-hairline bg-cream-raised px-6 py-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forest/5 text-forest">
              <TicketIcon className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <p className="mt-6 font-display text-2xl text-text">Your wallet is empty.</p>
            <p className="mt-3 max-w-sm font-sans text-sm text-text-soft leading-relaxed">
              When you buy tickets on NexusZim Live they appear here instantly, ready to scan.
            </p>
            <Link
              to="/events"
              className="btn-cta mt-8 bg-gold px-8 py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink"
            >
              Find your first event
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            <div>
              <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.08em] text-text">
                Upcoming ({upcoming.length})
              </h2>
              {upcoming.length === 0 ? (
                <p className="mt-4 font-sans text-sm text-text-soft">
                  No upcoming events —{" "}
                  <Link to="/events" className="text-forest underline underline-offset-4">
                    fix that
                  </Link>
                  .
                </p>
              ) : (
                <div className="mt-5 space-y-6">
                  {upcoming.map((o, i) => (
                    <OrderGroup key={o.id} order={o} index={i} />
                  ))}
                </div>
              )}
            </div>

            {past.length > 0 && (
              <div>
                <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.08em] text-text-soft">
                  Past events ({past.length})
                </h2>
                <div className="mt-5 space-y-6 opacity-70">
                  {past.map((o, i) => (
                    <OrderGroup key={o.id} order={o} index={i + 1} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
