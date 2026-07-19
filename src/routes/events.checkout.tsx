import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Ticket as TicketIcon,
  ArrowRight,
} from "lucide-react";
import {
  eventCity,
  formatEventDate,
  formatEventTime,
  formatMoney,
  getEvent,
  getVenue,
  ticketFee,
} from "@/lib/live-data";
import { useTickets, type TicketOrder } from "@/hooks/use-tickets";
import { EventPoster } from "@/components/live/poster";

export const Route = createFileRoute("/events/checkout")({
  head: () => ({
    meta: [{ title: "Checkout — NexusZim Live" }],
  }),
  component: Checkout,
});

function Checkout() {
  const { selection, placeOrder } = useTickets();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [payMethod, setPayMethod] = useState<"ecocash" | "card">("ecocash");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<TicketOrder | null>(null);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const event = selection ? getEvent(selection.eventId) : null;
  const venue = event ? getVenue(event.venueId) : null;

  const lines = useMemo(() => {
    if (!selection || !event) return [];
    return Object.entries(selection.quantities)
      .filter(([, qty]) => qty > 0)
      .map(([tierId, qty]) => {
        const tier = event.tiers.find((t) => t.id === tierId)!;
        return { tier, qty };
      })
      .filter((l) => l.tier);
  }, [selection, event]);

  const subtotal = lines.reduce((s, l) => s + l.tier.price * l.qty, 0);
  const fees = lines.reduce((s, l) => s + ticketFee(l.tier.price) * l.qty, 0);
  const total = subtotal + fees;
  const ticketCount = lines.reduce((s, l) => s + l.qty, 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (name.trim().length < 2) errs.name = "Enter the name that will appear on the tickets.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errs.email = "Enter a valid email address.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    // Mock payment processing — replace with a real gateway integration.
    setTimeout(() => {
      const order = placeOrder({
        buyerName: name.trim(),
        buyerEmail: email.trim(),
        payMethod,
      });
      setSubmitting(false);
      if (order) setConfirmed(order);
    }, 900);
  }

  // ─── CONFIRMATION ───
  if (confirmed) {
    const confirmedEvent = getEvent(confirmed.eventId)!;
    return (
      <div className="bg-cream pt-16 animate-page-enter">
        <div className="container-page flex min-h-[70vh] max-w-2xl flex-col items-center justify-center py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest text-gold animate-fade-up">
            <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} />
          </span>
          <p className="eyebrow mt-8 text-text-soft animate-fade-up delay-100">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            Order {confirmed.id} confirmed
          </p>
          <h1 className="mt-4 font-display text-4xl lg:text-5xl text-text animate-fade-up delay-150">
            You're going to
            <br />
            <em className="italic text-forest">{confirmedEvent.title}.</em>
          </h1>
          <p className="mt-6 max-w-md font-sans text-base text-text-soft leading-relaxed animate-fade-up delay-200">
            {confirmed.tickets.length} QR e-ticket{confirmed.tickets.length === 1 ? "" : "s"} issued
            to <span className="font-medium text-text">{confirmed.buyerEmail}</span> and saved to
            your wallet on this device. Show the QR at the gate — no printing needed.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row animate-fade-up delay-300">
            <Link
              to="/tickets"
              className="btn-cta inline-flex items-center justify-center gap-2 bg-gold px-8 py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink"
            >
              <TicketIcon className="h-4 w-4" />
              Open my tickets
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center justify-center gap-2 border border-forest px-8 py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest hover:bg-forest hover:text-cream transition-colors"
            >
              Keep browsing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── EMPTY STATE ───
  if (!selection || !event || lines.length === 0) {
    return (
      <div className="bg-cream pt-16 animate-page-enter">
        <div className="container-page flex min-h-[60vh] max-w-xl flex-col items-center justify-center py-16 text-center">
          <p className="eyebrow text-text-soft">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            Checkout
          </p>
          <h1 className="mt-4 font-display text-4xl text-text">Nothing to check out — yet.</h1>
          <p className="mt-4 font-sans text-base text-text-soft">
            Pick an event and choose your tickets first. Your selection carries straight through to
            this page.
          </p>
          <Link
            to="/events"
            className="btn-cta mt-8 bg-gold px-8 py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink"
          >
            Browse events
          </Link>
        </div>
      </div>
    );
  }

  // ─── CHECKOUT FORM ───
  return (
    <div className="bg-cream pt-16 animate-page-enter">
      <div className="container-page py-8 lg:py-12">
        <button
          onClick={() => navigate({ to: "/events/$eventId", params: { eventId: event.id } })}
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-text-soft hover:text-forest transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to {event.title}
        </button>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <form onSubmit={submit} className="min-w-0">
            <p className="eyebrow text-text-soft">
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
              Secure checkout
            </p>
            <h1 className="mt-3 font-display text-4xl text-text">Almost there.</h1>

            {/* Step 1: details */}
            <fieldset className="mt-10">
              <legend className="flex items-center gap-3 font-sans text-sm font-semibold text-text">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest font-mono text-[10px] font-bold text-gold">
                  1
                </span>
                Ticket holder details
              </legend>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="co-name"
                    className="block font-sans text-[13px] font-semibold text-text"
                  >
                    Full name
                  </label>
                  <input
                    id="co-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="As it should appear on the ticket"
                    className="field-input mt-2"
                    autoComplete="name"
                  />
                  {errors.name && (
                    <p className="mt-1.5 font-sans text-xs text-rose-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="co-email"
                    className="block font-sans text-[13px] font-semibold text-text"
                  >
                    Email address
                  </label>
                  <input
                    id="co-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your e-tickets land here"
                    className="field-input mt-2"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="mt-1.5 font-sans text-xs text-rose-600">{errors.email}</p>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Step 2: payment */}
            <fieldset className="mt-10">
              <legend className="flex items-center gap-3 font-sans text-sm font-semibold text-text">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest font-mono text-[10px] font-bold text-gold">
                  2
                </span>
                Payment method
              </legend>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {(
                  [
                    {
                      key: "ecocash",
                      icon: Smartphone,
                      title: "EcoCash / OneMoney",
                      copy: "Pay from your mobile wallet — a prompt is sent to your phone.",
                    },
                    {
                      key: "card",
                      icon: CreditCard,
                      title: "Visa / Mastercard",
                      copy: "International and ZimSwitch cards accepted.",
                    },
                  ] as const
                ).map((m) => {
                  const Icon = m.icon;
                  const active = payMethod === m.key;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setPayMethod(m.key)}
                      className={`flex items-start gap-3 rounded-[4px] border p-4 text-left transition-colors ${
                        active
                          ? "border-forest bg-forest/[0.04]"
                          : "border-hairline bg-cream-raised hover:border-forest/40"
                      }`}
                      aria-pressed={active}
                    >
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] ${active ? "bg-forest text-gold" : "bg-cream text-text-soft"}`}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.5} />
                      </span>
                      <span>
                        <span className="block font-sans text-sm font-semibold text-text">
                          {m.title}
                        </span>
                        <span className="mt-0.5 block font-sans text-xs leading-relaxed text-text-soft">
                          {m.copy}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 rounded-[4px] border border-gold/25 bg-gold/5 px-4 py-3 font-sans text-xs leading-relaxed text-text-soft">
                Demo checkout — no payment is taken. In production this step hands off to the
                payment gateway before tickets are issued.
              </p>
            </fieldset>

            <button
              type="submit"
              disabled={submitting}
              className="btn-cta mt-10 flex w-full items-center justify-center gap-2 rounded-[3px] bg-gold py-4 font-sans text-sm font-semibold text-forest-ink disabled:opacity-60 sm:w-auto sm:px-12"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-forest-ink/30 border-t-forest-ink" />
                  Processing…
                </>
              ) : (
                <>
                  Pay {formatMoney(Math.round(total * 100) / 100)} · issue tickets
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <p className="mt-4 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-text-soft/60">
              <ShieldCheck className="h-3 w-3" />
              256-bit encrypted · tickets held for 10 minutes
            </p>
          </form>

          {/* ─── ORDER SUMMARY ─── */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[8px] border border-hairline bg-cream-raised">
              <EventPoster event={event} size="mini" className="h-28" />
              <div className="border-b border-hairline px-5 py-4">
                <h2 className="font-sans text-sm font-semibold text-text">{event.title}</h2>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">
                  {formatEventDate(event.date)} · {formatEventTime(event.date)}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">
                  {venue?.name} · {eventCity(event)}
                </p>
              </div>
              <dl className="space-y-2.5 px-5 py-4">
                {lines.map((l) => (
                  <div key={l.tier.id} className="flex justify-between gap-4 font-sans text-sm">
                    <dt className="text-text-soft">
                      {l.qty} × {l.tier.name}
                    </dt>
                    <dd className="tabular-nums text-text">{formatMoney(l.tier.price * l.qty)}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4 border-t border-hairline pt-2.5 font-sans text-sm">
                  <dt className="text-text-soft">Service fee</dt>
                  <dd className="tabular-nums text-text">
                    {formatMoney(Math.round(fees * 100) / 100)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 font-sans text-base font-semibold text-text">
                  <dt>
                    Total · {ticketCount} ticket{ticketCount === 1 ? "" : "s"}
                  </dt>
                  <dd className="tabular-nums">{formatMoney(Math.round(total * 100) / 100)}</dd>
                </div>
              </dl>
              <div className="border-t border-hairline bg-cream px-5 py-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-text-soft/60">
                  All-in pricing — the total above is exactly what you pay.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
