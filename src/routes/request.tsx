import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CATEGORIES, CITIES, type CategorySlug } from "@/lib/mock-data";

interface Search {
  category?: CategorySlug;
  providerId?: string;
}

export const Route = createFileRoute("/request")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: (s.category as CategorySlug) || undefined,
    providerId: (s.providerId as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Post a service request — NexusZim" },
      {
        name: "description",
        content:
          "Tell us what you need and receive quotes from verified providers across Zimbabwe.",
      },
    ],
  }),
  component: RequestPage,
});

function RequestPage() {
  const search = Route.useSearch();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    category: search.category ?? ("events" as CategorySlug),
    title: "",
    details: "",
    city: "Harare",
    date: "",
    budget: "",
    urgency: "standard",
  });

  if (submitted) {
    return (
      <div className="container-page py-24 min-h-screen pt-40">
        <div className="mx-auto max-w-xl border border-gold/20 bg-card p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center bg-gold/10 border border-gold/30 mb-8">
            <span className="font-mono text-gold font-bold">OK</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground">Request Lodged.</h1>
          <p className="mt-6 font-body text-lg font-light text-foreground/60">
            Your enquiry has been broadcast to the NexusZim network. Verified providers will respond
            shortly with formal quotes.
          </p>
          <div className="mt-12 flex flex-col gap-4">
            <Link
              to="/dashboard"
              className="bg-gold px-8 py-4 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors"
            >
              Access My Dashboard
            </Link>
            <Link
              to="/search"
              className="border border-gold/30 px-8 py-4 font-display text-sm font-bold uppercase tracking-widest text-gold hover:bg-gold/5"
            >
              Browse More Fixers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background pt-24 min-h-screen">
      <div className="container-page py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-4">
            <span className="h-px w-8 bg-gold/40" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
              Service Enquiry
            </span>
          </div>
          <h1 className="mt-4 font-display text-5xl font-bold tracking-tight text-foreground">
            Tell us what you <span className="italic text-gold">need.</span>
          </h1>
          <p className="mt-6 font-body text-lg font-light text-foreground/60">
            Share your requirements once and let the continent's most trusted service providers come
            to you with curated proposals.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="mt-12 space-y-8 border border-gold/20 bg-card p-8 md:p-12"
          >
            <div className="grid gap-8 md:grid-cols-2">
              <Field label="Service Category">
                <select
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category: e.target.value as CategorySlug,
                    }))
                  }
                  className="w-full bg-background border border-gold/20 p-4 font-mono text-[11px] font-bold uppercase tracking-widest text-foreground outline-none focus:border-gold"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Short Request Title">
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Wedding coordination for 200 guests"
                  className="w-full bg-background border border-gold/20 p-4 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20"
                />
              </Field>
            </div>

            <Field label="Operational Details & Requirements">
              <textarea
                required
                value={form.details}
                onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
                rows={6}
                placeholder="Describe scope, expectations, and any mission-critical requirements..."
                className="w-full bg-background border border-gold/20 p-4 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20 resize-y"
              />
            </Field>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <Field label="Mission Location">
                  <select
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    className="w-full bg-background border border-gold/20 p-4 font-mono text-[11px] font-bold uppercase tracking-widest text-foreground outline-none focus:border-gold"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Target Date">
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full bg-background border border-gold/20 p-4 font-mono text-[11px] font-bold uppercase tracking-widest text-foreground outline-none focus:border-gold"
                />
              </Field>
              <Field label="Budget (USD)">
                <input
                  type="number"
                  min={0}
                  value={form.budget}
                  onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                  placeholder="e.g. 500"
                  className="w-full bg-background border border-gold/20 p-4 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20"
                />
              </Field>
            </div>

            <div className="border-t border-gold/10 pt-8">
              {search.providerId && (
                <p className="mb-8 font-mono text-[10px] font-bold uppercase tracking-widest text-gold text-center bg-gold/5 border border-gold/20 py-3">
                  This request will be sent directly to the selected elite provider.
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-gold py-5 font-display text-sm font-bold uppercase tracking-[0.2em] text-white hover:bg-foreground transition-colors"
              >
                Broadcast Request & Access proposals
              </button>
              <p className="mt-6 text-center font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-foreground/30">
                By posting, you agree to the NexusZim Terms of Engagement.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-3 block font-mono text-[9px] font-bold uppercase tracking-widest text-gold/60">
        {label}
      </label>
      {children}
    </div>
  );
}
