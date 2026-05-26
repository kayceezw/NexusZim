import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & conditions — NexusZim" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <article className="container-page prose-base mx-auto max-w-3xl py-12 md:py-16">
      <p className="font-display text-xs font-semibold uppercase tracking-wider text-teal">
        Legal
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
        Terms & conditions
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: today
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground">
        <Section title="1. About NexusZim">
          NexusZim is a marketplace platform connecting clients with independent service
          providers in Zimbabwe. We are not the provider of services listed on the platform.
        </Section>
        <Section title="2. Regulated services">
          Services such as visa application support and company registration are provided as
          consultancy and document assistance only. They are not government approval or legal
          representation unless the provider is properly licensed. Always verify provider
          credentials.
        </Section>
        <Section title="3. Bookings & payments">
          Clients may pay a deposit or full amount at checkout. NexusZim charges a platform
          fee on each completed booking. Funds may be held in escrow on eligible bookings until
          the service is delivered.
        </Section>
        <Section title="4. Cancellations & refunds">
          Cancellations made 48+ hours before the booking are eligible for a full refund of
          deposits. Cancellations within 48 hours may forfeit the deposit. Provider no-shows
          result in a full refund and a deduction against the provider account.
        </Section>
        <Section title="5. Dispute resolution">
          If a service was not delivered as described, open a dispute within 7 days. NexusZim
          will mediate between client and provider. Held funds are released according to the
          mediation outcome.
        </Section>
        <Section title="6. Provider responsibilities">
          Providers must hold all necessary licences and insurance for their services, deliver
          on time and to the agreed standard, and respond to messages within their stated
          response time.
        </Section>
        <Section title="7. Liability">
          NexusZim facilitates bookings but is not liable for the acts or omissions of
          providers or clients. Use of the platform is at your own risk and subject to these
          terms.
        </Section>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-muted-foreground">{children}</p>
    </section>
  );
}
