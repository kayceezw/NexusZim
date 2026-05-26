import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact NexusZim" }] }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="container-page grid gap-10 py-12 md:grid-cols-2 md:py-20">
      <div>
        <p className="font-display text-xs font-semibold uppercase tracking-wider text-teal">
          Contact us
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
          We'd love to hear from you
        </h1>
        <p className="mt-3 text-muted-foreground">
          Questions, partnerships, or feedback — drop us a message and we'll
          get back within one business day.
        </p>
        <ul className="mt-8 space-y-3 text-sm">
          <li>
            <span className="text-muted-foreground">Email — </span>
            info@nexuszim.co.zw
          </li>
          <li>
            <span className="text-muted-foreground">Phone — </span>
            +263 78 267 8453
          </li>
          <li>
            <span className="text-muted-foreground">Office — </span>
            10th Floor, Karigamombe Centre, Harare, Zimbabwe
          </li>
        </ul>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
        className="space-y-4 rounded-2xl border border-border bg-card p-6"
      >
        {sent ? (
          <div className="text-center py-8">
            <p className="font-display text-xl font-bold">Message sent</p>
            <p className="mt-2 text-sm text-muted-foreground">
              We'll be in touch shortly.
            </p>
          </div>
        ) : (
          <>
            <Input label="Your name" required />
            <Input label="Email" type="email" required />
            <Input label="Subject" />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Message</span>
              <textarea required rows={5} className="input" />
            </label>
            <button className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-accent">
              Send message
            </button>
          </>
        )}
      </form>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.625rem;
          border: 1px solid var(--border);
          background: var(--background);
          padding: 0.65rem 0.85rem;
          font-size: 0.875rem;
          color: var(--foreground);
        }
        .input:focus { border-color: var(--ring); outline: none; }
      `}</style>
    </div>
  );
}

function Input({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input {...rest} className="input" />
    </label>
  );
}
