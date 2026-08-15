import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { fetchClientBookings, type ClientBooking } from "@/lib/queries";
import { StarInput } from "@/components/registry/star-rating";
import { MessageSquare, Phone, CheckCircle2, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Your dashboard — NexusZim" }] }),
  component: () => (
    <RequireAuth roles={["client", "admin", "super_admin"]}>
      <DashboardPage />
    </RequireAuth>
  ),
});

type RequestRow = {
  id: string;
  title: string;
  service_name: string | null;
  city: string | null;
  budget: number | null;
  needed_by: string | null;
  status: string;
  created_at: string;
};

type QuoteRow = {
  id: string;
  request_id: string;
  provider_id: string;
  amount: number;
  message: string | null;
  status: string;
  created_at: string;
  business_name: string | null;
  phone: string | null;
  whatsapp: string | null;
};

async function fetchClientRequests(clientId: string): Promise<RequestRow[]> {
  const { data } = await supabase
    .from("requests")
    .select("id, title, service_name, city, budget, needed_by, status, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

async function fetchClientQuotes(requestIds: string[]): Promise<QuoteRow[]> {
  if (!requestIds.length) return [];
  const { data: qs } = await supabase
    .from("quotes")
    .select("id, request_id, provider_id, amount, message, status, created_at")
    .in("request_id", requestIds)
    .order("created_at", { ascending: false });
  const providerIds = Array.from(new Set((qs ?? []).map((q) => q.provider_id)));
  let profilesMap = new Map<
    string,
    { business_name: string; phone: string | null; whatsapp: string | null }
  >();
  if (providerIds.length > 0) {
    const { data: profs } = await supabase
      .from("provider_profiles")
      .select("user_id, business_name, phone, whatsapp")
      .in("user_id", providerIds);
    profilesMap = new Map(
      (profs ?? []).map((p) => [
        p.user_id,
        { business_name: p.business_name, phone: p.phone, whatsapp: p.whatsapp },
      ]),
    );
  }
  return (qs ?? []).map((q) => ({
    ...q,
    business_name: profilesMap.get(q.provider_id)?.business_name ?? null,
    phone: profilesMap.get(q.provider_id)?.phone ?? null,
    whatsapp: profilesMap.get(q.provider_id)?.whatsapp ?? null,
  }));
}

function DashboardPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [reviewFor, setReviewFor] = useState<ClientBooking | null>(null);

  const { data: requests = [], isLoading: loadingReqs } = useQuery({
    queryKey: ["client-requests", user?.id],
    queryFn: () => fetchClientRequests(user!.id),
    enabled: !!user,
  });

  const requestIds = requests.map((r) => r.id);
  const { data: quotes = [], isLoading: loadingQuotes } = useQuery({
    queryKey: ["client-quotes", requestIds],
    queryFn: () => fetchClientQuotes(requestIds),
    enabled: requestIds.length > 0,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["client-bookings", user?.id],
    queryFn: () => fetchClientBookings(user!.id),
    enabled: !!user,
  });

  const loading = loadingReqs || (requestIds.length > 0 && loadingQuotes);

  function refreshLoop() {
    qc.invalidateQueries({ queryKey: ["client-requests", user?.id] });
    qc.invalidateQueries({ queryKey: ["client-bookings", user?.id] });
    qc.invalidateQueries({ queryKey: ["client-quotes"] });
  }

  // Accepting a quote records a booking — a job record, NOT a payment. NexusZim
  // never holds money; the client still pays the provider directly. The booking
  // exists so that, once completed, a review can be left.
  const acceptQuote = useMutation({
    mutationFn: async ({ quote, request }: { quote: QuoteRow; request: RequestRow }) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("bookings").insert({
        client_id: user.id,
        provider_id: quote.provider_id,
        request_id: request.id,
        quote_id: quote.id,
        amount: quote.amount,
        payment_type: "full",
        status: "confirmed",
      });
      if (error) throw error;
      await supabase.from("quotes").update({ status: "accepted" }).eq("id", quote.id);
      await supabase.from("requests").update({ status: "awarded" }).eq("id", request.id);
    },
    onSuccess: () => {
      toast.success("Quote accepted — job recorded. You pay the provider directly.");
      refreshLoop();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markComplete = useMutation({
    mutationFn: async (booking: ClientBooking) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "completed" })
        .eq("id", booking.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job marked complete. Leave a review to build the provider's reputation.");
      refreshLoop();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCount = requests.filter((r) => r.status === "open").length;
  const [activeTab, setActiveTab] = useState<"open" | "all">("open");
  const visibleRequests =
    activeTab === "open" ? requests.filter((r) => r.status === "open") : requests;

  return (
    <div className="bg-cream pt-16 min-h-screen">
      {/* Forest header */}
      <div className="bg-forest-ink border-b border-cream/10">
        <div className="container-page py-10 md:py-14">
          <p className="eyebrow text-cream/40 mb-3">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            Client command
          </p>
          <h1
            className="font-display text-cream"
            style={{ fontSize: "clamp(32px, 4.5vw, 56px)", lineHeight: "1.06", letterSpacing: "-0.02em" }}
          >
            Your <em className="italic text-gold">Briefs.</em>
          </h1>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/request"
              className="bg-gold px-7 py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
            >
              New Brief
            </Link>
            <Link
              to="/search"
              className="border border-cream/20 px-7 py-3 rounded-[3px] font-sans text-sm font-semibold text-cream hover:border-cream/50 hover:bg-cream/5 transition-colors"
            >
              Browse Providers
            </Link>
          </div>
        </div>
      </div>

      <div className="container-page py-10 md:py-14 space-y-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Open Briefs" value={String(openCount)} />
          <StatCard label="Quotes Received" value={String(quotes.length)} />
          <StatCard label="Total Briefs" value={String(requests.length)} />
        </div>

        {/* Tab filter */}
        {requests.length > 0 && (
          <div className="flex gap-1 border-b border-hairline">
            <TabBtn active={activeTab === "open"} onClick={() => setActiveTab("open")}>
              Open ({openCount})
            </TabBtn>
            <TabBtn active={activeTab === "all"} onClick={() => setActiveTab("all")}>
              All ({requests.length})
            </TabBtn>
          </div>
        )}

        {/* Brief list */}
        <section className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 skeleton rounded-[3px]" />
              ))}
            </div>
          ) : visibleRequests.length === 0 && requests.length === 0 ? (
            <div className="border border-dashed border-hairline rounded-[6px] p-16 text-center">
              <h2 className="font-display text-2xl text-text mb-3">No active briefs</h2>
              <p className="font-sans text-sm text-text-soft max-w-sm mx-auto mb-8">
                Start by browsing our verified network of providers, or post a brief and let them
                come to you.
              </p>
              <Link
                to="/search"
                className="inline-block border border-forest px-8 py-3 rounded-[3px] font-sans text-sm font-semibold text-forest hover:bg-forest hover:text-cream transition-colors"
              >
                Browse Network
              </Link>
            </div>
          ) : visibleRequests.length === 0 ? (
            <div className="border border-dashed border-hairline rounded-[6px] p-12 text-center">
              <p className="font-sans text-sm text-text-soft">No {activeTab === "open" ? "open " : ""}briefs found.</p>
            </div>
          ) : (
            visibleRequests.map((r) => {
              const reqQuotes = quotes.filter((q) => q.request_id === r.id);
              return (
                <div
                  key={r.id}
                  className="bg-cream-raised border border-hairline rounded-[6px] overflow-hidden transition-all hover:border-forest"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-5 border-b border-hairline pb-6">
                      <div>
                        <h3 className="font-display text-xl text-text">
                          {r.service_name ?? r.title}
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[10px] uppercase tracking-widest text-text-soft">
                          <span>{r.city ?? "—"}</span>
                          {r.budget && (
                            <span className="text-gold">Budget: ${Number(r.budget).toFixed(0)}</span>
                          )}
                          {r.needed_by && <span>Date: {r.needed_by}</span>}
                        </div>
                      </div>
                      <span
                        className={`border px-3 py-1 rounded-[3px] font-mono text-[9px] uppercase tracking-widest ${
                          r.status === "open"
                            ? "border-amber-300 text-amber-600 bg-amber-50"
                            : "border-emerald-300 text-emerald-600 bg-emerald-50"
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="mt-6">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-text-soft mb-4">
                        Quotes received ({reqQuotes.length})
                      </p>
                      {reqQuotes.length === 0 ? (
                        <p className="font-sans text-sm text-text-soft italic">
                          Providers are reviewing your brief. Check back shortly.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {reqQuotes.map((q) => {
                            const waNumber = (q.whatsapp ?? q.phone ?? "").replace(/[^\d]/g, "");
                            const waMsg = encodeURIComponent(
                              `Hi! I'd like to accept your $${q.amount} quote for "${r.service_name ?? r.title}" on NexusZim.`,
                            );
                            return (
                              <div
                                key={q.id}
                                className="flex flex-col md:flex-row md:items-center justify-between gap-5 border border-hairline rounded-[3px] p-5 hover:border-forest transition-colors"
                              >
                                <div className="min-w-0">
                                  <p className="font-display text-base text-text">
                                    {q.business_name ?? "Provider"}
                                  </p>
                                  <p className="mt-1 font-display text-2xl text-gold">
                                    ${Number(q.amount).toFixed(0)}
                                  </p>
                                  {q.message && (
                                    <p className="mt-3 font-sans text-[13px] text-text-soft leading-relaxed italic border-l-2 border-gold/30 pl-3">
                                      "{q.message}"
                                    </p>
                                  )}
                                </div>
                                <div className="flex shrink-0 flex-col gap-2 md:w-52">
                                  {q.status === "accepted" ? (
                                    <span className="inline-flex items-center justify-center gap-1.5 border border-emerald-300 bg-emerald-50 px-5 py-2.5 rounded-[3px] font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      Accepted
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => acceptQuote.mutate({ quote: q, request: r })}
                                      disabled={acceptQuote.isPending}
                                      className="inline-flex items-center justify-center gap-2 bg-gold px-5 py-2.5 rounded-[3px] font-mono text-[10px] font-bold uppercase tracking-widest text-forest-ink hover:bg-gold-deep transition-colors disabled:opacity-60"
                                    >
                                      {acceptQuote.isPending ? "Recording…" : "Accept quote"}
                                    </button>
                                  )}
                                  <div className="flex gap-2">
                                    {waNumber && (
                                      <a
                                        href={`https://wa.me/${waNumber}?text=${waMsg}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 text-center inline-flex items-center justify-center gap-2 bg-[#25D366] px-4 py-2 rounded-[3px] font-mono text-[10px] font-bold uppercase tracking-widest text-white hover:opacity-90 transition-opacity"
                                      >
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        Chat
                                      </a>
                                    )}
                                    {q.phone && (
                                      <a
                                        href={`tel:${q.phone}`}
                                        className="flex-1 text-center inline-flex items-center justify-center gap-2 border border-forest/30 px-4 py-2 rounded-[3px] font-mono text-[10px] font-bold uppercase tracking-widest text-forest hover:bg-forest/5 transition-colors"
                                      >
                                        <Phone className="h-3.5 w-3.5" />
                                        Call
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* Jobs & Reviews — the direct-pay trust loop */}
        <JobsSection
          bookings={bookings}
          onMarkComplete={(b) => markComplete.mutate(b)}
          markPending={markComplete.isPending}
          onReview={(b) => setReviewFor(b)}
        />
      </div>

      {reviewFor && (
        <ReviewModal
          booking={reviewFor}
          clientId={user!.id}
          onClose={() => setReviewFor(null)}
          onDone={() => {
            setReviewFor(null);
            refreshLoop();
          }}
        />
      )}
    </div>
  );
}

const BOOKING_BADGE: Record<string, string> = {
  pending: "border-amber-300 text-amber-600 bg-amber-50",
  confirmed: "border-forest/30 text-forest bg-forest/5",
  in_progress: "border-blue-300 text-blue-600 bg-blue-50",
  completed: "border-emerald-300 text-emerald-600 bg-emerald-50",
  cancelled: "border-rose-300 text-rose-600 bg-rose-50",
  refunded: "border-text-soft/30 text-text-soft bg-hairline/30",
};

function JobsSection({
  bookings,
  onMarkComplete,
  markPending,
  onReview,
}: {
  bookings: ClientBooking[];
  onMarkComplete: (b: ClientBooking) => void;
  markPending: boolean;
  onReview: (b: ClientBooking) => void;
}) {
  if (bookings.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 border-b border-hairline pb-3">
        <h2 className="font-display text-2xl text-text">
          Your <em className="italic text-gold">Jobs.</em>
        </h2>
        <div className="h-px flex-1 bg-hairline" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-text-soft">
          {bookings.length} recorded
        </span>
      </div>

      <div className="space-y-3">
        {bookings.map((b) => {
          const canComplete = b.status === "confirmed" || b.status === "in_progress";
          const canReview = b.status === "completed" && !b.reviewed;
          return (
            <div
              key={b.id}
              className="flex flex-col gap-4 border border-hairline bg-cream-raised rounded-[6px] p-5 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-lg text-text">
                    {b.business_name ?? "Provider"}
                  </h3>
                  <span
                    className={`border px-2.5 py-0.5 rounded-[3px] font-mono text-[9px] uppercase tracking-widest ${
                      BOOKING_BADGE[b.status] ?? BOOKING_BADGE.pending
                    }`}
                  >
                    {b.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-text-soft">
                  Agreed: <span className="text-gold">${Number(b.amount).toFixed(0)}</span>
                  <span className="text-text-soft/50"> · paid directly to provider</span>
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                {canComplete && (
                  <button
                    onClick={() => onMarkComplete(b)}
                    disabled={markPending}
                    className="inline-flex items-center justify-center gap-2 border border-forest px-5 py-2.5 rounded-[3px] font-mono text-[10px] font-bold uppercase tracking-widest text-forest hover:bg-forest hover:text-cream transition-colors disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark complete
                  </button>
                )}
                {canReview && (
                  <button
                    onClick={() => onReview(b)}
                    className="inline-flex items-center justify-center gap-2 bg-gold px-5 py-2.5 rounded-[3px] font-mono text-[10px] font-bold uppercase tracking-widest text-forest-ink hover:bg-gold-deep transition-colors"
                  >
                    <Star className="h-3.5 w-3.5" />
                    Leave a review
                  </button>
                )}
                {b.status === "completed" && b.reviewed && (
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-emerald-600">
                    <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                    Reviewed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ReviewModal({
  booking,
  clientId,
  onClose,
  onDone,
}: {
  booking: ClientBooking;
  clientId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (rating < 1) {
      toast.error("Please choose a star rating.");
      return;
    }
    setSubmitting(true);
    // RLS only permits this insert when the booking is `completed` and owned by
    // the client — reviews are earned, not fakeable.
    const { error } = await supabase.from("reviews").insert({
      booking_id: booking.id,
      client_id: clientId,
      provider_id: booking.provider_id,
      rating,
      comment: comment.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Thank you — your review is now part of this provider's record.");
    onDone();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-forest-ink/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-cream-raised border border-hairline rounded-[6px] p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="eyebrow text-text-soft mb-3">
          <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
          Rate your experience
        </p>
        <h3 className="font-display text-2xl text-text">
          {booking.business_name ?? "Provider"}
        </h3>
        <p className="mt-1 font-sans text-[13px] text-text-soft">
          Your honest review builds trust for the whole network.
        </p>

        <div className="mt-6 flex justify-center">
          <StarInput value={rating} onChange={setRating} disabled={submitting} />
        </div>

        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How did it go? What should other clients know?"
          className="mt-5 field-input resize-none w-full"
        />

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 border border-hairline py-3 rounded-[3px] font-sans text-sm font-medium text-text-soft hover:border-forest hover:text-forest transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="flex-1 bg-gold py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream-raised border border-hairline rounded-[6px] p-6">
      <p className="font-display text-4xl text-gold">{value}</p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-text-soft">{label}</p>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 pb-3 pt-1 font-mono text-[10px] uppercase tracking-widest transition-colors border-b-2 -mb-px ${
        active
          ? "border-gold text-forest"
          : "border-transparent text-text-soft hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}
