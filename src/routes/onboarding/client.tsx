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
    <div className="bg-background pt-24 min-h-screen grid place-items-center">
      <form onSubmit={onSubmit} className="w-full max-w-2xl bg-card border border-gold/20 p-10 md:p-14 my-12">
        <div className="flex items-center gap-4">
             <span className="h-px w-8 bg-gold/40" />
             <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
               Onboarding Phase
             </p>
        </div>
        <h1 className="mt-6 font-display text-4xl font-bold text-foreground">Operational <span className="italic text-gold">Brief.</span></h1>
        <p className="mt-4 font-body text-base text-foreground/60">
            Define your preferences so our network of fixers can respond with optimal speed and precision.
        </p>

        {error && (
          <div className="mt-8 border border-rose-500/30 bg-rose-500/5 p-4 font-body text-sm text-rose-500 italic">
            {error}
          </div>
        )}

        <div className="mt-10 space-y-8">
          <Input 
            label="Secure Line / Phone (WhatsApp Preferred)" 
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+263 7..."
          />
          
          <div className="space-y-3">
            <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-gold/60">Base City</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-background border border-gold/20 p-4 font-mono text-[11px] font-bold uppercase tracking-widest text-foreground outline-none focus:border-gold">
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-gold/60">Preferred Intelligence Vector</label>
            <div className="grid grid-cols-3 gap-4">
              {(["whatsapp", "phone", "email"] as const).map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setPreferred(opt)}
                  className={`border px-3 py-3 font-mono text-[9px] font-bold uppercase tracking-widest transition-all ${
                    preferred === opt
                      ? "border-gold bg-gold text-white"
                      : "border-gold/20 text-gold/40 hover:border-gold/40"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-12 block w-full bg-gold py-5 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors disabled:opacity-60"
        >
          {loading ? "Synchronizing Data..." : "Finalize Deployment"}
        </button>
        <p className="mt-6 text-center font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/30">
          Welcome to the NexusZim intelligence layer.
        </p>
      </form>
    </div>
  );
}

function Input({
    label,
    ...rest
  }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
      <div className="space-y-3">
        <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-gold/60">{label}</label>
        <input {...rest} className="w-full bg-background border border-gold/20 p-4 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20" />
      </div>
    );
}

