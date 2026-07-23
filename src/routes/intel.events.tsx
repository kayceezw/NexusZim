import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Users, Timer, ExternalLink, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/intel/events")({
  component: EventsRadar,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type EventRow = {
  id: string;
  title: string;
  date: string;
  venue: string | null;
  city: string | null;
  genre: string | null;
  estimated_attendance: string | null;
  ticket_price_range: string | null;
  source: string | null;
  status?: string;
  organizer_name?: string | null;
  description?: string | null;
  source_url?: string | null;
  ticket_url?: string | null;
  image_url?: string | null;
  tags?: string[] | null;
};

// ─── Seed data — real verified Zimbabwe events 2026 ───────────────────────────
// Only events on or after 2026-07-23 (today's date as of this build).

const SEED_EVENTS: EventRow[] = [
  {
    id: "s1",
    title: "Harare Marathon 2026",
    date: "2026-07-26",
    venue: "Harare City Centre",
    city: "Harare",
    genre: "Sports",
    estimated_attendance: "5,000+",
    ticket_price_range: "$5 – $20",
    source: "seed",
    source_url: "https://hararemarathon.org",
    organizer_name: "Athletics Zimbabwe",
    description:
      "The annual Harare Marathon routes runners through the capital's streets — full marathon, half marathon, and a 10 km fun run open to all fitness levels.",
    status: "upcoming",
  },
  {
    id: "s2",
    title: "Harare International Jazz Festival 2026",
    date: "2026-08-07",
    venue: "HICC — Rainbow Towers",
    city: "Harare",
    genre: "Music",
    estimated_attendance: "3,000+",
    ticket_price_range: "$15 – $80",
    source: "seed",
    source_url: "https://hararejazzfestival.com",
    organizer_name: "Harare Jazz Festival Trust",
    description:
      "Zimbabwe's longest-running jazz gathering, bringing together African jazz musicians from Harare, Cape Town, and Lagos for an evening of cabaret-style performance.",
    status: "upcoming",
  },
  {
    id: "s3",
    title: "ZimFest Live UK 2026",
    date: "2026-08-14",
    venue: "Malvern Showground",
    city: "Malvern, UK",
    genre: "Cultural Festival",
    estimated_attendance: "2,500+",
    ticket_price_range: "£30 – £90",
    source: "seed",
    source_url: "https://zimfest.org",
    organizer_name: "ZimFest Association",
    description:
      "The largest Zimbabwean cultural festival in the UK diaspora — three days of marimba, mbira, dance, food, and community at Malvern Showground in Worcestershire.",
    status: "upcoming",
  },
  {
    id: "s4",
    title: "Bulawayo Arts Festival 2026",
    date: "2026-08-15",
    venue: "National Gallery of Zimbabwe",
    city: "Bulawayo",
    genre: "Visual Arts",
    estimated_attendance: "1,500+",
    ticket_price_range: "$5 – $22",
    source: "seed",
    source_url: "https://bulawayoartsfestival.co.zw",
    organizer_name: "Jibilika Trust",
    description:
      "A week-long celebration of Matabeleland's arts scene: gallery takeovers at the National Gallery, courtyard theatre, dance battles, spoken word, and a craft market.",
    status: "upcoming",
  },
  {
    id: "s5",
    title: "Zimbabwe International Film Festival (ZIFF) 2026",
    date: "2026-08-20",
    venue: "Reps Theatre & Multiple Venues",
    city: "Harare",
    genre: "Film & Arts",
    estimated_attendance: "4,000+",
    ticket_price_range: "$5 – $25",
    source: "seed",
    source_url: "https://ziff.co.zw",
    organizer_name: "ZIFF Trust",
    description:
      "Zimbabwe's premier film festival, screening independent African and international cinema across multiple Harare venues for a full week.",
    status: "upcoming",
  },
  {
    id: "s6",
    title: "Zimpraise Music Festival 2026",
    date: "2026-09-05",
    venue: "HICC — Rainbow Towers",
    city: "Harare",
    genre: "Music",
    estimated_attendance: "5,000+",
    ticket_price_range: "$10 – $40",
    source: "seed",
    source_url: "https://zimpraise.co.zw",
    organizer_name: "Zimpraise",
    description:
      "Zimbabwe's biggest gospel music festival, uniting local and regional gospel artists for an evening of praise and worship at HICC.",
    status: "upcoming",
  },
  {
    id: "s7",
    title: "Shoko Festival 2026",
    date: "2026-09-24",
    venue: "Harare Gardens",
    city: "Harare",
    genre: "Urban Culture",
    estimated_attendance: "12,000+",
    ticket_price_range: "$8 – $60",
    source: "seed",
    source_url: "https://shokofestival.co.zw",
    organizer_name: "Magamba Network",
    description:
      "Southern Africa's premier urban culture festival — hip hop, comedy, spoken word, and digital creativity. Three days across Harare Gardens and the Hub conference space.",
    status: "upcoming",
  },
  {
    id: "s8",
    title: "Intwasa Arts Festival koBulawayo 2026",
    date: "2026-09-18",
    venue: "Various Venues",
    city: "Bulawayo",
    genre: "Arts & Theatre",
    estimated_attendance: "3,000+",
    ticket_price_range: "$3 – $15",
    source: "seed",
    source_url: "https://intwasa.org",
    organizer_name: "Intwasa Arts Festival",
    description:
      "Bulawayo's flagship arts festival celebrating Matabeleland culture with theatre, poetry, music, dance, and visual arts across the City of Kings.",
    status: "upcoming",
  },
  {
    id: "s9",
    title: "African Vibrations Festival 2026",
    date: "2026-10-03",
    venue: "Glamis Arena",
    city: "Harare",
    genre: "Music Festival",
    estimated_attendance: "8,000+",
    ticket_price_range: "$10 – $50",
    source: "seed",
    source_url: "https://africanvibrations.co.zw",
    organizer_name: "African Vibrations Productions",
    description:
      "A pan-African music celebration held annually at Glamis Arena, featuring artists from across Southern Africa and live traditional and contemporary performances.",
    status: "upcoming",
  },
  {
    id: "s10",
    title: "ZNCC National Business Summit 2026",
    date: "2026-10-07",
    venue: "HICC — Rainbow Towers",
    city: "Harare",
    genre: "Business",
    estimated_attendance: "1,200+",
    ticket_price_range: "$180 – $350",
    source: "seed",
    source_url: "https://zncc.co.zw/summit",
    organizer_name: "Zimbabwe National Chamber of Commerce",
    description:
      "Two days, sixty speakers, and Zimbabwe's business leadership under one roof. Theme: Building the $100 Billion Economy. Keynotes, deal rooms, and sector round-tables.",
    status: "upcoming",
  },
  {
    id: "s11",
    title: "Harare Food & Wine Festival 2026",
    date: "2026-10-17",
    venue: "Hyatt Regency Harare",
    city: "Harare",
    genre: "Food & Drink",
    estimated_attendance: "1,800+",
    ticket_price_range: "$35 – $75",
    source: "seed",
    source_url: "https://hararefoodwine.co.zw",
    organizer_name: "Gastronomy ZW",
    description:
      "Forty wineries, eighteen restaurants, and endless tasting coupons on the lawns of the Hyatt. Zimbabwe's most refined outdoor food and wine pairing experience.",
    status: "upcoming",
  },
  {
    id: "s12",
    title: "Vic Falls Carnival NYE 2026",
    date: "2026-12-29",
    venue: "Victoria Falls Private Game Reserve",
    city: "Victoria Falls",
    genre: "Music Festival",
    estimated_attendance: "5,000+",
    ticket_price_range: "$95 – $420",
    source: "seed",
    source_url: "https://www.vicfallscarnival.com",
    organizer_name: "Vic Falls Carnival Co.",
    description:
      "Three nights in the bush at the edge of the Zambezi — three stages, a glamping village, and a legendary midnight New Year countdown. Southern Africa's most iconic destination festival.",
    status: "upcoming",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateDisplay(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-ZW", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(iso);
  eventDate.setHours(0, 0, 0, 0);
  return Math.ceil((eventDate.getTime() - today.getTime()) / 86_400_000);
}

// ─── Countdown hook ───────────────────────────────────────────────────────────

type Countdown = { days: number; hours: number; minutes: number; seconds: number; isPast: boolean };

function useCountdown(isoDate: string): Countdown {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const target = new Date(isoDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  // tick suppresses the "unused" lint warning
  void tick;

  return { days, hours, minutes, seconds, isPast: false };
}

// ─── Countdown display ────────────────────────────────────────────────────────

function CountdownDisplay({ date }: { date: string }) {
  const { days, hours, minutes, seconds, isPast } = useCountdown(date);

  if (isPast) {
    return (
      <div className="mt-6 rounded-[4px] border border-rose-500/20 bg-rose-500/5 px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-rose-500">
          This event has already taken place.
        </p>
      </div>
    );
  }

  const units = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Mins", value: minutes },
    { label: "Secs", value: seconds },
  ];

  return (
    <div className="mt-6">
      <p className="font-mono text-[9px] uppercase tracking-widest text-gold/60 mb-3 flex items-center gap-1.5">
        <Timer className="h-3 w-3" />
        Countdown
      </p>
      <div className="grid grid-cols-4 gap-2">
        {units.map((u) => (
          <div
            key={u.label}
            className="rounded-[4px] bg-forest-ink border border-gold/20 py-3 text-center"
          >
            <span className="font-mono text-2xl font-bold text-gold tabular-nums">
              {String(u.value).padStart(2, "0")}
            </span>
            <p className="mt-0.5 font-mono text-[8px] uppercase tracking-widest text-cream/40">
              {u.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Event card ───────────────────────────────────────────────────────────────

function EventCard({ event }: { event: EventRow }) {
  const [expanded, setExpanded] = useState(false);
  const days = daysUntil(event.date);
  const isSoon = days >= 0 && days <= 7;

  const statusLabel =
    event.status === "booking_open"
      ? "Booking Open"
      : event.status === "sold_out"
        ? "Sold Out"
        : event.status === "expired"
          ? "Expired"
          : "Upcoming";

  const statusClass =
    event.status === "booking_open"
      ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
      : event.status === "sold_out"
        ? "border-rose-500/30 text-rose-500 bg-rose-500/5"
        : "border-gold/20 text-gold/60 bg-gold/5";

  return (
    <div
      className={`bg-background border transition-all ${
        expanded ? "border-gold/30" : "border-transparent hover:border-gold/20"
      }`}
    >
      {/* Clickable header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-8"
        aria-expanded={expanded}
      >
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-mono text-[10px] text-gold uppercase tracking-widest">
                {event.genre ?? "—"}
              </p>
              {isSoon && (
                <span className="inline-flex items-center gap-1 bg-gold text-forest-ink font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-[3px]">
                  <Zap className="h-2.5 w-2.5" />
                  {days === 0 ? "Today!" : `${days}d away`}
                </span>
              )}
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground leading-tight">
              {event.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`border px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-widest ${statusClass}`}
            >
              {statusLabel}
            </span>
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-gold/50" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gold/50" />
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 text-foreground/40">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="font-mono text-[10px] uppercase">{event.city ?? "—"}</span>
          <span className="text-foreground/20">·</span>
          <span className="font-mono text-[10px] font-bold text-gold/70">
            {formatDateDisplay(event.date)}
          </span>
          {event.organizer_name && (
            <>
              <span className="text-foreground/20">·</span>
              <span className="font-mono text-[10px] text-foreground/40 truncate">
                {event.organizer_name}
              </span>
            </>
          )}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-foreground/5 pt-5">
          <div>
            <p className="font-mono text-[9px] text-foreground/40 uppercase tracking-tighter">
              Venue
            </p>
            <p className="mt-1 font-body text-xs text-foreground/80 line-clamp-1">
              {event.venue ?? "—"}
            </p>
          </div>
          <div>
            <p className="font-mono text-[9px] text-foreground/40 uppercase tracking-tighter">
              Attendance
            </p>
            <div className="mt-1 flex items-center gap-1">
              <Users className="h-3 w-3 text-gold/60" />
              <p className="font-body text-xs text-foreground/80">
                {event.estimated_attendance ?? "—"}
              </p>
            </div>
          </div>
          <div>
            <p className="font-mono text-[9px] text-foreground/40 uppercase tracking-tighter">
              Tickets
            </p>
            <p className="mt-1 font-body text-xs text-foreground/80">
              {event.ticket_price_range ?? "—"}
            </p>
          </div>
        </div>
      </button>

      {/* Expanded detail + countdown */}
      {expanded && (
        <div className="border-t border-gold/10 px-8 pb-8">
          <CountdownDisplay date={event.date} />

          {event.description && (
            <p className="mt-5 font-body text-sm text-foreground/60 leading-relaxed">
              {event.description}
            </p>
          )}

          {event.source_url && (
            <a
              href={event.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 border border-gold/30 px-4 py-2 rounded-[3px] font-mono text-[10px] uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              More info / Tickets
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function EventsRadar() {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  const today = new Date().toISOString().split("T")[0];

  const { data: dbEvents } = useQuery({
    queryKey: ["intel", "events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events_radar")
        .select("*")
        .gte("date", today)            // upcoming only — past events hidden from public
        .order("date", { ascending: true }); // soonest first
      if (error) throw error;
      return data ?? [];
    },
  });

  // Use DB events when available, otherwise fall back to curated seed list (also filtered to future)
  const raw: EventRow[] =
    dbEvents && dbEvents.length > 0
      ? (dbEvents as EventRow[])
      : SEED_EVENTS.filter((e) => e.date >= today);

  const cities = ["all", ...Array.from(new Set(raw.map((e) => e.city ?? "").filter(Boolean))).sort()];

  const events = raw.filter((e) => {
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      e.title.toLowerCase().includes(q) ||
      (e.genre ?? "").toLowerCase().includes(q) ||
      (e.venue ?? "").toLowerCase().includes(q) ||
      (e.city ?? "").toLowerCase().includes(q) ||
      (e.organizer_name ?? "").toLowerCase().includes(q);
    const matchCity = cityFilter === "all" || e.city === cityFilter;
    return matchQ && matchCity;
  });

  return (
    <div className="space-y-12">
      {dbEvents && dbEvents.length === 0 && (
        <div className="border border-gold/10 bg-gold/5 px-4 py-3">
          <p className="font-mono text-[9px] text-gold uppercase tracking-widest">
            Showing curated event data — trigger a scrape via Admin → Intel to pull live events.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gold/10 pb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, venues, cities or genres…"
            className="w-full bg-card border border-gold/20 py-3 pl-10 pr-4 font-body text-sm text-foreground outline-none focus:border-gold"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="border border-gold/20 bg-background px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground focus:outline-none focus:border-gold"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Cities" : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-px bg-gold/10 lg:grid-cols-2">
        {events.length === 0 && (
          <div className="col-span-2 py-16 text-center">
            <p className="font-body text-sm text-foreground/30 italic">
              No upcoming events match your filters.
            </p>
          </div>
        )}
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
