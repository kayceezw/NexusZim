import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only rating display: filled gold stars + numeric average and count. */
export function RatingDisplay({
  average,
  count,
  size = "sm",
  className,
}: {
  average: number;
  count: number;
  size?: "sm" | "md";
  className?: string;
}) {
  if (count === 0) {
    return (
      <span
        className={cn(
          "font-mono uppercase tracking-widest text-muted-foreground/50",
          size === "sm" ? "text-[10px]" : "text-[11px]",
          className,
        )}
      >
        No reviews yet
      </span>
    );
  }
  const dim = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="inline-flex items-center gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(dim, i <= Math.round(average) ? "fill-gold text-gold" : "text-muted-foreground/30")}
            strokeWidth={1.5}
          />
        ))}
      </span>
      <span
        className={cn(
          "font-mono text-muted-foreground",
          size === "sm" ? "text-[10px]" : "text-[11px]",
        )}
      >
        {average.toFixed(1)}
        <span className="text-muted-foreground/50"> ({count})</span>
      </span>
    </span>
  );
}

/** Interactive 1–5 star input for the review form. */
export function StarInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => {
        const active = i <= (hover || value);
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
            onMouseEnter={() => !disabled && setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => !disabled && onChange(i)}
            className="p-0.5 disabled:cursor-not-allowed transition-transform hover:scale-110"
          >
            <Star
              className={cn("h-7 w-7", active ? "fill-gold text-gold" : "text-muted-foreground/30")}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
