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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName, role },
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/onboarding" });
  }

  return (
    <div className="bg-cream pt-16 min-h-screen grid place-items-center">
      <div className="w-full max-w-md my-10 px-5 sm:px-0">
        {/* Brand mark */}
        <div className="text-center mb-8">
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
          className="bg-cream-raised border border-hairline rounded-[6px] p-7 md:p-9 space-y-5"
        >
          {error && (
            <div role="alert" className="border border-rose-200 bg-rose-50 rounded-[3px] px-4 py-3 font-sans text-sm text-rose-600">
              {error}
            </div>
          )}

          {/* Role selector */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft mb-2">
              I am joining as
            </p>
            <div className="grid grid-cols-2 gap-2">
              <RoleBtn active={role === "client"} onClick={() => setRole("client")}>
                Looking for services
              </RoleBtn>
              <RoleBtn active={role === "service_provider"} onClick={() => setRole("service_provider")}>
                Service provider
              </RoleBtn>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="signup-name" className="block font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">
              Full name <span className="text-gold">*</span>
            </label>
            <input
              id="signup-name"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="field-input"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="signup-email" className="block font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">
              Email <span className="text-gold">*</span>
            </label>
            <input
              id="signup-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="field-input"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="signup-password" className="block font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">
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
              className="field-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors disabled:opacity-60"
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
