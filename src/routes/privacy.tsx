import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy policy — NexusZim" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="bg-background pt-32 min-h-screen">
      <article className="container-page mx-auto max-w-4xl pb-24">
        <div className="flex items-center gap-4">
          <span className="h-px w-8 bg-gold/40" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
            Legal Framework
          </p>
        </div>
        <h1 className="mt-6 font-display text-5xl font-bold text-foreground md:text-6xl">
          Privacy <span className="italic text-gold">Policy.</span>
        </h1>
        <p className="mt-4 font-mono text-[10px] text-foreground/40 uppercase tracking-widest">
          Effective: June 2026
        </p>

        <div className="mt-16 space-y-12 border-t border-gold/10 pt-16">
          <Section title="Data Acquisition">
            We collect account credentials, secure contact vectors, mission deployment history, and
            encrypted communications. For provider tier verification, we mandate ID and business
            credential auditing.
          </Section>
          <Section title="Intelligence Utilization">
            Data is used to facilitate the NexusZim ecosystem: matching clients with verified
            fixers, processing secure escrow, dispatching critical alerts, and refining market
            intelligence indices.
          </Section>
          <Section title="Information Dissemination">
            Access is restricted to mission-critical personnel. We share necessary contact
            intelligence with authorized providers only upon booking confirmation. We do not
            monetize your identity to third parties.
          </Section>
          <Section title="Subject Rights">
            Operatives retain the right to access, rectify, or purge their data logs at any time via
            written request to legal@nexuszim.co.zw.
          </Section>
          <Section title="Security Protocol">
            NexusZim employs industry-grade encryption and access controls. Security is a shared
            responsibility; maintain secure credentials for all platform access.
          </Section>
        </div>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="group">
      <h2 className="font-display text-2xl font-bold text-foreground group-hover:text-gold transition-colors uppercase tracking-widest">
        {title}
      </h2>
      <p className="mt-4 font-body text-base font-light leading-relaxed text-foreground/60">
        {children}
      </p>
    </section>
  );
}
