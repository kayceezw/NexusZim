import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — NexusZim" }] }),
  component: ForgotPasswordPage,
});

const RESEND_COOLDOWN = 60;

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  async function sendLink(targetEmail: string) {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
    setResendCountdown(RESEND_COOLDOWN);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await sendLink(email);
  }

  async function onResend() {
    if (resendCountdown > 0) return;
    await sendLink(email);
  }

  return (
    <div className="bg-cream pt-16 min-h-screen grid place-items-center animate-page-enter">
      <div className="w-full max-w-md my-10 px-5 sm:px-0">
        {/* Brand mark */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="inline-block h-2 w-2 rotate-45 bg-gold" />
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-text-soft">
              NexusZim
            </span>
          </div>
        </div>

        <div className="bg-cream-raised border border-hairline rounded-[6px] p-7 md:p-9 animate-form-enter">
          {!sent ? (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <p className="eyebrow text-text-soft mb-2">
                  <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
                  Password reset
                </p>
                <h1 className="font-display text-2xl text-text">
                  Forgot your <em className="italic text-gold">password?</em>
                </h1>
                <p className="mt-2 font-sans text-sm text-text-soft">
                  Enter your email and we'll send you a reset link right away.
                </p>
              </div>

              {error && (
                <div className="border border-amber-300 bg-amber-50 rounded-[3px] px-4 py-3 font-sans text-sm text-amber-800">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="fp-email"
                  className="block font-mono text-[11px] uppercase tracking-[0.1em] text-text font-medium"
                >
                  Email address <span className="text-gold">*</span>
                </label>
                <input
                  id="fp-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoFocus
                  className="w-full h-11 px-4 bg-cream border border-hairline rounded-[3px] font-sans text-sm text-text placeholder:text-text-soft/50 outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {loading ? "Sending link..." : "Send reset link"}
              </button>

              <p className="text-center font-sans text-[13px] text-text-soft">
                Remembered it?{" "}
                <Link to="/login" className="text-forest hover:underline font-medium">
                  Back to login
                </Link>
              </p>
            </form>
          ) : (
            /* ─── SUCCESS STATE ─── */
            <div className="space-y-5 animate-fade-in">
              <div className="flex justify-center mb-4">
                <span className="h-14 w-14 rounded-full bg-gold/10 flex items-center justify-center">
                  <CheckIcon />
                </span>
              </div>

              <div className="text-center">
                <p className="eyebrow text-text-soft mb-2 justify-center">
                  <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                  Reset link sent!
                </p>
                <h1 className="font-display text-2xl text-text">
                  Check your <em className="italic text-gold">email.</em>
                </h1>
              </div>

              <div className="border border-gold/20 bg-gold/5 rounded-[3px] p-5 space-y-1.5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-gold">
                  Reset link dispatched
                </p>
                <p className="font-sans text-sm text-text-soft">
                  A password reset link was sent to{" "}
                  <span className="font-medium text-text">{email}</span>. Click the link to set a
                  new password.
                </p>
              </div>

              <ul className="space-y-2">
                {[
                  "Check your inbox — the link arrives within 2 minutes.",
                  "Check spam if it's not visible.",
                  "The link expires after 1 hour.",
                ].map((tip) => (
                  <li
                    key={tip}
                    className="flex items-start gap-2 font-sans text-[13px] text-text-soft"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 border border-current" />
                    {tip}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onResend}
                  disabled={resendCountdown > 0 || loading}
                  className="w-full border border-forest/30 py-3 rounded-[3px] font-sans text-sm font-semibold text-forest hover:bg-forest hover:text-cream transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {resendCountdown > 0
                    ? `Resend in ${resendCountdown}s`
                    : loading
                      ? "Sending..."
                      : "Resend link"}
                </button>
                <Link
                  to="/login"
                  className="block w-full border border-hairline py-3 text-center rounded-[3px] font-sans text-sm text-text-soft hover:border-forest hover:text-forest transition-colors"
                >
                  Back to login
                </Link>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setEmail("");
                  setResendCountdown(0);
                }}
                className="w-full text-center font-mono text-[9px] uppercase tracking-widest text-text-soft/40 hover:text-text-soft transition-colors"
              >
                Try a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#e7a020"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
