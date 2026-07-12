import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCart, type CartItem } from "@/hooks/use-cart";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your cart — NexusZim" }] }),
  component: CartPage,
});

const CITIES = ["Harare", "Bulawayo", "Mutare", "Gweru", "Masvingo", "Victoria Falls", "Other"];

function CartPage() {
  const { items, remove, updateNotes, clear, total } = useCart();
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

    // Snapshot client contact so matched providers can reach out directly
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
      budget: budget ? Number(budget) : item.basePrice ?? null,
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
      <div className="bg-background pt-24 min-h-screen grid place-items-center">
        <div className="container-page py-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center bg-gold/5 border border-gold/10 mb-8">
            <span className="font-mono text-gold/20 text-3xl font-bold">00</span>
          </div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-gold/60">
            Mission Brief
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold text-foreground">Cart is Empty.</h1>
          <p className="mt-6 font-body text-lg font-light text-foreground/40 max-w-md mx-auto">
            Your mission brief is currently empty. Initialize a search to find verified fixers.
          </p>
          <Link
            to="/categories"
            className="mt-12 inline-block bg-gold px-10 py-4 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors"
          >
            Access Network
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background pt-24 min-h-screen">
      <div className="container-page py-12 md:py-20">
        <div className="flex items-center gap-4">
            <span className="h-px w-8 bg-gold/40" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
                Mission Briefing
            </span>
        </div>
        <h1 className="mt-4 font-display text-5xl font-bold text-foreground md:text-6xl">
            Review your <span className="italic text-gold">Brief.</span>
        </h1>
        <p className="mt-6 font-body text-lg font-light text-foreground/60">
            Each item in your brief will be broadcast to our verified network in that domain.
        </p>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="border border-gold/10 bg-card p-8 md:p-10 transition-all hover:border-gold/30">
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold/60">
                      {item.categoryName}
                      {item.isCustom && <span className="ml-3 border border-gold/20 px-2 py-0.5 text-[9px] font-bold text-gold bg-gold/5">Bespoke</span>}
                    </p>
                    <h3 className="mt-4 font-display text-2xl font-bold text-foreground">{item.serviceName}</h3>
                  </div>
                  <div className="text-right">
                    {item.basePrice != null ? (
                      <p className="font-display text-2xl font-bold text-foreground">${Number(item.basePrice).toFixed(0)}</p>
                    ) : (
                      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold/40">Audit Pending</p>
                    )}
                    <button
                      onClick={() => remove(item.id)}
                      className="mt-4 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-rose-500 transition-colors"
                    >
                      Remove Item
                    </button>
                  </div>
                </div>
                <textarea
                  value={item.notes ?? ""}
                  onChange={(e) => updateNotes(item.id, e.target.value)}
                  placeholder="Provide operational details: dates, scope, guest count, or specific technical requirements..."
                  rows={3}
                  className="mt-8 w-full bg-background border border-gold/10 p-4 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20 resize-none"
                />
              </div>
            ))}
          </div>

          <aside className="border border-gold/20 bg-card p-10 h-fit lg:sticky lg:top-32">
            <h2 className="font-display text-2xl font-bold text-foreground uppercase tracking-widest">Op Specs</h2>
            <div className="mt-10 space-y-8">
              <Field label="Mission City">
                <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-background border border-gold/20 p-4 font-mono text-[11px] font-bold uppercase tracking-widest text-foreground outline-none focus:border-gold">
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Target Date">
                <input
                  type="date"
                  value={neededBy}
                  onChange={(e) => setNeededBy(e.target.value)}
                  className="w-full bg-background border border-gold/20 p-4 font-mono text-[11px] font-bold uppercase tracking-widest text-foreground outline-none focus:border-gold"
                />
              </Field>
              <Field label="Override Budget (USD)">
                <input
                  type="number"
                  min={0}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Standard Base Rates"
                  className="w-full bg-background border border-gold/20 p-4 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20"
                />
              </Field>
            </div>

            <div className="mt-12 flex items-center justify-between border-t border-gold/10 pt-8">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/40">Est. Engagement</span>
              <span className="font-display text-4xl font-bold text-gold">${total.toFixed(0)}</span>
            </div>

            {error && (
              <div className="mt-8 border border-rose-500/30 bg-rose-500/5 p-4 font-body text-xs text-rose-500 italic">
                {error}
              </div>
            )}

            {!user ? (
              <Link
                to="/login"
                className="mt-10 block w-full bg-gold py-5 text-center font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors"
              >
                Authenticate to Deploy
              </Link>
            ) : (
              <button
                onClick={placeOrder}
                disabled={submitting}
                className="mt-10 block w-full bg-gold py-5 text-center font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors disabled:opacity-60"
              >
                {submitting ? "Deploying Brief..." : "Submit Mission Brief"}
              </button>
            )}

            <p className="mt-8 text-center font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/30 leading-relaxed">
              Matched fixers will reach out with bespoke proposals. No upfront payment required.
            </p>
          </aside>
        </div>
      </div>
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
      <label className="mb-3 block font-mono text-[9px] font-bold uppercase tracking-widest text-gold/60">
        {label}
      </label>
      {children}
    </div>
  );
}
