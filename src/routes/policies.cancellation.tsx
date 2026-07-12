import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/policies/cancellation")({
  head: () => ({
    meta: [
      { title: "Cancellation & Refund Policy — NexusZim" },
      {
        name: "description",
        content:
          "Transparent cancellation windows, deposit handling and refund timelines for every NexusZim booking.",
      },
    ],
  }),
  component: CancellationPolicyPage,
});

const tiers = [
  {
    window: "More than 72 hours before service",
    refund: "100% refund",
    detail: "Full refund of deposit and any prepayment. Platform fee is refunded.",
    tone: "text-success",
  },
  {
    window: "24 – 72 hours before service",
    refund: "50% refund",
    detail: "Half of the deposit (or prepayment) is refunded. Platform fee is non-refundable.",
    tone: "text-teal",
  },
  {
    window: "Less than 24 hours before service",
    refund: "Non-refundable",
    detail:
      "Deposit is forfeited to compensate the provider for reserved time. Any balance not yet charged will not be collected.",
    tone: "text-gold",
  },
  {
    window: "No-show",
    refund: "Non-refundable",
    detail:
      "Full booking amount is charged. Disputes can be opened from your dashboard within 48 hours.",
    tone: "text-destructive",
  },
];

const highlights = [
  {
    title: "Escrowed funds",
    body: "Money is released to the provider only after the service is marked complete.",
  },
  {
    title: "Refund timing",
    body: "Approved refunds are returned to the original method within 5–10 business days.",
  },
  {
    title: "Reschedules",
    body: "Free reschedules up to 48 hours before service, subject to provider availability.",
  },
];

function CancellationPolicyPage() {
  return (
    <div className="bg-background pt-32 min-h-screen">
      <div className="container-page pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-4">
            <span className="h-px w-8 bg-gold/40" />
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
              Mission Abortion
            </p>
          </div>
          <h1 className="mt-6 font-display text-5xl font-bold text-foreground md:text-6xl">
            Cancellation <span className="italic text-gold">Protocol.</span>
          </h1>
          <p className="mt-8 text-lg font-light leading-relaxed text-foreground/70">
            NexusZim manages all commitment authorizations through a secure escrow layer. If mission
            parameters change, our protocol ensures fair compensation for mobilised fixers.
          </p>

          <div className="mt-16 grid gap-px bg-gold/10 border border-gold/10">
            {tiers.map((t) => (
              <div
                key={t.window}
                className="bg-background p-8 md:p-10 group hover:bg-card transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="font-display text-xl font-bold text-foreground group-hover:text-gold transition-colors">
                    {t.window}
                  </p>
                  <span
                    className={`font-mono text-[10px] font-bold uppercase tracking-widest ${t.tone}`}
                  >
                    {t.refund}
                  </span>
                </div>
                <p className="mt-6 font-body text-base text-foreground/60 leading-relaxed">
                  {t.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {highlights.map((h) => (
              <div key={h.title} className="border border-gold/10 bg-card p-8">
                <p className="font-display text-lg font-bold text-foreground uppercase tracking-widest">
                  {h.title}
                </p>
                <p className="mt-4 font-body text-sm text-foreground/60 leading-relaxed">
                  {h.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 border border-gold/20 bg-gold/5 p-10">
            <h2 className="font-display text-2xl font-bold text-gold uppercase tracking-widest">
              Fixer De-mobilisation
            </h2>
            <p className="mt-6 font-body text-base text-foreground/70 leading-relaxed italic">
              In the rare event of fixer-side abort, the operative receives a 100% commitment
              restoration. Our concierge desk will prioritize immediate re-assignment of a vetted
              alternative.
            </p>
          </div>

          <div className="mt-16 flex flex-wrap gap-6">
            <Link
              to="/contact"
              className="bg-gold px-10 py-5 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors"
            >
              Contact Support
            </Link>
            <Link
              to="/terms"
              className="border border-gold/30 px-10 py-5 font-display text-sm font-bold uppercase tracking-widest text-gold hover:bg-gold/5 transition-colors"
            >
              Operating Charter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
