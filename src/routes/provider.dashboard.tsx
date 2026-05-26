import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

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
  categories: { name: string } | null;
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

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data: prov } = await supabase
        .from("provider_profiles")
        .select("business_name, category_id, verified, categories(name)")
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
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function sendQuote(requestId: string) {
    if (!user) return;
    const amountStr = window.prompt("Quote amount (USD):");
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Enter a valid amount.");
      return;
    }
    const message = window.prompt("Optional message to client:") ?? "";
    const { data, error } = await supabase
      .from("quotes")
      .insert({ request_id: requestId, provider_id: user.id, amount, message })
      .select("id, request_id, amount, status")
      .single();
    if (error) {
      alert(error.message);
      return;
    }
    if (data) setMyQuotes((q) => [...q, data]);
  }

  const quotedRequestIds = new Set(myQuotes.map((q) => q.request_id));

  return (
    <div className="container-page py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-wider text-teal">
            Provider dashboard
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
            {provider?.business_name ?? "Your business"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {provider?.categories?.name ?? "Set your category in onboarding"} ·{" "}
            {provider?.verified ? (
              <span className="text-teal">Verified</span>
            ) : (
              <span className="text-gold">Pending verification</span>
            )}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Open requests in your category" value={String(requests.length)} />
        <Stat label="Quotes you've sent" value={String(myQuotes.length)} />
        <Stat label="Status" value={provider?.verified ? "Live" : "Pending"} />
      </div>

      <section className="mt-10 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">
            Open requests in {provider?.categories?.name ?? "your category"}
          </h2>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No open requests yet. They'll appear here the moment a client places an order.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {requests.map((r) => {
              const alreadyQuoted = quotedRequestIds.has(r.id);
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
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{r.service_name ?? r.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {r.city ?? "—"}
                        {r.budget ? ` · Budget $${Number(r.budget).toFixed(0)}` : ""}
                        {r.needed_by ? ` · Needed by ${r.needed_by}` : ""}
                        {" · "}
                        {timeAgo(r.created_at)}
                      </p>
                      {r.description && (
                        <p className="mt-2 text-sm text-foreground/80">{r.description}</p>
                      )}
                      {(r.client_name || r.client_phone || r.client_email) && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Client: <span className="text-foreground">{r.client_name ?? "—"}</span>
                          {r.client_phone && <> · {r.client_phone}</>}
                          {r.client_email && <> · {r.client_email}</>}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => sendQuote(r.id)}
                      disabled={alreadyQuoted}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-accent disabled:opacity-60"
                    >
                      {alreadyQuoted ? "Quoted" : "Send quote"}
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {waNumber && (
                      <a
                        href={`https://wa.me/${waNumber}?text=${waMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                      >
                        💬 WhatsApp client
                      </a>
                    )}
                    {r.client_email && (
                      <a
                        href={`mailto:${r.client_email}?subject=${emailSubject}&body=${emailBody}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                      >
                        ✉️ Email quote
                      </a>
                    )}
                    {r.client_phone && (
                      <a
                        href={`tel:${r.client_phone}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted"
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
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
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
