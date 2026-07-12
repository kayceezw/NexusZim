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
  const closedCount = requests.filter((r) => r.status !== "open").length;
  const [activeTab, setActiveTab] = useState<"open" | "all">("open");
  const visibleRequests =
    activeTab === "open" ? requests.filter((r) => r.status === "open") : requests;

  return (
    <div className="bg-background pt-24 min-h-screen">
      <div className="container-page py-12 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between border-b border-gold/20 pb-10">
          <div>
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gold/40" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
                Client Command
              </span>
            </div>
            <h1 className="mt-4 font-display text-5xl font-bold text-foreground md:text-6xl">
              Your <span className="italic text-gold">Briefs.</span>
            </h1>
          </div>
          <div className="mt-6 md:mt-0 flex gap-4">
            <Link
              to="/request"
              className="bg-gold px-8 py-4 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors"
            >
              New Brief
            </Link>
            <Link
              to="/search"
              className="border border-gold/30 px-8 py-4 font-display text-sm font-bold uppercase tracking-widest text-gold hover:bg-gold/5 transition-colors"
            >
              Browse Fixers
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <StatCard label="Open Briefs" value={String(openCount)} />
          <StatCard label="Quotes Received" value={String(quotes.length)} />
          <StatCard label="Total Ops" value={String(requests.length)} />
        </div>

        {/* Tab filter */}
        {requests.length > 0 && (
          <div className="mt-12 flex gap-6 border-b border-foreground/5 pb-4">
            <TabBtn active={activeTab === "open"} onClick={() => setActiveTab("open")}>
              Open Briefs ({openCount})
            </TabBtn>
            <TabBtn active={activeTab === "all"} onClick={() => setActiveTab("all")}>
              All Briefs ({requests.length})
            </TabBtn>
          </div>
        )}

        <section className="mt-8 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 skeleton" />
              ))}
            </div>
          ) : visibleRequests.length === 0 && requests.length === 0 ? (
            <div className="border border-dashed border-gold/20 bg-card/20 p-20 text-center">
              <p className="font-display text-2xl font-bold text-foreground uppercase tracking-widest">
                No Active Missions
              </p>
              <p className="mt-4 font-body text-sm text-foreground/40 max-w-md mx-auto">
                Your enquiry stream is empty. Start by browsing our verified network of providers.
              </p>
              <Link
                to="/search"
                className="mt-8 inline-block border border-gold px-10 py-4 font-mono text-xs font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-white transition-colors"
              >
                Browse Network
              </Link>
            </div>
          ) : visibleRequests.length === 0 ? (
            <div className="border border-dashed border-gold/20 bg-card/20 p-16 text-center">
              <p className="font-display text-xl font-bold text-foreground/40 uppercase tracking-widest">
                No {activeTab === "open" ? "open" : ""} briefs
              </p>
            </div>
          ) : (
            visibleRequests.map((r) => {
              const reqQuotes = quotes.filter((q) => q.request_id === r.id);
              return (
                <div
                  key={r.id}
                  className="border border-gold/10 bg-card p-8 md:p-10 transition-all hover:border-gold/30"
                >
                  <div className="flex flex-wrap items-start justify-between gap-6 border-b border-gold/10 pb-8">
                    <div>
                      <h3 className="font-display text-2xl font-bold text-foreground">
                        {r.service_name ?? r.title}
                      </h3>
                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                        <span className="flex items-center gap-2">
                          <span className="text-gold/60">LOC:</span> {r.city ?? "—"}
                        </span>
                        {r.budget && (
                          <span className="flex items-center gap-2">
                            <span className="text-gold/60">BUDGET:</span> $
                            {Number(r.budget).toFixed(0)}
                          </span>
                        )}
                        {r.needed_by && (
                          <span className="flex items-center gap-2">
                            <span className="text-gold/60">DATE:</span> {r.needed_by}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`border px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-widest ${
                        r.status === "open"
                          ? "border-amber-500/30 text-amber-500 bg-amber-500/5"
                          : "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <div className="mt-10">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60">
                      Incoming Quotes ({reqQuotes.length})
                    </p>
                    {reqQuotes.length === 0 ? (
                      <p className="mt-6 font-body text-sm text-foreground/30 italic">
                        Providers are reviewing your brief. Check back shortly.
                      </p>
                    ) : (
                      <div className="mt-8 grid gap-4">
                        {reqQuotes.map((q) => {
                          const waNumber = (q.whatsapp ?? q.phone ?? "").replace(/[^\d]/g, "");
                          const waMsg = encodeURIComponent(
                            `Hi! I'd like to accept your $${q.amount} quote for "${r.service_name ?? r.title}" on NexusZim.`,
                          );
                          return (
                            <div
                              key={q.id}
                              className="flex flex-col md:flex-row md:items-center justify-between gap-6 border border-gold/5 bg-background/50 p-6 hover:border-gold/20 transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="font-display text-lg font-bold text-foreground">
                                  {q.business_name ?? "Provider"}
                                </p>
                                <p className="mt-1 font-display text-xl text-gold">
                                  ${Number(q.amount).toFixed(0)}
                                </p>
                                {q.message && (
                                  <p className="mt-4 font-body text-sm text-foreground/60 leading-relaxed italic border-l border-gold/20 pl-4">
                                    "{q.message}"
                                  </p>
                                )}
                              </div>
                              <div className="flex shrink-0 gap-3">
                                {waNumber && (
                                  <a
                                    href={`https://wa.me/${waNumber}?text=${waMsg}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 md:flex-none text-center inline-flex items-center justify-center gap-2 bg-[#25D366] px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white hover:opacity-90 transition-opacity"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    Accept via WhatsApp
                                  </a>
                                )}
                                {q.phone && (
                                  <a
                                    href={`tel:${q.phone}`}
                                    className="flex-1 md:flex-none text-center inline-flex items-center justify-center gap-2 border border-gold/30 px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-gold hover:bg-gold/5"
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
    <div className="border border-gold/20 bg-card p-8 transition-all hover:border-gold/40">
      <p className="font-display text-4xl font-bold text-gold">{value}</p>
      <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/40">
        {label}
      </p>
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
      className={`pb-3 font-mono text-xs font-bold uppercase tracking-widest transition-colors border-b-2 ${
        active
          ? "border-gold text-gold"
          : "border-transparent text-foreground/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
