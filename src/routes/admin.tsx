import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { RequireAuth } from "@/components/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { createProviderFn } from "@/lib/create-provider";
import { toast } from "sonner";
import { Plus, Copy, CheckCircle2, X, Mail, AlertTriangle, CheckCheck, XCircle } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — NexusZim" }] }),
  component: () => (
    <RequireAuth roles={["admin", "super_admin"]}>
      <AdminPage />
    </RequireAuth>
  ),
});

type AdminTab = "pending" | "verified" | "clients" | "enquiries";

function AdminPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminTab>("pending");

  const { data: providers } = useQuery({
    queryKey: ["admin", "providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_profiles")
        .select(
          "user_id, business_name, city, phone, whatsapp, bio, website, verified, tier, created_at, category_id, categories(name), profiles(email)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 30_000, // auto-refresh every 30s to catch new signups
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
        .select(
          "id, title, status, city, budget, needed_by, client_name, client_email, client_phone, created_at, categories(name)",
        )
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
      toast.success("Provider updated");
      qc.invalidateQueries({ queryKey: ["admin", "providers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Reject: demote to tier 1, mark not verified
  const rejectProvider = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("provider_profiles")
        .update({ tier: 1, verified: false })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Provider application rejected");
      qc.invalidateQueries({ queryKey: ["admin", "providers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function sendPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success(`Password reset email sent to ${email}`);
  }

  // Pending = tier 1 (Listed, not yet upgraded by admin) and not yet verified
  const pending = (providers ?? []).filter((p) => (p.tier ?? 1) === 1 && !p.verified);
  const approved = (providers ?? []).filter((p) => (p.tier ?? 1) > 1 || p.verified);
  const pendingCount = pending.length;

  const TABS: { id: AdminTab; label: string; badge?: number }[] = [
    { id: "pending", label: "Pending Verification", badge: pendingCount },
    { id: "verified", label: "Verified Directory" },
    { id: "clients", label: "Clients" },
    { id: "enquiries", label: "Enquiry Stream" },
  ];

  return (
    <div className="bg-cream pt-16 min-h-screen animate-page-enter">
      {/* Forest header */}
      <div className="bg-forest border-b border-cream/10">
        <div className="container-page py-10">
          <p className="eyebrow text-cream/40 mb-3">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            Admin control
          </p>
          <h1 className="font-display text-3xl text-cream">
            Platform <em className="italic text-gold">Overview.</em>
          </h1>

          {/* Nav links */}
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/admin/intel"
              className="border border-cream/20 px-5 py-2.5 rounded-[3px] font-mono text-[10px] uppercase tracking-widest text-cream/70 hover:border-cream/50 hover:text-cream transition-colors"
            >
              Manage Intel
            </Link>
            <Link
              to="/admin/revenue"
              className="border border-cream/20 px-5 py-2.5 rounded-[3px] font-mono text-[10px] uppercase tracking-widest text-cream/70 hover:border-cream/50 hover:text-cream transition-colors"
            >
              Revenue
            </Link>
            <Link
              to="/admin/concierge"
              className="border border-cream/20 px-5 py-2.5 rounded-[3px] font-mono text-[10px] uppercase tracking-widest text-cream/70 hover:border-cream/50 hover:text-cream transition-colors"
            >
              Concierge
            </Link>
          </div>
        </div>
      </div>

      <div className="container-page py-8 space-y-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="Active Clients" value={String(clients?.length ?? "—")} />
          <Tile label="Total Providers" value={String(providers?.length ?? "—")} />
          <Tile
            label="Pending Review"
            value={String(pendingCount)}
            highlight={pendingCount > 0}
          />
          <Tile label="Recent Enquiries" value={String(requests?.length ?? "—")} />
        </div>

        {/* Amber alert banner if pending providers exist */}
        {pendingCount > 0 && (
          <div className="flex items-start gap-4 bg-amber-50 border border-amber-300 rounded-[6px] px-5 py-4 animate-fade-in">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-amber-700 mb-1">
                Action required
              </p>
              <p className="font-sans text-sm text-amber-800">
                <span className="font-semibold">{pendingCount} provider{pendingCount !== 1 ? "s" : ""}</span>{" "}
                {pendingCount === 1 ? "has" : "have"} submitted an application and{" "}
                {pendingCount === 1 ? "is" : "are"} awaiting verification. Review and approve or reject below.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("pending")}
              className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-[3px] font-mono text-[9px] uppercase tracking-widest transition-colors"
            >
              Review
            </button>
          </div>
        )}

        {/* Tab navigation */}
        <div className="border-b border-hairline flex gap-0 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 font-mono text-[10px] uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-forest text-forest"
                  : "border-transparent text-text-soft hover:text-text"
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-amber-500 text-white font-mono text-[9px] font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── TAB: PENDING VERIFICATIONS ─── */}
        {activeTab === "pending" && (
          <section className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-text">
                Pending Verifications
                {pendingCount > 0 && (
                  <span className="ml-3 inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-500 text-white font-mono text-[10px] font-bold">
                    {pendingCount}
                  </span>
                )}
              </h2>
            </div>

            {pending.length === 0 ? (
              <div className="border border-dashed border-hairline rounded-[6px] p-12 text-center bg-cream-raised">
                <CheckCheck className="h-8 w-8 text-emerald-400 mx-auto mb-3" strokeWidth={1.5} />
                <p className="font-display text-lg text-text">All clear</p>
                <p className="mt-1 font-sans text-sm text-text-soft">
                  No providers awaiting verification.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map((p) => {
                  const email = (p.profiles as { email: string } | null)?.email ?? null;
                  return (
                    <div
                      key={p.user_id}
                      className="flex flex-col gap-5 border border-amber-200 bg-amber-50/40 rounded-[6px] p-5 md:flex-row md:items-center md:justify-between hover:border-amber-300 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-block h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                          <p className="font-display text-lg text-text">{p.business_name}</p>
                        </div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-text-soft">
                          {(p.categories as { name: string } | null)?.name ?? "No category"} ·{" "}
                          {p.city ?? "—"}
                        </p>
                        {email && (
                          <p className="mt-1 font-mono text-[9px] text-text-soft/60">{email}</p>
                        )}
                        {p.bio && (
                          <p className="mt-2 font-sans text-[13px] text-text-soft line-clamp-2">
                            {p.bio}
                          </p>
                        )}
                        <p className="mt-2 font-mono text-[9px] text-text-soft/40 uppercase tracking-widest">
                          Applied{" "}
                          {new Date(p.created_at).toLocaleDateString("en-ZW", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {email && (
                          <button
                            onClick={() => sendPasswordReset(email)}
                            className="flex items-center gap-1.5 border border-hairline px-3 py-2 rounded-[3px] font-mono text-[9px] uppercase tracking-widest text-text-soft hover:border-forest hover:text-forest transition-colors"
                            title="Send password reset email"
                          >
                            <Mail className="h-3 w-3" />
                            Reset pwd
                          </button>
                        )}

                        {/* Quick Approve → Tier 2 */}
                        <button
                          onClick={() => setTier.mutate({ userId: p.user_id, tier: 2 })}
                          disabled={setTier.isPending}
                          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-[3px] font-mono text-[9px] uppercase tracking-widest transition-colors disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve
                        </button>

                        {/* Reject */}
                        <button
                          onClick={() => rejectProvider.mutate(p.user_id)}
                          disabled={rejectProvider.isPending}
                          className="flex items-center gap-1.5 border border-rose-300 text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-[3px] font-mono text-[9px] uppercase tracking-widest transition-colors disabled:opacity-60"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </button>

                        {/* Tier upgrade options */}
                        <div className="flex gap-1.5">
                          {[3, 4].map((t) => (
                            <button
                              key={t}
                              onClick={() => setTier.mutate({ userId: p.user_id, tier: t })}
                              disabled={setTier.isPending}
                              className={`px-3 py-2 rounded-[3px] font-mono text-[9px] uppercase tracking-widest border transition-colors disabled:opacity-60 ${
                                t === 3
                                  ? "border-amber-300 text-amber-600 hover:bg-amber-50"
                                  : "border-gold/50 text-gold hover:bg-gold hover:text-forest-ink"
                              }`}
                            >
                              T{t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ─── TAB: VERIFIED DIRECTORY ─── */}
        {activeTab === "verified" && (
          <section className="bg-cream-raised border border-hairline rounded-[6px] p-7 animate-fade-in">
            <h2 className="font-display text-xl text-text mb-6">
              Verified Directory ({approved.length})
            </h2>
            <div className="space-y-2">
              {approved.length === 0 && (
                <p className="font-sans text-sm text-text-soft italic">None yet.</p>
              )}
              {approved.map((p) => {
                const email = (p.profiles as { email: string } | null)?.email ?? null;
                return (
                  <div
                    key={p.user_id}
                    className="flex items-center justify-between border border-hairline rounded-[3px] px-4 py-3 hover:border-forest transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-display text-sm text-text">
                          {p.business_name}
                        </p>
                        <span className="shrink-0 font-mono text-[8px] text-emerald-500 border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 rounded-[2px] uppercase tracking-wider">
                          verified
                        </span>
                      </div>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-text-soft">
                        Tier {p.tier} · {p.city ?? "—"}
                        {email && ` · ${email}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {[2, 3, 4].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTier.mutate({ userId: p.user_id, tier: t })}
                          disabled={p.tier === t}
                          className={`px-2.5 py-1 rounded-[3px] font-mono text-[8px] uppercase tracking-widest border transition-colors disabled:opacity-30 ${
                            p.tier === t
                              ? "border-forest bg-forest/5 text-forest"
                              : "border-hairline text-text-soft hover:border-forest hover:text-forest"
                          }`}
                        >
                          T{t}
                        </button>
                      ))}
                      {email && (
                        <button
                          onClick={() => sendPasswordReset(email)}
                          className="flex items-center gap-1 border border-hairline px-2.5 py-1.5 rounded-[3px] font-mono text-[8px] uppercase tracking-widest text-text-soft hover:border-forest hover:text-forest transition-colors"
                          title={`Send password reset to ${email}`}
                        >
                          <Mail className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={() => setTier.mutate({ userId: p.user_id, tier: 1 })}
                        className="font-mono text-[9px] uppercase tracking-widest text-text-soft/40 hover:text-rose-500 transition-colors"
                      >
                        Demote
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── TAB: CLIENTS ─── */}
        {activeTab === "clients" && (
          <section className="bg-cream-raised border border-hairline rounded-[6px] p-7 animate-fade-in">
            <h2 className="font-display text-xl text-text mb-6">
              Platform Clients ({clients?.length ?? 0})
            </h2>
            <div className="space-y-2">
              {(clients ?? []).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between border border-hairline rounded-[3px] px-4 py-3 hover:border-forest transition-colors"
                >
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm text-text">
                      {c.full_name || "(no name)"}
                    </p>
                    <p className="truncate font-mono text-[9px] text-text-soft">{c.email}</p>
                  </div>
                  <span
                    className={`font-mono text-[9px] uppercase tracking-widest ${
                      c.onboarding_completed ? "text-emerald-500" : "text-text-soft/40"
                    }`}
                  >
                    {c.onboarding_completed ? "Active" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── TAB: ENQUIRY STREAM ─── */}
        {activeTab === "enquiries" && (
          <section className="bg-cream-raised border border-hairline rounded-[6px] p-7 animate-fade-in">
            <h2 className="font-display text-xl text-text mb-6">Enquiry Stream</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-soft border-b border-hairline">
                    <th className="pb-4 pr-6">Request Title</th>
                    <th className="pb-4 pr-6">Client</th>
                    <th className="pb-4 pr-6">Budget</th>
                    <th className="pb-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {(requests ?? []).map((r) => (
                    <tr key={r.id} className="group hover:bg-cream transition-colors">
                      <td className="py-3 pr-6 font-display text-sm text-text group-hover:text-forest transition-colors">
                        {r.title}
                      </td>
                      <td className="py-3 pr-6">
                        <p className="font-sans text-[13px] text-text-soft">{r.client_name ?? "—"}</p>
                        <p className="font-mono text-[9px] text-text-soft/60">{r.client_email}</p>
                      </td>
                      <td className="py-3 pr-6 font-mono text-xs text-text-soft">
                        {r.budget ? `$${r.budget}` : "—"}
                      </td>
                      <td className="py-3 text-right">
                        <span className="border border-hairline px-2 py-1 rounded-[3px] font-mono text-[9px] uppercase tracking-widest text-text-soft">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <AddProviderSection />
        <HeroFeatureSection />
      </div>
    </div>
  );
}

/* ─── ADD PROVIDER ─── */

const TIER_OPTIONS = [
  { value: 1, label: "T1 — Listed" },
  { value: 2, label: "T2 — Checked" },
  { value: 3, label: "T3 — Trusted" },
  { value: 4, label: "T4 — Elite" },
];

const EMPTY_FORM = {
  email: "",
  businessName: "",
  categoryId: "",
  city: "",
  phone: "",
  whatsapp: "",
  website: "",
  bio: "",
  tier: 2,
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
    navigator.clipboard.writeText(
      `NexusZim Login\nEmail: ${result.email}\nPassword: ${result.tempPassword}\nURL: ${window.location.origin}/login`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="bg-cream-raised border border-hairline rounded-[6px] p-7">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display text-xl text-text">Add Provider</h2>
            <span className="font-mono text-[8px] text-emerald-600 border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 rounded-[2px] uppercase tracking-wider">
              auto-verified
            </span>
          </div>
          <p className="font-sans text-[12px] text-text-soft">
            Providers you add here are automatically verified — you've checked them in person.
          </p>
        </div>
        <button
          onClick={() => {
            setOpen((v) => !v);
            setResult(null);
          }}
          className="flex items-center gap-2 bg-gold px-5 py-2.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
        >
          {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {open ? "Close" : "New Provider"}
        </button>
      </div>

      {result && (
        <div className="mt-6 border border-emerald-200 bg-emerald-50 rounded-[6px] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-600">
              Provider Account Created
            </p>
          </div>
          <div className="font-mono text-sm space-y-1.5">
            <p>
              <span className="text-text-soft">Email: </span>
              <span className="text-text">{result.email}</span>
            </p>
            <p>
              <span className="text-text-soft">Password: </span>
              <span className="text-gold font-bold tracking-widest">{result.tempPassword}</span>
            </p>
          </div>
          <p className="font-sans text-[12px] text-text-soft">
            Share these credentials with the provider. They can change their password after first
            login.
          </p>
          <button
            onClick={copyCredentials}
            className="flex items-center gap-2 border border-forest/30 px-5 py-2 rounded-[3px] font-mono text-[10px] uppercase tracking-widest text-forest hover:bg-forest hover:text-cream transition-colors"
          >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy Login Details"}
          </button>
        </div>
      )}

      {open && !result && (
        <div className="mt-7 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField
              label="Business Name *"
              value={form.businessName}
              onChange={(v) => setForm({ ...form, businessName: v })}
              placeholder="e.g. Zim Pro Photography"
            />
            <AdminField
              label="Email Address *"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              placeholder="provider@email.com"
            />
            <AdminField
              label="Phone"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              placeholder="+263 77 123 4567"
            />
            <AdminField
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(v) => setForm({ ...form, whatsapp: v })}
              placeholder="+263 77 123 4567"
            />

            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-text-soft">
                Category
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="field-input"
              >
                <option value="">— Select category —</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-text-soft">
                Verification Tier
              </label>
              <select
                value={form.tier}
                onChange={(e) => setForm({ ...form, tier: Number(e.target.value) })}
                className="field-input"
              >
                {TIER_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <AdminField
              label="City"
              value={form.city}
              onChange={(v) => setForm({ ...form, city: v })}
              placeholder="Harare, Bulawayo, etc."
            />
            <AdminField
              label="Website / Portfolio URL"
              value={form.website}
              onChange={(v) => setForm({ ...form, website: v })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-widest text-text-soft">
              Bio / Description
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              placeholder="Brief description of what this provider does…"
              className="field-input resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-gold px-9 py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating Account…" : "Create Provider Account"}
          </button>
        </div>
      )}
    </section>
  );
}

function AdminField({
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
    <div className="space-y-1.5">
      <label className="block font-mono text-[10px] uppercase tracking-widest text-text-soft">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field-input"
      />
    </div>
  );
}

function Tile({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-cream-raised border rounded-[6px] p-6 transition-colors ${
        highlight ? "border-amber-300 bg-amber-50/40" : "border-hairline"
      }`}
    >
      <p className={`font-display text-4xl ${highlight ? "text-amber-500" : "text-gold"}`}>
        {value}
      </p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-text-soft">{label}</p>
    </div>
  );
}

/* ─── HERO FEATURE ─── */

function HeroFeatureSection() {
  const [selectedId, setSelectedId] = useState("");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: providers } = useQuery({
    queryKey: ["admin", "providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_profiles")
        .select("user_id, business_name, city, tier")
        .order("tier", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    const { data } = supabase.storage.from("site-assets").getPublicUrl("config.json");
    fetch(`${data.publicUrl}?t=${Date.now()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg) => {
        if (cfg?.featuredProviderId) {
          setCurrentId(cfg.featuredProviderId);
          setSelectedId(cfg.featuredProviderId);
        }
      })
      .catch(() => {});
  }, []);

  const currentProvider = (providers ?? []).find((p) => p.user_id === currentId);

  async function save() {
    if (!selectedId) return;
    setSaving(true);
    const json = JSON.stringify({ featuredProviderId: selectedId });
    const blob = new Blob([json], { type: "application/json" });
    const { error } = await supabase.storage
      .from("site-assets")
      .upload("config.json", blob, { upsert: true, contentType: "application/json" });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      setCurrentId(selectedId);
      toast.success("Hero provider updated — refresh the homepage to see it.");
    }
  }

  async function clearFeatured() {
    setSaving(true);
    const json = JSON.stringify({ featuredProviderId: null });
    const blob = new Blob([json], { type: "application/json" });
    await supabase.storage
      .from("site-assets")
      .upload("config.json", blob, { upsert: true, contentType: "application/json" });
    setSaving(false);
    setCurrentId(null);
    setSelectedId("");
    toast.success("Cleared — hero card will show NexusZim default.");
  }

  return (
    <section className="bg-cream-raised border border-hairline rounded-[6px] p-7">
      <div className="mb-6">
        <h2 className="font-display text-xl text-text">Hero Featured Provider</h2>
        <p className="font-sans text-[12px] text-text-soft mt-1">
          The provider shown in the registry card on the homepage hero. Leave unset to show the
          NexusZim default.
        </p>
      </div>

      {currentProvider && (
        <div className="mb-5 flex items-center gap-3 border border-emerald-200 bg-emerald-50 rounded-[6px] px-5 py-3">
          <span className="font-mono text-[8px] text-emerald-600 border border-emerald-200 bg-emerald-100 px-1.5 py-0.5 rounded-[2px] uppercase tracking-wider shrink-0">
            Current
          </span>
          <p className="font-display text-sm text-text flex-1">
            {currentProvider.business_name}
            <span className="font-sans font-normal text-text-soft ml-2 text-[12px]">
              · {currentProvider.city ?? "—"} · Tier {currentProvider.tier}
            </span>
          </p>
          <button
            onClick={clearFeatured}
            disabled={saving}
            className="font-mono text-[9px] uppercase tracking-widest text-text-soft/50 hover:text-rose-500 transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {!currentProvider && (
        <div className="mb-5 border border-hairline rounded-[6px] px-5 py-3">
          <p className="font-sans text-[13px] text-text-soft italic">
            Showing default — "NexusZim"
          </p>
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-1.5">
          <label className="block font-mono text-[10px] uppercase tracking-widest text-text-soft">
            Select Provider
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="field-input"
          >
            <option value="">— Choose a provider —</option>
            {(providers ?? []).map((p) => (
              <option key={p.user_id} value={p.user_id}>
                {p.business_name} · {p.city ?? "—"} · T{p.tier}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={save}
          disabled={saving || !selectedId || selectedId === currentId}
          className="bg-gold px-6 py-2.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors disabled:opacity-50 shrink-0"
        >
          {saving ? "Saving..." : "Set as Featured"}
        </button>
      </div>
    </section>
  );
}
