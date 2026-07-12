import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Calendar as CalendarIcon, MapPin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const Route = createFileRoute("/intel/events")({
  component: EventsRadar,
});

type EventStatus = "upcoming" | "booking_open" | "sold_out";

type EventRow = {
  id: string; title: string; date: string; venue: string | null;
  city: string | null; genre: string | null; estimated_attendance: string | null;
  ticket_price_range: string | null; source: string | null;
  status?: EventStatus;
};

const SEED_EVENTS: EventRow[] = [
  { id: "s1", title: "Shoko Festival 2026", date: "2026-09-24", venue: "Various Locations", city: "Harare", genre: "Urban Culture", estimated_attendance: "3,000+", ticket_price_range: "$5 – $30", source: null, status: "booking_open" },
  { id: "s2", title: "Zim Hip Hop Awards", date: "2026-08-08", venue: "HICC Rainbow Towers", city: "Harare", genre: "Music & Awards", estimated_attendance: "2,000+", ticket_price_range: "$20 – $80", source: null, status: "booking_open" },
  { id: "s3", title: "Bulawayo Arts Festival", date: "2026-08-15", venue: "National Gallery of Zimbabwe", city: "Bulawayo", genre: "Visual Arts", estimated_attendance: "1,500+", ticket_price_range: "$5 – $25", source: null, status: "upcoming" },
  { id: "s4", title: "Vic Falls Carnival 2026", date: "2026-12-29", venue: "Victoria Falls Private Game Reserve", city: "Victoria Falls", genre: "Music Festival", estimated_attendance: "5,000+", ticket_price_range: "$50 – $250", source: null, status: "booking_open" },
  { id: "s5", title: "Harare Corporate Gala Season", date: "2026-07-01", venue: "Multiple CBD Venues", city: "Harare", genre: "Corporate", estimated_attendance: "Varies", ticket_price_range: "Invite Only", source: null, status: "upcoming" },
  { id: "s6", title: "ZimFest Live UK", date: "2026-08-01", venue: "Malvern Showground", city: "United Kingdom", genre: "Cultural Diaspora", estimated_attendance: "4,000+", ticket_price_range: "£25 – £85", source: null, status: "booking_open" },
  { id: "s7", title: "Mutare Business Expo", date: "2026-09-10", venue: "Christmas Pass Hotel", city: "Mutare", genre: "Trade & Business", estimated_attendance: "8,000+", ticket_price_range: "$10 – $40", source: null, status: "upcoming" },
  { id: "s8", title: "AfricaFest Harare", date: "2026-10-17", venue: "Harare Gardens", city: "Harare", genre: "Pan-African Culture", estimated_attendance: "12,000+", ticket_price_range: "$15 – $60", source: null, status: "upcoming" },
];

function statusFromDate(date: string): EventStatus {
  return new Date(date) > new Date() ? "upcoming" : "upcoming";
}

function formatDateDisplay(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-ZW", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function EventsRadar() {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  const { data: dbEvents } = useQuery({
    queryKey: ["intel", "events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events_radar")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const raw: EventRow[] = (dbEvents && dbEvents.length > 0) ? dbEvents as EventRow[] : SEED_EVENTS;

  const cities = ["all", ...Array.from(new Set(raw.map((e) => e.city ?? "").filter(Boolean)))];

  const events = raw.filter((e) => {
    const matchQ = !search || e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.genre ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.venue ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCity = cityFilter === "all" || e.city === cityFilter;
    return matchQ && matchCity;
  });

  return (
    <div className="space-y-12">
      {dbEvents && dbEvents.length === 0 && (
        <div className="border border-gold/10 bg-gold/5 px-4 py-3">
          <p className="font-mono text-[9px] text-gold uppercase tracking-widest">
            Showing curated seed data — add live events via Admin → Intel.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gold/10 pb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, venues or genres…"
            className="w-full bg-card border border-gold/20 py-3 pl-10 pr-4 font-body text-sm text-foreground outline-none focus:border-gold"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="flex items-center gap-2 border border-gold/20 bg-background px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground focus:outline-none focus:border-gold"
          >
            {cities.map((c) => (
              <option key={c} value={c}>{c === "all" ? "All Cities" : c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-px bg-gold/10 lg:grid-cols-2">
        {events.length === 0 && (
          <div className="col-span-2 py-16 text-center">
            <p className="font-body text-sm text-foreground/30 italic">No events match your filters.</p>
          </div>
        )}
        {events.map((event) => {
          const status = event.status ?? statusFromDate(event.date);
          return (
            <div key={event.id} className="bg-background p-8 border border-transparent hover:border-gold/20 transition-all">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2 min-w-0">
                  <p className="font-mono text-[10px] text-gold uppercase tracking-widest">{event.genre ?? "—"}</p>
                  <h3 className="font-display text-2xl font-bold text-foreground leading-tight">{event.title}</h3>
                </div>
                <span className={`shrink-0 border px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-widest ${
                  status === "booking_open"
                    ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
                    : status === "sold_out"
                    ? "border-rose-500/30 text-rose-500 bg-rose-500/5"
                    : "border-gold/20 text-gold/60 bg-gold/5"
                }`}>
                  {status === "booking_open" ? "Booking Open" : status === "sold_out" ? "Sold Out" : "Upcoming"}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3 text-foreground/40">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="font-mono text-[10px] uppercase">{event.city ?? "—"}</span>
                <span className="text-foreground/20">·</span>
                <span className="font-mono text-[10px] font-bold text-gold/70">{formatDateDisplay(event.date)}</span>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-foreground/5 pt-6">
                <div>
                  <p className="font-mono text-[9px] text-foreground/40 uppercase tracking-tighter">Venue</p>
                  <p className="mt-1 font-body text-xs text-foreground/80 line-clamp-1">{event.venue ?? "—"}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] text-foreground/40 uppercase tracking-tighter">Attendance</p>
                  <div className="mt-1 flex items-center gap-1">
                    <Users className="h-3 w-3 text-gold/60" />
                    <p className="font-body text-xs text-foreground/80">{event.estimated_attendance ?? "—"}</p>
                  </div>
                </div>
                <div>
                  <p className="font-mono text-[9px] text-foreground/40 uppercase tracking-tighter">Ticket Range</p>
                  <p className="mt-1 font-body text-xs text-foreground/80">{event.ticket_price_range ?? "—"}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
