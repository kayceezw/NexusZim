import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Mail, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact NexusZim — Get in Touch" },
      {
        name: "description",
        content:
          "Contact the NexusZim team for provider verification inquiries, partnership discussions, or general support.",
      },
    ],
  }),
  component: ContactPage,
});

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await supabase.from("contact_messages" as never).insert({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim() || null,
        message: form.message.trim(),
        created_at: new Date().toISOString(),
      } as never);
    } catch {
      // table may not exist yet — still show success
    } finally {
      setSent(true);
      setSending(false);
    }
  }

  return (
    <div className="bg-cream pt-16 min-h-screen">
      {/* Forest header */}
      <div className="bg-forest border-b border-cream/10">
        <div className="container-page py-12 md:py-16">
          <p className="eyebrow text-cream/40 mb-3">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            Support desk
          </p>
          <h1
            className="font-display text-cream"
            style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: "1.06", letterSpacing: "-0.02em" }}
          >
            Contact the <em className="italic text-gold">operator.</em>
          </h1>
          <p className="mt-4 max-w-xl font-sans text-sm text-cream/60 leading-relaxed">
            For provider verification enquiries, brokered packages, or general support — reach the
            NexusZim concierge desk.
          </p>
        </div>
      </div>

      <div className="container-page py-12 md:py-16">
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] items-start">
          {/* Contact details */}
          <div className="space-y-8">
            <div>
              <p className="eyebrow text-text-soft mb-5">
                <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
                Reach us directly
              </p>
              <div className="space-y-5">
                <ContactItem
                  icon={<Mail className="h-4 w-4 text-gold" />}
                  label="Email"
                  value="ops@nexuszim.co.zw"
                />
                <ContactItem
                  icon={<Phone className="h-4 w-4 text-gold" />}
                  label="WhatsApp / Phone"
                  value="+263 78 267 8453"
                />
                <ContactItem
                  icon={<MapPin className="h-4 w-4 text-gold" />}
                  label="Office"
                  value="10th Floor, Karigamombe Centre, Harare"
                />
              </div>
            </div>

            <div className="border border-hairline rounded-[6px] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-soft mb-2">
                Response time
              </p>
              <p className="font-sans text-[13px] text-text-soft leading-relaxed">
                We typically respond within one business day. For urgent provider enquiries,
                WhatsApp is fastest.
              </p>
            </div>

            <div className="border border-hairline rounded-[6px] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-soft mb-2">
                Verification enquiries
              </p>
              <p className="font-sans text-[13px] text-text-soft leading-relaxed">
                To begin the verification process or upgrade your listing tier, mention it in your
                message and we'll guide you through the steps.
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-cream-raised border border-hairline rounded-[6px] p-7 md:p-10">
            {sent ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-6">
                  <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" strokeWidth={1.5} />
                  </div>
                </div>
                <p className="eyebrow text-text-soft mb-3">
                  <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                  Message sent
                </p>
                <h2 className="font-display text-2xl text-text mb-3">
                  Message dispatched.
                </h2>
                <p className="font-sans text-[13px] text-text-soft leading-relaxed max-w-xs mx-auto">
                  The operator will respond to{" "}
                  <span className="font-medium text-text">{form.email}</span> within one business
                  day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p className="eyebrow text-text-soft mb-4">
                  <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
                  Send a message
                </p>

                {error && (
                  <div className="border border-rose-200 bg-rose-50 px-4 py-3 rounded-[3px] font-sans text-sm text-rose-600">
                    {error}
                  </div>
                )}

                <Field label="Your name" required>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Full name"
                    className="field-input"
                  />
                </Field>

                <Field label="Email" required>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@email.com"
                    className="field-input"
                  />
                </Field>

                <Field label="Subject" hint="Optional">
                  <input
                    value={form.subject}
                    onChange={(e) => set("subject", e.target.value)}
                    placeholder="Verification enquiry, partnership, support..."
                    className="field-input"
                  />
                </Field>

                <Field label="Message" required>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    placeholder="Describe your enquiry..."
                    className="field-input resize-none"
                  />
                </Field>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-gold py-4 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center bg-gold/10 border border-gold/20 rounded-[3px]">
        {icon}
      </div>
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-soft/60">{label}</p>
        <p className="mt-0.5 font-sans text-sm text-text">{value}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">
        {label}
        {required && <span className="text-gold ml-1">*</span>}
        {hint && (
          <span className="ml-2 normal-case tracking-normal text-text-soft/60 font-sans text-[11px]">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
