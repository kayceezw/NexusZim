import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Info, Calendar, MapPin, BarChart3, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/intel")({
  component: IntelLayout,
});

function IntelLayout() {
  return (
    <div className="min-h-screen bg-cream pt-16">
      {/* Dark forest header */}
      <div className="bg-forest border-b border-cream/10">
        <div className="container-page py-10">
          <p className="eyebrow text-cream/40 mb-3">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            NexusZim Intelligence
          </p>
          <h1
            className="font-display text-cream"
            style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: "1.06", letterSpacing: "-0.02em" }}
          >
            Event <em className="italic text-gold">Intel Hub</em>
          </h1>
          <p className="mt-4 max-w-2xl font-sans text-sm text-cream/60 leading-relaxed">
            The authoritative data layer for Zimbabwe's event industry. Real-time events radar,
            venue availability, and market rate indices.
          </p>

          {/* Navigation Tabs */}
          <div className="mt-8 flex flex-wrap gap-1">
            <IntelTab to="/intel" label="Overview" icon={<Info className="h-3.5 w-3.5" />} />
            <IntelTab to="/intel/events" label="Events Radar" icon={<Calendar className="h-3.5 w-3.5" />} />
            <IntelTab to="/intel/venues" label="Venue Board" icon={<MapPin className="h-3.5 w-3.5" />} />
            <IntelTab to="/intel/rates" label="Market Rates" icon={<BarChart3 className="h-3.5 w-3.5" />} />
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        <Outlet />
      </div>
    </div>
  );
}

function IntelTab({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      to={to}
      activeProps={{ className: "bg-gold text-forest-ink" }}
      inactiveProps={{ className: "text-cream/60 hover:text-cream hover:bg-cream/10" }}
      className="flex items-center gap-2 px-4 py-2 rounded-[3px] font-mono text-[10px] font-bold uppercase tracking-widest transition-all"
    >
      {icon}
      {label}
    </Link>
  );
}

export function IntelOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <IntelCard
        title="Events Radar"
        description="Upcoming events across Zimbabwe. Filter by city, genre, and scale."
        to="/intel/events"
        eyebrow="Live tracking"
      />
      <IntelCard
        title="Venue Board"
        description="Availability windows for major venues across Harare, Bulawayo, Vic Falls & Mutare."
        to="/intel/venues"
        eyebrow="Venue availability"
      />
      <IntelCard
        title="Market Rates"
        description="Monthly updated fair-price index for key service categories."
        to="/intel/rates"
        eyebrow="Rate intelligence"
      />
    </div>
  );
}

function IntelCard({
  title,
  description,
  to,
  eyebrow,
}: {
  title: string;
  description: string;
  to: string;
  eyebrow: string;
}) {
  return (
    <Link
      to={to}
      className="group bg-cream-raised border border-hairline rounded-[6px] p-6 transition-all hover:border-forest hover:shadow-[0_4px_20px_rgba(15,51,35,0.1)] relative overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-200" />
      <p className="eyebrow text-text-soft/60 mb-3">
        <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
        {eyebrow}
      </p>
      <h3 className="font-display text-xl text-text group-hover:text-forest transition-colors">
        {title}
      </h3>
      <p className="mt-2 font-sans text-[13px] text-text-soft leading-relaxed">{description}</p>
      <div className="mt-6 flex items-center gap-1 font-sans text-[12px] font-semibold text-forest group-hover:text-gold-deep transition-colors">
        Access data
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-[3px] duration-150" />
      </div>
    </Link>
  );
}
