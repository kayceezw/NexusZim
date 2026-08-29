import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** Small uppercase tracked kicker above the title (mono). */
  eyebrow?: ReactNode;
  /** The serif section title. */
  title: ReactNode;
  /** Optional muted supporting line below the title. */
  subcopy?: ReactNode;
  /** Text alignment. Centered headers constrain subcopy width. */
  align?: "left" | "center";
  /** Heading level for correct document outline. Defaults to h2. */
  as?: "h1" | "h2" | "h3";
  className?: string;
}

/**
 * Standardized section header: mono uppercase eyebrow, serif (font-display)
 * title, and a muted subcopy. Used across every section of the registry
 * redesign so headings stay visually consistent.
 */
export function SectionHeading({
  eyebrow,
  title,
  subcopy,
  align = "left",
  as: Heading = "h2",
  className,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        centered ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-gold-deep">
          <span className="h-1.5 w-1.5 rotate-45 bg-gold" aria-hidden />
          {eyebrow}
        </span>
      )}
      <Heading className="font-display text-3xl leading-[1.08] tracking-[-0.01em] text-foreground sm:text-4xl">
        {title}
      </Heading>
      {subcopy && (
        <p
          className={cn(
            "font-sans text-sm leading-relaxed text-muted-foreground sm:text-base",
            centered && "max-w-2xl",
          )}
        >
          {subcopy}
        </p>
      )}
    </div>
  );
}
