import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

/**
 * Premium light/dark toggle. Shows a moon in light mode (click → dark) and a
 * sun in dark mode (click → light). Icons cross-fade for a subtle transition.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, toggle } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-border bg-surface text-gold-deep dark:text-gold shadow-[var(--elev-sm)] transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`}
    >
      <Sun
        className={`h-[18px] w-[18px] absolute transition-all duration-300 ${
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
        aria-hidden="true"
      />
      <Moon
        className={`h-[18px] w-[18px] absolute transition-all duration-300 ${
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
