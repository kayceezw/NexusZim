import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — NexusZim" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"client" | "service_provider">("client");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // confirmationPending = email confirm is required (Supabase returned no session)
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function resendConfirmation() {
    setResending(true);
    setError(null);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setResending(false);
    if (error) setError(error.message);
    else setResent(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: fullName, role },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // If Supabase returned a live session, email confirmation is disabled — go straight to onboarding
    if (data.session) {
      navigate({ to: "/onboarding" });
      return;
    }

    // No session means Supabase sent a confirmation email first
    // Show a clear confirmation-pending message instead of silently failing
    setConfirmationPending(true);
  }

  // ─── Confirmation pending state ───
  if (confirmationPending) {
    return (
      <div className="bg-background pt-16 min-h-screen grid place-items-center animate-page-enter">
        <div className="w-full max-w-md my-10 px-5 sm:px-0">
          <div className="bg-card border border-border rounded-[6px] p-7 md:p-9 space-y-5 animate-form-enter text-center">
            <div className="flex justify-center mb-2">
              <span className="h-14 w-14 rounded-full bg-gold/10 flex items-center justify-center">
                <MailIcon />
              </span>
            </div>
            <div>
              <p className="eyebrow text-muted-foreground mb-2 justify-center">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                Almost there
              </p>
              <h1 className="font-display text-2xl text-foreground">
                Check your <em className="italic text-gold">email.</em>
              </h1>
            </div>

            <div className="border border-gold/20 bg-gold/5 rounded-[3px] p-5 text-left">
              <p className="font-mono text-[10px] uppercase tracking-widest text-gold mb-2">
                Confirmation link sent
              </p>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                We sent a confirmation link to{" "}
                <span className="font-medium text-foreground">{email}</span>. Click the link in that
                email to activate your account, then log in.
              </p>
            </div>

            <ul className="space-y-2 text-left">
              {[
                "The link arrives within 2 minutes.",
                "Check your spam folder if it's not in your inbox.",
                "The link expires after 24 hours.",
              ].map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-2 font-sans text-[13px] text-muted-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 border border-current" />
                  {tip}
                </li>
              ))}
            </ul>

            <Link
              to="/login"
              className="block w-full bg-gold py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors text-center"
            >
              Go to Login
            </Link>

            {resent ? (
              <p className="font-sans text-[13px] text-emerald-600 dark:text-emerald-400">
                ✓ New confirmation link sent to {email}.
              </p>
            ) : (
              <button
                type="button"
                onClick={resendConfirmation}
                disabled={resending}
                className="w-full text-center font-sans text-[13px] font-semibold text-primary hover:text-gold-deep transition-colors disabled:opacity-60"
              >
                {resending ? "Sending…" : "Didn't get it? Resend confirmation email"}
              </button>
            )}
            {error && <p className="font-sans text-[13px] text-rose-600 dark:text-rose-400">{error}</p>}

            <button
              type="button"
              onClick={() => setConfirmationPending(false)}
              className="w-full text-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            >
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background pt-16 min-h-screen grid place-items-center animate-page-enter">
      <div className="w-full max-w-md my-10 px-5 sm:px-0">
        {/* Brand mark */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="inline-block h-2 w-2 rotate-45 bg-gold" />
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              NexusZim
            </span>
          </div>
          <h1 className="font-display text-3xl text-foreground">
            Join the <em className="italic text-gold">register.</em>
          </h1>
          <p className="mt-2 font-sans text-sm text-muted-foreground">
            Create your account to post briefs or list your business.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-card border border-border rounded-[6px] p-7 md:p-9 space-y-5 animate-form-enter"
        >
          {error && (
            <div
              role="alert"
              className="border border-amber-500/40 bg-amber-500/10 rounded-[3px] px-4 py-3 font-sans text-sm text-amber-600 leading-relaxed"
            >
              {error}
            </div>
          )}

          {/* Role selector */}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-foreground font-medium mb-2">
              I am joining as
            </p>
            <div className="grid grid-cols-2 gap-2">
              <RoleBtn active={role === "client"} onClick={() => setRole("client")}>
                Looking for services
              </RoleBtn>
              <RoleBtn
                active={role === "service_provider"}
                onClick={() => setRole("service_provider")}
              >
                Service provider
              </RoleBtn>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="signup-name"
              className="block font-mono text-[11px] uppercase tracking-[0.1em] text-foreground font-medium"
            >
              Full name <span className="text-gold">*</span>
            </label>
            <input
              id="signup-name"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full h-11 px-4 bg-background border border-border rounded-[3px] font-sans text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="signup-email"
              className="block font-mono text-[11px] uppercase tracking-[0.1em] text-foreground font-medium"
            >
              Email address <span className="text-gold">*</span>
            </label>
            <input
              id="signup-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full h-11 px-4 bg-background border border-border rounded-[3px] font-sans text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="signup-password"
              className="block font-mono text-[11px] uppercase tracking-[0.1em] text-foreground font-medium"
            >
              Password <span className="text-gold">*</span>
            </label>
            <input
              id="signup-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full h-11 px-4 bg-background border border-border rounded-[3px] font-sans text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center font-sans text-[13px] text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function RoleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-4 py-3 rounded-[3px] font-sans text-[12px] font-semibold transition-all ${
        active
          ? "border-gold bg-gold text-forest-ink"
          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function MailIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#d4a63c"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
