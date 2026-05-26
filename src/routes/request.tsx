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
      <div className="container-page py-24">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-2xl font-bold">Request posted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Verified providers will start sending quotes shortly. We'll notify
            you in your dashboard.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              to="/dashboard"
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-accent"
            >
              Go to dashboard
            </Link>
            <Link
              to="/search"
              className="rounded-xl border border-border px-5 py-3 text-sm font-semibold"
            >
              Browse providers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="font-display text-xs font-semibold uppercase tracking-wider text-teal">
          Post a request
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
          Tell us what you need
        </h1>
        <p className="mt-2 text-muted-foreground">
          Share the details once and let providers come to you with quotes.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 md:p-8"
        >
          <Field label="Service category">
            <select
              required
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  category: e.target.value as CategorySlug,
                }))
              }
              className="input"
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Short title">
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Wedding coordination for 200 guests"
              className="input"
            />
          </Field>

          <Field label="Details & requirements">
            <textarea
              required
              value={form.details}
              onChange={(e) =>
                setForm((f) => ({ ...f, details: e.target.value }))
              }
              rows={5}
              placeholder="Describe scope, expectations, anything providers should know."
              className="input resize-y"
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="City / location">
              <select
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="input"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date needed">
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="input"
              />
            </Field>
            <Field label="Budget (USD)">
              <input
                type="number"
                min={0}
                value={form.budget}
                onChange={(e) =>
                  setForm((f) => ({ ...f, budget: e.target.value }))
                }
                placeholder="e.g. 500"
                className="input"
              />
            </Field>
            <Field label="Urgency">
              <select
                value={form.urgency}
                onChange={(e) =>
                  setForm((f) => ({ ...f, urgency: e.target.value }))
                }
                className="input"
              >
                <option value="flexible">Flexible</option>
                <option value="standard">Standard</option>
                <option value="urgent">Urgent (within 48 hrs)</option>
              </select>
            </Field>
          </div>

          {search.providerId && (
            <p className="rounded-lg bg-teal/10 px-3 py-2 text-xs text-teal">
              This request will be sent directly to the provider you selected.
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-accent"
          >
            Post request & receive quotes
          </button>
          <p className="text-center text-xs text-muted-foreground">
            By posting, you agree to our terms and our cancellation policy.
          </p>
        </form>
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
          outline: none;
        }
        .input:focus {
          border-color: var(--ring);
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 25%, transparent);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
