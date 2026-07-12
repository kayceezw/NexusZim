import { Link } from "@tanstack/react-router";

interface LogoProps {
  variant?: "color" | "reversed";
  size?: "sm" | "md" | "lg";
  asLink?: boolean;
}

const SIZES = {
  sm: { mark: 28, text: "text-lg" },
  md: { mark: 34, text: "text-xl" },
  lg: { mark: 42, text: "text-2xl" },
};

function LogoMark({ variant, size }: { variant: "color" | "reversed"; size: number }) {
  const forestStroke = variant === "reversed" ? "#F7F5F0" : "#0F3323";
  const forestFill = variant === "reversed" ? "#E7A020" : "#0F3323";
  const w = Math.round(size * (210 / 128));

  return (
    <svg
      viewBox="30 46 210 128"
      width={w}
      height={size}
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <rect
        x="45" y="65" width="90" height="90" rx="16"
        fill="none" stroke={forestStroke} strokeWidth="8"
        transform="rotate(45 90 110)"
      />
      <rect
        x="115" y="65" width="90" height="90" rx="16"
        fill="none" stroke="#E7A020" strokeWidth="8"
        transform="rotate(45 160 110)"
      />
      <rect
        x="113" y="103" width="14" height="14"
        fill={forestFill}
        transform="rotate(45 120 110)"
      />
    </svg>
  );
}

export function NexusZimLogo({ variant = "color", size = "md", asLink = true }: LogoProps) {
  const s = SIZES[size];
  const textColor = variant === "reversed" ? "text-[#F7F5F0]" : "text-[#0F3323]";
  const goldColor = variant === "reversed" ? "text-[#E7A020]" : "text-[#E7A020]";

  const inner = (
    <div className={`flex items-center gap-2.5 ${textColor}`}>
      <LogoMark variant={variant} size={s.mark} />
      <span className={`font-sans font-bold tracking-tight ${s.text}`}>
        Nexus<span className={goldColor}>Zim</span>
      </span>
    </div>
  );

  if (!asLink) return inner;

  return (
    <Link to="/" className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm">
      {inner}
    </Link>
  );
}
