import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, MapPin, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/intel/venues")({
  component: VenueBoard,
});

type VenueRow = {
  id: string;
  venue_name: string;
  city: string | null;
  available_from: string | null;
  available_to: string | null;
  capacity: number | null;
  contact: string | null;
};

const SEED_VENUES: (VenueRow & { status: "available" | "booked" })[] = [
  {
    id: "s1",
    venue_name: "HICC Rainbow Towers",
    city: "Harare",
    capacity: 4500,
    contact: "+263 24 2776 000",
    available_from: null,
    available_to: null,
    status: "booked",
  },
  {
    id: "s2",
    venue_name: "Celebration Centre",
    city: "Harare",
    capacity: 3500,
    contact: "+263 77 123 4567",
    available_from: null,
    available_to: null,
    status: "booked",
  },
  {
    id: "s3",
    venue_name: "Wild Geese Lodge",
    city: "Harare",
    capacity: 500,
    contact: "+263 77 223 3445",
    available_from: null,
    available_to: null,
    status: "available",
  },
  {
    id: "s4",
    venue_name: "Meikles Hotel Ballroom",
    city: "Harare",
    capacity: 900,
    contact: "+263 24 2795 655",
    available_from: null,
    available_to: null,
    status: "available",
  },
  {
    id: "s5",
    venue_name: "Bulawayo City Hall",
    city: "Bulawayo",
    capacity: 1200,
    contact: "+263 29 2888 100",
    available_from: null,
    available_to: null,
    status: "available",
  },
  {
    id: "s6",
    venue_name: "Indaba Hotel & Spa",
    city: "Bulawayo",
    capacity: 600,
    contact: "+263 29 2225 566",
    available_from: null,
    available_to: null,
    status: "booked",
  },
  {
    id: "s7",
    venue_name: "Elephant Hills Resort",
    city: "Victoria Falls",
    capacity: 800,
    contact: "+263 21 3343 344",
    available_from: null,
    available_to: null,
    status: "available",
  },
  {
    id: "s8",
    venue_name: "Ilala Lodge",
    city: "Victoria Falls",
    capacity: 200,
    contact: "+263 21 3343 737",
    available_from: null,
    available_to: null,
    status: "booked",
  },
  {
    id: "s9",
    venue_name: "Christmas Pass Hotel",
    city: "Mutare",
    capacity: 400,
    contact: "+263 20 2263 500",
    available_from: null,
    available_to: null,
    status: "available",
  },
];

function isAvailable(v: VenueRow): boolean {
  const now = new Date();
  if (!v.available_from && !v.available_to) return true;
  if (v.available_from && new Date(v.available_from) <= now) {
    if (!v.available_to || new Date(v.available_to) >= now) return true;
  }
  return false;
}

function VenueBoard() {
  const { data: dbVenues } = useQuery({
    queryKey: ["intel", "venues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venue_availability")
        .select("*")
        .order("venue_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const venues =
    dbVenues && dbVenues.length > 0
      ? (dbVenues as VenueRow[]).map((v) => ({
          ...v,
          status: isAvailable(v) ? ("available" as const) : ("booked" as const),
        }))
      : SEED_VENUES;

  const availableCount = venues.filter((v) => v.status === "available").length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-gold/10 pb-6">
        <div>
          <h2 className="font-display text-3xl font-bold text-foreground">
            Venue Availability Board
          </h2>
          <p className="mt-1 font-body text-sm text-foreground/60">
            Crowd-sourced + Admin-verified windows for major venues.
            {dbVenues && dbVenues.length === 0 && (
              <span className="ml-2 font-mono text-[9px] text-gold uppercase tracking-widest">
                (Seed data — add live venues via Admin → Intel)
              </span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] text-foreground/40 uppercase tracking-widest">
            Available Now
          </p>
          <p className="font-display text-3xl font-bold text-emerald-500">{availableCount}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gold/20 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
              <th className="pb-4 pt-2 font-bold">Venue Name</th>
              <th className="pb-4 pt-2 font-bold">Location</th>
              <th className="pb-4 pt-2 font-bold text-center">Capacity</th>
              <th className="pb-4 pt-2 font-bold text-center">Status</th>
              <th className="pb-4 pt-2 font-bold text-right">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5">
            {venues.map((venue) => (
              <tr key={venue.id} className="group hover:bg-card/50 transition-colors">
                <td className="py-6">
                  <p className="font-display text-lg font-bold text-foreground group-hover:text-gold">
                    {venue.venue_name}
                  </p>
                  {venue.available_from && (
                    <p className="mt-0.5 font-mono text-[9px] text-foreground/30">
                      {venue.available_from}
                      {venue.available_to ? ` → ${venue.available_to}` : "+"}
                    </p>
                  )}
                </td>
                <td className="py-6">
                  <div className="flex items-center gap-2 text-foreground/60">
                    <MapPin className="h-3 w-3" />
                    <span className="font-mono text-[10px] uppercase tracking-wider">
                      {venue.city ?? "—"}
                    </span>
                  </div>
                </td>
                <td className="py-6 text-center">
                  <span className="font-mono text-xs text-foreground/80">
                    {venue.capacity ? venue.capacity.toLocaleString() : "—"}
                  </span>
                </td>
                <td className="py-6">
                  <div className="flex items-center justify-center gap-2">
                    {venue.status === "available" ? (
                      <div className="flex items-center gap-1.5 text-emerald-500">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="font-mono text-[9px] font-bold uppercase tracking-widest">
                          Available
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-500">
                        <XCircle className="h-3.5 w-3.5" />
                        <span className="font-mono text-[9px] font-bold uppercase tracking-widest">
                          Booked
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-6 text-right">
                  {venue.contact ? (
                    <a
                      href={`tel:${venue.contact}`}
                      className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-gold hover:text-foreground transition-colors"
                    >
                      {venue.contact}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="font-mono text-[10px] text-foreground/20">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 border border-gold/10 bg-card/30 p-6">
        <p className="font-body text-xs text-foreground/50 leading-relaxed italic">
          * Availability data is indicative and based on last reported status. Confirm directly with
          venue management before planning.
        </p>
      </div>
    </div>
  );
}
