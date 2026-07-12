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
      <div className="bg-background pt-24 min-h-screen grid place-items-center">
        <div className="container-page py-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center bg-gold/5 border border-gold/10 mb-8">
            <span className="font-mono text-gold font-bold">OK</span>
          </div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-gold/60">
            Booking Protocol
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold text-foreground">Mission Confirmed.</h1>
          <p className="mt-6 font-body text-lg font-light text-foreground/40 max-w-md mx-auto">
            We've notified {provider.business} and placed ${due} in secure escrow. 
            {paymentType === "deposit" && (
              <> The remaining balance of ${balance} is scheduled for finalization.</>
            )}
          </p>
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/dashboard"
              className="bg-gold px-10 py-5 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors"
            >
              Command Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background pt-32 min-h-screen">
      <div className="container-page pb-24">
        <Link
            to="/providers/$providerId"
            params={{ providerId: provider.id }}
            className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold/60 hover:text-gold transition-colors"
        >
            ← Return to Profile
        </Link>
        <h1 className="mt-10 font-display text-5xl font-bold text-foreground md:text-6xl">
            Confirm <span className="italic text-gold">Deployment.</span>
        </h1>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_400px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!agreed) return;
              setDone(true);
            }}
            className="space-y-12"
          >
            <Section title="Operational Details">
                <div className="grid gap-8 md:grid-cols-2">
                    <Field label="Target Date">
                        <input type="date" required className="w-full bg-card border border-gold/20 p-4 font-mono text-[11px] font-bold uppercase tracking-widest text-foreground outline-none focus:border-gold" />
                    </Field>
                    <Field label="Deployment Time">
                        <input type="time" required className="w-full bg-card border border-gold/20 p-4 font-mono text-[11px] font-bold uppercase tracking-widest text-foreground outline-none focus:border-gold" />
                    </Field>
                    <div className="md:col-span-2">
                        <Field label="Mission Location / Address">
                            <input
                                required
                                placeholder="Street address, city complex..."
                                className="w-full bg-card border border-gold/20 p-4 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20"
                            />
                        </Field>
                    </div>
                    <div className="md:col-span-2">
                        <Field label="Additional Intelligence / Notes">
                            <textarea
                                rows={4}
                                placeholder="Describe specific requirements or operational constraints..."
                                className="w-full bg-card border border-gold/20 p-4 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20 resize-none"
                            />
                        </Field>
                    </div>
                </div>
            </Section>

            <Section title="Representative Contact">
                <div className="grid gap-8 md:grid-cols-2">
                    <Field label="Identity Name">
                        <input required placeholder="Full name" className="w-full bg-card border border-gold/20 p-4 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20" />
                    </Field>
                    <Field label="Secure Line">
                        <input required type="tel" placeholder="+263..." className="w-full bg-card border border-gold/20 p-4 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20" />
                    </Field>
                    <div className="md:col-span-2">
                        <Field label="Secure Email">
                            <input required type="email" placeholder="you@domain.zw" className="w-full bg-card border border-gold/20 p-4 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20" />
                        </Field>
                    </div>
                </div>
            </Section>

            <Section title="Payment Authorization">
                <div className="grid gap-4 sm:grid-cols-2">
                    <PayOption
                        checked={paymentType === "deposit"}
                        onChange={() => setPaymentType("deposit")}
                        title="30% Commitment"
                        desc={`$${deposit} Immediate · $${balance} on Terminal`}
                    />
                    <PayOption
                        checked={paymentType === "full"}
                        onChange={() => setPaymentType("full")}
                        title="Full Settlement"
                        desc={`$${total} Initialized · Held in Escrow`}
                    />
                </div>

                <div className="mt-8 grid gap-8 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <Field label="Cardholder Identity">
                            <input required placeholder="Name as shown on card" className="w-full bg-card border border-gold/20 p-4 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20" />
                        </Field>
                    </div>
                    <div className="md:col-span-2">
                        <Field label="Credential Number">
                            <input
                                required
                                inputMode="numeric"
                                placeholder="4242 4242 4242 4242"
                                className="w-full bg-card border border-gold/20 p-4 font-mono text-sm tracking-widest text-foreground outline-none focus:border-gold placeholder:text-foreground/20"
                            />
                        </Field>
                    </div>
                    <Field label="Expiry Code">
                        <input required placeholder="MM / YY" className="w-full bg-card border border-gold/20 p-4 font-mono text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20" />
                    </Field>
                    <Field label="Security CVC">
                        <input required inputMode="numeric" placeholder="123" className="w-full bg-card border border-gold/20 p-4 font-mono text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20" />
                    </Field>
                </div>
            </Section>

            <Section title="Cancellation Protocol">
                <ul className="space-y-4">
                    <PolicyRow tone="text-emerald-500" label="72+ Hours Notice" value="100% Refund" />
                    <PolicyRow tone="text-gold" label="24 – 72 Hours Notice" value="50% Refund" />
                    <PolicyRow tone="text-rose-500" label="Under 24 Hours / No-Show" value="Non-Refundable" />
                </ul>
                <div className="mt-8 p-6 bg-gold/5 border border-gold/10">
                    <p className="font-body text-xs text-foreground/60 leading-relaxed italic">
                        Funds stay in secure escrow until mission delivery is confirmed. 
                        Provider-side cancellations are authorized for full refund.
                    </p>
                </div>
                <label className="mt-8 flex items-start gap-4 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 h-4 w-4 accent-gold"
                    />
                    <span className="font-body text-sm text-foreground/70 group-hover:text-foreground transition-colors">
                        I authorize this deployment and agree to the NexusZim {" "}
                        <Link to="/terms" className="text-gold underline underline-offset-4 decoration-gold/30">Terms</Link> and {" "}
                        <Link to="/policies/cancellation" className="text-gold underline underline-offset-4 decoration-gold/30">Cancellation Protocol</Link>.
                    </span>
                </label>
            </Section>

            <button
                type="submit"
                disabled={!agreed}
                className="w-full bg-gold py-6 font-display text-sm font-bold uppercase tracking-[0.2em] text-white hover:bg-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
                Authorize & Deploy (${due})
            </button>
          </form>

          <aside className="h-fit border border-gold/20 bg-card p-10 lg:sticky lg:top-32">
            <h3 className="font-display text-2xl font-bold text-foreground uppercase tracking-widest">Op Summary</h3>
            <div className="mt-8 flex items-center gap-6 border-b border-gold/10 pb-8">
                <div
                className={`grid h-16 w-16 place-items-center font-display text-xl font-bold border border-gold/20 ${provider.avatarColor}`}
                >
                {provider.initials}
                </div>
                <div>
                <p className="font-display text-xl font-bold text-foreground">{provider.business}</p>
                <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/40">{provider.city}</p>
                </div>
            </div>
            
            <div className="mt-8 space-y-4">
                <Row label="Mission Base Rate" value={`$${total}`} />
                <Row
                    label={paymentType === "full" ? "Authorization Amount" : "Commitment (30%)"}
                    value={`$${paymentType === "full" ? total : deposit}`}
                />
                {paymentType === "deposit" && (
                    <Row label="Deferred Balance" value={`$${balance}`} />
                )}
                <Row label="Brokerage Fee (7%)" value={`$${platformFee}`} />
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-gold/10 pt-8">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/40">Due for Deployment</span>
                <span className="font-display text-4xl font-bold text-gold">${due}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function PolicyRow({ tone, label, value }: { tone: string; label: string; value: string }) {
  return (
    <li className="flex items-center justify-between border border-gold/5 bg-background/30 p-4">
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/60">{label}</span>
      <span className={`font-mono text-[10px] font-bold uppercase tracking-widest ${tone}`}>{value}</span>
    </li>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
          <span className="h-px w-8 bg-gold/40" />
          <h2 className="font-display text-2xl font-bold text-foreground uppercase tracking-widest">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-gold/60">{label}</label>
      {children}
    </div>
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
      className={`border p-6 text-left transition-all ${
        checked
          ? "border-gold bg-gold/5 ring-1 ring-gold"
          : "border-gold/10 bg-card hover:border-gold/30"
      }`}
    >
      <p className="font-display text-lg font-bold text-foreground">{title}</p>
      <p className="mt-2 font-body text-xs text-foreground/40 leading-relaxed">{desc}</p>
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-body text-sm text-foreground/50">{label}</span>
      <span className="font-mono text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}

