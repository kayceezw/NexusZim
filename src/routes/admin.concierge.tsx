import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/admin/concierge")({
  head: () => ({ meta: [{ title: "Concierge Mode — NexusZim" }] }),
  component: () => (
    <RequireAuth roles={["admin", "super_admin"]}>
      <ConciergeMode />
    </RequireAuth>
  ),
});

/* ─── TYPES ─── */
type Package = {
  id: string;
  name: string;
  event_type: string | null;
  provider_ids: string[];
  commission_pct: number | null;
  description: string | null;
  created_at: string;
};
type Deal = {
  id: string;
  package_id: string | null;
  client_name: string;
  event_date: string | null;
  value: number | null;
  commission_earned: number | null;
  notes: string | null;
  created_at: string;
};

/* ─── FORMS ─── */
const EMPTY_PKG = {
  name: "",
  event_type: "",
  provider_ids_raw: "",
  commission_pct: "",
  description: "",
};
const EMPTY_DEAL = {
  package_id: "",
  client_name: "",
  event_date: "",
  value: "",
  commission_earned: "",
  notes: "",
};

function ConciergeMode() {
  const [activeTab, setActiveTab] = useState<"packages" | "deals">("packages");

  return (
    <div className="container-page pt-32 pb-14">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-gold/20 pb-10">
        <div>
          <div className="flex items-center gap-4">
            <span className="h-px w-8 bg-gold/40" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
              Operator Only
            </span>
          </div>
          <h1 className="mt-4 font-display text-5xl font-bold text-foreground">
            Concierge <span className="italic text-gold">Mode.</span>
          </h1>
          <p className="mt-4 max-w-xl font-body text-base text-foreground/60">
            Create managed packages, track brokered deals, and log off-platform commissions.
          </p>
        </div>
      </div>

      <div className="mt-12 flex gap-8 border-b border-foreground/5 pb-6">
        {(["packages", "deals"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
              activeTab === t ? "text-gold" : "text-foreground/40 hover:text-foreground"
            }`}
          >
            {t === "packages" ? "Managed Packages" : "Brokered Deals"}
          </button>
        ))}
      </div>

      <div className="py-12">{activeTab === "packages" ? <PackagesTab /> : <DealsTab />}</div>
    </div>
  );
}

/* ─── PACKAGES TAB ─── */

function PackagesTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_PKG);

  const { data: packages } = useQuery<Package[]>({
    queryKey: ["admin", "concierge", "packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operator_packages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Package[];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const ids = form.provider_ids_raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const { error } = await supabase.from("operator_packages").insert([
        {
          name: form.name,
          event_type: form.event_type || null,
          provider_ids: ids,
          commission_pct: form.commission_pct ? parseFloat(form.commission_pct) : null,
          description: form.description || null,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Package created");
      setForm(EMPTY_PKG);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "concierge", "packages"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("operator_packages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Package deleted");
      qc.invalidateQueries({ queryKey: ["admin", "concierge", "packages"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground uppercase tracking-widest">
          Managed Packages ({packages?.length ?? 0})
        </h2>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 bg-gold px-6 py-3 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Package
        </button>
      </div>

      {open && (
        <div className="border border-gold/30 bg-card p-8 space-y-6">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
            New Managed Package
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Package Name *"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="e.g. Corporate Dinner Package"
            />
            <Field
              label="Event Type"
              value={form.event_type}
              onChange={(v) => setForm({ ...form, event_type: v })}
              placeholder="e.g. Corporate, Wedding, VIP"
            />
            <Field
              label="Commission %"
              type="number"
              value={form.commission_pct}
              onChange={(v) => setForm({ ...form, commission_pct: v })}
              placeholder="e.g. 15"
            />
            <Field
              label="Provider IDs (comma-separated)"
              value={form.provider_ids_raw}
              onChange={(v) => setForm({ ...form, provider_ids_raw: v })}
              placeholder="uuid1, uuid2, uuid3"
            />
          </div>
          <Field
            label="Description"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            placeholder="Brief description of what's included…"
          />
          <div className="flex gap-4">
            <button
              onClick={() => add.mutate()}
              disabled={!form.name || add.isPending}
              className="bg-gold px-8 py-3 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors disabled:opacity-50"
            >
              {add.isPending ? "Saving…" : "Create Package"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-6 py-3 font-mono text-xs text-foreground/40 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {(packages ?? []).length === 0 && !open && (
        <p className="font-body text-sm text-foreground/30 italic">
          No packages yet. Create one above.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(packages ?? []).map((pkg) => (
          <div
            key={pkg.id}
            className="border border-gold/10 bg-card p-8 group hover:border-gold/30 relative"
          >
            <button
              onClick={() => del.mutate(pkg.id)}
              className="absolute top-4 right-4 text-foreground/20 hover:text-rose-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="font-mono text-[10px] text-gold uppercase tracking-widest">
              {pkg.event_type ?? "General"}
            </p>
            <h3 className="mt-4 font-display text-xl font-bold text-foreground">{pkg.name}</h3>
            {pkg.description && (
              <p className="mt-3 font-body text-xs text-foreground/50 leading-relaxed line-clamp-2">
                {pkg.description}
              </p>
            )}
            <div className="mt-8 space-y-4">
              <Row label="Providers" value={String(pkg.provider_ids.length)} />
              <Row
                label="Commission"
                value={pkg.commission_pct != null ? `${pkg.commission_pct}%` : "—"}
                gold
              />
              <Row label="Created" value={new Date(pkg.created_at).toLocaleDateString()} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── DEALS TAB ─── */

function DealsTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_DEAL);

  const { data: deals } = useQuery<Deal[]>({
    queryKey: ["admin", "concierge", "deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brokered_deals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Deal[];
    },
  });

  const { data: packages } = useQuery<Package[]>({
    queryKey: ["admin", "concierge", "packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operator_packages")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return (data ?? []) as Package[];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("brokered_deals").insert([
        {
          package_id: form.package_id || null,
          client_name: form.client_name,
          event_date: form.event_date || null,
          value: form.value ? parseFloat(form.value) : null,
          commission_earned: form.commission_earned ? parseFloat(form.commission_earned) : null,
          notes: form.notes || null,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deal logged");
      setForm(EMPTY_DEAL);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "concierge", "deals"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("brokered_deals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deal removed");
      qc.invalidateQueries({ queryKey: ["admin", "concierge", "deals"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const totalCommission = (deals ?? []).reduce((sum, d) => sum + (d.commission_earned ?? 0), 0);
  const totalValue = (deals ?? []).reduce((sum, d) => sum + (d.value ?? 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground uppercase tracking-widest">
          Brokered Deals ({deals?.length ?? 0})
        </h2>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 bg-gold px-6 py-3 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
          Log Deal
        </button>
      </div>

      {open && (
        <div className="border border-gold/30 bg-card p-8 space-y-6">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
            Log Brokered Deal
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Client Name *"
              value={form.client_name}
              onChange={(v) => setForm({ ...form, client_name: v })}
            />
            <div>
              <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/40 mb-2">
                Package (optional)
              </label>
              <select
                value={form.package_id}
                onChange={(e) => setForm({ ...form, package_id: e.target.value })}
                className="w-full bg-background border border-gold/20 p-3 font-body text-sm text-foreground outline-none focus:border-gold"
              >
                <option value="">— None —</option>
                {(packages ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <Field
              label="Event Date"
              type="date"
              value={form.event_date}
              onChange={(v) => setForm({ ...form, event_date: v })}
            />
            <Field
              label="Deal Value (USD)"
              type="number"
              value={form.value}
              onChange={(v) => setForm({ ...form, value: v })}
              placeholder="e.g. 3500"
            />
            <Field
              label="Commission Earned (USD)"
              type="number"
              value={form.commission_earned}
              onChange={(v) => setForm({ ...form, commission_earned: v })}
              placeholder="e.g. 525"
            />
            <Field
              label="Notes"
              value={form.notes}
              onChange={(v) => setForm({ ...form, notes: v })}
              placeholder="Any context on this deal…"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => add.mutate()}
              disabled={!form.client_name || add.isPending}
              className="bg-gold px-8 py-3 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors disabled:opacity-50"
            >
              {add.isPending ? "Saving…" : "Log Deal"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-6 py-3 font-mono text-xs text-foreground/40 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Stat label="Total Commission" value={`$${totalCommission.toFixed(0)}`} />
        <Stat label="Total Deal Value" value={`$${totalValue.toFixed(0)}`} />
        <Stat label="Active Deals" value={String((deals ?? []).length)} />
      </div>

      <div className="overflow-x-auto">
        {(deals ?? []).length === 0 && (
          <p className="font-body text-sm text-foreground/30 italic">No deals logged yet.</p>
        )}
        {(deals ?? []).length > 0 && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gold/20 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
                <th className="pb-4 pt-2 font-bold">Client / Date</th>
                <th className="pb-4 pt-2 font-bold">Package</th>
                <th className="pb-4 pt-2 font-bold text-center">Value</th>
                <th className="pb-4 pt-2 font-bold text-center">Commission</th>
                <th className="pb-4 pt-2 font-bold text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {(deals ?? []).map((deal) => {
                const pkg = (packages ?? []).find((p) => p.id === deal.package_id);
                return (
                  <tr key={deal.id} className="group hover:bg-card/50 transition-colors">
                    <td className="py-6">
                      <p className="font-display text-lg font-bold text-foreground">
                        {deal.client_name}
                      </p>
                      <p className="font-mono text-[10px] text-foreground/40">
                        {deal.event_date ?? "No date"}
                      </p>
                    </td>
                    <td className="py-6">
                      <span className="font-body text-sm text-foreground/80">
                        {pkg?.name ?? "—"}
                      </span>
                      {deal.notes && (
                        <p className="mt-1 font-mono text-[9px] text-foreground/30 line-clamp-1">
                          {deal.notes}
                        </p>
                      )}
                    </td>
                    <td className="py-6 text-center">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {deal.value != null ? `$${deal.value.toFixed(0)}` : "—"}
                      </span>
                    </td>
                    <td className="py-6 text-center">
                      <span className="font-mono text-xs font-bold text-gold">
                        {deal.commission_earned != null
                          ? `$${deal.commission_earned.toFixed(0)}`
                          : "—"}
                      </span>
                    </td>
                    <td className="py-6 text-right">
                      <button
                        onClick={() => del.mutate(deal.id)}
                        className="text-foreground/20 hover:text-rose-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ─── SHARED ─── */

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/40 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-background border border-gold/20 p-3 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20"
      />
    </div>
  );
}

function Row({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-foreground/5 pb-2 text-xs last:border-0 last:pb-0">
      <span className="font-mono text-foreground/40 uppercase">{label}</span>
      <span className={`font-bold ${gold ? "text-gold" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gold/10 bg-card p-8">
      <p className="font-mono text-[10px] text-foreground/40 uppercase tracking-widest">{label}</p>
      <p className="mt-4 font-display text-4xl font-bold text-gold">{value}</p>
    </div>
  );
}
