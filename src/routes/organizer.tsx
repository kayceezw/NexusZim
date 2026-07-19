import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  QrCode,
  Radio,
  Ticket,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { LIVE_EVENTS, formatMoney, getVenue } from "@/lib/live-data";
import { EventPoster } from "@/components/live/poster";

export const Route = createFileRoute("/organizer")({
  head: () => ({
    meta: [
      { title: "Organizer Suite — Sell tickets on NexusZim Live" },
      {
        name: "description",
        content:
          "List your event, set your tiers, and watch sales live. 48-hour payouts, QR gate scanning, and Zimbabwe's biggest events audience.",
      },
    ],
  }),
  component: OrganizerSuite,
});

// Demo portfolio: a believable organizer account with three live listings.
const DEMO_EVENT_IDS = ["evt-shoko-2026", "evt-rooftop-sessions", "evt-hiphop-awards"];

const SALES_SERIES = [
  { day: "Mon", gross: 420, tickets: 38 },
  { day: "Tue", gross: 610, tickets: 52 },
  { day: "Wed", gross: 540, tickets: 47 },
  { day: "Thu", gross: 890, tickets: 71 },
  { day: "Fri", gross: 1480, tickets: 118 },
  { day: "Sat", gross: 2210, tickets: 163 },
  { day: "Sun", gross: 1730, tickets: 129 },
];

function StatTile({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: typeof Ticket;
  label: string;
  value: string;
  delta?: string;
}) {
  return (
    <div className="rounded-[6px] border border-hairline bg-cream-raised p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-soft/60">
          {label}
        </p>
        <Icon className="h-4 w-4 text-gold" strokeWidth={1.5} />
      </div>
      <p className="mt-3 font-display text-3xl text-text tabular-nums">{value}</p>
      {delta && (
        <p className="mt-1.5 flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-emerald-700">
          <ArrowUpRight className="h-3 w-3" />
          {delta}
        </p>
      )}
    </div>
  );
}

function OrganizerSuite() {
  const [range, setRange] = useState<"7d" | "30d">("7d");

  const portfolio = useMemo(
    () =>
      DEMO_EVENT_IDS.map((id) => LIVE_EVENTS.find((e) => e.id === id)!).map((event) => {
        const capacity = event.tiers.reduce((s, t) => s + t.remaining, 0);
        // Demo sold counts derived from tier data for believable progress bars
        const sold = event.tiers.reduce(
          (s, t) =>
            s + Math.round((t.maxPerOrder * 97 + t.price * 13) % Math.max(t.remaining + 40, 60)),
          0,
        );
        const total = capacity + sold;
        return { event, sold, total, gross: event.tiers.reduce((s, t) => s + t.price * 8, 0) * 3 };
      }),
    [],
  );

  const scale = range === "7d" ? 1 : 4.2;
  const totalGross = Math.round(SALES_SERIES.reduce((s, d) => s + d.gross, 0) * scale);
  const totalTickets = Math.round(SALES_SERIES.reduce((s, d) => s + d.tickets, 0) * scale);

  return (
    <div className="bg-cream pt-16 animate-page-enter">
      {/* ─── PITCH HERO ─── */}
      <section className="border-b border-hairline bg-forest-ink text-cream overflow-hidden relative">
        <span className="pointer-events-none absolute -right-8 -bottom-20 font-display text-[20rem] leading-none text-cream/[0.04] select-none hidden lg:block">
          Sell
        </span>
        <div className="container-page relative grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="eyebrow text-gold">
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
              Organizer suite
            </p>
            <h1 className="mt-6 font-display leading-[1.02] tracking-tight text-[clamp(2.5rem,5.5vw,4.5rem)]">
              Your event.
              <br />
              <em className="italic text-gold">Your numbers, live.</em>
            </h1>
            <p className="mt-6 max-w-lg font-sans text-base lg:text-lg text-cream/60 leading-relaxed">
              List in minutes, sell with transparent all-in pricing, scan tickets at the gate from
              any phone, and get paid out within 48 hours of your event. The same platform your
              buyers already trust for venues and suppliers.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="btn-cta inline-flex items-center justify-center gap-2 bg-gold px-8 py-4 rounded-[3px] font-sans text-sm font-semibold text-forest-ink"
              >
                List your event
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#dashboard"
                className="inline-flex items-center justify-center gap-2 border border-cream/20 px-8 py-4 rounded-[3px] font-sans text-sm font-semibold text-cream hover:border-cream/60 hover:bg-cream/5 transition-colors"
              >
                See the dashboard
              </a>
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Banknote,
                title: "48-hour payouts",
                copy: "Gross sales minus one flat 8% fee — settled to EcoCash or bank within two days of your event.",
              },
              {
                icon: QrCode,
                title: "Gate scanning built in",
                copy: "Every ticket is a unique QR. Scan from any phone browser — no hardware, no app.",
              },
              {
                icon: Radio,
                title: "Real-time sales",
                copy: "Watch every tier sell down live, with daily digests to your inbox.",
              },
              {
                icon: Users,
                title: "A ready-made audience",
                copy: "Your listing is cross-promoted to venue browsers and the provider directory's client base.",
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <li
                  key={f.title}
                  className="rounded-[6px] border border-cream/10 bg-cream/[0.03] p-5"
                >
                  <Icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
                  <h3 className="mt-4 font-sans text-sm font-semibold text-cream">{f.title}</h3>
                  <p className="mt-1.5 font-sans text-[13px] leading-relaxed text-cream/50">
                    {f.copy}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ─── DEMO DASHBOARD ─── */}
      <section id="dashboard" className="container-page py-14 lg:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-text-soft">
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
              Live preview · Magamba Network
            </p>
            <h2 className="mt-3 font-display text-3xl lg:text-4xl text-text">Sales overview</h2>
          </div>
          <div className="flex items-center gap-1.5">
            {(["7d", "30d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-[3px] border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
                  range === r
                    ? "border-forest bg-forest text-cream"
                    : "border-hairline text-text-soft hover:border-forest/50 hover:text-forest"
                }`}
              >
                {r === "7d" ? "Last 7 days" : "Last 30 days"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon={TrendingUp}
            label="Gross sales"
            value={formatMoney(totalGross)}
            delta="+18% vs prev period"
          />
          <StatTile
            icon={Ticket}
            label="Tickets sold"
            value={totalTickets.toLocaleString()}
            delta="+11% vs prev period"
          />
          <StatTile icon={Users} label="Page views" value={(totalTickets * 14).toLocaleString()} />
          <StatTile
            icon={Wallet}
            label="Next payout"
            value={formatMoney(Math.round(totalGross * 0.92))}
            delta="Settles in 48h"
          />
        </div>

        {/* sales chart */}
        <div className="mt-6 rounded-[6px] border border-hairline bg-cream-raised p-5 lg:p-7">
          <div className="flex items-center justify-between">
            <h3 className="font-sans text-sm font-semibold text-text">Daily gross (USD)</h3>
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-soft/60">
              All events · all tiers
            </p>
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_SERIES} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f3323" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0f3323" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#dedacb" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#5c6b60", fontFamily: "Spline Sans Mono" }}
                  axisLine={{ stroke: "#dedacb" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#5c6b60", fontFamily: "Spline Sans Mono" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fdfcf9",
                    border: "1px solid #dedacb",
                    borderRadius: 4,
                    fontFamily: "Archivo",
                    fontSize: 12,
                  }}
                  formatter={(value: number, key: string) => [
                    key === "gross" ? formatMoney(value) : value,
                    key === "gross" ? "Gross" : "Tickets",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="gross"
                  stroke="#0f3323"
                  strokeWidth={2}
                  fill="url(#salesFill)"
                />
                <Area
                  type="monotone"
                  dataKey="tickets"
                  stroke="#e7a020"
                  strokeWidth={2}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* event table */}
        <div className="mt-6 overflow-hidden rounded-[6px] border border-hairline bg-cream-raised">
          <div className="border-b border-hairline px-5 py-4">
            <h3 className="font-sans text-sm font-semibold text-text">Your listings</h3>
          </div>
          <ul className="divide-y divide-hairline">
            {portfolio.map(({ event, sold, total, gross }) => {
              const pct = Math.min(100, Math.round((sold / total) * 100));
              const venue = getVenue(event.venueId);
              return (
                <li key={event.id}>
                  <Link
                    to="/events/$eventId"
                    params={{ eventId: event.id }}
                    className="group grid items-center gap-4 px-5 py-4 transition-colors hover:bg-cream sm:grid-cols-[auto_1.2fr_1fr_auto]"
                  >
                    <EventPoster
                      event={event}
                      size="mini"
                      className="hidden h-14 w-20 rounded-[3px] sm:block"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-sans text-sm font-semibold text-text group-hover:text-forest transition-colors">
                        {event.title}
                      </p>
                      <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-text-soft">
                        {venue?.name}
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.1em] text-text-soft">
                        <span>
                          {sold.toLocaleString()} / {total.toLocaleString()} sold
                        </span>
                        <span>{pct}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-hairline">
                        <div
                          className={`h-full rounded-full ${pct > 85 ? "bg-gold" : "bg-forest"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <p className="font-sans text-sm font-semibold text-text tabular-nums sm:text-right">
                      {formatMoney(gross)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.1em] text-text-soft/50">
          Demo data shown — your dashboard populates the moment your first listing goes live.
        </p>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="border-t border-hairline bg-cream-raised">
        <div className="container-page py-14 lg:py-20">
          <p className="eyebrow text-text-soft">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            How it works
          </p>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "List your event",
                copy: "Title, tiers, venue, artwork — our team reviews and publishes within 24 hours. Venues from our marketplace attach in one click.",
              },
              {
                step: "02",
                title: "Sell everywhere",
                copy: "Your page works on every phone. Share one link; we handle EcoCash, cards, fees and fraud, and cross-promote you across the platform.",
              },
              {
                step: "03",
                title: "Scan & get paid",
                copy: "Gate staff scan QRs from any browser. Duplicates flag instantly. Your payout lands within 48 hours, reconciled to the ticket.",
              },
            ].map((s) => (
              <div key={s.step} className="border-t-2 border-forest pt-5">
                <p className="font-mono text-[11px] text-gold-deep">{s.step}</p>
                <h3 className="mt-2 font-sans text-base font-semibold text-text">{s.title}</h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-text-soft">{s.copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-start gap-4 rounded-[6px] border border-gold/30 bg-gold/5 p-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-2xl text-text">
                One flat 8% — <em className="italic text-forest">that's the whole fee.</em>
              </h3>
              <p className="mt-2 font-sans text-sm text-text-soft">
                No setup costs, no monthly charges, no payout fees. Free events are free to run.
              </p>
            </div>
            <Link
              to="/contact"
              className="btn-cta inline-flex shrink-0 items-center gap-2 bg-gold px-8 py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink"
            >
              Talk to the events desk
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
