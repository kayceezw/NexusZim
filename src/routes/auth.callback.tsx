import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Confirming your account — NexusZim" }] }),
  component: AuthCallback,
});

// Landing target for the email confirmation / magic link. Supabase redirects
// here after verifying the token; the Supabase client (detectSessionInUrl) reads
// the session from the URL, or we complete a PKCE code exchange explicitly. Once
// a session exists we forward to onboarding; otherwise we show a clear error.
function AuthCallback() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const done = useRef(false);

  // Surface any error carried in the callback URL, and finish a PKCE exchange if present.
  useEffect(() => {
    async function run() {
      if (typeof window === "undefined") return;
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const query = new URLSearchParams(window.location.search);

      const errDesc = hash.get("error_description") || query.get("error_description");
      const errCode =
        hash.get("error") || query.get("error") || hash.get("error_code") || query.get("error_code");
      if (errDesc || errCode) {
        setError(
          (errDesc || errCode || "This link is invalid or has expired.").replace(/\+/g, " "),
        );
        return;
      }

      // PKCE flow: exchange the ?code= for a session (harmless no-op for implicit flow).
      if (query.get("code")) {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) setError(error.message);
      }
    }
    void run();
  }, []);

  // Once the session resolves, forward onward. Grace timeout catches used/expired links.
  useEffect(() => {
    if (error || done.current) return;
    if (!loading && session) {
      done.current = true;
      navigate({ to: "/onboarding", replace: true });
      return;
    }
    const t = setTimeout(() => {
      if (!done.current && !session) {
        setError(
          "We couldn't confirm your account from this link. It may have expired or already been used.",
        );
      }
    }, 6000);
    return () => clearTimeout(t);
  }, [loading, session, error, navigate]);

  return (
    <div className="bg-background pt-16 min-h-screen grid place-items-center animate-page-enter">
      <div className="w-full max-w-md my-10 px-5 sm:px-0 text-center">
        <div className="bg-card border border-border rounded-[6px] p-8 md:p-9 space-y-5">
          {!error ? (
            <>
              <div className="mx-auto h-12 w-12 rounded-full border-2 border-gold/25 border-t-gold animate-spin" />
              <h1 className="font-display text-2xl text-foreground">
                Confirming your <em className="italic text-gold">account…</em>
              </h1>
              <p className="font-sans text-sm text-muted-foreground">
                One moment while we verify your email.
              </p>
            </>
          ) : (
            <>
              <p className="eyebrow text-muted-foreground justify-center">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                Confirmation issue
              </p>
              <h1 className="font-display text-2xl text-foreground">This link didn't work</h1>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">{error}</p>
              <Link
                to="/login"
                className="block w-full bg-gold py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
              >
                Go to login
              </Link>
              <Link
                to="/signup"
                className="block font-sans text-[13px] text-primary hover:underline"
              >
                Or create a new account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
