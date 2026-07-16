import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CATEGORIES, type Category } from "@/lib/mock-data";
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
  loader: ({ params }): { category: Category } => {
    const category = CATEGORIES.find((c) => c.slug === params.slug);
    if (!category) throw notFound();
    return { category };
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
      <h1 className="font-display text-2xl text-text">Category not found</h1>
      <Link to="/categories" className="mt-4 inline-block text-forest hover:underline">
        Back to categories
      </Link>
    </div>
  ),
});

function CategoryDetailPage() {
  const { category } = Route.useLoaderData();
  const [selectedSub, setSelectedSub] = useState<string>("all");

  const { data: providers = [], isLoading: loadingProviders } = useQuery({
    queryKey: ["providers-by-category", category.slug],
    queryFn: () => fetchProvidersByCategory(category.slug),
    staleTime: 5 * 60 * 1000,
  });

  const { data: dbData, isLoading: loadingServices } = useQuery({
    queryKey: ["category-services", category.slug],
    queryFn: async () => {
      const { data: cat } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("slug", category.slug)
        .maybeSingle();
      if (!cat) return { dbCategory: null as DbCategory | null, services: [] as DbService[] };
      const { data: svc } = await supabase
        .from("services")
        .select("id, name, base_price, description")
        .eq("category_id", cat.id)
        .eq("active", true)
        .order("name");
      return { dbCategory: cat as DbCategory, services: (svc ?? []) as DbService[] };
    },
    staleTime: 5 * 60 * 1000,
  });

  const dbCategory = dbData?.dbCategory ?? null;
  const services = dbData?.services ?? [];

  return (
    <div className="bg-cream pt-16 min-h-screen">
      {/* Forest hero header */}
      <div className="bg-forest border-b border-cream/10">
        <div className="container-page py-12 md:py-16">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-cream/30 mb-6">
            <Link to="/categories" className="hover:text-cream/60 transition-colors">
              Categories
            </Link>
            <span className="text-cream/20">/</span>
            <span className="text-gold">{category.name}</span>
          </div>
          <p className="eyebrow text-cream/40 mb-3">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            {category.tagline}
          </p>
          <h1
            className="font-display text-cream"
            style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: "1.06", letterSpacing: "-0.02em" }}
          >
            {category.name}.
          </h1>
          <p className="mt-4 max-w-xl font-sans text-sm text-cream/60 leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      {/* Sub-category filter strip */}
      <div className="sticky top-[64px] z-40 bg-cream border-b border-hairline">
        <div className="container-page">
          <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedSub("all")}
              className={`shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.08em] px-3 py-1.5 rounded-[3px] border transition-colors ${
                selectedSub === "all"
                  ? "bg-gold border-gold text-forest-ink"
                  : "border-hairline text-text-soft hover:border-forest hover:text-forest"
              }`}
            >
              All ({providers.length})
            </button>
            {category.subCategories.map((sub) => {
              const active = selectedSub === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSub(active ? "all" : sub)}
                  className={`shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.08em] px-3 py-1.5 rounded-[3px] border transition-colors ${
                    active
                      ? "bg-gold border-gold text-forest-ink"
                      : "border-hairline text-text-soft hover:border-forest hover:text-forest"
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
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-hairline pb-8">
          <div>
            <p className="eyebrow text-text-soft mb-2">
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
              Available services
            </p>
            <h2 className="font-display text-2xl text-text">
              Select <em className="italic text-gold">what you need.</em>
            </h2>
          </div>
          <Link
            to="/cart"
            className="bg-gold px-7 py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
          >
            View Brief
          </Link>
        </div>

        {loadingServices ? (
          <p className="mt-10 font-mono text-[10px] text-text-soft/40 animate-pulse uppercase tracking-widest">
            Loading services...
          </p>
        ) : services.length === 0 ? (
          <div className="mt-8 border border-dashed border-hairline rounded-[6px] p-14 text-center">
            <p className="font-sans text-sm text-text-soft">
              No services listed yet.{" "}
              <Link
                to="/request"
                search={{ category: category.slug }}
                className="text-forest hover:underline"
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
      <div className="border-t border-hairline">
        <div className="container-page py-12">
          <div className="flex flex-wrap items-center gap-4 border-b border-hairline pb-6 mb-10">
            <h2 className="font-display text-2xl text-text">
              Verified <em className="italic text-gold">Directory.</em>
            </h2>
            {selectedSub !== "all" && (
              <span className="font-mono text-[10px] px-2.5 py-1 bg-gold/10 border border-gold/30 text-gold uppercase tracking-[0.06em] rounded-[3px]">
                {selectedSub}
              </span>
            )}
            <div className="h-px flex-1 bg-hairline ml-2" />
            {!loadingProviders && (
              <span className="font-mono text-[10px] text-text-soft uppercase tracking-widest">
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
            <div className="border border-dashed border-hairline rounded-[6px] p-16 text-center">
              <p className="font-sans text-sm text-text-soft">
                No verified providers in this category yet.
              </p>
              <Link
                to="/request"
                search={{ category: category.slug }}
                className="mt-6 inline-block border border-forest px-6 py-3 rounded-[3px] font-sans text-sm font-semibold text-forest hover:bg-forest hover:text-cream transition-colors"
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
    <div className="bg-cream-raised border border-hairline rounded-[6px] p-6 flex flex-col group hover:border-forest hover:shadow-[0_4px_20px_rgba(15,51,35,0.08)] transition-all">
      <h3 className="font-display text-lg text-text group-hover:text-forest transition-colors">
        {service.name}
      </h3>
      {service.description && (
        <p className="mt-3 font-sans text-[13px] text-text-soft leading-relaxed line-clamp-2">
          {service.description}
        </p>
      )}
      <div className="mt-6 flex items-baseline gap-2">
        {service.base_price != null ? (
          <>
            <span className="font-mono text-[9px] uppercase tracking-tight text-text-soft/50">From</span>
            <span className="font-display text-2xl text-text">
              ${Number(service.base_price).toFixed(0)}
            </span>
          </>
        ) : (
          <span className="font-mono text-[10px] text-gold uppercase tracking-widest">
            Quote on request
          </span>
        )}
      </div>
      <div className="mt-auto pt-6 flex flex-col gap-2">
        <button
          onClick={handleAdd}
          disabled={inCart}
          className={`w-full py-3 rounded-[3px] font-sans text-sm font-semibold transition-colors ${
            inCart
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed"
              : "bg-gold/10 text-gold border border-gold/30 hover:bg-gold hover:text-forest-ink"
          }`}
        >
          {inCart ? "Added to brief" : "Add to brief"}
        </button>
        {inCart && (
          <button
            onClick={() => navigate({ to: "/cart" })}
            className="w-full border border-hairline py-2.5 rounded-[3px] font-sans text-[12px] text-text-soft hover:border-forest hover:text-forest transition-colors"
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
    <div className="mt-10 bg-cream-raised border border-hairline rounded-[6px] p-8 md:p-10">
      <p className="eyebrow text-text-soft mb-3">
        <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
        Bespoke enquiry
      </p>
      <h3 className="font-display text-2xl text-text mb-2">
        Describe a custom <em className="italic text-gold">brief.</em>
      </h3>
      <p className="font-sans text-[13px] text-text-soft max-w-xl leading-relaxed mb-8">
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
          className="bg-gold px-8 py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {added ? "Added!" : "Add to brief"}
        </button>
        <button
          onClick={() => navigate({ to: "/cart" })}
          className="border border-hairline px-6 py-3 rounded-[3px] font-sans text-sm text-text-soft hover:border-forest hover:text-forest transition-colors whitespace-nowrap"
        >
          View brief
        </button>
      </div>
    </div>
  );
}
