import { cn } from "@/lib/utils";

export type TierLevel = 1 | 2 | 3 | 4;

const TIER_CONFIG: Record<TierLevel, { label: string; className: string }> = {
  1: {
    label: "Listed",
    className: "border border-[#DEDACB] text-[#5C6B60] bg-transparent",
  },
  2: {
    label: "Verified",
    className: "border border-[#0F3323] text-[#0F3323] bg-transparent",
  },
  3: {
    label: "Trust Certified",
    className: "border border-[#E7A020] text-[#B87F1A] bg-[#E7A020]/10",
  },
  4: {
    label: "Trust Certified",
    className: "border border-[#E7A020] text-[#B87F1A] bg-[#E7A020]/10",
  },
};

interface HallmarkProps {
  tier: TierLevel;
  className?: string;
}

export function Hallmark({ tier, className }: HallmarkProps) {
  const config = TIER_CONFIG[tier];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5",
        "font-mono text-[10px] font-medium uppercase tracking-[0.08em]",
        "rounded-[3px]",
        config.className,
        className,
      )}
    >
      <span
        className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0"
        aria-hidden
      />
      {config.label}
    </span>
  );
}

export function TierBadge({ tier, className }: HallmarkProps) {
  return <Hallmark tier={tier} className={className} />;
}
