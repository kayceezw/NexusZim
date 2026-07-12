import { cn } from "@/lib/utils";

export interface LedgerEntry {
  key: string;
  value: string;
  date?: string;
  verified?: boolean;
}

interface LedgerProps {
  entries: LedgerEntry[];
  className?: string;
  variant?: "default" | "condensed";
}

export function Ledger({ entries, className, variant = "default" }: LedgerProps) {
  return (
    <dl className={cn("divide-y divide-[#DEDACB]", className)}>
      {entries.map((entry) => (
        <div
          key={entry.key}
          className={cn(
            "flex items-start justify-between gap-4",
            variant === "condensed" ? "py-2" : "py-3"
          )}
        >
          <dt className="font-sans text-[13px] text-[#5C6B60] shrink-0 min-w-0">
            {entry.key}
          </dt>
          <dd className="font-mono text-[12px] tracking-[0.04em] text-right">
            {entry.verified !== false && (
              <span className="text-[#0F3323] mr-1">✓</span>
            )}
            <span className="text-[#14251C]">{entry.value}</span>
            {entry.date && (
              <span className="ml-2 text-[#5C6B60]/70">{entry.date}</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

interface LedgerRowProps {
  label: string;
  value: string;
  date?: string;
  verified?: boolean;
  className?: string;
}

export function LedgerRow({ label, value, date, verified = true, className }: LedgerRowProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 py-3 border-b border-[#DEDACB] last:border-0", className)}>
      <span className="font-sans text-[13px] text-[#5C6B60]">{label}</span>
      <span className="font-mono text-[12px] tracking-[0.04em] text-right">
        {verified && <span className="text-[#0F3323] mr-1">✓</span>}
        <span className="text-[#14251C]">{value}</span>
        {date && <span className="ml-2 text-[#5C6B60]/70">{date}</span>}
      </span>
    </div>
  );
}
