import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Recovery Protocol — NexusZim" }] }),
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
    <div className="bg-background pt-24 min-h-screen grid place-items-center">
      <div className="w-full max-w-xl bg-card border border-gold/20 p-10 md:p-14 my-12">
        <div className="flex items-center gap-4">
          <span className="h-px w-8 bg-gold/40" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
            Recovery Protocol
          </p>
        </div>

        {!sent ? (
          <form onSubmit={onSubmit}>
            <h1 className="mt-6 font-display text-4xl font-bold text-foreground">
              Credential <span className="italic text-gold">Recovery.</span>
            </h1>
            <p className="mt-4 font-body text-base text-foreground/60">
              Enter your registered email address. We will dispatch a secure recovery link within moments.
            </p>

            {error && (
              <div className="mt-8 border border-rose-500/30 bg-rose-500/5 p-4 font-body text-sm text-rose-500 italic">
                {error}
              </div>
            )}

            <div className="mt-10">
              <div className="space-y-3">
                <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-gold/60">
                  Registered Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@nexus.zw"
                  autoFocus
                  className="w-full bg-background border border-gold/20 p-4 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-12 block w-full bg-gold py-5 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors disabled:opacity-60"
            >
              {loading ? "Dispatching Link..." : "Send Recovery Link"}
            </button>

            <p className="mt-8 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/30">
              Credentials recovered?{" "}
              <Link to="/login" className="text-gold hover:text-foreground transition-colors">
                Return to Portal
              </Link>
            </p>
          </form>
        ) : (
          <div>
            <h1 className="mt-6 font-display text-4xl font-bold text-foreground">
              Link <span className="italic text-gold">Dispatched.</span>
            </h1>
            <div className="mt-8 border border-gold/20 bg-gold/5 p-6 space-y-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
                Recovery Transmission Sent
              </p>
              <p className="font-body text-sm text-foreground/60">
                A secure recovery link has been sent to{" "}
                <span className="text-foreground font-bold">{email}</span>. Follow the link to reset your credentials.
              </p>
            </div>
            <ul className="mt-6 space-y-3">
              {[
                "Check your inbox — the link arrives within 2 minutes.",
                "Scan your spam or junk folder if it's not visible.",
                "The link expires after 1 hour for your security.",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-3 font-body text-sm text-foreground/50">
                  <span className="mt-[6px] h-1.5 w-1.5 shrink-0 bg-gold/40" />
                  {tip}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={onResend}
                disabled={resendCountdown > 0 || loading}
                className="block w-full border border-gold/20 py-4 font-display text-sm font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {resendCountdown > 0
                  ? `Resend available in ${resendCountdown}s`
                  : loading
                  ? "Sending..."
                  : "Resend Recovery Link"}
              </button>
              <Link
                to="/login"
                className="block w-full border border-gold/10 py-4 text-center font-display text-sm font-bold uppercase tracking-widest text-foreground/40 hover:text-gold hover:border-gold/20 transition-colors"
              >
                Return to Portal
              </Link>
            </div>
            <button
              type="button"
              onClick={() => { setSent(false); setEmail(""); setResendCountdown(0); }}
              className="mt-4 block w-full py-3 text-center font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground/60 transition-colors"
            >
              Try a different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
