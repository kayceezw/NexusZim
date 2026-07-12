import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/admin/revenue")({
  head: () => ({ meta: [{ title: "Admin Revenue — NexusZim" }] }),
  component: () => (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AdminRevenuePage />
    </RequireAuth>
  ),
});

const PLAN_COLORS: Record<string, string> = {
  basic: "text-foreground/40 border-foreground/20",
  pro: "text-blue-400 border-blue-400/40",
  business: "text-gold border-gold/40",
};

function AdminRevenuePage() {
  const qc = useQueryClient();

  const { data: subscriptions } = useQuery({
    queryKey: ["admin", "revenue", "subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("id, plan, status, payment_confirmed_by, confirmed_at, created_at, provider_id, provider_profiles(business_name, city)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: featured } = useQuery({
    queryKey: ["admin", "revenue", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_listings")
        .select("id, position, active_from, active_to, provider_id, category_id, provider_profiles(business_name), categories(name)")
        .order("active_from", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const confirmPayment = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "active", payment_confirmed_by: user?.id ?? null, confirmed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment confirmed");
      qc.invalidateQueries({ queryKey: ["admin", "revenue"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pending = (subscriptions ?? []).filter((s) => s.status === "pending" || !s.payment_confirmed_by);
  const active = (subscriptions ?? []).filter((s) => s.status === "active" && s.payment_confirmed_by);

  const totalActive = active.length;
  const proCount = (subscriptions ?? []).filter((s) => s.plan === "pro" && s.payment_confirmed_by).length;
  const bizCount = (subscriptions ?? []).filter((s) => s.plan === "business" && s.payment_confirmed_by).length;
  const mrr = proCount * 15 + bizCount * 40;

  return (
    <div className="container-page pt-40 pb-20">
      <div className="border-b border-gold/20 pb-10">
        <div className="flex items-center gap-4">
          <span className="h-px w-8 bg-gold/40" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
            Admin · Revenue
          </span>
        </div>
        <h1 className="mt-4 font-display text-5xl font-bold text-foreground">
          Revenue <span className="italic text-gold">Dashboard.</span>
        </h1>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Active Subscriptions" value={String(totalActive)} />
        <Tile label="Est. MRR (USD)" value={`$${mrr}`} />
        <Tile label="Pro Plans" value={String(proCount)} />
        <Tile label="Business Plans" value={String(bizCount)} />
      </div>

      {/* Pending Confirmations */}
      <section className="mt-16 border border-gold/20 bg-card p-8">
        <h2 className="font-display text-2xl font-bold text-foreground uppercase tracking-widest">
          Awaiting Payment Confirmation ({pending.length})
        </h2>
        <p className="mt-2 font-body text-xs text-foreground/40">
          Providers who've signed up for a paid plan — confirm once EcoCash/bank transfer is received.
        </p>
        <div className="mt-8 space-y-4">
          {pending.length === 0 && (
            <p className="font-body text-sm text-foreground/30 italic">No pending confirmations.</p>
          )}
          {pending.map((s) => {
            const prof = s.provider_profiles as { business_name: string; city: string | null } | null;
            return (
              <div key={s.id} className="flex flex-col gap-4 border border-gold/10 bg-background/50 p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-display text-xl font-bold text-foreground">{prof?.business_name ?? s.provider_id}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                    {prof?.city ?? "—"} · Registered {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${PLAN_COLORS[s.plan] ?? "text-foreground/40 border-foreground/20"}`}>
                    {s.plan}
                  </span>
                  <button
                    onClick={() => confirmPayment.mutate(s.id)}
                    disabled={confirmPayment.isPending}
                    className="flex items-center gap-2 bg-gold px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Confirm Payment
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Active Subscriptions */}
      <section className="mt-8 border border-gold/20 bg-card p-8">
        <h2 className="font-display text-xl font-bold text-foreground uppercase tracking-widest">
          Active Subscriptions
        </h2>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/60 border-b border-gold/10">
                <th className="pb-4 font-bold">Provider</th>
                <th className="pb-4 font-bold">Plan</th>
                <th className="pb-4 font-bold">Confirmed</th>
                <th className="pb-4 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {active.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 font-body text-sm text-foreground/30 italic text-center">
                    No active subscriptions yet.
                  </td>
                </tr>
              )}
              {active.map((s) => {
                const prof = s.provider_profiles as { business_name: string } | null;
                return (
                  <tr key={s.id} className="hover:bg-background/40 transition-colors">
                    <td className="py-4 font-display font-bold text-foreground">{prof?.business_name ?? s.provider_id}</td>
                    <td className="py-4">
                      <span className={`border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${PLAN_COLORS[s.plan] ?? ""}`}>
                        {s.plan}
                      </span>
                    </td>
                    <td className="py-4 font-mono text-[10px] text-foreground/40">
                      {s.confirmed_at ? new Date(s.confirmed_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-4 text-right">
                      <span className="flex items-center justify-end gap-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-500">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="mt-8 border border-gold/20 bg-card p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-xl font-bold text-foreground uppercase tracking-widest">
            Featured Listings
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/60 border-b border-gold/10">
                <th className="pb-4 font-bold">Provider</th>
                <th className="pb-4 font-bold">Category</th>
                <th className="pb-4 font-bold">Position</th>
                <th className="pb-4 font-bold text-right">Window</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {(featured ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 font-body text-sm text-foreground/30 italic text-center">
                    No featured listings yet.
                  </td>
                </tr>
              )}
              {(featured ?? []).map((f) => {
                const prof = f.provider_profiles as { business_name: string } | null;
                const cat = f.categories as { name: string } | null;
                const isActive = !f.active_to || new Date(f.active_to) >= new Date();
                return (
                  <tr key={f.id} className="hover:bg-background/40 transition-colors">
                    <td className="py-4 font-display font-bold text-foreground">{prof?.business_name ?? f.provider_id}</td>
                    <td className="py-4 font-mono text-[10px] text-foreground/60 uppercase">{cat?.name ?? "—"}</td>
                    <td className="py-4 font-mono text-[10px] text-foreground/60">#{f.position ?? "—"}</td>
                    <td className="py-4 text-right">
                      <span className={`flex items-center justify-end gap-1.5 font-mono text-[9px] font-bold uppercase tracking-widest ${isActive ? "text-gold" : "text-foreground/20"}`}>
                        {isActive ? (
                          <><CheckCircle2 className="h-3 w-3" />Active</>
                        ) : (
                          <><Clock className="h-3 w-3" />Expired</>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gold/20 bg-card p-8">
      <p className="font-display text-4xl font-bold text-gold">{value}</p>
      <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/40">{label}</p>
    </div>
  );
}
