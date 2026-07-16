import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — NexusZim" }] }),
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
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
      setError("Passwords do not match.");
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
    <div className="bg-cream pt-16 min-h-screen grid place-items-center">
      <div className="w-full max-w-md my-10 px-5 sm:px-0">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="inline-block h-2 w-2 rotate-45 bg-gold" />
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-soft">
              NexusZim
            </span>
          </div>
        </div>

        <div className="bg-cream-raised border border-hairline rounded-[6px] p-7 md:p-9">
          {pageState === "loading" && (
            <div className="py-16 flex flex-col items-center gap-5">
              <div className="h-7 w-7 border-2 border-hairline border-t-forest rounded-full animate-spin" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-soft/60">
                Verifying reset link...
              </p>
            </div>
          )}

          {pageState === "expired" && (
            <div className="space-y-5">
              <div>
                <p className="eyebrow text-text-soft mb-2">
                  <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
                  Link expired
                </p>
                <h1 className="font-display text-2xl text-text">
                  Reset link <em className="italic text-rose-500">expired.</em>
                </h1>
                <p className="mt-2 font-sans text-sm text-text-soft">
                  This link is no longer valid — links expire after 1 hour. Request a new one.
                </p>
              </div>
              <Link
                to="/forgot-password"
                className="block w-full bg-gold py-3.5 text-center rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
              >
                Request new link
              </Link>
              <Link
                to="/login"
                className="block w-full border border-hairline py-3 text-center rounded-[3px] font-sans text-sm text-text-soft hover:border-forest hover:text-forest transition-colors"
              >
                Back to login
              </Link>
            </div>
          )}

          {pageState === "ready" && (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <p className="eyebrow text-text-soft mb-2">
                  <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
                  Reset password
                </p>
                <h1 className="font-display text-2xl text-text">
                  Choose a new <em className="italic text-gold">password.</em>
                </h1>
                <p className="mt-2 font-sans text-sm text-text-soft">
                  Pick something strong that only you know.
                </p>
              </div>

              {error && (
                <div className="border border-rose-200 bg-rose-50 rounded-[3px] px-4 py-3 font-sans text-sm text-rose-600">
                  {error}
                </div>
              )}

              {/* New password */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">
                  New password <span className="text-gold">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    className="field-input pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-soft/40 hover:text-forest transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {/* Strength meter */}
                {password.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < strength.score ? strength.barColor : "bg-hairline"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`font-mono text-[9px] uppercase tracking-widest ${strength.textColor}`}>
                        {strength.label}
                      </p>
                    </div>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {strength.requirements.map((req) => (
                        <li
                          key={req.label}
                          className={`flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider transition-colors ${
                            req.met ? "text-emerald-500" : "text-text-soft/30"
                          }`}
                        >
                          <span className="shrink-0">{req.met ? "✓" : "○"}</span>
                          {req.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className={`font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
                      confirmsMatch
                        ? "text-emerald-500"
                        : confirmsMismatch
                          ? "text-rose-500"
                          : "text-text-soft"
                    }`}
                  >
                    Confirm password <span className="text-gold">*</span>
                  </label>
                  {confirmsMatch && (
                    <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-500">
                      ✓ Matches
                    </span>
                  )}
                  {confirmsMismatch && (
                    <span className="font-mono text-[9px] uppercase tracking-widest text-rose-500">
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
                    className={`field-input pr-11 transition-colors ${
                      confirmsMatch
                        ? "border-emerald-300 focus:border-emerald-500"
                        : confirmsMismatch
                          ? "border-rose-300 focus:border-rose-500"
                          : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-soft/40 hover:text-forest transition-colors"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || confirmsMismatch || password.length < 8}
                className="w-full bg-gold py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors disabled:opacity-50"
              >
                {loading ? "Updating password..." : "Set new password"}
              </button>
            </form>
          )}

          {pageState === "success" && (
            <div className="space-y-5 text-center py-4">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-emerald-500" strokeWidth={1.5} />
                </div>
              </div>
              <p className="eyebrow text-text-soft">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                Password updated
              </p>
              <h1 className="font-display text-2xl text-text">
                All <em className="italic text-gold">done.</em>
              </h1>
              <div className="border border-emerald-200 bg-emerald-50 rounded-[6px] p-5">
                <p className="font-sans text-sm text-emerald-700 leading-relaxed">
                  Your password has been updated. Use it to log in from now on.
                </p>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-text-soft/50">
                Redirecting to login in 4 seconds...
              </p>
              <Link
                to="/login"
                className="block w-full bg-gold py-3.5 text-center rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
              >
                Go to login
              </Link>
            </div>
          )}
        </div>
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
    { label: "Weak", barColor: "bg-rose-500", textColor: "text-rose-500" },
    { label: "Minimal", barColor: "bg-orange-400", textColor: "text-orange-500" },
    { label: "Fair", barColor: "bg-amber-400", textColor: "text-amber-600" },
    { label: "Strong", barColor: "bg-gold", textColor: "text-gold" },
    { label: "Secure", barColor: "bg-emerald-500", textColor: "text-emerald-600" },
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
