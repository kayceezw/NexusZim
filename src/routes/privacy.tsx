import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy policy — NexusZim" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <article className="container-page mx-auto max-w-3xl py-12 md:py-16">
      <p className="font-display text-xs font-semibold uppercase tracking-wider text-teal">
        Legal
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
        Privacy policy
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: today</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <Section title="What we collect">
          Account details, contact information, booking history, payment metadata, and the
          messages you exchange with providers. For verification we collect ID and business
          documents from providers.
        </Section>
        <Section title="How we use it">
          To run the marketplace — match clients and providers, process bookings and payments,
          send notifications, prevent fraud, and improve the service.
        </Section>
        <Section title="Sharing">
          We share what's needed to fulfil a booking (e.g. your name and contact info with the
          chosen provider). We don't sell your personal data.
        </Section>
        <Section title="Your rights">
          You can request access to, correction of, or deletion of your personal data at any
          time by emailing privacy@zimserve.co.zw.
        </Section>
        <Section title="Security">
          We use industry-standard safeguards. No system is 100% secure — please use a strong
          password and enable any account protections we offer.
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
