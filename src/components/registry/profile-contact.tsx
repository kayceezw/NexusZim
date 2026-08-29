import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileContactCardProps {
  /**
   * The action element (button or anchor) wired to the route's existing
   * contact/booking handler. Rendered full-width beneath the disclaimer so the
   * card owns none of the wiring itself.
   */
  children: ReactNode;
  className?: string;
}

const DISCLAIMER =
  "NexusZim serves solely as an official verification repository and does not " +
  "hold or intermediate client funds. All negotiations, contracts, and financial " +
  "transactions are executed directly between you and the provider.";

/**
 * "Initiate Contact" card for the provider profile. Presentational only: it
 * frames the no-escrow disclaimer and renders whatever action element the route
 * passes in, so the existing contact/booking wiring stays in the route.
 */
export function ProfileContactCard({ children, className }: ProfileContactCardProps) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm",
        className,
      )}
      aria-labelledby="contact-heading"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        Initiate Contact
      </p>
      <h2
        id="contact-heading"
        className="mt-1 font-display text-xl leading-tight text-foreground"
      >
        Engage This Provider
      </h2>

      <div className="mt-4 flex items-start gap-2.5 rounded-[var(--radius-sm)] border border-border bg-surface/60 p-3">
        <ShieldAlert
          className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep"
          strokeWidth={1.75}
          aria-hidden
        />
        <p className="font-sans text-[12px] leading-relaxed text-muted-foreground">
          {DISCLAIMER}
        </p>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}
