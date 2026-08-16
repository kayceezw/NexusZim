import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme; // the user's choice (may be "system")
  resolvedTheme: ResolvedTheme; // what is actually applied right now
  setTheme: (theme: Theme) => void;
  toggle: () => void; // flip between light and dark (sets an explicit choice)
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const THEME_KEY = "nexuszim-theme";

/**
 * Inline, SSR-safe no-flash script. Injected into the document <head> so the
 * correct `.dark` class is applied before first paint (avoids theme flicker).
 * Keep this in sync with resolveTheme() below.
 */
export const themeNoFlashScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}')||'system';var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var c=document.documentElement.classList;d?c.add('dark'):c.remove('dark');}catch(e){}})();`;

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") return systemPrefersDark() ? "dark" : "light";
  return theme;
}

function applyResolved(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const c = document.documentElement.classList;
  if (resolved === "dark") c.add("dark");
  else c.remove("dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Default to "system"; the no-flash script has already set the class on <html>.
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  // Hydrate the stored choice on mount.
  useEffect(() => {
    let stored: Theme = "system";
    try {
      const raw = localStorage.getItem(THEME_KEY) as Theme | null;
      if (raw === "light" || raw === "dark" || raw === "system") stored = raw;
    } catch {
      // ignore
    }
    setThemeState(stored);
    const resolved = resolveTheme(stored);
    setResolvedTheme(resolved);
    applyResolved(resolved);
  }, []);

  // React to OS changes while in "system" mode.
  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const resolved = systemPrefersDark() ? "dark" : "light";
      setResolvedTheme(resolved);
      applyResolved(resolved);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // ignore
    }
    const resolved = resolveTheme(next);
    setResolvedTheme(resolved);
    applyResolved(resolved);
  };

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggle: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
