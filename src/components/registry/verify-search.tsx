import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";

interface VerifySearchProps {
  /** Called with the trimmed, uppercased registry code on submit. */
  onVerify: (code: string) => void;
  /** True while the provider list is being fetched. */
  isLoading?: boolean;
}

/**
 * Centered verification search block: serif H1, subcopy, a large mono uppercase
 * input with an inline primary "Verify" button, and the repository caption.
 * The input is force-uppercased so the visible code matches the NX- registry
 * format regardless of how it was typed.
 */
export function VerifySearch({ onVerify, isLoading = false }: VerifySearchProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const code = value.trim().toUpperCase();
    if (!code) return;
    onVerify(code);
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
      <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-gold-deep">
        <span className="h-1.5 w-1.5 rotate-45 bg-gold" aria-hidden />
        Official Registry Lookup
      </span>

      <h1 className="mt-4 font-display text-4xl leading-[1.06] tracking-[-0.015em] text-foreground sm:text-5xl">
        Verification Center
      </h1>

      <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-muted-foreground">
        Enter a provider's NX registry number to confirm their standing against the official
        ZimDataPulse accreditation record. Every certificate is traceable and tamper-evident.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 w-full">
        <div className="flex flex-col gap-3 rounded-[var(--radius)] border border-border bg-card p-2 shadow-sm sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 px-3">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground/60" strokeWidth={1.5} aria-hidden />
            <input
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={value}
              onChange={(e) => setValue(e.target.value.toUpperCase())}
              placeholder="e.g. NX-2024-8492A"
              aria-label="Registry number"
              className="w-full bg-transparent py-3 font-mono text-base uppercase tracking-[0.08em] text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !value.trim()}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[calc(var(--radius)-2px)] bg-primary px-8 py-3 font-sans text-sm font-semibold text-cream transition-colors hover:bg-forest-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Checking…" : "Verify"}
          </button>
        </div>
      </form>

      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/60">
        Official ZimDataPulse Repository Access
      </p>
    </div>
  );
}
