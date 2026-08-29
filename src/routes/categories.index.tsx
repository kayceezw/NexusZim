import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CategoryCard } from "@/components/category-card";
import { fetchCategories } from "@/lib/queries";

export const Route = createFileRoute("/categories/")({
  head: () => ({
    meta: [
      { title: "Service categories - NexusZim" },
      {
        name: "description",
        content:
          "Browse all service categories on NexusZim: events, visa & docs, transport, beauty, business services and more.",
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: dbCategories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
  });

  const totalProviders = dbCategories.reduce((s, c) => s + c.provider_count, 0);

  return (
    <div className="bg-background pt-16 min-h-screen">
      {/* Forest header */}
      <div className="bg-forest-ink border-b border-cream/10 py-12">
        <div className="container-page">
          <p className="eyebrow text-cream/40 mb-3">
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
            Service network
          </p>
          <h1 className="font-display text-cream" style={{ fontSize: "clamp(32px, 4.5vw, 56px)", lineHeight: "1.06", letterSpacing: "-0.02em" }}>
            Browse by Category
          </h1>
          <p className="mt-3 max-w-lg font-sans text-sm text-cream/60 leading-relaxed">
            {dbCategories.length} service categories · {totalProviders} verified providers across Zimbabwe.
          </p>
        </div>
      </div>

      {/* Category grid */}
      <div className="container-page py-12 pb-8">
        {isLoading ? (
          <p className="font-mono text-[10px] text-muted-foreground/40 animate-pulse uppercase tracking-widest">
            Loading categories...
          </p>
        ) : dbCategories.length === 0 ? (
          <div className="border border-dashed border-border rounded-[6px] p-16 text-center">
            <p className="font-sans text-sm text-muted-foreground">No categories yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {dbCategories.map((c, i) => (
              <CategoryCard key={c.id} category={c} animationDelay={i * 40} />
            ))}
          </div>
        )}
      </div>

      {/* Full service index - all categories with counts */}
      {dbCategories.length > 0 && (
        <div className="border-t border-gold/10 mt-8">
          <div className="container-page py-16 pb-24">
            <div className="flex items-center gap-4 mb-10">
              <span className="h-px w-8 bg-gold/40" />
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold">
                Full Service Index
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
              {dbCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="border border-border bg-card rounded-[6px] overflow-hidden"
                >
                  {/* Parent header */}
                  <Link
                    to="/categories/$slug"
                    params={{ slug: cat.slug }}
                    className="group flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-3 py-3 sm:px-5 sm:py-4 border-b border-border hover:bg-forest hover:border-primary transition-colors"
                  >
                    <span className="font-display text-sm sm:text-base font-bold text-foreground group-hover:text-white transition-colors flex-1 leading-tight">
                      {cat.name}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground/50 group-hover:text-white/50 transition-colors shrink-0">
                      {cat.provider_count} on register
                    </span>
                  </Link>

                  {cat.description && (
                    <div className="px-3 py-3 sm:px-5 sm:py-4">
                      <p className="font-sans text-[12px] sm:text-[13px] text-muted-foreground leading-relaxed line-clamp-3">
                        {cat.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
