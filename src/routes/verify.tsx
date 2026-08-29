import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileLock2, GitBranch, Landmark, SearchX } from "lucide-react";
import { SectionHeading } from "@/components/registry";
import { VerifySearch } from "@/components/registry/verify-search";
import { VerifyCertificate } from "@/components/registry/verify-certificate";
import { fetchProviders, providerRegistryId, type ProviderListing } from "@/lib/queries";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verification Center - NexusZim Official Registry" },
      {
        name: "description",
        content:
          "Confirm a provider's accreditation standing against the official ZimDataPulse registry. Enter an NX registry number to view a tamper-evident verification certificate.",
      },
    ],
  }),
  component: VerifyPage,
});

const WHY_CARDS: Array<{ icon: typeof FileLock2; title: string; desc: string }> = [
  {
    icon: FileLock2,
    title: "Immutable Record",
    desc: "Each NX number is bound to a single accreditation record. Once issued it cannot be altered, reassigned, or quietly rewritten.",
  },
  {
    icon: GitBranch,
    title: "Complete Traceability",
    desc: "Every certification, audit, and tier change is timestamped against the registry, giving a full history behind the number.",
  },
  {
    icon: Landmark,
    title: "Institutional Trust",
    desc: "The registry is maintained by ZimDataPulse as a neutral repository. NexusZim verifies and records; it never intermediates funds.",
  },
];

function VerifyPage() {
  // The submitted, normalized code we are actively resolving. Empty until submit.
  const [code, setCode] = useState<string | null>(null);

  // Fetch the full provider list once and resolve locally. We match by the
  // derived registry id rather than a DB column, mirroring providerRegistryId.
  const {
    data: providers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["verify", "providers"],
    queryFn: () => fetchProviders({ limit: 500, minTier: 1 }),
  });

  const matched = useMemo<ProviderListing | null>(() => {
    if (!code) return null;
    const target = code.trim().toUpperCase();
    return (
      providers.find(
        (p) => providerRegistryId(p.user_id).toUpperCase() === target,
      ) ?? null
    );
  }, [code, providers]);

  const hasSearched = code !== null;

  return (
    <div className="bg-background pt-16 min-h-screen">
      {/* Search block */}
      <section className="border-b border-border py-16 lg:py-24">
        <div className="container-page">
          <VerifySearch onVerify={setCode} isLoading={isLoading} />
        </div>
      </section>

      {/* Result: certificate, empty state, or fetch error */}
      {hasSearched && (
        <section className="py-16 lg:py-20">
          <div className="container-page">
            {isError ? (
              <div className="mx-auto max-w-2xl rounded-[var(--radius)] border border-destructive/30 bg-destructive/[0.06] p-10 text-center">
                <SearchX
                  className="mx-auto mb-4 h-8 w-8 text-destructive"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <h2 className="font-display text-2xl text-foreground">
                  Registry lookup unavailable
                </h2>
                <p className="mx-auto mt-2 max-w-md font-sans text-sm leading-relaxed text-muted-foreground">
                  We could not reach the accreditation repository. Please check your connection and
                  try again in a moment.
                </p>
              </div>
            ) : isLoading ? (
              <div className="mx-auto max-w-2xl rounded-[var(--radius)] border border-border bg-card p-12 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/60">
                Checking the official registry…
              </div>
            ) : matched ? (
              <div className="mx-auto max-w-4xl">
                <VerifyCertificate provider={matched} />
              </div>
            ) : (
              <div className="mx-auto max-w-2xl rounded-[var(--radius)] border border-border bg-card p-10 text-center">
                <SearchX
                  className="mx-auto mb-4 h-8 w-8 text-muted-foreground/50"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <h2 className="font-display text-2xl text-foreground">No official record found</h2>
                <p className="mx-auto mt-2 max-w-md font-sans text-sm leading-relaxed text-muted-foreground">
                  No accredited provider matches{" "}
                  <span className="font-mono uppercase tracking-[0.06em] text-foreground">
                    {code}
                  </span>
                  . Confirm the NX registry number and try again, or browse the full register.
                </p>
                <Link
                  to="/search"
                  className="mt-6 inline-flex items-center gap-2 rounded-[var(--radius)] border border-border px-6 py-3 font-sans text-sm font-semibold text-foreground transition-colors hover:border-foreground/50 hover:bg-surface"
                >
                  Browse the registry
                  <span aria-hidden>→</span>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Why the NX Number Matters */}
      <section className="border-t border-border bg-surface/40 py-16 lg:py-24">
        <div className="container-page">
          <SectionHeading
            align="center"
            eyebrow="Registry Integrity"
            title="Why the NX Number Matters"
            subcopy="The NX registry number is the anchor of every accreditation record. It is what makes verification meaningful rather than cosmetic."
            className="mx-auto"
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {WHY_CARDS.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="relative flex flex-col gap-4 rounded-[var(--radius)] border border-border bg-card p-6"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius)] border border-gold/40 bg-gold/[0.08] text-gold-deep">
                    <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                  </span>
                  <h3 className="font-display text-xl text-foreground">{c.title}</h3>
                  <p className="font-sans text-[13px] leading-relaxed text-muted-foreground">
                    {c.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center font-sans text-[13px] leading-relaxed text-muted-foreground/80">
            NexusZim is an accreditation registry and does not handle or intermediate client funds.
          </p>
        </div>
      </section>
    </div>
  );
}
