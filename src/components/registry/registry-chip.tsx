import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegistryChipProps {
  /** The registry number to display (e.g. `providerRegistryId(userId)`). */
  value: string;
  /** Render a copy-to-clipboard button that copies `value`. */
  copyable?: boolean;
  /** Visual tone. `gold` denotes Trust Certified surfaces. */
  tone?: "default" | "gold";
  /** Sizing. `sm` for inline/card use, `md` for feature blocks. */
  size?: "sm" | "md";
  /** Accessible label prefix for the copy button. Defaults to "registry number". */
  label?: string;
  className?: string;
}

const TONE: Record<NonNullable<RegistryChipProps["tone"]>, string> = {
  default: "border-border text-foreground bg-card",
  gold: "elite-border text-gold-deep bg-gold/[0.06]",
};

const SIZE: Record<NonNullable<RegistryChipProps["size"]>, string> = {
  sm: "px-2 py-1 text-[11px] gap-1.5",
  md: "px-3 py-1.5 text-xs gap-2",
};

/**
 * A mono registry number rendered in a bordered near-square chip. When
 * `copyable`, renders an accessible copy-to-clipboard button that shows a
 * transient check state on success.
 */
export function RegistryChip({
  value,
  copyable = false,
  tone = "default",
  size = "sm",
  label = "registry number",
  className,
}: RegistryChipProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback for non-secure contexts / older browsers.
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard denied — leave the value visible so it can be copied manually.
      setCopied(false);
    }
  }, [value]);

  const iconTone = tone === "gold" ? "text-gold-deep" : "text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-sm)] border font-mono uppercase tracking-[0.06em] tabular-nums",
        SIZE[size],
        TONE[tone],
        className,
      )}
    >
      <span className="truncate">{value}</span>
      {copyable && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? `Copied ${label}` : `Copy ${label}`}
          title={copied ? "Copied" : "Copy"}
          className={cn(
            "ml-0.5 inline-flex shrink-0 items-center justify-center rounded-[2px] p-0.5",
            "transition-colors hover:text-foreground focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring/60",
            iconTone,
          )}
        >
          {copied ? (
            <Check className={size === "md" ? "h-3.5 w-3.5" : "h-3 w-3"} strokeWidth={2} />
          ) : (
            <Copy className={size === "md" ? "h-3.5 w-3.5" : "h-3 w-3"} strokeWidth={1.75} />
          )}
          <span className="sr-only" aria-live="polite">
            {copied ? "Copied to clipboard" : ""}
          </span>
        </button>
      )}
    </span>
  );
}
