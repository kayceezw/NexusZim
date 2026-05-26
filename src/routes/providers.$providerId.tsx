import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  findCategory,
  findProvider,
  reviewsForProvider,
  type Category,
  type Provider,
  type Review,
} from "@/lib/mock-data";

export const Route = createFileRoute("/providers/$providerId")({
  loader: ({
    params,
  }): { provider: Provider; category: Category | undefined; reviews: Review[] } => {
    const provider = findProvider(params.providerId);
    if (!provider) throw notFound();
    return {
      provider,
      category: findCategory(provider.category),
      reviews: reviewsForProvider(provider.id),
    };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.provider.business} — NexusZim` },
          { name: "description", content: loaderData.provider.bio },
        ]
      : [],
  }),
  component: ProviderProfilePage,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Provider not found</h1>
      <Link to="/search" className="mt-4 inline-block text-teal">
        Back to search
      </Link>
    </div>
  ),
});

function ProviderProfilePage() {
  const { provider, category, reviews } = Route.useLoaderData() as {
    provider: Provider;
    category: Category | undefined;
    reviews: Review[];
  };

  return (
    <div>
      <div className="bg-surface">
        <div className="container-page py-10">
          <Link to="/search" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to search
          </Link>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-5">
              <div
                className={`grid h-20 w-20 shrink-0 place-items-center rounded-2xl font-display text-2xl font-bold ${provider.avatarColor}`}
              >
                {provider.initials}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                    {provider.business}
                  </h1>
                  {provider.verified && (
                    <span className="rounded-full bg-teal/10 px-2.5 py-1 text-xs font-medium text-teal">
                      Verified
                    </span>
                  )}
                </div>
                <p className="mt-1 text-muted-foreground">
                  by {provider.name}
                  {category && (
                    <>
                      {" · "}
                      <Link
                        to="/categories/$slug"
                        params={{ slug: category.slug }}
                        className="text-teal hover:underline"
                      >
                        {category.name}
                      </Link>
                    </>
                  )}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span className="text-foreground">
                    <span className="font-semibold">{provider.rating}</span>
                    <span className="text-muted-foreground"> ({provider.reviews} reviews)</span>
                  </span>
                  <span>{provider.city}</span>
                  <span>{provider.responseTime}</span>
                  <span>{provider.completedJobs} jobs completed</span>
                </div>
              </div>
            </div>

            <aside className="rounded-2xl border border-border bg-card p-5 md:w-80">
              <p className="text-sm text-muted-foreground">Starting from</p>
              <p className="font-display text-3xl font-bold">
                ${provider.priceFrom}
              </p>
              <div className="mt-4 grid gap-2">
                <Link
                  to="/book/$providerId"
                  params={{ providerId: provider.id }}
                  className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-accent"
                >
                  Book now
                </Link>
                <Link
                  to="/request"
                  search={{ category: provider.category, providerId: provider.id }}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold hover:bg-muted"
                >
                  Request a quote
                </Link>
                <button className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold hover:bg-muted">
                  Message
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Deposit options available at checkout. Cancellation policy
                applies.
              </p>
            </aside>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-10 py-12 md:grid-cols-3">
        <section className="md:col-span-2">
          <h2 className="font-display text-xl font-semibold">About</h2>
          <p className="mt-2 text-muted-foreground">{provider.bio}</p>

          <h2 className="mt-10 font-display text-xl font-semibold">Services</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {provider.services.map((s) => (
              <li
                key={s}
                className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                {s}
              </li>
            ))}
          </ul>

          <h2 className="mt-10 font-display text-xl font-semibold">
            Reviews ({reviews.length})
          </h2>
          <div className="mt-3 space-y-3">
            {reviews.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No reviews yet. Be the first to book.
              </p>
            )}
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{r.client}</p>
                  <span className="text-sm font-semibold">{r.rating}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.date}</p>
                <p className="mt-2 text-sm">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-semibold">Availability</h3>
            <p
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                provider.availability === "available"
                  ? "bg-success/10 text-success"
                  : provider.availability === "busy"
                  ? "bg-warning/15 text-warning"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {provider.availability}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-semibold">Verification</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <Verify ok={provider.verified} label="Identity verified" />
              <Verify ok={provider.verified} label="Business documents" />
              <Verify ok={provider.verified} label="References checked" />
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Verify({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className={ok ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={`text-xs font-semibold ${ok ? "text-teal" : "text-muted-foreground"}`}>
        {ok ? "Verified" : "Pending"}
      </span>
    </li>
  );
}
