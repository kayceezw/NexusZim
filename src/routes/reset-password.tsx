import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Credentials — NexusZim" }] }),
  component: ResetPasswordPage,
});

type PageState = "loading" | "ready" | "success" | "expired";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let fallback: ReturnType<typeof setTimeout> | null = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        if (fallback) clearTimeout(fallback);
        setPageState("ready");
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setPageState("ready");
      } else {
        fallback = setTimeout(() => {
          supabase.auth.getSession().then(({ data: d }) => {
            if (!d.session) setPageState("expired");
          });
        }, 2000);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (fallback) clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (pageState === "success") {
      const t = setTimeout(() => navigate({ to: "/login" }), 4000);
      return () => clearTimeout(t);
    }
  }, [pageState, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match — verify both fields.");
      return;
    }
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    await supabase.auth.signOut();
    setLoading(false);
    setPageState("success");
  }

  const strength = getPasswordStrength(password);
  const confirmsMatch = confirm.length > 0 && password === confirm;
  const confirmsMismatch = confirm.length > 0 && password !== confirm;

  return (
    <div className="bg-background pt-24 min-h-screen grid place-items-center">
      <div className="w-full max-w-xl bg-card border border-gold/20 p-10 md:p-14 my-12">
        <div className="flex items-center gap-4">
          <span className="h-px w-8 bg-gold/40" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
            Security Override
          </p>
        </div>

        {pageState === "loading" && (
          <div className="mt-16 mb-8 flex flex-col items-center gap-6">
            <div className="h-8 w-8 border-2 border-gold/20 border-t-gold animate-spin" />
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/40">
              Verifying recovery token...
            </p>
          </div>
        )}

        {pageState === "expired" && (
          <>
            <h1 className="mt-6 font-display text-4xl font-bold text-foreground">
              Link <span className="italic text-rose-500">Expired.</span>
            </h1>
            <p className="mt-4 font-body text-base text-foreground/60">
              This recovery link is no longer valid. Links expire after 1 hour as a security measure. Request a new one to continue.
            </p>
            <Link
              to="/forgot-password"
              className="mt-10 block w-full bg-gold py-5 text-center font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors"
            >
              Request New Link
            </Link>
            <Link
              to="/login"
              className="mt-4 block w-full py-3 text-center font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground/60 transition-colors"
            >
              Return to Portal
            </Link>
          </>
        )}

        {pageState === "ready" && (
          <form onSubmit={onSubmit}>
            <h1 className="mt-6 font-display text-4xl font-bold text-foreground">
              New <span className="italic text-gold">Credentials.</span>
            </h1>
            <p className="mt-4 font-body text-base text-foreground/60">
              Establish your new security credentials. Choose something strong that only you know.
            </p>

            {error && (
              <div className="mt-8 border border-rose-500/30 bg-rose-500/5 p-4 font-body text-sm text-rose-500 italic">
                {error}
              </div>
            )}

            <div className="mt-10 space-y-8">
              {/* New password field */}
              <div className="space-y-3">
                <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-gold/60">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
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

                {/* Strength meter */}
                {password.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-0.5 flex-1 transition-all duration-300 ${i < strength.score ? strength.barColor : "bg-foreground/10"}`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`font-mono text-[9px] font-bold uppercase tracking-widest transition-colors ${strength.textColor}`}>
                        {strength.label}
                      </p>
                    </div>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                      {strength.requirements.map((req) => (
                        <li
                          key={req.label}
                          className={`flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider transition-colors ${req.met ? "text-emerald-500" : "text-foreground/25"}`}
                        >
                          <span className="shrink-0">{req.met ? "✓" : "○"}</span>
                          {req.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm password field */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label
                    className={`block font-mono text-[9px] font-bold uppercase tracking-widest transition-colors ${
                      confirmsMatch
                        ? "text-emerald-500"
                        : confirmsMismatch
                        ? "text-rose-500"
                        : "text-gold/60"
                    }`}
                  >
                    Confirm Password
                  </label>
                  {confirmsMatch && (
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-500">
                      ✓ Match confirmed
                    </span>
                  )}
                  {confirmsMismatch && (
                    <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-rose-500">
                      ✗ Mismatch
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={`w-full bg-background border p-4 pr-12 font-body text-sm text-foreground outline-none placeholder:text-foreground/20 transition-colors ${
                      confirmsMatch
                        ? "border-emerald-500/50 focus:border-emerald-500"
                        : confirmsMismatch
                        ? "border-rose-500/50 focus:border-rose-500"
                        : "border-gold/20 focus:border-gold"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-gold transition-colors"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || confirmsMismatch || password.length < 8}
              className="mt-12 block w-full bg-gold py-5 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors disabled:opacity-40"
            >
              {loading ? "Updating Credentials..." : "Confirm New Credentials"}
            </button>
          </form>
        )}

        {pageState === "success" && (
          <>
            <h1 className="mt-6 font-display text-4xl font-bold text-foreground">
              Credentials <span className="italic text-gold">Updated.</span>
            </h1>
            <div className="mt-8 border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-2">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                Security Override Complete
              </p>
              <p className="font-body text-sm text-foreground/60">
                Your credentials have been successfully updated. Use your new password the next time you access the portal.
              </p>
            </div>
            <p className="mt-6 font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/30">
              Redirecting to portal in 4 seconds...
            </p>
            <Link
              to="/login"
              className="mt-4 block w-full bg-gold py-5 text-center font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors"
            >
              Proceed to Portal
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function getPasswordStrength(password: string) {
  const requirements = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = requirements.filter((r) => r.met).length;
  const levels = [
    { label: "Compromised", barColor: "bg-rose-500", textColor: "text-rose-500" },
    { label: "Minimal", barColor: "bg-orange-500", textColor: "text-orange-500" },
    { label: "Adequate", barColor: "bg-amber-500", textColor: "text-amber-500" },
    { label: "Strong", barColor: "bg-gold", textColor: "text-gold" },
    { label: "Secure", barColor: "bg-emerald-500", textColor: "text-emerald-500" },
  ];
  return { score, requirements, ...levels[Math.min(score, 4)] };
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
