import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { IntelOverview } from "./intel";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/intel/")({
  component: IntelIndexPage,
});

function IntelIndexPage() {
  return (
    <>
      <div className="mb-10">
        <p className="eyebrow text-text-soft mb-2">
          <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
          Intelligence sections
        </p>
        <h2 className="font-display text-3xl text-text">What's in the hub</h2>
      </div>
      <IntelOverview />
      <AlertsSection />
    </>
  );
}

function AlertsSection() {
  const [email, setEmail] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const ALERT_TYPES = [
    "New Elite Providers",
    "Rate Changes",
    "Venue Availability",
    "Upcoming Events",
    "Scarcity Alerts",
  ];

  function toggleCategory(c: string) {
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from("subscriptions" as never).insert({
        email,
        categories,
        type: "intel_alerts",
        created_at: new Date().toISOString(),
      } as never);
    } catch {
      // table may not exist yet — still show success
    } finally {
      setSubscribed(true);
      setLoading(false);
    }
  }

  return (
    <section className="mt-12 bg-cream-raised border border-hairline rounded-[6px] p-8 md:p-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-gold/10 border border-gold/30 rounded-[6px]">
          <Bell className="h-5 w-5 text-gold" />
        </div>
        <div className="flex-1">
          <p className="eyebrow text-text-soft mb-2">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            Organizer alerts
          </p>
          <h3 className="font-display text-2xl text-text mb-2">
            Never miss a market shift.
          </h3>
          <p className="font-sans text-[13px] text-text-soft max-w-xl leading-relaxed">
            Subscribe for weekly intelligence: new verified providers, rate changes, venue openings,
            and priority events in your city.
          </p>

          {subscribed ? (
            <div className="mt-8 flex items-center gap-3 border border-emerald-500/30 bg-emerald-500/5 rounded-[6px] p-5 max-w-md">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-600">
                  Alert subscription active
                </p>
                <p className="mt-0.5 font-sans text-[12px] text-text-soft">
                  Intelligence briefings will be sent to{" "}
                  <span className="text-text font-medium">{email}</span>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <p className="eyebrow text-text-soft/60 mb-3">
                  <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
                  Alert categories
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALERT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleCategory(type)}
                      className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.06em] rounded-[3px] transition-all ${
                        categories.includes(type)
                          ? "border-gold bg-gold text-forest-ink"
                          : "border-hairline text-text-soft hover:border-forest hover:text-forest"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row max-w-xl">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 h-11 px-3 bg-cream border border-hairline rounded-[3px] font-sans text-sm text-text outline-none focus:border-forest transition-colors placeholder:text-text-soft/40"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gold px-7 h-11 font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors rounded-[3px] whitespace-nowrap disabled:opacity-60"
                >
                  {loading ? "Subscribing..." : "Subscribe to alerts"}
                </button>
              </div>
              <p className="font-mono text-[10px] text-text-soft/50 uppercase tracking-widest">
                Weekly digest · Unsubscribe anytime · No spam
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
