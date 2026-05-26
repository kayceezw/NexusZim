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
    <div>
      <section className="bg-surface">
        <div className="container-page py-16 md:py-24">
          <p className="font-display text-xs font-semibold uppercase tracking-wider text-teal">
            About NexusZim
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold tracking-tight md:text-5xl">
            Built in Zimbabwe, for everyone who hires services here.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            NexusZim brings local service providers and clients onto one
            trusted platform. We verify providers, standardise quotes, handle
            deposits, and offer a clear dispute process — so booking services
            in Zimbabwe finally feels professional.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-6 py-16 md:grid-cols-2">
        {VALUES.map((v) => (
          <div key={v.title} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-xl font-semibold">{v.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
          </div>
        ))}
      </section>

      <section className="bg-surface">
        <div className="container-page py-16 text-center">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Ready to find a provider — or become one?
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/categories" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-accent">
              Browse categories
            </Link>
            <Link to="/signup" className="rounded-xl border border-border px-5 py-3 text-sm font-semibold">
              Become a provider
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const VALUES = [
  {
    title: "Verified providers",
    desc: "Every paid provider passes identity, business and reference checks before they can accept jobs.",
  },
  {
    title: "Safe payments",
    desc: "Deposits are held in escrow on eligible bookings and only released when the service is delivered.",
  },
  {
    title: "Built for locals",
    desc: "Local cities, local currency, local categories — including categories that reflect how Zimbabwean services actually work.",
  },
  {
    title: "Expanding nationwide",
    desc: "Starting in Harare and Bulawayo, we're rolling out across every major Zimbabwean city.",
  },
];
