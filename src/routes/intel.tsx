import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Info, Calendar, MapPin, BarChart3, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/intel")({
  component: IntelLayout,
});

function IntelLayout() {
  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container-page">
        {/* Header */}
        <div className="border-b border-gold/20 pb-12">
          <div className="flex items-center gap-4">
            <span className="h-px w-12 bg-gold/40" />
            <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-gold">
              NexusZim Intelligence
            </span>
          </div>
          <h1 className="mt-6 font-display text-5xl font-bold text-foreground md:text-7xl">
            Event <span className="italic text-gold">Intel Hub.</span>
          </h1>
          <p className="mt-6 max-w-2xl font-body text-lg font-light text-foreground/70">
            The authoritative data layer for Zimbabwe's event industry. 
            Access real-time radar, venue boards, and market rate indices.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex flex-wrap gap-4 border-b border-foreground/5 pb-8">
          <IntelTab to="/intel" label="Overview" icon={<Info className="h-4 w-4" />} />
          <IntelTab to="/intel/events" label="Events Radar" icon={<Calendar className="h-4 w-4" />} />
          <IntelTab to="/intel/venues" label="Venue Board" icon={<MapPin className="h-4 w-4" />} />
          <IntelTab to="/intel/rates" label="Market Rates" icon={<BarChart3 className="h-4 w-4" />} />
        </div>

        <div className="py-12">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function IntelTab({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      to={to}
      activeProps={{ className: "border-gold text-gold" }}
      inactiveProps={{ className: "border-transparent text-foreground/50 hover:text-foreground" }}
      className="flex items-center gap-2 border-b-2 px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-all"
    >
      {icon}
      {label}
    </Link>
  );
}

export function IntelOverview() {
    return (
        <div className="grid gap-8 md:grid-cols-3">
            <IntelCard
                title="Events Radar"
                description="Track 8 upcoming events in Q3/Q4 2026. Filter by genre, scale, and city."
                to="/intel/events"
                stat="8 Upcoming Events"
            />
            <IntelCard
                title="Venue Board"
                description="Live availability for 9 major venues across Harare, Bulawayo, Vic Falls & Mutare."
                to="/intel/venues"
                stat="5 Currently Available"
            />
            <IntelCard
                title="Market Rates"
                description="Monthly updated fair-price index for 7 service categories."
                to="/intel/rates"
                stat="Updated June 2026"
            />
        </div>
    )
}

function IntelCard({ title, description, to, stat }: { title: string; description: string; to: string; stat: string }) {
    return (
        <Link to={to} className="group border border-gold/10 bg-card p-8 transition-all hover:border-gold/30 hover:bg-card/80">
            <p className="font-mono text-[10px] text-gold uppercase tracking-widest">{stat}</p>
            <h3 className="mt-4 font-display text-2xl font-bold text-foreground group-hover:text-gold">{title}</h3>
            <p className="mt-4 font-body text-sm text-foreground/60 leading-relaxed">{description}</p>
            <div className="mt-8 flex items-center gap-2 text-gold">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Access Data</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
        </Link>
    )
}
