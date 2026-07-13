import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { findProvider } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Clock, MapPin } from "lucide-react";
import { Hallmark } from "@/components/registry/hallmark";

export const Route = createFileRoute("/book/$providerId")({
  loader: ({ params }) => {
    const provider = findProvider(params.providerId);
    if (!provider) throw notFound();
    return { provider };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `Enquire — ${loaderData.provider.business} — NexusZim` }]
      : [],
  }),
  component: EnquiryPage,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-2xl text-text">Provider not found</h1>
      <Link to="/search" className="mt-4 inline-block font-sans text-sm text-forest hover:underline">
        Back to directory
      </Link>
    </div>
  ),
});

function EnquiryPage() {
  const { provider } = Route.useLoaderData();
  const { user } = useAuth();

  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [budget, setBudget] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    if (user) {
      const { error: e } = await supabase.from("requests").insert({
        client_id: user.id,
        category_id: provider.category,
        service_name: provider.business,
        title: `Enquiry to ${provider.business}`,
        description: notes,
        city: location || provider.city,
        budget: budget ? Number(budget) : null,
        needed_by: date || null,
        status: "open",
        client_name: name || null,
        client_email: email || null,
        client_phone: phone || null,
        client_whatsapp: phone || null,
      });
      if (e) {
        setError(e.message);
        setSubmitting(false);
        return;
      }
    }
    setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="bg-cream pt-16 min-h-screen grid place-items-center">
        <div className="container-page py-20 text-center max-w-xl mx-auto">
          <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="eyebrow text-text-soft mb-4">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            Enquiry sent
          </p>
          <h1
            className="font-display text-text"
            style={{ fontSize: "clamp(28px, 4vw, 44px)", lineHeight: "1.08", letterSpacing: "-0.02em" }}
          >
            {provider.business} has your details.
          </h1>
          <p className="mt-5 font-sans text-base text-text-soft leading-relaxed">
            They typically respond within{" "}
            <strong className="text-text font-medium">
              {provider.responseTime.replace("Replies in ~", "")}
            </strong>
            . They'll reach out directly to discuss your requirements and agree on a fee.
          </p>
          <div className="mt-6 mx-auto max-w-sm border border-forest/20 bg-forest/5 rounded-[6px] p-5">
            <p className="font-sans text-[13px] text-forest leading-relaxed">
              <strong>You pay the provider directly.</strong> NexusZim never holds money or charges a
              fee. The final rate is whatever you agree with the provider.
            </p>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/search"
              className="bg-gold px-8 py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
            >
              Browse Directory
            </Link>
            <Link
              to="/"
              className="border border-forest px-8 py-3 rounded-[3px] font-sans text-sm font-semibold text-forest hover:bg-forest hover:text-cream transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream pt-16 min-h-screen">
      <div className="container-page pt-8 pb-2">
        <Link
          to="/providers/$providerId"
          params={{ providerId: provider.id }}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-text-soft hover:text-forest transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to profile
        </Link>
      </div>

      <div className="container-page pb-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          {/* Form */}
          <div>
            <p className="eyebrow text-text-soft mb-4">
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
              Direct Enquiry
            </p>
            <h1
              className="font-display text-text mb-2"
              style={{ fontSize: "clamp(28px, 4vw, 44px)", lineHeight: "1.08", letterSpacing: "-0.02em" }}
            >
              Send enquiry to{" "}
              <em className="italic text-forest">{provider.business}</em>
            </h1>
            <p className="font-sans text-[14px] text-text-soft mb-8 max-w-lg">
              Share your requirements. The provider will contact you directly to discuss scope and
              agree on a fee — no payment goes through NexusZim.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Requirements */}
              <div className="bg-cream-raised border border-hairline rounded-[6px] p-6 space-y-5">
                <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-soft">
                  Your requirements
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Preferred date" id="eq-date">
                    <input
                      id="eq-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="field-input"
                    />
                  </Field>
                  <Field label="Location / venue" id="eq-location">
                    <input
                      id="eq-location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={provider.city}
                      className="field-input"
                    />
                  </Field>
                </div>

                <Field label="What do you need?" id="eq-notes">
                  <textarea
                    id="eq-notes"
                    required
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe your requirements — guest count, event type, scope, timeline, anything the provider should know..."
                    className="field-input resize-none"
                  />
                </Field>

                <Field
                  label="Budget range — optional, helps the provider respond accurately"
                  id="eq-budget"
                >
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[12px] text-text-soft pointer-events-none">
                      $
                    </span>
                    <input
                      id="eq-budget"
                      type="number"
                      min={0}
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. 500"
                      className="field-input pl-6"
                    />
                  </div>
                </Field>
              </div>

              {/* Contact */}
              <div className="bg-cream-raised border border-hairline rounded-[6px] p-6 space-y-5">
                <div>
                  <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-soft">
                    Your contact details
                  </h2>
                  <p className="mt-1 font-sans text-[12px] text-text-soft">
                    The provider uses these to reach you directly.
                  </p>
                </div>

                <Field label="Full name" id="eq-name">
                  <input
                    id="eq-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    className="field-input"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone / WhatsApp" id="eq-phone">
                    <input
                      id="eq-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+263..."
                      autoComplete="tel"
                      className="field-input"
                    />
                  </Field>
                  <Field label="Email" id="eq-email">
                    <input
                      id="eq-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="field-input"
                    />
                  </Field>
                </div>
              </div>

              {error && (
                <div role="alert" className="border border-rose-300 bg-rose-50 rounded-[3px] p-4 font-sans text-sm text-rose-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gold py-4 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors disabled:opacity-60"
              >
                {submitting ? "Sending…" : `Send enquiry to ${provider.business}`}
              </button>

              <p className="text-center font-sans text-[12px] text-text-soft">
                NexusZim does not take a fee. You pay the provider directly after agreeing on terms.
              </p>
            </form>
          </div>

          {/* Provider sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <div className="bg-cream-raised border border-hairline rounded-[6px] overflow-hidden">
              <div
                className={`flex items-center justify-center py-10 border-b border-hairline ${provider.avatarColor}`}
              >
                <span className="font-sans text-3xl font-bold tracking-tight">
                  {provider.initials}
                </span>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-display text-xl text-text">{provider.business}</h3>
                  <p className="mt-0.5 font-sans text-[13px] text-text-soft">{provider.name}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Hallmark tier={provider.tier} />
                  <span className="flex items-center gap-1 font-mono text-[11px] text-text-soft">
                    <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                    {provider.city}
                  </span>
                </div>

                <div className="pt-3 border-t border-hairline space-y-2">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-text-soft">
                    <Clock className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                    {provider.responseTime}
                  </div>
                  <p className="font-mono text-[11px] text-text-soft">
                    Starts from{" "}
                    <strong className="text-text">${provider.priceFrom}</strong>
                    <span className="text-text-soft/60"> — final rate agreed directly</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-forest/20 bg-forest/5 rounded-[6px] p-4">
              <p className="font-sans text-[12px] text-forest leading-relaxed">
                <strong>You pay the provider directly.</strong> NexusZim never holds money or charges
                a commission. The starting rate shown is indicative — the final amount is whatever you
                and the provider agree.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-mono text-[9px] font-bold uppercase tracking-widest text-text-soft/70"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
