import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { fetchCategories } from "@/lib/queries";
import { CITIES } from "@/lib/mock-data";

interface Search {
  category?: string;
  providerId?: string;
}

export const Route = createFileRoute("/request")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s.category === "string" ? s.category : undefined,
    providerId: typeof s.providerId === "string" ? s.providerId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Post a service brief — NexusZim" },
      {
        name: "description",
        content:
          "Tell us what you need and receive quotes from verified providers across Zimbabwe.",
      },
    ],
  }),
  component: RequestPage,
});

type FormState = {
  categorySlug: string;
  title: string;
  details: string;
  city: string;
  neededBy: string;
  budget: string;
  clientWhatsapp: string;
  clientEmail: string;
};

function RequestPage() {
  const search = Route.useSearch();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
  });

  const [form, setForm] = useState<FormState>({
    categorySlug: search.category ?? (categories[0]?.slug ?? ""),
    title: "",
    details: "",
    city: "Harare",
    neededBy: "",
    budget: "",
    clientWhatsapp: "",
    clientEmail: "",
  });

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  // Pre-populate contact fields from the user's profile
  useEffect(() => {
    if (!user) return;
    async function prefill() {
      const [{ data: profile }, { data: clientProfile }] = await Promise.all([
        supabase.from("profiles").select("email").eq("id", user!.id).maybeSingle(),
        supabase.from("client_profiles").select("whatsapp, phone").eq("user_id", user!.id).maybeSingle(),
      ]);
      setForm((f) => ({
        ...f,
        clientEmail: profile?.email ?? user!.email ?? "",
        clientWhatsapp: clientProfile?.whatsapp ?? clientProfile?.phone ?? "",
      }));
    }
    prefill();
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (!form.clientWhatsapp.trim()) {
      setError("Please provide your WhatsApp number so providers can contact you.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const categoryId = categories.find((c) => c.slug === form.categorySlug)?.id ?? null;

    // Snapshot contact details from the user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    const { data, error: e1 } = await supabase
      .from("requests")
      .insert({
        client_id: user.id,
        title: form.title.trim(),
        description: form.details.trim() || null,
        category_id: categoryId,
        city: form.city,
        needed_by: form.neededBy || null,
        budget: form.budget ? Number(form.budget) : null,
        client_name: profile?.full_name ?? null,
        client_email: form.clientEmail.trim() || null,
        client_whatsapp: form.clientWhatsapp.trim() || null,
        status: "open",
      })
      .select("id")
      .single();

    if (e1) {
      setError(e1.message);
      setSubmitting(false);
      return;
    }

    setSubmittedId(data?.id ?? null);
    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    const cat = categories.find((c) => c.slug === form.categorySlug);
    return (
      <div className="bg-cream pt-16 min-h-screen">
        <div className="container-page max-w-lg py-20 text-center">
          <div className="bg-cream-raised border border-hairline rounded-[6px] p-12">
            <div className="flex justify-center mb-6">
              <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" strokeWidth={1.5} />
              </div>
            </div>

            <p className="eyebrow text-text-soft mb-3">
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
              Brief submitted
            </p>
            <h1 className="font-display text-3xl text-text mb-3">
              We've logged your brief.
            </h1>
            <p className="font-sans text-[13px] text-text-soft leading-relaxed mb-2">
              Verified providers in{" "}
              <span className="font-medium text-text">{cat?.name ?? "your category"}</span>{" "}
              will contact you via WhatsApp or phone to discuss your requirements.
            </p>
            <p className="font-sans text-[12px] text-text-soft/60">
              You pay the provider directly. NexusZim never handles money.
            </p>

            {submittedId && (
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft/40">
                Brief reference: {submittedId.slice(0, 8).toUpperCase()}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-gold py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
                >
                  View my dashboard
                </Link>
              ) : null}
              {cat && (
                <Link
                  to="/categories/$slug"
                  params={{ slug: cat.slug }}
                  className="border border-forest py-3 rounded-[3px] font-sans text-sm font-semibold text-forest hover:bg-forest hover:text-cream transition-colors"
                >
                  Browse {cat.name} providers
                </Link>
              )}
              <Link
                to="/search"
                className="border border-hairline py-3 rounded-[3px] font-sans text-sm text-text-soft hover:border-forest hover:text-forest transition-colors"
              >
                Browse the full directory
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !user) {
    return (
      <div className="bg-cream pt-16 min-h-screen grid place-items-center">
        <div className="container-page max-w-lg py-20 text-center">
          <div className="bg-cream-raised border border-hairline rounded-[6px] p-12">
            <p className="eyebrow text-text-soft mb-3">
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
              Post a brief
            </p>
            <h1 className="font-display text-3xl text-text mb-3">Sign in to continue.</h1>
            <p className="font-sans text-[13px] text-text-soft leading-relaxed mb-8">
              Create a free account or log in to post your service brief. Providers will contact you
              directly via the details on your profile.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                className="bg-gold py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="border border-forest py-3 rounded-[3px] font-sans text-sm font-semibold text-forest hover:bg-forest hover:text-cream transition-colors"
              >
                Create a free account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream pt-16 min-h-screen">
      {/* Forest header */}
      <div className="bg-forest-ink border-b border-cream/10">
        <div className="container-page max-w-2xl py-10">
          <p className="eyebrow text-cream/40 mb-3">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            Service brief
          </p>
          <h1 className="font-display text-3xl lg:text-4xl text-cream">
            Tell us what you need.
          </h1>
          <p className="mt-3 font-sans text-sm text-cream/60 leading-relaxed">
            Describe your requirements once. Verified providers in the matching category receive
            your brief and contact you directly.
          </p>
        </div>
      </div>

      <div className="container-page max-w-2xl py-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="border border-rose-200 bg-rose-50 px-4 py-3 rounded-[3px] font-sans text-sm text-rose-600">
              {error}
            </div>
          )}

          {/* Service details */}
          <div className="bg-cream-raised border border-hairline rounded-[6px] p-7 space-y-5">
            <p className="eyebrow text-text-soft">
              <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
              What do you need?
            </p>

            <Field label="Service category" required>
              <select
                required
                value={form.categorySlug}
                onChange={(e) => set("categorySlug", e.target.value)}
                className="field-input"
              >
                <option value="">Select a category...</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Request title" required hint="One sentence summary">
              <input
                required
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Wedding coordination for 200 guests in July"
                className="field-input"
              />
            </Field>

            <Field label="Details & requirements" required>
              <textarea
                required
                rows={5}
                value={form.details}
                onChange={(e) => set("details", e.target.value)}
                placeholder="Describe your scope, timeline, guest count, or any specific requirements..."
                className="field-input resize-none"
              />
            </Field>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="City" required>
                <select
                  required
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className="field-input"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Date needed" hint="Approx. is fine">
                <input
                  type="date"
                  value={form.neededBy}
                  onChange={(e) => set("neededBy", e.target.value)}
                  className="field-input"
                />
              </Field>
            </div>

            <Field label="Budget (USD)" hint="Optional — enter your approx. budget">
              <input
                type="number"
                min={0}
                value={form.budget}
                onChange={(e) => set("budget", e.target.value)}
                placeholder="e.g. 500"
                className="field-input"
              />
            </Field>
          </div>

          {/* Contact details */}
          <div className="bg-cream-raised border border-hairline rounded-[6px] p-7 space-y-5">
            <div>
              <p className="eyebrow text-text-soft mb-1">
                <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
                Your contact details
              </p>
              <p className="font-sans text-[12px] text-text-soft">
                Providers will use these to send you quotes. Pre-filled from your profile — edit if
                needed.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="WhatsApp number" required>
                <input
                  required
                  type="tel"
                  value={form.clientWhatsapp}
                  onChange={(e) => set("clientWhatsapp", e.target.value)}
                  placeholder="+263 77 123 4567"
                  className="field-input"
                />
              </Field>

              <Field label="Email" hint="For quote notifications">
                <input
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => set("clientEmail", e.target.value)}
                  placeholder="you@email.com"
                  className="field-input"
                />
              </Field>
            </div>
          </div>

          {/* Trust note */}
          <div className="border border-hairline rounded-[6px] px-5 py-4">
            <div className="flex gap-3">
              <span className="inline-block h-2 w-2 rotate-45 border border-hairline shrink-0 mt-0.5" />
              <p className="font-sans text-[12px] text-text-soft leading-relaxed">
                Providers contact you directly via WhatsApp or phone. You agree a fee and pay them
                directly. NexusZim never holds your money.
              </p>
            </div>
          </div>

          {search.providerId && (
            <div className="border border-forest/30 bg-forest/5 rounded-[6px] px-5 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-forest">
                ✓ This brief will be sent directly to your selected provider.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gold py-4 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors disabled:opacity-60"
          >
            {submitting ? "Submitting brief..." : "Submit brief"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">
        {label}
        {required && <span className="text-gold ml-1">*</span>}
        {hint && (
          <span className="ml-2 normal-case tracking-normal text-text-soft/60 font-sans text-[11px]">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
