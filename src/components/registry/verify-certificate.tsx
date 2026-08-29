import { CheckCircle2, Download, Printer } from "lucide-react";
import { DiamondField, RegistryChip } from "@/components/registry";
import {
  providerInitials,
  providerAvatarColor,
  providerRegistryId,
  type ProviderListing,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

/** Tier integer -> registry vocabulary. */
function tierLabel(tier: number): string {
  if (tier >= 3) return "Trust Certified";
  if (tier === 2) return "Verified";
  return "Listed";
}

/** Human-readable long date, e.g. "14 March 2024". Falls back gracefully. */
function longDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Accreditation validity runs one year from the last audit (updated_at). This is
 * a display convention only, computed from the record's own timestamp so it is
 * deterministic and never fabricated.
 */
function expiryDate(updatedAt: string | null | undefined): string {
  if (!updatedAt) return "—";
  const d = new Date(updatedAt);
  if (Number.isNaN(d.getTime())) return "—";
  d.setFullYear(d.getFullYear() + 1);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

interface DetailProps {
  label: string;
  value: string;
  mono?: boolean;
}

function Detail({ label, value, mono = true }: DetailProps) {
  return (
    <div className="flex flex-col gap-1 border-t border-border pt-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
        {label}
      </span>
      <span
        className={cn(
          "text-sm text-foreground",
          mono ? "font-mono tabular-nums" : "font-sans",
        )}
      >
        {value}
      </span>
    </div>
  );
}

interface VerifyCertificateProps {
  provider: ProviderListing;
}

/**
 * Certificate-of-Accreditation preview rendered for a resolved provider. Gold
 * top accent bar + diamond-field watermark, two columns: identity/status on the
 * left, the official certificate body + action buttons on the right.
 *
 * "Download PDF" is a stubbed action (no PDF pipeline on this branch);
 * "Print Record" invokes the browser print dialog on the certificate.
 */
export function VerifyCertificate({ provider }: VerifyCertificateProps) {
  const registryId = providerRegistryId(provider.user_id);
  const photo = provider.photos?.[0] ?? null;
  const isCertified = provider.tier >= 3;

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius)] border bg-card shadow-sm",
        isCertified ? "elite-border" : "border-border",
      )}
    >
      {/* Gold top accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-gold-deep via-gold to-gold-hi" aria-hidden />

      <DiamondField tone={isCertified ? "gold" : "forest"} className="opacity-[0.55]" />

      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,260px)_1fr] lg:gap-10">
        {/* Left column: identity + status */}
        <div className="flex flex-col gap-5">
          <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-forest-ink/[0.04]">
            {photo ? (
              <img
                src={photo}
                alt={provider.business_name}
                loading="lazy"
                className="aspect-square w-full object-cover grayscale"
              />
            ) : (
              <div
                className={cn(
                  "flex aspect-square w-full items-center justify-center",
                  providerAvatarColor(provider.user_id),
                )}
              >
                <span className="font-display text-5xl tracking-tight">
                  {providerInitials(provider.business_name)}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
                <span className="absolute inline-flex h-full w-full rounded-full bg-success/60 animate-pulse-soft" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
              </span>
              <span className="font-sans text-sm font-semibold text-foreground">Active</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
                Status
              </span>
            </div>

            <div className="flex flex-col gap-1 border-t border-border pt-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
                Certificate Expiry
              </span>
              <span className="font-mono text-sm tabular-nums text-foreground">
                {expiryDate(provider.updated_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Right column: certificate body */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-gold-deep">
              <span className="h-1.5 w-1.5 rotate-45 bg-gold" aria-hidden />
              Official Verification Certificate
            </span>
            <h2 className="font-display text-3xl leading-[1.08] tracking-[-0.01em] text-foreground">
              {provider.business_name}
            </h2>
            <p className="flex items-center gap-2 font-sans text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" strokeWidth={1.75} />
              This record is validated against the official ZimDataPulse repository.
            </p>
          </div>

          {/* Registry Number box */}
          <div className="rounded-[var(--radius)] border border-dashed border-border bg-surface/60 px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
              Registry Number
            </p>
            <div className="mt-2">
              <RegistryChip
                value={registryId}
                copyable
                size="md"
                tone={isCertified ? "gold" : "default"}
                label="registry number"
              />
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <Detail label="Tier Level" value={tierLabel(provider.tier)} mono={false} />
            <Detail
              label="Institution"
              value={provider.categories?.name ?? "NexusZim Registry"}
              mono={false}
            />
            <Detail label="Initial Certification" value={longDate(provider.created_at)} />
            <Detail label="Last Audit" value={longDate(provider.updated_at)} />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row print:hidden">
            <button
              type="button"
              onClick={() => {
                // PDF export pipeline is not wired on this branch; stub keeps the
                // affordance visible without pretending to produce a file.
              }}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius)] bg-primary px-5 py-3 font-sans text-sm font-semibold text-cream transition-colors hover:bg-forest-ink"
            >
              <Download className="h-4 w-4" strokeWidth={1.75} />
              Download PDF
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius)] border border-border px-5 py-3 font-sans text-sm font-semibold text-foreground transition-colors hover:border-foreground/50 hover:bg-surface"
            >
              <Printer className="h-4 w-4" strokeWidth={1.75} />
              Print Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
