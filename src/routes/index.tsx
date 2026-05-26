import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { CATEGORIES, type CategorySlug } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NexusZim — Zimbabwe's marketplace for trusted services" },
      {
        name: "description",
        content:
          "A curated marketplace connecting clients with vetted providers across Zimbabwe — events, documentation, transport, personal services and elite concierge.",
      },
    ],
  }),
  component: LandingPage,
});

const HERO_CHIPS: { label: string; slug: CategorySlug }[] = [
  { label: "Events", slug: "events" },
  { label: "Transport", slug: "transport" },
  { label: "Concierge", slug: "elite" },
  { label: "Wellness", slug: "personal" },
  { label: "Documentation", slug: "documentation" },
];

function LandingPage() {
  return (
    <div style={{ backgroundColor: "var(--navy-deep)" }}>
      {/* ───────────── HERO ───────────── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "var(--navy-deep)" }}>
        {/* Subtle dot grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hero-grid-overlay opacity-[0.04]"
        />

        {/* Massive faded wordmark */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        >
          <span
            className="font-display font-semibold uppercase leading-none tracking-tighter"
            style={{ fontSize: "26vw", color: "rgba(245,237,216,0.025)" }}
          >
            NexusZim
          </span>
        </div>

        <div className="container-page relative">
          {/* Eyebrow ribbon */}
          <div
            className="flex items-center justify-between border-b py-4 font-sans text-[10px] uppercase tracking-[0.3em]"
            style={{ borderColor: "rgba(245,237,216,0.08)", color: "rgba(245,237,216,0.4)" }}
          >
            <span>Est. Harare · Zimbabwe</span>
            <span className="hidden sm:inline">A curated service marketplace</span>
            <span>MMXXVI</span>
          </div>

          <div className="relative z-10 grid gap-14 py-20 md:grid-cols-12 md:py-28 lg:py-32">
            {/* Left: Headline + copy */}
            <div className="md:col-span-7">
              <div className="flex items-center gap-4">
                <span className="h-px w-12" style={{ backgroundColor: "rgba(196,154,42,0.4)" }} />
                <span className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-gold">
                  Private Network
                </span>
              </div>

              <h1
                className="mt-8 font-display font-semibold leading-[1.02] tracking-tight text-center md:text-left"
                style={{ fontSize: "clamp(48px, 8vw, 88px)" }}
              >
                <span className="text-white">Services</span>
                <br />
                <span className="italic font-medium text-gold">Marketplace.</span>
              </h1>

              <p
                className="mt-8 max-w-[480px] font-sans text-base font-light leading-[1.7] text-center md:text-left"
                style={{ color: "rgba(245,237,216,0.75)" }}
              >
                Zimbabwe's leading marketplace for verified and reliable service
                providers — book trusted professionals across events,
                documentation, transport, personal care and concierge.
              </p>

              {/* Category chips */}
              <div className="mt-8 flex flex-wrap justify-center gap-2 md:justify-start">
                {HERO_CHIPS.map((c) => (
                  <Link
                    key={c.slug}
                    to="/categories/$slug"
                    params={{ slug: c.slug }}
                    className="rounded-sm border px-3 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-cream/85 transition-all hover:bg-gold hover:text-gold-foreground"
                    style={{ borderColor: "rgba(196,154,42,0.4)" }}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Search + CTAs + metrics */}
            <div className="md:col-span-5 md:pt-4">
              <form action="/search" className="w-full">
                <div
                  className="relative rounded-lg border transition-colors focus-within:border-gold"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderColor: "rgba(196,154,42,0.25)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                  }}
                >
                  <Search
                    strokeWidth={1.5}
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: "rgba(245,237,216,0.5)" }}
                  />
                  <input
                    name="q"
                    placeholder="What do you need?"
                    className="h-14 w-full bg-transparent pl-11 pr-40 font-sans text-sm font-light text-cream outline-none placeholder:text-cream/40"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md bg-gold px-5 py-2.5 font-sans text-sm font-medium text-gold-foreground transition-colors hover:bg-cream"
                  >
                    Find Providers
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Link
                    to="/request"
                    className="group inline-flex items-center gap-2 font-sans text-sm font-medium text-gold transition-colors hover:text-cream"
                  >
                    Book a service now
                    <ArrowRight strokeWidth={1.5} className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/contact"
                    className="font-sans text-sm font-light text-cream/60 underline underline-offset-[6px] transition-colors hover:text-cream"
                    style={{ textDecorationColor: "rgba(196,154,42,0.4)" }}
                  >
                    Speak to a concierge
                  </Link>
                </div>
              </form>

              <div
                className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t pt-8 sm:grid-cols-4 md:sm:grid-cols-2"
                style={{ borderColor: "rgba(245,237,216,0.1)" }}
              >
                <Metric value="500+" label="Vetted providers" />
                <Metric value="08" label="Cities covered" />
                <Metric value="4.8" label="Avg. rating" />
                <Metric value="100%" label="Funds in escrow" />
              </div>
            </div>
          </div>
        </div>

        {/* Thin gold divider */}
        <div className="h-px w-full" style={{ backgroundColor: "rgba(196,154,42,0.18)" }} />
      </section>

      {/* ───────────── EXPLORE CATEGORIES (preview) ───────────── */}
      <section style={{ backgroundColor: "var(--navy-deep)" }}>
        <div className="container-page py-20 md:py-24">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-gold">
                Explore
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-cream md:text-5xl">
                A curated set of <span className="italic font-medium text-gold">categories.</span>
              </h2>
            </div>
            <Link
              to="/categories"
              className="group inline-flex items-center gap-2 self-start font-sans text-sm font-medium text-gold transition-colors hover:text-cream md:self-end"
            >
              View all categories
              <ArrowRight strokeWidth={1.5} className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-3">
            {CATEGORIES.slice(0, 6).map((c) => (
              <Link
                key={c.slug}
                to="/categories/$slug"
                params={{ slug: c.slug }}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-lg border p-6 transition-all hover:-translate-y-1"
                style={{
                  backgroundColor: "var(--navy-mid)",
                  borderColor: "rgba(196,154,42,0.2)",
                }}
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-full w-[3px]"
                  style={{ backgroundColor: "var(--gold)" }}
                />
                <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-gold">
                  {c.tagline}
                </p>
                <h3 className="font-display text-2xl font-semibold text-cream group-hover:text-gold">
                  {c.name}
                </h3>
                <p className="text-sm font-light leading-relaxed text-cream/65 line-clamp-2">
                  {c.description}
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-gold">
                  Browse providers
                  <ArrowRight strokeWidth={1.5} className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-semibold tracking-tight text-gold md:text-4xl">
        {value}
      </p>
      <p
        className="mt-1 font-sans text-[10px] font-medium uppercase tracking-[0.2em]"
        style={{ color: "rgba(245,237,216,0.6)" }}
      >
        {label}
      </p>
    </div>
  );
}
