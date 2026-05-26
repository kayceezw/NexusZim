import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";

import { findProvider } from "@/lib/mock-data";

export const Route = createFileRoute("/book/$providerId")({
  loader: ({ params }) => {
    const provider = findProvider(params.providerId);
    if (!provider) throw notFound();
    return { provider };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `Book ${loaderData.provider.business} — NexusZim` }]
      : [],
  }),
  component: CheckoutPage,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Provider not found</h1>
    </div>
  ),
});

function CheckoutPage() {
  const { provider } = Route.useLoaderData();
  const [paymentType, setPaymentType] = useState<"deposit" | "full">("deposit");
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState(false);

  const total = provider.priceFrom;
  const deposit = Math.round(total * 0.3);
  const balance = total - deposit;
  const platformFee = Math.round((paymentType === "full" ? total : deposit) * 0.07);
  const due = (paymentType === "full" ? total : deposit) + platformFee;

  if (done) {
    return (
      <div className="container-page py-24">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-2xl font-bold">Booking confirmed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We've notified {provider.business} and placed ${due} in escrow.
            {paymentType === "deposit" && (
              <>
                {" "}The remaining ${balance} will be charged on completion.
              </>
            )}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Need to change plans? Review our{" "}
            <Link to="/policies/cancellation" className="underline">
              cancellation policy
            </Link>
            .
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-accent"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <Link
        to="/providers/$providerId"
        params={{ providerId: provider.id }}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to profile
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
        Confirm your booking
      </h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!agreed) return;
            setDone(true);
          }}
          className="space-y-6 rounded-2xl border border-border bg-card p-6"
        >
          <Section title="Service details">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Date">
                <input type="date" required className="input" />
              </Field>
              <Field label="Time">
                <input type="time" required className="input" />
              </Field>
              <Field label="Location / address">
                <input
                  required
                  placeholder="Street, city"
                  className="input md:col-span-2"
                />
              </Field>
              <Field label="Notes for the provider">
                <textarea
                  rows={3}
                  placeholder="Anything they should know"
                  className="input md:col-span-2"
                />
              </Field>
            </div>
          </Section>

          <Section title="Contact">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name">
                <input required placeholder="Jane Doe" className="input" />
              </Field>
              <Field label="Phone">
                <input required type="tel" placeholder="+263…" className="input" />
              </Field>
              <Field label="Email">
                <input required type="email" placeholder="you@example.com" className="input md:col-span-2" />
              </Field>
            </div>
          </Section>

          <Section title="Payment">
            <div className="grid gap-2 sm:grid-cols-2">
              <PayOption
                checked={paymentType === "deposit"}
                onChange={() => setPaymentType("deposit")}
                title="Pay 30% deposit"
                desc={`$${deposit} now · $${balance} on completion`}
              />
              <PayOption
                checked={paymentType === "full"}
                onChange={() => setPaymentType("full")}
                title="Pay in full"
                desc={`$${total} now · held in escrow`}
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Cardholder name">
                <input required placeholder="Name on card" className="input md:col-span-2" />
              </Field>
              <Field label="Card number">
                <input
                  required
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  className="input md:col-span-2"
                />
              </Field>
              <Field label="Expiry">
                <input required placeholder="MM / YY" className="input" />
              </Field>
              <Field label="CVC">
                <input required inputMode="numeric" placeholder="123" className="input" />
              </Field>
            </div>
          </Section>

          <Section title="Cancellation & refunds">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <PolicyRow tone="text-success" label="72+ hours before" value="100% refund" />
              <PolicyRow tone="text-teal" label="24 – 72 hours before" value="50% refund" />
              <PolicyRow tone="text-gold" label="Under 24 hours / no-show" value="Non-refundable" />
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Funds stay in escrow until the service is delivered. Provider
              cancellations are refunded in full.{" "}
              <Link to="/policies/cancellation" className="underline">
                Read full policy
              </Link>
              .
            </p>
            <label className="mt-4 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                I agree to the{" "}
                <Link to="/terms" className="underline">
                  terms
                </Link>{" "}
                and{" "}
                <Link to="/policies/cancellation" className="underline">
                  cancellation policy
                </Link>
                .
              </span>
            </label>
          </Section>

          <button
            type="submit"
            disabled={!agreed}
            className="w-full rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm & pay ${due}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Secure escrow. Released to the provider only after the service is
            delivered.
          </p>
        </form>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-20">
          <h3 className="font-display font-semibold">Order summary</h3>
          <div className="mt-3 flex items-center gap-3 border-b border-border pb-4">
            <div
              className={`grid h-12 w-12 place-items-center rounded-xl font-bold ${provider.avatarColor}`}
            >
              {provider.initials}
            </div>
            <div>
              <p className="font-semibold">{provider.business}</p>
              <p className="text-xs text-muted-foreground">{provider.city}</p>
            </div>
          </div>
          <Row label="Service starting price" value={`$${total}`} />
          <Row
            label={paymentType === "full" ? "Paying now" : "Deposit (30%)"}
            value={`$${paymentType === "full" ? total : deposit}`}
          />
          {paymentType === "deposit" && (
            <Row label="Balance on completion" value={`$${balance}`} />
          )}
          <Row label="Platform fee (7%)" value={`$${platformFee}`} />
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="font-display font-semibold">Due today</span>
            <span className="font-display text-xl font-bold">${due}</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Free cancellation up to 72 hours before service.
          </p>
        </aside>
      </div>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.625rem;
          border: 1px solid var(--border);
          background: var(--background);
          padding: 0.65rem 0.85rem;
          font-size: 0.875rem;
          color: var(--foreground);
        }
        .input:focus { border-color: var(--ring); outline: none; }
      `}</style>
    </div>
  );
}

function PolicyRow({ tone, label, value }: { tone: string; label: string; value: string }) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
      <span>{label}</span>
      <span className={`font-semibold ${tone}`}>{value}</span>
    </li>
  );
}


function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function PayOption({
  checked,
  onChange,
  title,
  desc,
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`rounded-xl border p-4 text-left transition-colors ${
        checked
          ? "border-teal bg-teal/5"
          : "border-border bg-card hover:border-teal"
      }`}
    >
      <p className="font-display font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3 flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
