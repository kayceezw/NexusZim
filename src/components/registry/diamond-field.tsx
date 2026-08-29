import { cn } from "@/lib/utils";

interface DiamondFieldProps {
  /** Extra classes for positioning/opacity overrides. */
  className?: string;
  /** Gold-tinted lattice for Trust Certified surfaces. Defaults to forest tint. */
  tone?: "forest" | "gold";
}

/**
 * Decorative interlocking-diamonds watermark layer. Absolutely positioned and
 * pointer-events-none so it sits behind card/section content without capturing
 * clicks. The parent must be `relative` (and usually `overflow-hidden`).
 *
 * The visible content should render *after* this in the DOM, or be given a
 * `relative` wrapper, so it layers above the watermark.
 */
export function DiamondField({ className, tone = "forest" }: DiamondFieldProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 select-none",
        tone === "gold" ? "diamond-field-gold" : "diamond-field",
        className,
      )}
    />
  );
}
