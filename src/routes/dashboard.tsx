import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

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
        let profilesMap = new Map<string, { business_name: string; phone: string | null; whatsapp: string | null }>();
        if (providerIds.length > 0) {
          const { data: profs } = await supabase
            .from("provider_profiles")
            .select("user_id, business_name, phone, whatsapp")
            .in("user_id", providerIds);
          profilesMap = new Map((profs ?? []).map((p) => [p.user_id, { business_name: p.business_name, phone: p.phone, whatsapp: p.whatsapp }]));
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

  return (
    <div className="container-page py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-wider text-teal">
            Client dashboard
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Your requests
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Providers will reach out by WhatsApp or email. Reply to lock in your quote.
          </p>
        </div>
        <Link
          to="/categories"
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-accent"
        >
          New request
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Open requests" value={String(requests.filter((r) => r.status === "open").length)} />
        <StatCard label="Quotes received" value={String(quotes.length)} />
        <StatCard label="Total requests" value={String(requests.length)} />
      </div>

      <section className="mt-10 space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="font-display text-lg font-semibold">No requests yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse a category and add services to your cart to send your first request.
            </p>
            <Link
              to="/categories"
              className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-accent"
            >
              Browse categories
            </Link>
          </div>
        ) : (
          requests.map((r) => {
            const reqQuotes = quotes.filter((q) => q.request_id === r.id);
            return (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold">{r.service_name ?? r.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.city ?? "—"}
                      {r.budget ? ` · Budget $${Number(r.budget).toFixed(0)}` : ""}
                      {r.needed_by ? ` · Needed by ${r.needed_by}` : ""}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      r.status === "open"
                        ? "bg-warning/15 text-warning"
                        : "bg-success/10 text-success"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Quotes ({reqQuotes.length})
                  </p>
                  {reqQuotes.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Waiting for providers to respond...
                    </p>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {reqQuotes.map((q) => {
                        const waNumber = (q.whatsapp ?? q.phone ?? "").replace(/[^\d]/g, "");
                        const waMsg = encodeURIComponent(
                          `Hi! I'd like to accept your $${q.amount} quote for "${r.service_name ?? r.title}" on NexusZim.`,
                        );
                        return (
                          <div
                            key={q.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-3"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold">
                                {q.business_name ?? "Provider"}
                                <span className="ml-2 font-display text-base">${Number(q.amount).toFixed(0)}</span>
                              </p>
                              {q.message && (
                                <p className="mt-0.5 text-xs text-muted-foreground">{q.message}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {waNumber && (
                                <a
                                  href={`https://wa.me/${waNumber}?text=${waMsg}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                                >
                                  💬 WhatsApp
                                </a>
                              )}
                              {q.phone && (
                                <a
                                  href={`tel:${q.phone}`}
                                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                                >
                                  📞 Call
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
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
