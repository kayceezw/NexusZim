import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ChevronDown, ChevronUp, Send, CheckCircle2, TrendingUp, Eye, Zap, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/provider/dashboard")({
  head: () => ({ meta: [{ title: "Provider dashboard — NexusZim" }] }),
  component: () => (
    <RequireAuth roles={["service_provider", "admin", "super_admin"]}>
      <ProviderDashboard />
    </RequireAuth>
  ),
});

type ProviderRow = {
  business_name: string;
  category_id: string | null;
  verified: boolean;
  tier: number;
  bio: string | null;
  phone: string | null;
  website: string | null;
  categories: { name: string } | null;
};

function profileCompletion(p: ProviderRow): { pct: number; missing: string[] } {
  const checks = [
    { label: "Business Name", ok: !!p.business_name },
    { label: "Category", ok: !!p.category_id },
    { label: "Bio / Description", ok: !!p.bio?.trim() },
    { label: "Phone Number", ok: !!p.phone },
    { label: "Website / Portfolio", ok: !!p.website },
  ];
  const done = checks.filter((c) => c.ok).length;
  return { pct: Math.round((done / checks.length) * 100), missing: checks.filter((c) => !c.ok).map((c) => c.label) };
}

const TIER_LABELS: Record<number, string> = { 1: "Listed", 2: "Checked", 3: "Trusted", 4: "Elite" };
const TIER_COLORS: Record<number, string> = {
  1: "text-foreground/40 border-foreground/20",
  2: "text-blue-400 border-blue-400/40",
  3: "text-copper border-copper/40",
  4: "text-gold border-gold/40",
};

type RequestRow = {
  id: string;
  title: string;
  description: string | null;
  service_name: string | null;
  city: string | null;
  budget: number | null;
  needed_by: string | null;
  created_at: string;
  client_name: string | null;
  client_phone: string | null;
  client_email: string | null;
  client_whatsapp: string | null;
};

type QuoteRow = { id: string; request_id: string; amount: number; status: string };

function ProviderDashboard() {
  const { user } = useAuth();
  const [provider, setProvider] = useState<ProviderRow | null>(null);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [myQuotes, setMyQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Quote form state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quoteAmounts, setQuoteAmounts] = useState<Record<string, string>>({});
  const [quoteMessages, setQuoteMessages] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data: prov } = await supabase
        .from("provider_profiles")
        .select("business_name, category_id, verified, tier, bio, phone, website, categories(name)")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (cancelled) return;
      setProvider(prov as ProviderRow | null);

      if (prov?.category_id) {
        const { data: reqs } = await supabase
          .from("requests")
          .select("id, title, description, service_name, city, budget, needed_by, created_at, client_name, client_phone, client_email, client_whatsapp")
          .eq("category_id", prov.category_id)
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(50);
        if (!cancelled) setRequests(reqs ?? []);
      }

      const { data: quotes } = await supabase
        .from("quotes")
        .select("id, request_id, amount, status")
        .eq("provider_id", user!.id);
      if (!cancelled) setMyQuotes(quotes ?? []);

      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  async function sendQuote(requestId: string) {
    if (!user) return;
    const amount = Number(quoteAmounts[requestId]);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid quote amount.");
      return;
    }
    const message = quoteMessages[requestId]?.trim() ?? "";
    setSubmitting(requestId);

    const { data, error } = await supabase
      .from("quotes")
      .insert({ request_id: requestId, provider_id: user.id, amount, message })
      .select("id, request_id, amount, status")
      .single();

    setSubmitting(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) {
      setMyQuotes((q) => [...q, data]);
      setExpandedId(null);
      setQuoteAmounts((prev) => { const n = { ...prev }; delete n[requestId]; return n; });
      setQuoteMessages((prev) => { const n = { ...prev }; delete n[requestId]; return n; });
      toast.success("Quote submitted successfully.");
    }
  }

  const quotedRequestIds = new Set(myQuotes.map((q) => q.request_id));

  const completion = provider ? profileCompletion(provider) : null;
  const tier = provider?.tier ?? 1;

  return (
    <div className="bg-background pt-24 min-h-screen">
      <div className="container-page py-12 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-gold/20 pb-10">
          <div>
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gold/40" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
                Provider Control
              </span>
            </div>
            <h1 className="mt-4 font-display text-5xl font-bold text-foreground md:text-6xl">
              {provider?.business_name ?? "Your Business."}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                {provider?.categories?.name ?? "Category Pending"}
              </span>
              <span className="text-foreground/20">·</span>
              <span className={`border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest ${TIER_COLORS[tier]}`}>
                T{tier} {TIER_LABELS[tier]}
              </span>
              {provider?.verified ? (
                <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-500">
                  <CheckCircle2 className="h-3 w-3" /> Audit Passed
                </span>
              ) : (
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-amber-500">
                  Awaiting Verification
                </span>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/onboarding/provider"
              className="border border-gold/20 bg-gold/5 px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Visibility Stats */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <VisibilityStat icon={<Eye className="h-4 w-4 text-gold" />} label="Profile Views" value="284" trend="+12% this week" />
          <VisibilityStat icon={<TrendingUp className="h-4 w-4 text-gold" />} label="Enquiry Rate" value="18.4%" trend="From 284 views" />
          <VisibilityStat icon={<Zap className="h-4 w-4 text-gold" />} label="Avg. Response" value="2.3h" trend="Top 10% of fixers" />
          <VisibilityStat icon={<Star className="h-4 w-4 text-gold" />} label="Conversion" value="6.7%" trend="4 confirmed this month" />
        </div>

        {/* Profile Completion */}
        {completion && completion.pct < 100 && (
          <div className="mt-8 border border-gold/20 bg-gold/5 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
                    Profile Completion
                  </p>
                  <span className="font-mono text-sm font-bold text-gold">{completion.pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-gold/10">
                  <div
                    className="h-full bg-gold transition-all duration-700"
                    style={{ width: `${completion.pct}%` }}
                  />
                </div>
                {completion.missing.length > 0 && (
                  <p className="mt-3 font-mono text-[9px] text-foreground/40 uppercase tracking-wider">
                    Missing: {completion.missing.join(" · ")}
                  </p>
                )}
              </div>
              <Link
                to="/onboarding/provider"
                className="shrink-0 bg-gold px-8 py-3 font-display text-[11px] font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors"
              >
                Complete Profile →
              </Link>
            </div>
          </div>
        )}

        {/* Featured Listing Upsell (show for T1/T2 providers) */}
        {tier < 3 && (
          <div className="mt-8 border border-gold/30 bg-card/50 p-6 md:p-8 grid gap-6 md:grid-cols-[1fr_auto] items-center">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Upgrade Your Visibility</p>
              <h3 className="mt-2 font-display text-xl font-bold text-foreground">
                Featured listings get <span className="text-gold">8× more enquiries.</span>
              </h3>
              <p className="mt-2 font-body text-sm text-foreground/50">
                Claim a Featured slot to appear at the top of your category directory and on the landing page. Starts at $15/month.
              </p>
            </div>
            <Link
              to="/contact"
              className="shrink-0 border border-gold px-8 py-4 font-mono text-[10px] font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-white transition-colors whitespace-nowrap"
            >
              Get Featured →
            </Link>
          </div>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <Stat label="Live Ops" value={String(requests.length)} />
          <Stat label="Active Quotes" value={String(myQuotes.length)} />
          <Stat label="Status" value={provider?.verified ? "Live" : "Hold"} />
        </div>

        <section className="mt-16 border border-gold/20 bg-card p-8 md:p-12">
          <div className="flex items-center justify-between border-b border-gold/10 pb-6">
            <h2 className="font-display text-2xl font-bold text-foreground uppercase tracking-widest">
              Available Briefs
            </h2>
            <span className="font-mono text-[10px] text-foreground/40 uppercase tracking-widest">
              {requests.length} open
            </span>
          </div>

          {loading ? (
            <div className="mt-10 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 skeleton" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <p className="mt-8 font-body text-sm text-foreground/30 italic">
              No briefs currently match your category. Check back shortly.
            </p>
          ) : (
            <div className="mt-10 space-y-4">
              {requests.map((r) => {
                const alreadyQuoted = quotedRequestIds.has(r.id);
                const isExpanded = expandedId === r.id;
                const waNumber = (r.client_whatsapp ?? r.client_phone ?? "").replace(/[^\d]/g, "");
                const waMessage = encodeURIComponent(
                  `Hi ${r.client_name ?? "there"}, I'm reaching out about your "${r.service_name ?? r.title}" request on NexusZim. I'd love to send you a quote.`,
                );
                const emailSubject = encodeURIComponent(`Quote for: ${r.service_name ?? r.title}`);
                const emailBody = encodeURIComponent(
                  `Hi ${r.client_name ?? "there"},\n\nI saw your request for "${r.service_name ?? r.title}"${r.city ? ` in ${r.city}` : ""} on NexusZim.\n\nMy quote: $___\n\nDetails:\n\nThanks!`,
                );

                return (
                  <div
                    key={r.id}
                    className="border border-gold/5 bg-background/40 transition-all hover:border-gold/20"
                  >
                    <div className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-xl font-bold text-foreground">
                            {r.service_name ?? r.title}
                          </h3>
                          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                            <span>{r.city ?? "—"}</span>
                            {r.budget && (
                              <span className="text-gold">Budget: ${Number(r.budget).toFixed(0)}</span>
                            )}
                            <span>Needed: {r.needed_by ?? "ASAP"}</span>
                            <span className="text-foreground/20">{timeAgo(r.created_at)}</span>
                          </div>

                          {r.description && (
                            <p className="mt-4 font-body text-sm text-foreground/60 leading-relaxed max-w-2xl line-clamp-2">
                              {r.description}
                            </p>
                          )}

                          <div className="mt-5 flex flex-wrap gap-3">
                            {waNumber && (
                              <a
                                href={`https://wa.me/${waNumber}?text=${waMessage}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#25D366] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white hover:opacity-90 transition-opacity"
                              >
                                WhatsApp
                              </a>
                            )}
                            {r.client_email && (
                              <a
                                href={`mailto:${r.client_email}?subject=${emailSubject}&body=${emailBody}`}
                                className="border border-gold/30 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-gold hover:bg-gold/5"
                              >
                                Email
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-2">
                          {alreadyQuoted ? (
                            <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                                Quoted
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : r.id)}
                              className="flex items-center gap-3 bg-gold px-6 py-3 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors"
                            >
                              Submit Quote
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inline quote form */}
                    {isExpanded && !alreadyQuoted && (
                      <div className="border-t border-gold/10 bg-card/50 p-6 md:p-8">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold mb-6">
                          Submit Your Quote
                        </p>
                        <div className="grid gap-4 md:grid-cols-[1fr_2fr_auto]">
                          <div>
                            <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/40 mb-2">
                              Amount (USD) *
                            </label>
                            <input
                              type="number"
                              min={1}
                              placeholder="e.g. 350"
                              value={quoteAmounts[r.id] ?? ""}
                              onChange={(e) =>
                                setQuoteAmounts((prev) => ({ ...prev, [r.id]: e.target.value }))
                              }
                              className="w-full bg-background border border-gold/20 p-3 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20"
                            />
                          </div>
                          <div>
                            <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/40 mb-2">
                              Message to Client (optional)
                            </label>
                            <input
                              type="text"
                              placeholder="Brief summary of what's included..."
                              value={quoteMessages[r.id] ?? ""}
                              onChange={(e) =>
                                setQuoteMessages((prev) => ({ ...prev, [r.id]: e.target.value }))
                              }
                              className="w-full bg-background border border-gold/20 p-3 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => sendQuote(r.id)}
                              disabled={submitting === r.id || !quoteAmounts[r.id]}
                              className="flex items-center gap-2 bg-gold px-6 py-3 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center"
                            >
                              {submitting === r.id ? (
                                "Sending..."
                              ) : (
                                <>
                                  <Send className="h-4 w-4" />
                                  Send
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gold/20 bg-card p-8">
      <p className="font-display text-4xl font-bold text-gold">{value}</p>
      <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/40">{label}</p>
    </div>
  );
}

function VisibilityStat({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: string }) {
  return (
    <div className="border border-foreground/5 bg-card/40 p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        {icon}
        <span className="font-mono text-[9px] text-foreground/30 uppercase tracking-widest">{trend}</span>
      </div>
      <p className="font-display text-3xl font-bold text-foreground">{value}</p>
      <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/40">{label}</p>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
