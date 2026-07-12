import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About NexusZim" },
      {
        name: "description",
        content:
          "NexusZim is Zimbabwe's marketplace for trusted services — connecting clients with verified providers across events, documentation, transport and more.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="bg-background pt-24 min-h-screen">
      <section className="border-b border-gold/10">
        <div className="container-page py-20 md:py-32">
          <div className="flex items-center gap-4">
             <span className="h-px w-12 bg-gold/40" />
             <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
               The Vision
             </p>
          </div>
          <h1 className="mt-8 max-w-4xl font-display text-5xl font-bold tracking-tight text-foreground md:text-7xl">
            Africa's Premier Event <span className="italic text-gold">Intelligence.</span>
          </h1>
          <p className="mt-10 max-w-2xl font-body text-xl font-light leading-relaxed text-foreground/70">
            NexusZim is the authoritative hub where event organizers, corporates, and individuals connect with verified service providers, book complete event packages, and access market intel no one else has.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-px bg-gold/10 border border-gold/10 my-24 md:grid-cols-2">
        {VALUES.map((v) => (
          <div key={v.title} className="bg-background p-10 md:p-14 group hover:bg-card transition-colors">
            <h2 className="font-display text-2xl font-bold text-foreground group-hover:text-gold transition-colors uppercase tracking-widest">{v.title}</h2>
            <p className="mt-6 font-body text-base font-light leading-relaxed text-foreground/60">{v.desc}</p>
          </div>
        ))}
      </section>

      <section className="bg-card/30 border-y border-gold/10">
        <div className="container-page py-24 text-center">
          <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            Ready to secure your <span className="italic text-gold">Fixer?</span>
          </h2>
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/categories" className="bg-gold px-10 py-5 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors">
              Access Network
            </Link>
            <Link to="/signup" className="border border-gold/30 px-10 py-5 font-display text-sm font-bold uppercase tracking-widest text-gold hover:bg-gold/5 transition-colors">
              Apply as Provider
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const VALUES = [
  {
    title: "Verified Intelligence",
    desc: "We don't just list providers; we audit them. Our four-tier trust system ensures you're hiring vetted professionals with proven track records.",
  },
  {
    title: "Market Data Layer",
    desc: "NexusZim provides real-time event radars and market rate indices, giving organizers the data they need to plan with precision.",
  },
  {
    title: "The Fixer's Network",
    desc: "From elite concierge specialists to mission-critical security teams, we connect you with the fixers who make things happen across the continent.",
  },
  {
    title: "Bespoke Brokerage",
    desc: "Our operator-managed packages and concierge mode allow for seamless, high-touch event production and service bundling.",
  },
];

