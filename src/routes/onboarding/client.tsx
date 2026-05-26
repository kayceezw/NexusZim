import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { RequireAuth } from "@/components/require-auth";

export const Route = createFileRoute("/onboarding/client")({
  head: () => ({ meta: [{ title: "Client onboarding — NexusZim" }] }),
  component: () => (
    <RequireAuth roles={["client"]} requireOnboarding={false}>
      <ClientOnboarding />
    </RequireAuth>
  ),
});

const CITIES = ["Harare", "Bulawayo", "Mutare", "Gweru", "Masvingo", "Victoria Falls", "Other"];

function ClientOnboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Harare");
  const [preferred, setPreferred] = useState<"email" | "phone" | "whatsapp">("whatsapp");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    const { error: e1 } = await supabase.from("client_profiles").upsert({
      user_id: user.id,
      phone,
      city,
      preferred_contact: preferred,
    });
    if (e1) {
      setError(e1.message);
      setLoading(false);
      return;
    }
    const { error: e2 } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", user.id);
    if (e2) {
      setError(e2.message);
      setLoading(false);
      return;
    }
    await refreshProfile();
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="container-page grid min-h-[80vh] place-items-center py-12">
      <form onSubmit={onSubmit} className="w-full max-w-lg rounded-2xl border border-border bg-card p-8">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          Step 1 of 1
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold">Tell us about you</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A few details so providers can reach you quickly.
        </p>

        {error && (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Phone (WhatsApp preferred)</span>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+263 7..."
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">City</span>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="input">
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Preferred contact</legend>
            <div className="grid grid-cols-3 gap-2">
              {(["whatsapp", "phone", "email"] as const).map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setPreferred(opt)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize transition-colors ${
                    preferred === opt
                      ? "border-gold bg-gold/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 block w-full rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-accent disabled:opacity-60"
        >
          {loading ? "Saving..." : "Finish & go to dashboard"}
        </button>
      </form>
      <style>{`
        .input { width: 100%; border-radius: 0.625rem; border: 1px solid var(--border); background: var(--background); padding: 0.65rem 0.85rem; font-size: 0.875rem; }
        .input:focus { border-color: var(--ring); outline: none; }
      `}</style>
    </div>
  );
}
