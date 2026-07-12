import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { IntelOverview } from "./intel";

export const Route = createFileRoute("/intel/")({
  component: IntelIndexPage,
});

function IntelIndexPage() {
  return (
    <>
      <IntelOverview />
      <AlertsSection />
    </>
  );
}

function AlertsSection() {
  const [email, setEmail] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [subscribed, setSubscribed] = useState(false);

  const ALERT_TYPES = [
    "New Elite Providers",
    "Rate Changes",
    "Venue Availability",
    "Upcoming Events",
    "Scarcity Alerts",
  ];

  function toggleCategory(c: string) {
    setCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubscribed(true);
  }

  return (
    <section className="mt-16 border border-gold/20 bg-gold/5 p-10 md:p-14">
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-gold/30 bg-gold/10">
          <Bell className="h-6 w-6 text-gold" />
        </div>
        <div className="flex-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Organizer Alerts</p>
          <h3 className="mt-3 font-display text-3xl font-bold text-foreground">
            Never miss a <span className="italic text-gold">market shift.</span>
          </h3>
          <p className="mt-4 font-body text-base text-foreground/60 max-w-xl leading-relaxed">
            Subscribe for weekly intelligence: new verified providers, rate changes, venue openings, and priority events in your city.
          </p>

          {subscribed ? (
            <div className="mt-10 flex items-center gap-4 border border-emerald-500/30 bg-emerald-500/5 p-6 max-w-md">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                  Alert Subscription Active
                </p>
                <p className="mt-1 font-body text-xs text-foreground/50">
                  Intelligence briefings will be sent to <span className="text-foreground/80">{email}</span>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/40 mb-3">
                  Alert Categories (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALERT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleCategory(type)}
                      className={`border px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-widest transition-all ${
                        categories.includes(type)
                          ? "border-gold bg-gold text-white"
                          : "border-gold/20 text-foreground/50 hover:border-gold/40"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row max-w-2xl">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-background border border-gold/20 p-4 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20"
                />
                <button
                  type="submit"
                  className="bg-gold px-10 py-4 font-display text-[11px] font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors whitespace-nowrap"
                >
                  Subscribe to Alerts
                </button>
              </div>
              <p className="font-mono text-[9px] text-foreground/30 uppercase tracking-widest">
                Weekly digest · Unsubscribe anytime · No spam
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
