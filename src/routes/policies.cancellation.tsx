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
    detail:
      "Full refund of deposit and any prepayment. Platform fee is refunded.",
    tone: "text-success",
  },
  {
    window: "24 – 72 hours before service",
    refund: "50% refund",
    detail:
      "Half of the deposit (or prepayment) is refunded. Platform fee is non-refundable.",
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
    <div className="container-page py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Policy
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Cancellation & refund policy
        </h1>
        <p className="mt-4 text-muted-foreground">
          We hold every payment in escrow until the service is delivered. If
          plans change, here is exactly what you can expect — no fine print.
        </p>

        <div className="mt-10 grid gap-3">
          {tiers.map((t) => (
            <div
              key={t.window}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display font-semibold">{t.window}</p>
                <span className={`text-sm font-semibold ${t.tone}`}>
                  {t.refund}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {highlights.map((h) => (
            <div key={h.title} className="rounded-2xl border border-border bg-card p-5">
              <p className="font-display font-semibold">{h.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{h.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-gold/40 bg-gold/5 p-6">
          <h2 className="font-display font-semibold">Provider cancellations</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            If a provider cancels, you receive a 100% refund — including the
            platform fee — and we'll prioritise matching you with a vetted
            alternative.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/contact"
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-accent"
          >
            Contact support
          </Link>
          <Link
            to="/terms"
            className="rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:border-gold"
          >
            Read full terms
          </Link>
        </div>
      </div>
    </div>
  );
}
