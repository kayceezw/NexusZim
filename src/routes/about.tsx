import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About NexusZim — Zimbabwe's Verified Service Directory" },
      {
        name: "description",
        content:
          "NexusZim is Zimbabwe's verified service marketplace — connecting clients with vetted providers across events, transport, business services and more.",
      },
    ],
  }),
  component: AboutPage,
});

const TRUST_PILLARS = [
  {
    title: "Identity verification",
    desc: "Every provider submits government-issued ID. We confirm the person behind the business.",
  },
  {
    title: "Business registration",
    desc: "CR14/CR6 company documents are checked against the Zimbabwe Companies Registry.",
  },
  {
    title: "Rating history",
    desc: "Providers with a track record of positive client references earn Trust Certified status.",
  },
  {
    title: "Portfolio audit",
    desc: "Senior providers submit work samples reviewed by the NexusZim desk.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Browse the register",
    desc: "Search by service, city, or verification tier. Every listing shows exactly what was checked.",
  },
  {
    step: "02",
    title: "Post a brief",
    desc: "Describe what you need. Verified providers in the matching category receive your brief.",
  },
  {
    step: "03",
    title: "Connect directly",
    desc: "Providers contact you via WhatsApp or phone. You agree a fee and pay them directly.",
  },
];

function AboutPage() {
  return (
    <div className="bg-cream pt-16 min-h-screen">
      {/* Hero */}
      <section className="bg-forest border-b border-cream/10 py-20 lg:py-28">
        <div className="container-page">
          <p className="eyebrow text-cream/40 mb-5">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            About NexusZim
          </p>
          <h1
            className="font-display text-cream max-w-3xl"
            style={{ fontSize: "clamp(40px, 5.5vw, 72px)", lineHeight: "1.06", letterSpacing: "-0.025em" }}
          >
            Zimbabwe's service economy,{" "}
            <em className="italic text-gold">organized.</em>
          </h1>
          <p className="mt-6 max-w-xl font-sans text-base text-cream/60 leading-relaxed">
            NexusZim is a public register of verified service providers across Zimbabwe. Clients find
            trusted providers. Providers build a verifiable reputation. Every listing shows exactly
            what was checked, by whom, and when.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              to="/search"
              className="bg-gold px-8 py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors flex items-center gap-2 group"
            >
              Browse the directory
              <span className="transition-transform group-hover:translate-x-[3px] duration-150">→</span>
            </Link>
            <Link
              to="/onboarding/provider"
              className="border border-cream/20 px-8 py-3.5 rounded-[3px] font-sans text-sm font-semibold text-cream hover:border-cream/60 hover:bg-cream/5 transition-colors text-center"
            >
              List your business
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 border-b border-hairline">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="eyebrow text-text-soft mb-4">
                <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                Why we built this
              </p>
              <h2 className="font-display text-3xl lg:text-4xl text-text leading-tight">
                The trust gap in Zimbabwe's service economy
              </h2>
            </div>
            <div className="space-y-5">
              <p className="font-sans text-base text-text-soft leading-relaxed">
                Zimbabwe's service economy is largely informal. Most clients find providers through word
                of mouth, WhatsApp groups, or Facebook — with no way to verify credentials, check past
                work, or confirm the person they're dealing with is legitimate.
              </p>
              <p className="font-sans text-base text-text-soft leading-relaxed">
                This creates friction, drives risk, and leaves excellent providers invisible — while
                unverified operators collect deposits and disappear.
              </p>
              <p className="font-sans text-base text-text-soft leading-relaxed">
                NexusZim creates a verified public record. Providers who pass our checks earn a Hallmark
                badge. Clients can see exactly what was verified and make informed decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-b border-hairline">
        <div className="container-page">
          <p className="eyebrow text-text-soft mb-4">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            How it works
          </p>
          <h2 className="font-display text-3xl lg:text-4xl text-text mb-12">
            Three steps. No middleman.
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((h) => (
              <div key={h.step} className="bg-cream-raised border border-hairline rounded-[6px] p-6 relative overflow-hidden">
                <p
                  className="font-display text-[80px] text-hairline leading-none absolute -top-2 -right-2 select-none"
                  aria-hidden
                >
                  {h.step}
                </p>
                <div className="relative z-10">
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-gold mb-3">
                    Step {h.step}
                  </p>
                  <h3 className="font-display text-xl text-text mb-2">{h.title}</h3>
                  <p className="font-sans text-[13px] text-text-soft leading-relaxed">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust pillars */}
      <section className="py-20 border-b border-hairline">
        <div className="container-page">
          <p className="eyebrow text-text-soft mb-4">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            The Hallmark system
          </p>
          <h2 className="font-display text-3xl lg:text-4xl text-text mb-3">
            What gets verified
          </h2>
          <p className="font-sans text-base text-text-soft mb-10 max-w-xl leading-relaxed">
            Not every provider passes every check. The Hallmark badge shows which tier a provider
            has reached — and exactly what that means.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {TRUST_PILLARS.map((p) => (
              <div key={p.title} className="flex gap-4 bg-cream-raised border border-hairline rounded-[6px] p-5">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h3 className="font-display text-base text-text mb-1">{p.title}</h3>
                  <p className="font-sans text-[13px] text-text-soft leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tier comparison */}
          <div className="mt-10 border border-hairline rounded-[6px] overflow-hidden">
            <div className="grid grid-cols-4 border-b border-hairline">
              <div className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.08em] text-text-soft/60">
                Check
              </div>
              {["Listed", "Verified", "Trust Certified"].map((t) => (
                <div key={t} className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.08em] text-text-soft/60 text-center">
                  {t}
                </div>
              ))}
            </div>
            {[
              { check: "Public profile", listed: true, verified: true, trust: true },
              { check: "Identity docs", listed: false, verified: true, trust: true },
              { check: "CR14/CR6 check", listed: false, verified: true, trust: true },
              { check: "Rating history", listed: false, verified: false, trust: true },
              { check: "Portfolio audit", listed: false, verified: false, trust: true },
            ].map((row) => (
              <div key={row.check} className="grid grid-cols-4 border-b border-hairline last:border-0">
                <div className="px-4 py-3 font-sans text-[13px] text-text-soft">{row.check}</div>
                {[row.listed, row.verified, row.trust].map((ok, i) => (
                  <div key={i} className="px-4 py-3 text-center">
                    {ok ? (
                      <span className="font-mono text-[11px] text-emerald-600">✓</span>
                    ) : (
                      <span className="font-mono text-[11px] text-text-soft/30">—</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ZDP connection */}
      <section className="py-20 border-b border-hairline">
        <div className="container-page max-w-2xl">
          <p className="eyebrow text-text-soft mb-4">
            <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
            Behind NexusZim
          </p>
          <h2 className="font-display text-2xl text-text mb-4">
            Built by ZimDataPulse
          </h2>
          <p className="font-sans text-base text-text-soft leading-relaxed mb-5">
            NexusZim is a product of ZimDataPulse, a Harare-based technology company building
            digital infrastructure for Zimbabwe's service economy. Our products include market
            intelligence tools, sector data registries, and now the verified service directory.
          </p>
          <p className="font-sans text-base text-text-soft leading-relaxed">
            Verification is handled by the NexusZim concierge desk. We check, we record, we
            publish — and we hold ourselves accountable to the same standard.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-forest py-20">
        <div className="container-page text-center">
          <h2 className="font-display text-3xl lg:text-4xl text-cream mb-4">
            Ready to use the register?
          </h2>
          <p className="font-sans text-sm text-cream/60 mb-8 max-w-md mx-auto leading-relaxed">
            Find a verified provider or list your business today. NexusZim is free to browse.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/search"
              className="bg-gold px-8 py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
            >
              Browse the directory
            </Link>
            <Link
              to="/onboarding/provider"
              className="border border-cream/20 px-8 py-3.5 rounded-[3px] font-sans text-sm font-semibold text-cream hover:border-cream/60 hover:bg-cream/5 transition-colors"
            >
              Apply as a provider
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
