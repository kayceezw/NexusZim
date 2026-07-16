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
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="border border-rose-200 bg-rose-50 rounded-[3px] px-4 py-3 font-sans text-sm text-rose-600">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">
                  Email <span className="text-gold">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoFocus
                  className="field-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors disabled:opacity-60"
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
            <div className="space-y-5">
              <div>
                <p className="eyebrow text-text-soft mb-2">
                  <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                  Check your inbox
                </p>
                <h1 className="font-display text-2xl text-text">
                  Link <em className="italic text-gold">sent.</em>
                </h1>
              </div>

              <div className="border border-gold/20 bg-gold/5 rounded-[3px] p-5 space-y-1.5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-gold">
                  Reset link dispatched
                </p>
                <p className="font-sans text-sm text-text-soft">
                  A reset link was sent to{" "}
                  <span className="font-medium text-text">{email}</span>.
                </p>
              </div>

              <ul className="space-y-2">
                {[
                  "Check your inbox — the link arrives within 2 minutes.",
                  "Check spam if it's not visible.",
                  "The link expires after 1 hour.",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 font-sans text-[13px] text-text-soft">
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
