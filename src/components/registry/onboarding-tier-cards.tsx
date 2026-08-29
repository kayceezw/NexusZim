import { BadgeCheck, Check, Circle, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DiamondField } from "./diamond-field";

interface TierCardConfig {
  code: string;
  name: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  certified?: boolean;
}

const TIERS: TierCardConfig[] = [
  {
    code: "TR-01",
    name: "Listed",
    description: "Your entity enters the public register immediately, free of charge.",
    icon: Circle,
    features: [
      "Public registry profile",
      "Searchable NX registry number",
      "Direct client contact",
    ],
  },
  {
    code: "TR-02",
    name: "Verified",
    description: "Reviewed credentials and a verification seal on your profile.",
    icon: ShieldCheck,
    features: [
      "Everything in Listed",
      "Document-verified badge",
      "Priority registry placement",
      "Verification certificate",
    ],
  },
  {
    code: "TR-03",
    name: "Trust Certified",
    description: "The registry's highest institutional standard of accreditation.",
    icon: BadgeCheck,
    certified: true,
    features: [
      "Everything in Verified",
      "Trust Certified gold seal",
      "Featured registry standing",
      "Annual re-audit and record",
    ],
  },
];

/**
 * The three-tier accreditation ladder shown on the Welcome step. Trust Certified
 * carries the gold `.elite-border` and a diamond-field watermark. Presentational
 * only — selecting a tier is not part of onboarding (tier is assigned by review).
 */
export function OnboardingTierCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {TIERS.map((tier) => {
        const Icon = tier.icon;
        return (
          <div
            key={tier.code}
            className={cn(
              "relative flex flex-col overflow-hidden rounded-[6px] p-5",
              tier.certified
                ? "elite-border bg-gold/[0.05]"
                : "border border-border bg-card",
            )}
          >
            {tier.certified && <DiamondField tone="gold" className="opacity-60" />}
            <div className="relative">
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border",
                    tier.certified
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : "border-border bg-background text-primary",
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.12em]",
                    tier.certified ? "text-gold-deep" : "text-muted-foreground/60",
                  )}
                >
                  {tier.code}
                </span>
              </div>
              <h3
                className={cn(
                  "font-display text-xl",
                  tier.certified ? "text-gold-deep" : "text-foreground",
                )}
              >
                {tier.name}
              </h3>
              <p className="mt-1 font-sans text-[12px] leading-relaxed text-muted-foreground">
                {tier.description}
              </p>
              <ul className="mt-4 space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check
                      className={cn(
                        "mt-0.5 h-3.5 w-3.5 shrink-0",
                        tier.certified ? "text-gold" : "text-primary",
                      )}
                      strokeWidth={2}
                    />
                    <span className="font-sans text-[12px] leading-snug text-foreground">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
