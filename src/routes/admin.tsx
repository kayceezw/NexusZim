import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
        .select("user_id, business_name, city, phone, whatsapp, bio, website, verified, created_at, category_id, categories(name)")
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

  const setVerified = useMutation({
    mutationFn: async ({ userId, verified }: { userId: string; verified: boolean }) => {
      const { error } = await supabase
        .from("provider_profiles")
        .update({ verified })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(v.verified ? "Provider approved" : "Verification revoked");
      qc.invalidateQueries({ queryKey: ["admin", "providers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pending = (providers ?? []).filter((p) => !p.verified);
  const approved = (providers ?? []).filter((p) => p.verified);

  return (
    <div className="container-page py-10 md:py-14">
      <p className="font-display text-xs font-semibold uppercase tracking-wider text-teal">
        Admin console
      </p>
      <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
        Platform overview
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Clients" value={String(clients?.length ?? "—")} />
        <Tile label="Providers" value={String(providers?.length ?? "—")} />
        <Tile label="Pending verifications" value={String(pending.length)} />
        <Tile label="Requests (recent)" value={String(requests?.length ?? "—")} />
      </div>

      <section className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold">
          Pending provider verifications ({pending.length})
        </h2>
        <div className="mt-4 space-y-3">
          {pending.length === 0 && (
            <p className="text-sm text-muted-foreground">No pending verifications.</p>
          )}
          {pending.map((p) => (
            <div
              key={p.user_id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold">{p.business_name}</p>
                <p className="text-xs text-muted-foreground">
                  {(p.categories as { name: string } | null)?.name ?? "No category"} ·{" "}
                  {p.city ?? "—"} · {p.phone ?? "no phone"}
                  {p.whatsapp ? ` · WhatsApp ${p.whatsapp}` : ""}
                </p>
                {p.bio && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.bio}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setVerified.mutate({ userId: p.user_id, verified: false })}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                >
                  Skip
                </button>
                <button
                  onClick={() => setVerified.mutate({ userId: p.user_id, verified: true })}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Verified providers ({approved.length})</h2>
          <div className="mt-4 space-y-2 text-sm">
            {approved.length === 0 && <p className="text-muted-foreground">None yet.</p>}
            {approved.map((p) => (
              <div key={p.user_id} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.business_name}</p>
                  <p className="text-xs text-muted-foreground">{(p.categories as { name: string } | null)?.name ?? "—"} · {p.city ?? "—"}</p>
                </div>
                <button
                  onClick={() => setVerified.mutate({ userId: p.user_id, verified: false })}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Clients ({clients?.length ?? 0})</h2>
          <div className="mt-4 space-y-2 text-sm">
            {(clients ?? []).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.full_name || "(no name)"}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                </div>
                <span className={`text-xs ${c.onboarding_completed ? "text-teal" : "text-muted-foreground"}`}>
                  {c.onboarding_completed ? "onboarded" : "pending"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold">Recent service requests</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2 pr-3">Title</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Client</th>
                <th className="py-2 pr-3">City</th>
                <th className="py-2 pr-3">Budget</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(requests ?? []).map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="py-2 pr-3 font-medium">{r.title}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{(r.categories as { name: string } | null)?.name ?? "—"}</td>
                  <td className="py-2 pr-3 text-muted-foreground">
                    {r.client_name ?? "—"}
                    {r.client_email ? <span className="block text-xs">{r.client_email}</span> : null}
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">{r.city ?? "—"}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{r.budget ? `$${r.budget}` : "—"}</td>
                  <td className="py-2 pr-3"><span className="rounded-md bg-muted px-2 py-0.5 text-xs">{r.status}</span></td>
                </tr>
              ))}
              {(!requests || requests.length === 0) && (
                <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">No requests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
