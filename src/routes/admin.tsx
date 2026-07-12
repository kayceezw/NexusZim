import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { createProviderFn } from "@/lib/create-provider";
import { toast } from "sonner";
import { Plus, Copy, CheckCircle2, X } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — NexusZim" }] }),
  component: () => (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AdminPage />
    </RequireAuth>
  ),
});

function AdminPage() {
  const qc = useQueryClient();

  const { data: providers } = useQuery({
    queryKey: ["admin", "providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_profiles")
        .select("user_id, business_name, city, phone, whatsapp, bio, website, verified, tier, created_at, category_id, categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: clients } = useQuery({
    queryKey: ["admin", "clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, onboarding_completed, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: requests } = useQuery({
    queryKey: ["admin", "requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("id, title, status, city, budget, needed_by, client_name, client_email, client_phone, created_at, categories(name)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const setTier = useMutation({
    mutationFn: async ({ userId, tier }: { userId: string; tier: number }) => {
      const { error } = await supabase
        .from("provider_profiles")
        .update({ tier, verified: tier > 1 })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Provider tier updated");
      qc.invalidateQueries({ queryKey: ["admin", "providers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pending = (providers ?? []).filter((p) => (p.tier ?? 1) === 1);
  const approved = (providers ?? []).filter((p) => (p.tier ?? 1) > 1);

  return (
    <div className="container-page pt-40 pb-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-gold/20 pb-10">

        <div>
          <div className="flex items-center gap-4">
            <span className="h-px w-8 bg-gold/40" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
              Admin Control
            </span>
          </div>
          <h1 className="mt-4 font-display text-5xl font-bold text-foreground">
            Platform <span className="italic text-gold">Overview.</span>
          </h1>
        </div>
        
        <div className="mt-6 md:mt-0 flex flex-wrap gap-3">
          <Link
            to="/admin/intel"
            className="flex items-center gap-3 border border-gold/30 bg-gold/5 px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-white transition-colors"
          >
            Manage Intel
          </Link>
          <Link
            to="/admin/revenue"
            className="flex items-center gap-3 border border-gold/30 bg-gold/5 px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-white transition-colors"
          >
            Revenue
          </Link>
          <Link
            to="/admin/concierge"
            className="flex items-center gap-3 border border-gold/30 bg-gold/5 px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-white transition-colors"
          >
            Concierge
          </Link>
        </div>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Active Clients" value={String(clients?.length ?? "—")} />
        <Tile label="Total Providers" value={String(providers?.length ?? "—")} />
        <Tile label="Pending T1" value={String(pending.length)} />
        <Tile label="Recent Enquiries" value={String(requests?.length ?? "—")} />
      </div>

      <section className="mt-16 border border-gold/20 bg-card p-8">
        <h2 className="font-display text-2xl font-bold text-foreground uppercase tracking-widest">
          Pending Verifications ({pending.length})
        </h2>
        <div className="mt-8 space-y-4">
          {pending.length === 0 && (
            <p className="font-body text-sm text-foreground/40 italic">No providers awaiting tier upgrades.</p>
          )}
          {pending.map((p) => (
            <div
              key={p.user_id}
              className="flex flex-col gap-6 border border-gold/10 bg-background/50 p-6 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <p className="font-display text-xl font-bold text-foreground">{p.business_name}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-gold/60">
                  {(p.categories as { name: string } | null)?.name ?? "No category"} ·{" "}
                  {p.city ?? "—"}
                </p>
                {p.bio && <p className="mt-4 font-body text-sm text-foreground/60 line-clamp-1">{p.bio}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                {[2, 3, 4].map(t => (
                    <button
                        key={t}
                        onClick={() => setTier.mutate({ userId: p.user_id, tier: t })}
                        className={`px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-widest border transition-colors ${
                            t === 2 ? 'border-blue-500/30 text-blue-400 hover:bg-blue-400/10' :
                            t === 3 ? 'border-copper/30 text-copper hover:bg-copper/10' :
                            'border-gold text-gold hover:bg-gold hover:text-white'
                        }`}
                    >
                        Tier {t}
                    </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="border border-gold/20 bg-card p-8">
          <h2 className="font-display text-xl font-bold text-foreground uppercase tracking-widest">Verified Directory</h2>
          <div className="mt-8 space-y-3">
            {approved.length === 0 && <p className="font-body text-sm text-foreground/40 italic">None yet.</p>}
            {approved.map((p) => (
              <div key={p.user_id} className="flex items-center justify-between border border-gold/5 bg-background/30 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-display font-bold text-foreground">{p.business_name}</p>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/40">Tier {p.tier} · {p.city ?? "—"}</p>
                </div>
                <button
                  onClick={() => setTier.mutate({ userId: p.user_id, tier: 1 })}
                  className="font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/30 hover:text-rose-500 transition-colors"
                >
                  Demote
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-gold/20 bg-card p-8">
          <h2 className="font-display text-xl font-bold text-foreground uppercase tracking-widest">Platform Clients</h2>
          <div className="mt-8 space-y-3">
            {(clients ?? []).map((c) => (
              <div key={c.id} className="flex items-center justify-between border border-gold/5 bg-background/30 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-display font-bold text-foreground">{c.full_name || "(no name)"}</p>
                  <p className="truncate font-mono text-[9px] text-foreground/40">{c.email}</p>
                </div>
                <span className={`font-mono text-[9px] font-bold uppercase tracking-widest ${c.onboarding_completed ? "text-emerald-500" : "text-foreground/20"}`}>
                  {c.onboarding_completed ? "Active" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-8 border border-gold/20 bg-card p-8">
        <h2 className="font-display text-xl font-bold text-foreground uppercase tracking-widest">Enquiry Stream</h2>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/60 border-b border-gold/10">
                <th className="pb-4 font-bold">Request Title</th>
                <th className="pb-4 font-bold">Client</th>
                <th className="pb-4 font-bold">Budget</th>
                <th className="pb-4 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {(requests ?? []).map((r) => (
                <tr key={r.id} className="group hover:bg-background/40 transition-colors">
                  <td className="py-4 font-display font-bold text-foreground group-hover:text-gold">{r.title}</td>
                  <td className="py-4">
                    <p className="font-body text-sm text-foreground/70">{r.client_name ?? "—"}</p>
                    <p className="font-mono text-[10px] text-foreground/40">{r.client_email}</p>
                  </td>
                  <td className="py-4 font-mono text-xs text-foreground/80">{r.budget ? `$${r.budget}` : "—"}</td>
                  <td className="py-4 text-right">
                    <span className="border border-gold/20 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-gold/60">
                        {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AddProviderSection />
    </div>
  );
}

/* ─── ADD PROVIDER ─── */

const TIER_OPTIONS = [
  { value: 1, label: "T1 — Listed", color: "text-foreground/40" },
  { value: 2, label: "T2 — Checked", color: "text-blue-400" },
  { value: 3, label: "T3 — Trusted", color: "text-copper" },
  { value: 4, label: "T4 — Elite", color: "text-gold" },
];

const EMPTY_FORM = {
  email: "", businessName: "", categoryId: "",
  city: "", phone: "", whatsapp: "", website: "", bio: "", tier: 2,
};

function AddProviderSection() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState<{ email: string; tempPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("id, name").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!form.email || !form.businessName) {
      toast.error("Email and business name are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createProviderFn({
        data: {
          email: form.email,
          businessName: form.businessName,
          categoryId: form.categoryId || null,
          city: form.city,
          phone: form.phone,
          whatsapp: form.whatsapp,
          website: form.website,
          bio: form.bio,
          tier: form.tier,
        },
      });
      setResult({ email: res.email, tempPassword: res.tempPassword });
      setForm(EMPTY_FORM);
      toast.success(`Provider account created for ${res.email}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function copyCredentials() {
    if (!result) return;
    navigator.clipboard.writeText(`NexusZim Login\nEmail: ${result.email}\nPassword: ${result.tempPassword}\nURL: ${window.location.origin}/login`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="mt-8 border border-gold/20 bg-card p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground uppercase tracking-widest">Add Provider</h2>
          <p className="mt-1 font-body text-xs text-foreground/40">Create an account for a provider you work with directly.</p>
        </div>
        <button
          onClick={() => { setOpen((v) => !v); setResult(null); }}
          className="flex items-center gap-2 bg-gold px-6 py-3 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors"
        >
          {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {open ? "Close" : "New Provider"}
        </button>
      </div>

      {/* Success card */}
      {result && (
        <div className="mt-8 border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-500">
              Provider Account Created
            </p>
          </div>
          <div className="font-mono text-sm space-y-1">
            <p><span className="text-foreground/40">Email:</span> <span className="text-foreground">{result.email}</span></p>
            <p><span className="text-foreground/40">Password:</span> <span className="text-gold font-bold tracking-widest">{result.tempPassword}</span></p>
          </div>
          <p className="font-body text-xs text-foreground/50">Share these credentials with the provider. They can change their password after first login.</p>
          <button
            onClick={copyCredentials}
            className="flex items-center gap-2 border border-gold/30 px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-white transition-colors"
          >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Login Details"}
          </button>
        </div>
      )}

      {open && !result && (
        <div className="mt-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Business Name *" value={form.businessName} onChange={(v) => setForm({ ...form, businessName: v })} placeholder="e.g. Zim Pro Photography" />
            <Field label="Email Address *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="provider@email.com" />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+263 77 123 4567" />
            <Field label="WhatsApp" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} placeholder="+263 77 123 4567" />

            <div>
              <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/40 mb-2">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full bg-background border border-gold/20 p-3 font-body text-sm text-foreground outline-none focus:border-gold"
              >
                <option value="">— Select category —</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/40 mb-2">Verification Tier</label>
              <select
                value={form.tier}
                onChange={(e) => setForm({ ...form, tier: Number(e.target.value) })}
                className="w-full bg-background border border-gold/20 p-3 font-body text-sm text-foreground outline-none focus:border-gold"
              >
                {TIER_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="Harare, Bulawayo, etc." />
            <Field label="Website / Portfolio URL" value={form.website} onChange={(v) => setForm({ ...form, website: v })} placeholder="https://..." />
          </div>

          <div>
            <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/40 mb-2">Bio / Description</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              placeholder="Brief description of what this provider does…"
              className="w-full bg-background border border-gold/20 p-3 font-body text-sm text-foreground outline-none focus:border-gold resize-none placeholder:text-foreground/20"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-gold px-10 py-4 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating Account…" : "Create Provider Account"}
          </button>
        </div>
      )}
    </section>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/40 mb-2">{label}</label>
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

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gold/20 bg-card p-8">
      <p className="font-display text-4xl font-bold text-gold">{value}</p>
      <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/40">{label}</p>
    </div>
  );
}
