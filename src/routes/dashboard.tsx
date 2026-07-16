import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { MessageSquare, Phone } from "lucide-react";

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

function DashboardPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data: reqs } = await supabase
        .from("requests")
        .select("id, title, service_name, city, budget, needed_by, status, created_at")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      setRequests(reqs ?? []);

      const ids = (reqs ?? []).map((r) => r.id);
      if (ids.length > 0) {
        const { data: qs } = await supabase
          .from("quotes")
          .select("id, request_id, provider_id, amount, message, status, created_at")
          .in("request_id", ids)
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
        const merged: QuoteRow[] = (qs ?? []).map((q) => ({
          ...q,
          business_name: profilesMap.get(q.provider_id)?.business_name ?? null,
          phone: profilesMap.get(q.provider_id)?.phone ?? null,
          whatsapp: profilesMap.get(q.provider_id)?.whatsapp ?? null,
        }));
        if (!cancelled) setQuotes(merged);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const openCount = requests.filter((r) => r.status === "open").length;
  const [activeTab, setActiveTab] = useState<"open" | "all">("open");
  const visibleRequests =
    activeTab === "open" ? requests.filter((r) => r.status === "open") : requests;

  return (
    <div className="bg-cream pt-16 min-h-screen">
      {/* Forest header */}
      <div className="bg-forest border-b border-cream/10">
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
                                <div className="flex shrink-0 gap-2">
                                  {waNumber && (
                                    <a
                                      href={`https://wa.me/${waNumber}?text=${waMsg}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-1 md:flex-none text-center inline-flex items-center justify-center gap-2 bg-[#25D366] px-5 py-2.5 rounded-[3px] font-mono text-[10px] font-bold uppercase tracking-widest text-white hover:opacity-90 transition-opacity"
                                    >
                                      <MessageSquare className="h-3.5 w-3.5" />
                                      Accept via WhatsApp
                                    </a>
                                  )}
                                  {q.phone && (
                                    <a
                                      href={`tel:${q.phone}`}
                                      className="flex-1 md:flex-none text-center inline-flex items-center justify-center gap-2 border border-forest/30 px-5 py-2.5 rounded-[3px] font-mono text-[10px] font-bold uppercase tracking-widest text-forest hover:bg-forest/5 transition-colors"
                                    >
                                      <Phone className="h-3.5 w-3.5" />
                                      Call
                                    </a>
                                  )}
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
