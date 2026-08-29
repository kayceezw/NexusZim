import { BadgeCheck } from "lucide-react";
import { DiamondField } from "./diamond-field";
import { RegistryChip } from "./registry-chip";

interface OnboardingSuccessProps {
  /** Provisional receipt reference, e.g. REC-4821. */
  receipt: string;
  /** Called when the provider dismisses the overlay (routes onward). */
  onReturn: () => void;
}

/**
 * Full-screen confirmation shown after the provider submits for the official
 * record: a gold accreditation seal, the provisional receipt reference in mono,
 * and a Return action. Presentational; the route owns the actual navigation.
 */
export function OnboardingSuccess({ receipt, onReturn }: OnboardingSuccessProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-ink/80 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-[6px] border border-border bg-card p-8 text-center shadow-lg">
        <DiamondField tone="gold" className="opacity-50" />
        <div className="relative">
          <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold">
            <BadgeCheck className="h-8 w-8" strokeWidth={1.5} />
          </span>
          <p className="eyebrow justify-center text-gold-deep">
            <span className="inline-block h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
            Official record
          </p>
          <h2 className="mt-2 font-display text-2xl text-foreground">Submission Received</h2>
          <p className="mx-auto mt-2 max-w-xs font-sans text-[13px] leading-relaxed text-muted-foreground">
            Your entity has entered the NexusZim register. The verification desk will contact you
            with document requirements for Verified and Trust Certified status.
          </p>

          <div className="mt-6 flex flex-col items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60">
              Provisional receipt
            </span>
            <RegistryChip value={receipt} tone="gold" size="md" copyable label="receipt reference" />
          </div>

          <button
            type="button"
            onClick={onReturn}
            className="mt-7 w-full rounded-[3px] bg-gold py-3 font-sans text-sm font-semibold text-forest-ink transition-colors hover:bg-gold-deep"
          >
            Return to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
