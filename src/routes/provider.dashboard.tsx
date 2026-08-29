import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchProviderBookings,
  fetchProviderRating,
  type ProviderBooking,
} from "@/lib/queries";
import { RatingDisplay } from "@/components/registry/star-rating";
import {
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  FileText,
  Briefcase,
  Star,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/provider/dashboard")({
  head: () => ({ meta: [{ title: "Provider dashboard - NexusZim" }] }),
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
  return {
    pct: Math.round((done / checks.length) * 100),
    missing: checks.filter((c) => !c.ok).map((c) => c.label),
  };
}

const TIER_LABELS: Record<number, string> = { 1: "Listed", 2: "Checked", 3: "Trusted", 4: "Elite" };
const TIER_COLORS: Record<number, string> = {
  1: "text-muted-foreground border-border",
  2: "text-blue-500 border-blue-500/40",
  3: "text-amber-600 border-amber-500/40",
  4: "text-gold border-gold/50",
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

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [quoteAmounts, setQuoteAmounts] = useState<Record<string, string>>({});
  const [quoteMessages, setQuoteMessages] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const qc = useQueryClient();
  const { data: myBookings = [] } = useQuery({
    queryKey: ["provider-bookings", user?.id],
    queryFn: () => fetchProviderBookings(user!.id),
    enabled: !!user,
  });
  const { data: myRating } = useQuery({
    queryKey: ["provider-rating", user?.id],
    queryFn: () => fetchProviderRating(user!.id),
    enabled: !!user,
  });
  const advanceBooking = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "in_progress" | "completed" }) => {
      const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, v) => {
      toast.success(v.status === "completed" ? "Job marked complete." : "Job started.");
      qc.invalidateQueries({ queryKey: ["provider-bookings", user?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const completedJobs = myBookings.filter((b) => b.status === "completed").length;

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
          .select(
            "id, title, description, service_name, city, budget, needed_by, created_at, client_name, client_phone, client_email, client_whatsapp",
          )
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
    return () => {
      cancelled = true;
    };
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
      setQuoteAmounts((prev) => {
        const n = { ...prev };
        delete n[requestId];
        return n;
      });
      setQuoteMessages((prev) => {
        const n = { ...prev };
        delete n[requestId];
        return n;
      });
      toast.success("Quote submitted.");
    }
  }

  const quotedRequestIds = new Set(myQuotes.map((q) => q.request_id));
  const completion = provider ? profileCompletion(provider) : null;
  const tier = provider?.tier ?? 1;

  return (
    <div className="bg-background pt-16 min-h-screen">
      {/* Forest header */}
      <div className="bg-forest-ink border-b border-cream/10">
        <div className="container-page py-10 md:py-14">
          <p className="eyebrow text-cream/40 mb-3">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            Provider control
          </p>
          <h1
            className="font-display text-cream"
            style={{ fontSize: "clamp(32px, 4.5vw, 56px)", lineHeight: "1.06", letterSpacing: "-0.02em" }}
          >
            {provider?.business_name ?? "Your business."}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-cream/40">
              {provider?.categories?.name ?? "Category pending"}
            </span>
            <span className="text-cream/20">·</span>
            <span className={`border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest rounded-[3px] ${TIER_COLORS[tier]}`}>
              T{tier} {TIER_LABELS[tier]}
            </span>
            {provider?.verified ? (
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </span>
            ) : (
              <span className="font-mono text-[9px] uppercase tracking-widest text-amber-400">
                Awaiting verification
              </span>
            )}
          </div>
          <div className="mt-6">
            <Link
              to="/onboarding/provider"
              className="border border-cream/20 px-5 py-2.5 rounded-[3px] font-sans text-sm text-cream hover:border-cream/50 hover:bg-background/5 transition-colors"
            >
              Edit profile
            </Link>
          </div>
        </div>
      </div>

      <div className="container-page py-10 md:py-14 space-y-8">
        {/* Real performance stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <VisibilityStat
            icon={<Star className="h-4 w-4 text-gold" />}
            label="Rating"
            value={myRating && myRating.count > 0 ? myRating.average.toFixed(1) : "-"}
            trend={
              myRating && myRating.count > 0
                ? `${myRating.count} review${myRating.count !== 1 ? "s" : ""}`
                : "No reviews yet"
            }
          />
          <VisibilityStat
            icon={<CheckCircle2 className="h-4 w-4 text-gold" />}
            label="Completed Jobs"
            value={String(completedJobs)}
            trend="All time"
          />
          <VisibilityStat
            icon={<FileText className="h-4 w-4 text-gold" />}
            label="Active Quotes"
            value={String(myQuotes.length)}
            trend="Awaiting client"
          />
          <VisibilityStat
            icon={<Briefcase className="h-4 w-4 text-gold" />}
            label="Open Briefs"
            value={String(requests.length)}
            trend="In your category"
          />
        </div>

        {/* Profile Completion */}
        {completion && completion.pct < 100 && (
          <div className="bg-card border border-border rounded-[6px] p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Profile completion
                  </p>
                  <span className="font-mono text-sm font-bold text-gold">{completion.pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-hairline rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full transition-all duration-700"
                    style={{ width: `${completion.pct}%` }}
                  />
                </div>
                {completion.missing.length > 0 && (
                  <p className="mt-3 font-mono text-[9px] text-muted-foreground/60 uppercase tracking-wider">
                    Missing: {completion.missing.join(" · ")}
                  </p>
                )}
              </div>
              <Link
                to="/onboarding/provider"
                className="shrink-0 bg-gold px-7 py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
              >
                Complete profile →
              </Link>
            </div>
          </div>
        )}

        {/* Featured upsell for T1/T2 */}
        {tier < 3 && (
          <div className="border border-primary/20 bg-primary/10 rounded-[6px] p-6 md:p-8 grid gap-6 md:grid-cols-[1fr_auto] items-center">
            <div>
              <p className="eyebrow text-muted-foreground mb-2">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                Upgrade your visibility
              </p>
              <h3 className="font-display text-xl text-foreground mb-1">
                Featured listings get <span className="text-gold">8× more enquiries.</span>
              </h3>
              <p className="font-sans text-[13px] text-muted-foreground leading-relaxed">
                Appear at the top of your category and on the homepage. Starts at $15/month.
              </p>
            </div>
            <Link
              to="/contact"
              className="shrink-0 border border-primary px-7 py-3 rounded-[3px] font-sans text-sm font-semibold text-primary hover:bg-forest hover:text-cream transition-colors whitespace-nowrap"
            >
              Get featured →
            </Link>
          </div>
        )}

        {/* Your Jobs - the delivery + reputation side of the loop */}
        {myBookings.length > 0 && (
          <section className="bg-card border border-border rounded-[6px] p-7 md:p-10">
            <div className="flex items-center justify-between border-b border-border pb-5 mb-8">
              <div>
                <p className="eyebrow text-muted-foreground mb-1">
                  <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
                  Confirmed work
                </p>
                <h2 className="font-display text-xl text-foreground">Your Jobs</h2>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                {completedJobs} completed
              </span>
            </div>
            <div className="space-y-3">
              {myBookings.map((b) => (
                <ProviderJobRow
                  key={b.id}
                  booking={b}
                  onStart={() => advanceBooking.mutate({ id: b.id, status: "in_progress" })}
                  onComplete={() => advanceBooking.mutate({ id: b.id, status: "completed" })}
                  busy={advanceBooking.isPending}
                />
              ))}
            </div>
          </section>
        )}

        {/* Available Briefs */}
        <section className="bg-card border border-border rounded-[6px] p-7 md:p-10">
          <div className="flex items-center justify-between border-b border-border pb-5 mb-8">
            <div>
              <p className="eyebrow text-muted-foreground mb-1">
                <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
                Incoming briefs
              </p>
              <h2 className="font-display text-xl text-foreground">Available Briefs</h2>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              {requests.length} open
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 skeleton rounded-[3px]" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <p className="font-sans text-sm text-muted-foreground italic">
              No briefs currently match your category. Check back shortly.
            </p>
          ) : (
            <div className="space-y-3">
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
                    className="border border-border rounded-[3px] transition-all hover:border-primary"
                  >
                    <div className="p-5 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-lg text-foreground">
                            {r.service_name ?? r.title}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            <span>{r.city ?? "-"}</span>
                            {r.budget && (
                              <span className="text-gold">Budget: ${Number(r.budget).toFixed(0)}</span>
                            )}
                            <span>Needed: {r.needed_by ?? "ASAP"}</span>
                            <span className="text-muted-foreground/40">{timeAgo(r.created_at)}</span>
                          </div>

                          {r.description && (
                            <p className="mt-3 font-sans text-[13px] text-muted-foreground leading-relaxed max-w-2xl line-clamp-2">
                              {r.description}
                            </p>
                          )}

                          <div className="mt-4 flex flex-wrap gap-2">
                            {waNumber && (
                              <a
                                href={`https://wa.me/${waNumber}?text=${waMessage}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#25D366] px-4 py-2 rounded-[3px] font-mono text-[10px] font-bold uppercase tracking-widest text-white hover:opacity-90 transition-opacity"
                              >
                                WhatsApp
                              </a>
                            )}
                            {r.client_email && (
                              <a
                                href={`mailto:${r.client_email}?subject=${emailSubject}&body=${emailBody}`}
                                className="border border-primary/30 px-4 py-2 rounded-[3px] font-mono text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors"
                              >
                                Email
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-2">
                          {alreadyQuoted ? (
                            <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 rounded-[3px]">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                Quoted
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : r.id)}
                              className="flex items-center gap-2 bg-gold px-5 py-2.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
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

                    {isExpanded && !alreadyQuoted && (
                      <div className="border-t border-border bg-background px-5 py-5 md:px-6">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                          Your quote
                        </p>
                        <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
                          <div>
                            <label className="block font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-1.5">
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
                              className="field-input"
                            />
                          </div>
                          <div>
                            <label className="block font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-1.5">
                              Message (optional)
                            </label>
                            <input
                              type="text"
                              placeholder="Brief summary of what's included..."
                              value={quoteMessages[r.id] ?? ""}
                              onChange={(e) =>
                                setQuoteMessages((prev) => ({ ...prev, [r.id]: e.target.value }))
                              }
                              className="field-input"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => sendQuote(r.id)}
                              disabled={submitting === r.id || !quoteAmounts[r.id]}
                              className="flex items-center gap-2 bg-gold px-5 py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors disabled:opacity-50 w-full md:w-auto justify-center"
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

const PROVIDER_JOB_BADGE: Record<string, string> = {
  pending: "border-amber-500/40 text-amber-600 bg-amber-500/10",
  confirmed: "border-primary/30 text-primary bg-primary/10",
  in_progress: "border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10",
  completed: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  cancelled: "border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/10",
  refunded: "border-text-soft/30 text-muted-foreground bg-hairline/30",
};

function ProviderJobRow({
  booking,
  onStart,
  onComplete,
  busy,
}: {
  booking: ProviderBooking;
  onStart: () => void;
  onComplete: () => void;
  busy: boolean;
}) {
  const canStart = booking.status === "confirmed" || booking.status === "pending";
  const canComplete = booking.status === "in_progress";
  return (
    <div className="border border-border rounded-[3px] p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="font-display text-lg text-foreground">{booking.notes || "Job"}</h3>
            <span
              className={`border px-2.5 py-0.5 rounded-[3px] font-mono text-[9px] uppercase tracking-widest ${
                PROVIDER_JOB_BADGE[booking.status] ?? PROVIDER_JOB_BADGE.pending
              }`}
            >
              {booking.status.replace("_", " ")}
            </span>
          </div>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Agreed: <span className="text-gold">${Number(booking.amount).toFixed(0)}</span>
            <span className="text-muted-foreground/50"> · paid to you directly</span>
          </p>
          {booking.status === "completed" && booking.reviewed && (
            <div className="mt-3 border-l-2 border-gold/40 pl-3">
              <RatingDisplay average={booking.review_rating ?? 0} count={1} />
              {booking.review_comment && (
                <p className="mt-1.5 font-sans text-[13px] italic text-muted-foreground leading-relaxed">
                  "{booking.review_comment}"
                </p>
              )}
            </div>
          )}
          {booking.status === "completed" && !booking.reviewed && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
              Awaiting client review
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {canStart && (
            <button
              onClick={onStart}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 border border-primary px-5 py-2.5 rounded-[3px] font-mono text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-forest hover:text-cream transition-colors disabled:opacity-60"
            >
              Start job
            </button>
          )}
          {canComplete && (
            <button
              onClick={onComplete}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 bg-gold px-5 py-2.5 rounded-[3px] font-mono text-[10px] font-bold uppercase tracking-widest text-forest-ink hover:bg-gold-deep transition-colors disabled:opacity-60"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Mark complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function VisibilityStat({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <div className="bg-card border border-border rounded-[6px] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        {icon}
        <span className="font-mono text-[9px] text-muted-foreground/60 uppercase tracking-widest">
          {trend}
        </span>
      </div>
      <p className="font-display text-3xl text-foreground">{value}</p>
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</p>
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
