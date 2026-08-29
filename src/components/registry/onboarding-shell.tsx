import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Check, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export type OnboardingStepKey = "welcome" | "identity" | "credentials" | "finalize";

export interface OnboardingStepMeta {
  key: OnboardingStepKey;
  label: string;
  index: number; // 0-based order in the rail
  icon: LucideIcon;
}

interface OnboardingShellProps {
  steps: OnboardingStepMeta[];
  /** Currently active step key. */
  active: OnboardingStepKey;
  /** Jump to a step (only allowed to already-reached steps by the caller). */
  onStepSelect: (key: OnboardingStepKey) => void;
  /** Index of the furthest step reached, so future steps render dimmed/locked. */
  reachedIndex: number;
  /** Persist current form state as a local draft. */
  onSaveDraft: () => void;
  /** Transient confirmation that a draft was saved. */
  draftSaved?: boolean;
  children: ReactNode;
}

/**
 * The registry onboarding shell: a fixed left progress rail (lg and up) that
 * lists the four accreditation steps, an equivalent top app bar on mobile, and
 * a footer with Terms / Privacy / Compliance links. Layout only — the wizard's
 * form state, validation, and submit logic live in the route.
 */
export function OnboardingShell({
  steps,
  active,
  onStepSelect,
  reachedIndex,
  onSaveDraft,
  draftSaved,
  children,
}: OnboardingShellProps) {
  const activeMeta = steps.find((s) => s.key === active) ?? steps[0];

  return (
    <div className="min-h-screen bg-background">
      {/* ---- Desktop side-nav rail (lg+) ---- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-80 flex-col border-r border-border bg-forest-ink lg:flex">
        <div className="border-b border-cream/10 px-7 py-8">
          <p className="eyebrow mb-2 text-cream/40">
            <span className="inline-block h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
            Accreditation
          </p>
          <h1 className="font-display text-2xl leading-tight text-cream">
            Provider registration
          </h1>
          <p className="mt-2 font-sans text-[12px] leading-relaxed text-cream/50">
            Complete each stage to enter the official NexusZim register.
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Onboarding progress">
          <ol className="space-y-1.5">
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = s.key === active;
              const isComplete = s.index < reachedIndex;
              const isReached = s.index <= reachedIndex;
              return (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => isReached && onStepSelect(s.key)}
                    disabled={!isReached}
                    aria-current={isActive ? "step" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[6px] px-3.5 py-3 text-left transition-colors",
                      isActive
                        ? "bg-gold text-forest-ink"
                        : isReached
                          ? "text-cream/80 hover:bg-cream/5"
                          : "cursor-not-allowed text-cream/30",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                        isActive
                          ? "border-forest-ink/30 bg-forest-ink/10"
                          : isComplete
                            ? "border-gold/40 bg-gold/10 text-gold"
                            : "border-cream/20",
                      )}
                    >
                      {isComplete && !isActive ? (
                        <Check className="h-4 w-4" strokeWidth={2} />
                      ) : (
                        <Icon className="h-4 w-4" strokeWidth={1.75} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block font-mono text-[9px] uppercase tracking-[0.14em]",
                          isActive ? "text-forest-ink/60" : "text-cream/40",
                        )}
                      >
                        Step {s.index + 1} of {steps.length}
                      </span>
                      <span className="block font-sans text-[14px] font-medium leading-tight">
                        {s.label}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="border-t border-cream/10 px-4 py-5">
          <button
            type="button"
            onClick={onSaveDraft}
            className="flex w-full items-center justify-center gap-2 rounded-[6px] border border-cream/20 px-4 py-2.5 font-sans text-[13px] text-cream/70 transition-colors hover:border-gold/50 hover:text-cream"
          >
            <Save className="h-3.5 w-3.5" strokeWidth={1.75} />
            {draftSaved ? "Draft saved" : "Save draft"}
          </button>
          <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-cream/30">
            NexusZim Accreditation Registry
          </p>
        </div>
      </aside>

      {/* ---- Mobile top app bar (below lg) ---- */}
      <div className="sticky top-0 z-30 border-b border-border bg-forest-ink lg:hidden">
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-cream/40">
              Step {activeMeta.index + 1} of {steps.length}
            </p>
            <p className="truncate font-display text-lg leading-tight text-cream">
              {activeMeta.label}
            </p>
          </div>
          <button
            type="button"
            onClick={onSaveDraft}
            className="flex shrink-0 items-center gap-1.5 rounded-[6px] border border-cream/20 px-3 py-1.5 font-sans text-[12px] text-cream/70"
          >
            <Save className="h-3.5 w-3.5" strokeWidth={1.75} />
            {draftSaved ? "Saved" : "Draft"}
          </button>
        </div>
        {/* progress dots */}
        <div className="flex gap-1 px-4 pb-3">
          {steps.map((s) => (
            <span
              key={s.key}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                s.index < reachedIndex
                  ? "bg-gold"
                  : s.key === active
                    ? "bg-gold/70"
                    : "bg-cream/15",
              )}
            />
          ))}
        </div>
      </div>

      {/* ---- Main content ---- */}
      <main className="lg:ml-80">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-12">{children}</div>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 py-6 sm:flex-row sm:justify-between sm:px-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">
              NexusZim is an accreditation registry and does not handle or intermediate client funds.
            </p>
            <nav className="flex items-center gap-5 font-sans text-[12px] text-muted-foreground">
              <a href="/terms" className="transition-colors hover:text-primary">
                Terms
              </a>
              <a href="/privacy" className="transition-colors hover:text-primary">
                Privacy
              </a>
              <a href="/compliance" className="transition-colors hover:text-primary">
                Compliance
              </a>
            </nav>
          </div>
        </footer>
      </main>
    </div>
  );
}
