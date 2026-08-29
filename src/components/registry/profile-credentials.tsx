import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { RegistryChip } from "./registry-chip";

export interface CredentialItem {
  /** Bold row label, e.g. "Identity Verified". */
  label: string;
  /** Mono sub-line under the label (a reference, standard, or status code). */
  sub: string;
  /** Whether this credential is confirmed for the provider. */
  confirmed: boolean;
}

interface ProfileCredentialsCardProps {
  registryId: string;
  items: CredentialItem[];
  className?: string;
}

/**
 * "Verified Credentials" checklist card for the provider profile bento grid.
 * Renders check_circle rows with a bold label + mono sub-line. Confirmed items
 * read in forest/primary; pending items are dimmed and use an outline circle so
 * the checklist never overstates a provider's standing.
 */
export function ProfileCredentialsCard({
  registryId,
  items,
  className,
}: ProfileCredentialsCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm",
        className,
      )}
      aria-labelledby="credentials-heading"
    >
      <div className="mb-5 border-b border-border pb-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Verified Credentials
        </p>
        <h2
          id="credentials-heading"
          className="mt-1 font-display text-xl leading-tight text-foreground"
        >
          Accreditation Record
        </h2>
      </div>

      <ul className="flex flex-col gap-4">
        {items.map((item) => {
          const Icon = item.confirmed ? CheckCircle2 : Circle;
          return (
            <li key={item.label} className="flex items-start gap-3">
              <Icon
                className={cn(
                  "mt-0.5 h-5 w-5 shrink-0",
                  item.confirmed ? "text-primary" : "text-muted-foreground/40",
                )}
                strokeWidth={item.confirmed ? 2 : 1.5}
                aria-hidden
              />
              <div className="min-w-0">
                <p
                  className={cn(
                    "font-sans text-sm font-semibold leading-tight",
                    item.confirmed ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </p>
                <p className="mt-0.5 truncate font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                  {item.sub}
                </p>
              </div>
              <span className="sr-only">
                {item.confirmed ? "confirmed" : "pending"}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Registry Reference
        </span>
        <RegistryChip value={registryId} size="sm" />
      </div>
    </section>
  );
}
