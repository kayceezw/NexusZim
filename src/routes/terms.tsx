import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & conditions — NexusZim" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="bg-background pt-32 min-h-screen">
      <article className="container-page mx-auto max-w-4xl pb-24">
        <div className="flex items-center gap-4">
             <span className="h-px w-8 bg-gold/40" />
             <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
               Operating Charter
             </p>
        </div>
        <h1 className="mt-6 font-display text-5xl font-bold text-foreground md:text-6xl">
            Terms of <span className="italic text-gold">Engagement.</span>
        </h1>
        <p className="mt-4 font-mono text-[10px] text-foreground/40 uppercase tracking-widest">Effective: June 2026</p>

        <div className="mt-16 space-y-12 border-t border-gold/10 pt-16">
          <Section title="01. The Brokerage">
            NexusZim is a connection intelligence platform. We facilitate introductions between clients and independent service fixers. We do not personally execute the services listed beyond administrative and data support.
          </Section>
          <Section title="02. Regulatory Boundaries">
            Specialized services (legal, medical, or government documentation) are provided as administrative consultancy only. Clients are responsible for verifying specific professional licenses where mandated by law.
          </Section>
          <Section title="03. Financial Escrow">
            All financial authorizations are held in a secure escrow layer. Brokerage fees are applied to each successful deployment. Funds are released only upon verification of mission completion.
          </Section>
          <Section title="04. Cancellation Protocol">
            Deployment aborts with 72+ hours notice qualify for full commitment refund. Late aborts (under 24h) result in commitment forfeiture to compensate provider mobilization.
          </Section>
          <Section title="05. Conflict Resolution">
            In the event of mission failure or standard deviation, formal disputes must be lodged within 7 days. NexusZim acting as the operator will mediate based on the logged Mission Brief.
          </Section>
          <Section title="06. Operational Liability">
            NexusZim is a facilitator of intelligence and connection. We are not liable for the tactical execution or omissions of independent providers. Deployment is at the operative's discretion.
          </Section>
        </div>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="group">
      <h2 className="font-display text-2xl font-bold text-foreground group-hover:text-gold transition-colors uppercase tracking-widest">{title}</h2>
      <p className="mt-4 font-body text-base font-light leading-relaxed text-foreground/60">{children}</p>
    </section>
  );
}

