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
      // Translate common Supabase error messages into user-friendly text
      if (
        error.message.toLowerCase().includes("email not confirmed") ||
        error.message.toLowerCase().includes("not confirmed")
      ) {
        setError(
          "Your email address has not been confirmed yet. Please check your inbox for a confirmation link before logging in.",
        );
      } else if (error.message.toLowerCase().includes("invalid login credentials")) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError(error.message);
      }
      return;
    }
    navigate({ to: "/onboarding" });
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
            Welcome <em className="italic text-gold">back.</em>
          </h1>
          <p className="mt-2 font-sans text-sm text-text-soft">
            Log in to manage your briefs and access intelligence.
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

          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="block font-mono text-[11px] uppercase tracking-[0.1em] text-text font-medium"
            >
              Email address
            </label>
            <input
              id="login-email"
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
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="font-mono text-[11px] uppercase tracking-[0.1em] text-text font-medium"
              >
                Password
              </label>
              {/* Forgot password — gold, clearly visible */}
              <Link
                to="/forgot-password"
                className="font-sans text-[12px] font-semibold text-gold hover:text-gold-deep transition-colors underline underline-offset-2"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 pr-11 bg-cream border border-hairline rounded-[3px] font-sans text-sm text-text outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-soft/40 hover:text-forest transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          <p className="text-center font-sans text-[13px] text-text-soft">
            Don't have an account?{" "}
            <Link to="/signup" className="text-forest hover:underline font-medium">
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
