import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — NexusZim" }] }),
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
    <div className="bg-background pt-24 min-h-screen grid place-items-center">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-xl bg-card border border-gold/20 p-10 md:p-14 my-12"
      >
        <div className="flex items-center gap-4">
          <span className="h-px w-8 bg-gold/40" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
            Identity Protocol
          </p>
        </div>
        <h1 className="mt-6 font-display text-4xl font-bold text-foreground">
          Join the <span className="italic text-gold">Network.</span>
        </h1>
        <p className="mt-4 font-body text-base text-foreground/60">
          Establish your credentials on Africa's premier brokerage platform.
        </p>

        {error && (
          <div className="mt-8 border border-rose-500/30 bg-rose-500/5 p-4 font-body text-sm text-rose-500 italic">
            {error}
          </div>
        )}

        <div className="mt-10 grid grid-cols-2 gap-4">
          <RoleBtn active={role === "client"} onClick={() => setRole("client")}>
            I'm a client
          </RoleBtn>
          <RoleBtn active={role === "service_provider"} onClick={() => setRole("service_provider")}>
            I'm a provider
          </RoleBtn>
        </div>

        <div className="mt-10 space-y-8">
          <Input
            label="Full Identity Name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="Secure Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Security Password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-12 block w-full bg-gold py-5 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors disabled:opacity-60"
        >
          {loading ? "Authenticating..." : "Initialize Account"}
        </button>

        <p className="mt-8 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-foreground/30">
          Already established?{" "}
          <Link to="/login" className="text-gold hover:text-foreground transition-colors">
            Access Portal
          </Link>
        </p>
      </form>
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
      className={`border px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest transition-all ${
        active
          ? "border-gold bg-gold text-white"
          : "border-gold/20 text-gold/40 hover:border-gold/40"
      }`}
    >
      {children}
    </button>
  );
}

function Input({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-3">
      <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-gold/60">
        {label}
      </label>
      <input
        {...rest}
        className="w-full bg-background border border-gold/20 p-4 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20"
      />
    </div>
  );
}
