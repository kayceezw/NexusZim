import { Check, Circle, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChecklistState = "done" | "pending" | "todo";

interface ChecklistItem {
  label: string;
  sub: string;
  state: ChecklistState;
}

interface OnboardingVerifiedChecklistProps {
  /** Provider has supplied the required primary license. */
  hasPrimaryLicense: boolean;
  /** Count of optional supplemental documents attached. */
  supplementalCount: number;
}

/**
 * The forest-surface Verified-Tier checklist shown alongside the credentials
 * upload zones, plus a Bank-Grade Security note. Item states react to what the
 * provider has attached so far.
 */
export function OnboardingVerifiedChecklist({
  hasPrimaryLicense,
  supplementalCount,
}: OnboardingVerifiedChecklistProps) {
  const items: ChecklistItem[] = [
    {
      label: "Entity details",
      sub: "Identity & contact captured",
      state: "done",
    },
    {
      label: "Primary license",
      sub: hasPrimaryLicense ? "Document attached" : "Required to proceed",
      state: hasPrimaryLicense ? "done" : "pending",
    },
    {
      label: "Supplemental records",
      sub:
        supplementalCount > 0
          ? `${supplementalCount} document${supplementalCount === 1 ? "" : "s"} attached`
          : "Optional. Strengthens your tier.",
      state: supplementalCount > 0 ? "done" : "todo",
    },
    {
      label: "Registry review",
      sub: "NexusZim desk verification",
      state: "todo",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[6px] bg-primary text-cream">
        <div className="border-b border-cream/10 px-5 py-4">
          <p className="eyebrow text-gold">
            <span className="inline-block h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
            Path to Verified
          </p>
          <h3 className="mt-1.5 font-display text-lg text-cream">Verification progress</h3>
        </div>
        <ul className="divide-y divide-cream/10">
          {items.map((item) => (
            <li key={item.label} className="flex items-start gap-3 px-5 py-3.5">
              <ChecklistIcon state={item.state} />
              <div className="min-w-0">
                <p
                  className={cn(
                    "font-sans text-[13px] font-medium",
                    item.state === "todo" ? "text-cream/50" : "text-cream",
                  )}
                >
                  {item.label}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-cream/40">
                  {item.sub}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-[6px] border border-border bg-card px-5 py-4">
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
          <p className="font-sans text-[13px] font-semibold text-foreground">Bank-Grade Security</p>
        </div>
        <p className="mt-1.5 font-sans text-[12px] leading-relaxed text-muted-foreground">
          Documents are encrypted at rest with AES-256 and transmitted over TLS 1.3. Records are
          accessible only to the NexusZim verification desk.
        </p>
      </div>
    </div>
  );
}

function ChecklistIcon({ state }: { state: ChecklistState }) {
  if (state === "done") {
    return (
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
        <Check className="h-3 w-3" strokeWidth={2.5} />
      </span>
    );
  }
  if (state === "pending") {
    return (
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold">
        <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />
      </span>
    );
  }
  return (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cream/20 text-cream/30">
      <Circle className="h-2 w-2" strokeWidth={2} />
    </span>
  );
}
