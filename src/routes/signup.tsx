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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
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
      <div className="bg-cream pt-16 min-h-screen grid place-items-center animate-page-enter">
        <div className="w-full max-w-md my-10 px-5 sm:px-0">
          <div className="bg-cream-raised border border-hairline rounded-[6px] p-7 md:p-9 space-y-5 animate-form-enter text-center">
            <div className="flex justify-center mb-2">
              <span className="h-14 w-14 rounded-full bg-gold/10 flex items-center justify-center">
                <MailIcon />
              </span>
            </div>
            <div>
              <p className="eyebrow text-text-soft mb-2 justify-center">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                Almost there
              </p>
              <h1 className="font-display text-2xl text-text">
                Check your <em className="italic text-gold">email.</em>
              </h1>
            </div>

            <div className="border border-gold/20 bg-gold/5 rounded-[3px] p-5 text-left">
              <p className="font-mono text-[10px] uppercase tracking-widest text-gold mb-2">
                Confirmation link sent
              </p>
              <p className="font-sans text-sm text-text-soft leading-relaxed">
                We sent a confirmation link to{" "}
                <span className="font-medium text-text">{email}</span>. Click the link in that
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
                  className="flex items-start gap-2 font-sans text-[13px] text-text-soft"
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

            <button
              type="button"
              onClick={() => setConfirmationPending(false)}
              className="w-full text-center font-mono text-[9px] uppercase tracking-widest text-text-soft/40 hover:text-text-soft transition-colors"
            >
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
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
          <h1 className="font-display text-3xl text-text">
            Join the <em className="italic text-gold">register.</em>
          </h1>
          <p className="mt-2 font-sans text-sm text-text-soft">
            Create your account to post briefs or list your business.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-cream-raised border border-hairline rounded-[6px] p-7 md:p-9 space-y-5 animate-form-enter"
        >
          {error && (
            <div
              role="alert"
              className="border border-amber-300 bg-amber-50 rounded-[3px] px-4 py-3 font-sans text-sm text-amber-800 leading-relaxed"
            >
              {error}
            </div>
          )}

          {/* Role selector */}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text font-medium mb-2">
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
              className="block font-mono text-[11px] uppercase tracking-[0.1em] text-text font-medium"
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
              className="w-full h-11 px-4 bg-cream border border-hairline rounded-[3px] font-sans text-sm text-text placeholder:text-text-soft/50 outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="signup-email"
              className="block font-mono text-[11px] uppercase tracking-[0.1em] text-text font-medium"
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
              className="w-full h-11 px-4 bg-cream border border-hairline rounded-[3px] font-sans text-sm text-text placeholder:text-text-soft/50 outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="signup-password"
              className="block font-mono text-[11px] uppercase tracking-[0.1em] text-text font-medium"
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
              className="w-full h-11 px-4 bg-cream border border-hairline rounded-[3px] font-sans text-sm text-text placeholder:text-text-soft/50 outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center font-sans text-[13px] text-text-soft">
            Already have an account?{" "}
            <Link to="/login" className="text-forest hover:underline font-medium">
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
          : "border-hairline text-text-soft hover:border-forest hover:text-forest"
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
      stroke="#e7a020"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
