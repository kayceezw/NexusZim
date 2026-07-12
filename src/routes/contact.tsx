import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact NexusZim" }] }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="bg-background pt-32 min-h-screen">
      <div className="container-page grid gap-16 py-12 md:grid-cols-2 md:py-24">
        <div>
          <div className="flex items-center gap-4">
             <span className="h-px w-8 bg-gold/40" />
             <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
               Support Desk
             </p>
          </div>
          <h1 className="mt-6 font-display text-5xl font-bold tracking-tight text-foreground md:text-6xl">
            Contact the <span className="italic text-gold">Operator.</span>
          </h1>
          <p className="mt-8 text-lg font-light leading-relaxed text-foreground/70">
            NexusZim is a connection hub. If you have questions regarding brokered deals, 
            managed packages, or provider verification, reach out to our concierge desk.
          </p>
          <ul className="mt-12 space-y-6">
            <ContactItem label="Email Intelligence" value="ops@nexuszim.co.zw" />
            <ContactItem label="Secure Line" value="+263 78 267 8453" />
            <ContactItem label="HQ Location" value="10th Floor, Karigamombe Centre, Harare" />
          </ul>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="bg-card border border-gold/20 p-8 md:p-12"
        >
          {sent ? (
            <div className="text-center py-20">
              <div className="mx-auto flex h-16 w-16 items-center justify-center bg-gold/10 border border-gold/30 mb-8">
                <span className="font-mono text-gold font-bold">OK</span>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">Message Dispatched.</p>
              <p className="mt-4 font-body text-sm text-foreground/60 leading-relaxed">
                The operator will respond to your secure line shortly.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <Input label="Identity Name" required />
              <Input label="Secure Email" type="email" required />
              <Input label="Subject / Topic" />
              <div className="space-y-3">
                <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-gold/60">Brief Message</label>
                <textarea required rows={5} className="w-full bg-background border border-gold/20 p-4 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20 resize-none" />
              </div>
              <button className="w-full bg-gold py-5 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors">
                Broadcast Message
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function ContactItem({ label, value }: { label: string; value: string }) {
    return (
        <li>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-gold/60">{label}</p>
            <p className="mt-1 font-body text-base text-foreground/80">{value}</p>
        </li>
    )
}

function Input({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-3">
      <label className="block font-mono text-[9px] font-bold uppercase tracking-widest text-gold/60">{label}</label>
      <input {...rest} className="w-full bg-background border border-gold/20 p-4 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20" />
    </div>
  );
}

