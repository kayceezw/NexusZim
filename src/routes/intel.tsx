import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Info, BarChart3, ArrowRight } from "lucide-react";
import { IntelTicker } from "@/components/intel-ticker";

export const Route = createFileRoute("/intel")({
  component: IntelLayout,
});

function IntelLayout() {
  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Dark forest header */}
      <div className="bg-forest-ink border-b border-cream/10">
        <div className="container-page py-10">
          <p className="eyebrow text-cream/40 mb-3">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            NexusZim Intelligence
          </p>
          <h1
            className="font-display text-cream"
            style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: "1.06", letterSpacing: "-0.02em" }}
          >
            Market <span className="text-gold">Intelligence</span>
          </h1>
          <p className="mt-4 max-w-2xl font-sans text-sm text-cream/60 leading-relaxed">
            The authoritative data layer for Zimbabwe's service economy, with fair-price indices and
            market rate intelligence across key categories.
          </p>

          {/* Navigation Tabs */}
          <div className="mt-8 flex flex-wrap gap-1">
            <IntelTab to="/intel" label="Overview" icon={<Info className="h-3.5 w-3.5" />} />
            <IntelTab to="/intel/rates" label="Market Rates" icon={<BarChart3 className="h-3.5 w-3.5" />} />
          </div>
        </div>
      </div>

      {/* Live market wire - spans all intel tabs */}
      <IntelTicker />

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
      className="group bg-card border border-border rounded-[6px] p-6 transition-all hover:border-primary hover:shadow-[0_4px_20px_rgba(15,51,35,0.1)] relative overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-200" />
      <p className="eyebrow text-muted-foreground/60 mb-3">
        <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
        {eyebrow}
      </p>
      <h3 className="font-display text-xl text-foreground group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="mt-2 font-sans text-[13px] text-muted-foreground leading-relaxed">{description}</p>
      <div className="mt-6 flex items-center gap-1 font-sans text-[12px] font-semibold text-primary group-hover:text-gold-deep transition-colors">
        Access data
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-[3px] duration-150" />
      </div>
    </Link>
  );
}
