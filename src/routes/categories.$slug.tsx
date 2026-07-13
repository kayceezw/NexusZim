import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { findCategory, providersByCategory, type Category, type Provider } from "@/lib/mock-data";
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
    <div className="bg-background pt-24 min-h-screen">
      <div className="border-b border-gold/10">
        <div className="container-page py-16 md:py-24">
          <div className="flex items-center gap-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
            <Link to="/categories" className="hover:text-gold transition-colors">
              Categories
            </Link>
            <span className="text-gold/20">/</span>
            <span className="text-gold">{category.name}</span>
          </div>
          <div className="mt-8 max-w-3xl">
            <h1 className="font-display text-5xl font-bold tracking-tight text-foreground md:text-7xl">
              {category.name}.
            </h1>
            <p className="mt-8 max-w-xl font-body text-lg font-light leading-relaxed text-foreground/70">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      <div className="container-page py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 border-b border-gold/10 pb-10">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
              Step 01
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground">
              Select <span className="italic text-gold">Services.</span>
            </h2>
          </div>
          <Link
            to="/cart"
            className="bg-gold px-8 py-4 font-display text-sm font-bold uppercase tracking-widest text-forest-ink hover:bg-gold-deep transition-colors"
          >
            View Brief
          </Link>
        </div>

        {loadingServices ? (
          <p className="mt-10 font-mono text-xs text-gold/40 animate-pulse uppercase tracking-widest">
            Querying service layers...
          </p>
        ) : (
          <div className="mt-12 grid gap-px bg-gold/10 md:grid-cols-3 border border-gold/10">
            {services.map((s) => (
              <ServiceCard
                key={s.id}
                service={s}
                category={dbCategory!}
                categorySlug={category.slug}
                categoryName={category.name}
              />
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
        <div className="bg-card/30 border-y border-gold/10 py-20">
          <div className="container-page">
            <div className="flex items-center gap-4">
              <span className="h-px w-8 bg-gold/40" />
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
                Elite Network
              </p>
            </div>
            <h2 className="mt-4 font-display text-4xl font-bold text-foreground">
              Featured <span className="italic text-gold">Fixers.</span>
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {providers
                .filter((p) => p.featured)
                .slice(0, 3)
                .map((p) => (
                  <ProviderCard key={p.id} provider={p} />
                ))}
            </div>
          </div>
        </div>
      )}

      <div className="container-page py-20">
        <div className="flex items-center gap-4 border-b border-gold/10 pb-8">
          <h2 className="font-display text-3xl font-bold text-foreground">
            Verified <span className="italic text-gold">Directory.</span>
          </h2>
          <div className="h-px flex-1 bg-gold/5 ml-4" />
          <span className="font-mono text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
            {providers.length} Available
          </span>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
        {providers.length === 0 && (
          <div className="border border-dashed border-gold/20 p-20 text-center bg-card/20">
            <p className="font-body text-sm text-foreground/40 italic">
              Our network for this category is currently being audited. Check back shortly.
            </p>
          </div>
        )}
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
    <div className="flex flex-col bg-background p-8 group hover:bg-card transition-colors">
      <h3 className="font-display text-xl font-bold text-foreground group-hover:text-gold transition-colors">
        {service.name}
      </h3>
      {service.description && (
        <p className="mt-4 font-body text-sm text-foreground/60 leading-relaxed line-clamp-2">
          {service.description}
        </p>
      )}
      <div className="mt-8 flex items-baseline gap-2">
        {service.base_price != null ? (
          <>
            <span className="font-mono text-[9px] uppercase tracking-tighter text-foreground/30">
              From
            </span>
            <span className="font-display text-2xl font-bold text-foreground">
              ${Number(service.base_price).toFixed(0)}
            </span>
          </>
        ) : (
          <span className="font-mono text-[10px] text-gold/60 font-bold uppercase tracking-widest">
            Quote on Request
          </span>
        )}
      </div>
      <div className="mt-auto pt-10 flex flex-col gap-3">
        <button
          onClick={handleAdd}
          disabled={inCart}
          className={`w-full py-4 font-display text-[11px] font-bold uppercase tracking-widest transition-colors ${
            inCart
              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 cursor-not-allowed"
              : "bg-gold/10 text-gold border border-gold/30 hover:bg-gold hover:text-forest-ink"
          }`}
        >
          {inCart ? "Added to brief" : "Add to brief"}
        </button>
        {inCart && (
          <button
            onClick={() => navigate({ to: "/cart" })}
            className="w-full border border-gold/20 py-3 font-mono text-[9px] font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors"
          >
            View brief
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
    <div className="mt-20 border border-gold/20 bg-gold/5 p-10 md:p-14">
      <div className="flex items-center gap-4">
        <span className="h-px w-8 bg-gold/40" />
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
          Bespoke Enquiry
        </p>
      </div>
      <h3 className="mt-6 font-display text-3xl font-bold text-foreground">
        Describe a custom <span className="italic text-gold">brief.</span>
      </h3>
      <p className="mt-4 font-body text-base text-foreground/60 max-w-xl">
        Tell us exactly what you're looking for and verified fixers in {categoryName} will respond
        with bespoke proposals.
      </p>
      <div className="mt-10 flex flex-col gap-4 md:flex-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Drone aerial photography for a 200-guest wedding..."
          className="flex-1 bg-background border border-gold/20 p-4 font-body text-sm text-foreground outline-none focus:border-gold placeholder:text-foreground/20"
        />
        <button
          onClick={handleAdd}
          disabled={!text.trim() || !dbCategory}
          className="bg-gold px-10 py-4 font-display text-[11px] font-bold uppercase tracking-widest text-forest-ink hover:bg-gold-deep transition-colors disabled:opacity-60"
        >
          {added ? "Added to brief!" : "Add to brief"}
        </button>
        <button
          onClick={() => navigate({ to: "/cart" })}
          className="border border-gold/30 px-6 py-4 font-display text-[11px] font-bold uppercase tracking-widest text-gold hover:bg-gold/5 transition-colors"
        >
          View brief
        </button>
      </div>
    </div>
  );
}
