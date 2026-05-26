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
      <div className="container-page grid min-h-[60vh] place-items-center py-16">
        <div className="max-w-md text-center">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            Your cart
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold">Cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse a category and add the services you need.
          </p>
          <Link
            to="/categories"
            className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-accent"
          >
            Browse categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-14">
      <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-gold">
        Your cart
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
        Review and place your order
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Each item becomes an open request that every provider in that category will see.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {item.categoryName}
                    {item.isCustom && <span className="ml-2 rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold">Custom</span>}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold">{item.serviceName}</h3>
                </div>
                <div className="text-right">
                  {item.basePrice != null ? (
                    <p className="font-display text-lg font-bold">${Number(item.basePrice).toFixed(0)}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Quoted</p>
                  )}
                  <button
                    onClick={() => remove(item.id)}
                    className="mt-2 text-xs text-muted-foreground underline hover:text-destructive"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <textarea
                value={item.notes ?? ""}
                onChange={(e) => updateNotes(item.id, e.target.value)}
                placeholder="Add details for providers (date, location, guest count, etc.)"
                rows={2}
                className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none"
              />
            </div>
          ))}
        </div>

        <aside className="rounded-2xl border border-border bg-surface p-6 lg:sticky lg:top-24 h-fit">
          <h2 className="font-display text-lg font-semibold">Order details</h2>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">City</span>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="input">
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Needed by</span>
              <input
                type="date"
                value={neededBy}
                onChange={(e) => setNeededBy(e.target.value)}
                className="input"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Budget per item (USD, optional)</span>
              <input
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Use service base price"
                className="input"
              />
            </label>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Estimated total</span>
            <span className="font-display text-xl font-bold">${total.toFixed(0)}</span>
          </div>

          {error && (
            <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {!user ? (
            <Link
              to="/login"
              className="mt-5 block w-full rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-accent"
            >
              Log in to place order
            </Link>
          ) : (
            <button
              onClick={placeOrder}
              disabled={submitting}
              className="mt-5 block w-full rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-accent disabled:opacity-60"
            >
              {submitting ? "Placing order..." : `Place order (${items.length} request${items.length === 1 ? "" : "s"})`}
            </button>
          )}

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Providers will respond with quotes you can review and book.
          </p>
        </aside>
      </div>
      <style>{`
        .input { width: 100%; border-radius: 0.625rem; border: 1px solid var(--border); background: var(--background); padding: 0.65rem 0.85rem; font-size: 0.875rem; }
        .input:focus { border-color: var(--ring); outline: none; }
      `}</style>
    </div>
  );
}
