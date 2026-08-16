import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchProvidersByCategory } from "@/lib/queries";
import { LiveProviderCard } from "@/components/provider-card";
import { ProviderCardSkeleton } from "@/components/skeletons";
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
  loader: async ({ params }) => {
    const { data: category } = await supabase
      .from("categories")
      .select("id, name, slug, description")
      .eq("slug", params.slug)
      .maybeSingle();
    if (!category) throw notFound();

    // Sub-categories are child rows (parent_id) in the taxonomy-v2 model.
    const { data: subs } = await supabase
      .from("categories")
      .select("name")
      .eq("parent_id", category.id)
      .eq("active", true)
      .order("name");

    return { category, subCategories: (subs ?? []).map((s) => s.name) };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.category.name} — NexusZim` },
          { name: "description", content: loaderData.category.description ?? "" },
        ]
      : [],
  }),
  component: CategoryDetailPage,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-2xl text-foreground">Category not found</h1>
      <Link to="/categories" className="mt-4 inline-block text-primary hover:underline">
        Back to categories
      </Link>
    </div>
  ),
});

function CategoryDetailPage() {
  const { category, subCategories } = Route.useLoaderData();
  const [selectedSub, setSelectedSub] = useState<string>("all");

  const dbCategory: DbCategory = {
    id: category.id,
    name: category.name,
    slug: category.slug,
  };

  const { data: providers = [], isLoading: loadingProviders } = useQuery({
    queryKey: ["providers-by-category", category.slug],
    queryFn: () => fetchProvidersByCategory(category.slug),
    staleTime: 5 * 60 * 1000,
  });

  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ["category-services", category.id],
    queryFn: async () => {
      const { data: svc } = await supabase
        .from("services")
        .select("id, name, base_price, description")
        .eq("category_id", category.id)
        .eq("active", true)
        .order("name");
      return (svc ?? []) as DbService[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="bg-background pt-16 min-h-screen">
      {/* Forest hero header */}
      <div className="relative bg-forest-ink border-b border-cream/10 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(45% 60% at 92% 0%, rgba(212,166,60,0.12), transparent 60%)",
          }}
        />
        <div className="container-page py-12 md:py-16 relative z-10">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-cream/30 mb-6">
            <Link to="/categories" className="hover:text-cream/60 transition-colors">
              Categories
            </Link>
            <span className="text-cream/20">/</span>
            <span className="text-gold">{category.name}</span>
          </div>
          <p className="eyebrow text-cream/40 mb-3">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            Verified Directory
          </p>
          <h1
            className="font-display text-cream"
            style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: "1.06", letterSpacing: "-0.02em" }}
          >
            {category.name}.
          </h1>
          <p className="mt-4 max-w-xl font-sans text-sm text-cream/60 leading-relaxed">
            {category.description ??
              `Browse verified ${category.name} providers across Zimbabwe.`}
          </p>
        </div>
      </div>

      {/* Sub-category filter strip */}
      <div className="sticky top-[64px] z-40 bg-background border-b border-border">
        <div className="container-page">
          <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedSub("all")}
              className={`shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.08em] px-3 py-1.5 rounded-[3px] border transition-colors ${
                selectedSub === "all"
                  ? "bg-gold border-gold text-forest-ink"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              All ({providers.length})
            </button>
            {subCategories.map((sub) => {
              const active = selectedSub === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSub(active ? "all" : sub)}
                  className={`shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.08em] px-3 py-1.5 rounded-[3px] border transition-colors ${
                    active
                      ? "bg-gold border-gold text-forest-ink"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Services section */}
      <div className="container-page py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-border pb-8">
          <div>
            <p className="eyebrow text-muted-foreground mb-2">
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
              Available services
            </p>
            <h2 className="font-display text-2xl text-foreground">
              Select <em className="italic text-gold-deep dark:text-gold">what you need.</em>
            </h2>
          </div>
          <Link
            to="/cart"
            className="btn-cta gold-metal px-7 py-3 rounded-[4px] font-sans text-sm font-semibold text-gold-foreground shadow-[var(--elev-sm)]"
          >
            View Brief
          </Link>
        </div>

        {loadingServices ? (
          <p className="mt-10 font-mono text-[10px] text-muted-foreground/40 animate-pulse uppercase tracking-widest">
            Loading services...
          </p>
        ) : services.length === 0 ? (
          <div className="mt-8 border border-dashed border-border rounded-[8px] bg-surface-low/60 p-14 text-center">
            <p className="font-sans text-sm text-muted-foreground">
              No services listed yet.{" "}
              <Link
                to="/request"
                search={{ category: category.slug }}
                className="text-primary hover:underline"
              >
                Post a custom brief instead.
              </Link>
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
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

      {/* Verified provider directory */}
      <div className="border-t border-border">
        <div className="container-page py-12">
          <div className="flex flex-wrap items-center gap-4 border-b border-border pb-6 mb-10">
            <h2 className="font-display text-2xl text-foreground">
              Verified <em className="italic text-gold-deep dark:text-gold">Directory.</em>
            </h2>
            {selectedSub !== "all" && (
              <span className="font-mono text-[10px] px-2.5 py-1 bg-gold/10 border border-gold/30 text-gold-deep dark:text-gold uppercase tracking-[0.06em] rounded-[3px]">
                {selectedSub}
              </span>
            )}
            <div className="h-px flex-1 bg-hairline ml-2" />
            {!loadingProviders && (
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                {providers.length} verified
              </span>
            )}
          </div>

          {loadingProviders ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <ProviderCardSkeleton key={i} />
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="border border-dashed border-border rounded-[8px] bg-surface-low/60 p-16 text-center">
              <p className="font-sans text-sm text-muted-foreground">
                No verified providers in this category yet.
              </p>
              <Link
                to="/request"
                search={{ category: category.slug }}
                className="mt-6 inline-block border border-primary/80 bg-card px-6 py-3 rounded-[4px] font-sans text-sm font-semibold text-primary shadow-[var(--elev-sm)] hover:bg-forest hover:text-cream hover:-translate-y-px hover:shadow-[var(--elev-md)] transition-all duration-150"
              >
                Post a brief
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {providers.map((p) => (
                <LiveProviderCard key={p.user_id} provider={p} />
              ))}
            </div>
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
    <div className="bg-card border border-border rounded-[8px] p-6 flex flex-col group shadow-[var(--elev-sm)] hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-[var(--elev-lg)] transition-all duration-200">
      <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors">
        {service.name}
      </h3>
      {service.description && (
        <p className="mt-3 font-sans text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
          {service.description}
        </p>
      )}
      <div className="mt-6 flex items-baseline gap-2">
        {service.base_price != null ? (
          <>
            <span className="font-mono text-[9px] uppercase tracking-tight text-muted-foreground/50">From</span>
            <span className="font-display text-2xl text-foreground">
              ${Number(service.base_price).toFixed(0)}
            </span>
          </>
        ) : (
          <span className="font-mono text-[10px] text-gold-deep dark:text-gold uppercase tracking-widest">
            Quote on request
          </span>
        )}
      </div>
      <div className="mt-auto pt-6 flex flex-col gap-2">
        <button
          onClick={handleAdd}
          disabled={inCart}
          className={`w-full py-3 rounded-[4px] font-sans text-sm font-semibold transition-all duration-150 ${
            inCart
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-not-allowed"
              : "bg-gold/10 text-gold-deep dark:text-gold border border-gold/40 hover:gold-metal hover:text-gold-foreground hover:border-transparent hover:shadow-[var(--glow-gold)]"
          }`}
        >
          {inCart ? "Added to brief" : "Add to brief"}
        </button>
        {inCart && (
          <button
            onClick={() => navigate({ to: "/cart" })}
            className="w-full border border-border py-2.5 rounded-[3px] font-sans text-[12px] text-muted-foreground hover:border-primary hover:text-primary transition-colors"
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
    <div className="mt-10 bg-card border border-border rounded-[8px] p-8 md:p-10 shadow-[var(--elev-md)]">
      <p className="eyebrow text-muted-foreground mb-3">
        <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
        Bespoke enquiry
      </p>
      <h3 className="font-display text-2xl text-foreground mb-2">
        Describe a custom <em className="italic text-gold-deep dark:text-gold">brief.</em>
      </h3>
      <p className="font-sans text-[13px] text-muted-foreground max-w-xl leading-relaxed mb-8">
        Tell us what you're looking for. Verified providers in {categoryName} will respond with
        bespoke proposals.
      </p>
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`e.g. Drone photography for a 200-guest ${categoryName.toLowerCase()} event…`}
          className="flex-1 field-input"
        />
        <button
          onClick={handleAdd}
          disabled={!text.trim() || !dbCategory}
          className="btn-cta gold-metal px-8 py-3 rounded-[4px] font-sans text-sm font-semibold text-gold-foreground shadow-[var(--elev-sm)] disabled:opacity-60 disabled:pointer-events-none whitespace-nowrap"
        >
          {added ? "Added!" : "Add to brief"}
        </button>
        <button
          onClick={() => navigate({ to: "/cart" })}
          className="border border-border px-6 py-3 rounded-[3px] font-sans text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
        >
          View brief
        </button>
      </div>
    </div>
  );
}
