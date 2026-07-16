import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCart, type CartItem } from "@/hooks/use-cart";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your brief — NexusZim" }] }),
  component: CartPage,
});

const CITIES = ["Harare", "Bulawayo", "Mutare", "Gweru", "Masvingo", "Victoria Falls", "Other"];

function CartPage() {
  const { items, remove, updateNotes, clear } = useCart();
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [city, setCity] = useState("Harare");
  const [neededBy, setNeededBy] = useState("");
  const [budget, setBudget] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function placeOrder() {
    if (items.length === 0) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (!hasRole("client")) {
      setError("Only client accounts can place orders.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const [{ data: profile }, { data: clientProfile }] = await Promise.all([
      supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle(),
      supabase.from("client_profiles").select("phone").eq("user_id", user.id).maybeSingle(),
    ]);

    const rows = items.map((item: CartItem) => ({
      client_id: user.id,
      category_id: item.categoryId,
      service_id: item.serviceId,
      service_name: item.serviceName,
      title: item.serviceName,
      description: item.notes ?? null,
      city,
      budget: budget ? Number(budget) : (item.basePrice ?? null),
      needed_by: neededBy || null,
      status: "open" as const,
      client_name: profile?.full_name ?? null,
      client_email: profile?.email ?? user.email ?? null,
      client_phone: clientProfile?.phone ?? null,
      client_whatsapp: clientProfile?.phone ?? null,
    }));

    const { error: e } = await supabase.from("requests").insert(rows);
    setSubmitting(false);
    if (e) {
      setError(e.message);
      return;
    }
    clear();
    navigate({ to: "/dashboard" });
  }

  if (items.length === 0) {
    return (
      <div className="bg-cream pt-16 min-h-screen grid place-items-center">
        <div className="container-page max-w-lg py-20 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-[6px] bg-cream-raised border border-hairline flex items-center justify-center">
              <span className="font-mono text-text-soft/30 text-2xl">00</span>
            </div>
          </div>
          <p className="eyebrow text-text-soft mb-3">
            <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
            Enquiry brief
          </p>
          <h1 className="font-display text-3xl text-text mb-3">Brief is empty.</h1>
          <p className="font-sans text-sm text-text-soft leading-relaxed mb-10 max-w-sm mx-auto">
            Browse service categories to add what you need, then submit your brief to get responses
            from verified providers.
          </p>
          <Link
            to="/categories"
            className="bg-gold px-9 py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
          >
            Browse Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream pt-16 min-h-screen">
      {/* Forest header */}
      <div className="bg-forest border-b border-cream/10">
        <div className="container-page py-10">
          <p className="eyebrow text-cream/40 mb-3">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            Enquiry brief
          </p>
          <h1 className="font-display text-2xl text-cream">
            Review your <em className="italic text-gold">Brief.</em>
          </h1>
          <p className="mt-3 font-sans text-sm text-cream/60 leading-relaxed max-w-xl">
            Providers matching your requirements will contact you directly. No payment goes through
            NexusZim.
          </p>
        </div>
      </div>

      <div className="container-page py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px] items-start">
          {/* Item list */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-cream-raised border border-hairline rounded-[6px] p-6 md:p-8 transition-all hover:border-forest"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-text-soft">
                      {item.categoryName}
                      {item.isCustom && (
                        <span className="ml-3 border border-gold/30 bg-gold/5 px-2 py-0.5 text-[9px] text-gold">
                          Bespoke
                        </span>
                      )}
                    </p>
                    <h3 className="mt-3 font-display text-xl text-text">{item.serviceName}</h3>
                  </div>
                  <div className="text-right shrink-0">
                    {item.basePrice != null && (
                      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-soft/60">
                        From ${Number(item.basePrice).toFixed(0)}
                      </p>
                    )}
                    <button
                      onClick={() => remove(item.id)}
                      className="mt-2 font-mono text-[9px] uppercase tracking-widest text-text-soft/40 hover:text-rose-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <textarea
                  value={item.notes ?? ""}
                  onChange={(e) => updateNotes(item.id, e.target.value)}
                  placeholder="Provide details: dates, scope, guest count, technical requirements..."
                  rows={3}
                  className="mt-6 field-input resize-none"
                />
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="bg-cream-raised border border-hairline rounded-[6px] p-6 lg:sticky lg:top-24 space-y-5">
            <p className="eyebrow text-text-soft">
              <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
              Brief details
            </p>

            <CartField label="City">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="field-input"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </CartField>

            <CartField label="Date needed">
              <input
                type="date"
                value={neededBy}
                onChange={(e) => setNeededBy(e.target.value)}
                className="field-input"
              />
            </CartField>

            <CartField label="Budget (USD)" hint="optional">
              <input
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 500"
                className="field-input"
              />
            </CartField>

            <div className="border border-forest/20 bg-forest/5 rounded-[3px] p-4">
              <p className="font-sans text-[12px] text-forest leading-relaxed">
                <strong>You pay providers directly.</strong> NexusZim never holds money or charges a
                fee.
              </p>
            </div>

            {error && (
              <div role="alert" className="border border-rose-200 bg-rose-50 rounded-[3px] p-4 font-sans text-[13px] text-rose-600">
                {error}
              </div>
            )}

            {!user ? (
              <Link
                to="/login"
                className="block w-full bg-gold py-3.5 text-center rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
              >
                Log in to send brief
              </Link>
            ) : (
              <button
                onClick={placeOrder}
                disabled={submitting}
                className="w-full bg-gold py-3.5 text-center rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors disabled:opacity-60"
              >
                {submitting ? "Sending brief…" : "Send enquiry brief"}
              </button>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function CartField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">
        {label}
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
