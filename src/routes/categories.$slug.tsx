import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  findCategory,
  providersByCategory,
  type Category,
  type Provider,
} from "@/lib/mock-data";
import { ProviderCard } from "@/components/provider-card";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/use-cart";

type DbService = {
  id: string;
  name: string;
  base_price: number | null;
  description: string | null;
};

type DbCategory = { id: string; name: string; slug: string };

export const Route = createFileRoute("/categories/$slug")({
  loader: ({ params }): { category: Category; providers: Provider[] } => {
    const category = findCategory(params.slug);
    if (!category) throw notFound();
    return {
      category,
      providers: providersByCategory(params.slug),
    };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.category.name} — NexusZim` },
          { name: "description", content: loaderData.category.description },
        ]
      : [],
  }),
  component: CategoryDetailPage,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-2xl font-bold">Category not found</h1>
      <Link to="/categories" className="mt-4 inline-block text-teal">
        Back to categories
      </Link>
    </div>
  ),
});

function CategoryDetailPage() {
  const { category, providers } = Route.useLoaderData() as {
    category: Category;
    providers: Provider[];
  };
  const [dbCategory, setDbCategory] = useState<DbCategory | null>(null);
  const [services, setServices] = useState<DbService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingServices(true);
      const { data: cat } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("slug", category.slug)
        .maybeSingle();
      if (cancelled) return;
      setDbCategory(cat);
      if (cat) {
        const { data: svc } = await supabase
          .from("services")
          .select("id, name, base_price, description")
          .eq("category_id", cat.id)
          .eq("active", true)
          .order("name");
        if (!cancelled) setServices(svc ?? []);
      }
      if (!cancelled) setLoadingServices(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [category.slug]);

  return (
    <div>
      <div style={{ backgroundColor: "var(--navy-mid)", borderBottom: "1px solid rgba(196,154,42,0.18)" }}>
        <div className="container-page py-16 md:py-20">
          <div className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.18em] text-cream/55">
            <Link to="/categories" className="hover:text-gold">
              Categories
            </Link>
            <span>/</span>
            <span className="text-gold">{category.name}</span>
          </div>
          <div className="mt-6 max-w-2xl">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-cream md:text-6xl">
              {category.name}
            </h1>
            <p className="mt-5 max-w-xl font-sans text-base font-light leading-[1.7] text-cream/70">{category.description}</p>
          </div>
        </div>
      </div>

      <div className="container-page py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-gold">
              01 — Choose services
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold">
              Add what you need to your cart
            </h2>
          </div>
          <Link
            to="/cart"
            className="hidden rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted md:inline-flex"
          >
            View cart
          </Link>
        </div>

        {loadingServices ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading services...</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} category={dbCategory!} categorySlug={category.slug} categoryName={category.name} />
            ))}
          </div>
        )}

        <CustomRequestCard
          dbCategory={dbCategory}
          categorySlug={category.slug}
          categoryName={category.name}
        />
      </div>

      {providers.some((p) => p.featured) && (
        <div className="container-page pb-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                Featured providers
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                Top picks in {category.name}
              </h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {providers
              .filter((p) => p.featured)
              .slice(0, 3)
              .map((p) => (
                <Link
                  key={p.id}
                  to="/providers/$providerId"
                  params={{ providerId: p.id }}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-gold"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-12 w-12 place-items-center rounded-full font-display text-base font-semibold ${p.avatarColor}`}
                    >
                      {p.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-display text-base font-semibold group-hover:text-gold">
                        {p.business}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.name} · {p.city}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {p.bio}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      ★ {p.rating.toFixed(2)}{" "}
                      <span className="text-muted-foreground">
                        ({p.reviews})
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      From ${p.priceFrom}
                    </span>
                  </div>
                  <span className="mt-4 inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
                    View profile →
                  </span>
                </Link>
              ))}
          </div>
        </div>
      )}

      <div className="container-page pb-12">
        <h2 className="font-display text-2xl font-semibold">
          {providers.length} provider{providers.length === 1 ? "" : "s"}{" "}
          available
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
          {providers.length === 0 && (
            <p className="text-muted-foreground">
              No providers yet — check back soon.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  category,
  categorySlug,
  categoryName,
}: {
  service: DbService;
  category: DbCategory;
  categorySlug: string;
  categoryName: string;
}) {
  const { add, items } = useCart();
  const inCart = items.some((i) => i.serviceId === service.id);
  const navigate = useNavigate();

  function handleAdd() {
    add({
      serviceId: service.id,
      serviceName: service.name,
      categoryId: category.id,
      categorySlug,
      categoryName,
      basePrice: service.base_price,
      isCustom: false,
    });
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <h3 className="font-display text-base font-semibold">{service.name}</h3>
      {service.description && (
        <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
      )}
      <div className="mt-4 flex items-baseline gap-2">
        {service.base_price != null ? (
          <>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">From</span>
            <span className="font-display text-xl font-bold">${Number(service.base_price).toFixed(0)}</span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Quoted on request</span>
        )}
      </div>
      <div className="mt-auto pt-5 flex gap-2">
        <button
          onClick={handleAdd}
          disabled={inCart}
          className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          {inCart ? "Added" : "Add to cart"}
        </button>
        {inCart && (
          <button
            onClick={() => navigate({ to: "/cart" })}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Cart
          </button>
        )}
      </div>
    </div>
  );
}

function CustomRequestCard({
  dbCategory,
  categorySlug,
  categoryName,
}: {
  dbCategory: DbCategory | null;
  categorySlug: string;
  categoryName: string;
}) {
  const { add } = useCart();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [added, setAdded] = useState(false);

  function handleAdd() {
    if (!text.trim() || !dbCategory) return;
    add({
      serviceId: null,
      serviceName: text.trim().slice(0, 120),
      categoryId: dbCategory.id,
      categorySlug,
      categoryName,
      basePrice: null,
      isCustom: true,
    });
    setText("");
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="mt-10 rounded-2xl border border-dashed border-gold/40 bg-gold/5 p-6">
      <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-gold">
        Don't see what you need?
      </p>
      <h3 className="mt-2 font-display text-xl font-semibold">
        Describe a custom request
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell us what you're looking for and providers in {categoryName} will respond.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Drone aerial photography for a 200-guest wedding"
          className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-ring focus:outline-none"
        />
        <button
          onClick={handleAdd}
          disabled={!text.trim() || !dbCategory}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-accent disabled:opacity-60"
        >
          {added ? "Added!" : "Add custom request"}
        </button>
        <button
          onClick={() => navigate({ to: "/cart" })}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
        >
          View cart
        </button>
      </div>
    </div>
  );
}
