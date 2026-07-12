import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — NexusZim" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/onboarding" });
  }

  return (
    <div className="bg-background pt-24 min-h-screen grid place-items-center">
      <form onSubmit={onSubmit} className="w-full max-w-xl bg-card border border-gold/20 p-10 md:p-14 my-12">
        <div className="flex items-center gap-4">
             <span className="h-px w-8 bg-gold/40" />
             <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
               Secure Access
             </p>
        </div>
        <h1 className="mt-6 font-display text-4xl font-bold text-foreground">Welcome <span className="italic text-gold">Back.</span></h1>
        <p className="mt-4 font-body text-base text-foreground/60">
            Log in to manage your active missions, track quotes, and access intelligence.
        </p>

        {error && (
          <div className="mt-8 border border-rose-500/30 bg-rose-500/5 p-4 font-body text-sm text-rose-500 italic">
            {error}
          </div>
        )}

        <div className="mt-10 space-y-8">
          <Input
            label="Secure Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@nexus.zw"
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-gold/60">
                Security Password
              </label>
              <Link
                to="/forgot-password"
                className="font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/30 hover:text-gold transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-gold/20 p-4 pr-12 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-gold transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-12 block w-full bg-gold py-5 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors disabled:opacity-60"
        >
          {loading ? "Authenticating..." : "Authorize Entry"}
        </button>

        <p className="mt-8 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/30">
          New operative?{" "}
          <Link to="/signup" className="text-gold hover:text-foreground transition-colors">
            Initialize Account
          </Link>
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

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

