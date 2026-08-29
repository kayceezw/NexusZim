import { BadgeCheck, Circle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Hallmark, type TierLevel } from "./hallmark";

export type TierMarkerTier = 1 | 2 | 3;

interface TierConfig {
  label: string;
  code: string;
  /** Full-variant surface/border/text classes. */
  surface: string;
  icon: typeof ShieldCheck;
  iconClass: string;
}

const CONFIG: Record<TierMarkerTier, TierConfig> = {
  1: {
    label: "Listed",
    code: "TIER_01",
    surface: "border border-border bg-card text-muted-foreground",
    icon: Circle,
    iconClass: "text-muted-foreground",
  },
  2: {
    label: "Verified",
    code: "TIER_02",
    surface: "border border-primary/70 bg-card text-primary",
    icon: ShieldCheck,
    iconClass: "text-primary",
  },
  3: {
    label: "Trust Certified",
    code: "TIER_03",
    surface: "elite-border bg-gold/[0.06] text-gold-deep",
    icon: BadgeCheck,
    iconClass: "text-gold",
  },
};

function normalize(tier: number): TierMarkerTier {
  if (tier >= 3) return 3;
  if (tier === 2) return 2;
  return 1;
}

interface TierMarkerProps {
  /** Raw DB tier integer (1..4); normalized internally to 1|2|3. */
  tier: number;
  /**
   * Provider verified flag. Only affects the shown label at tier 2: an
   * unverified tier-2 still reads "Verified" per the registry vocabulary, but
   * the verified icon is emphasized when true. At tier 3 the seal is always
   * Trust Certified. Optional; defaults to derived-from-tier.
   */
  verified?: boolean;
  /** `compact` = inline pill (wraps Hallmark). `full` = seal card with code. */
  variant?: "compact" | "full";
  className?: string;
}

/**
 * Registry tier seal implementing the Listed / Verified / Trust Certified
 * system. The `compact` variant delegates to the existing `Hallmark` pill for
 * consistency with cards; the `full` variant renders a bordered seal block with
 * an icon, serif-adjacent label, and the mono tier code.
 */
export function TierMarker({
  tier,
  verified,
  variant = "compact",
  className,
}: TierMarkerProps) {
  const level = normalize(tier);

  if (variant === "compact") {
    return <Hallmark tier={level as TierLevel} className={className} />;
  }

  const cfg = CONFIG[level];
  const Icon = cfg.icon;
  const isCertified = level === 3;
  // Emphasize the seal icon when the provider is affirmatively verified.
  const affirmed = verified ?? level >= 2;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2",
        cfg.surface,
        className,
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 shrink-0",
          cfg.iconClass,
          isCertified && "animate-pulse-soft",
          affirmed ? "opacity-100" : "opacity-60",
        )}
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="flex flex-col leading-tight">
        <span className="font-sans text-[13px] font-semibold tracking-tight">
          {cfg.label}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-70">
          {cfg.code}
        </span>
      </span>
    </div>
  );
}
