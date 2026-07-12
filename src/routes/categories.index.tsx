import { createFileRoute } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/mock-data";
import { CategoryCard } from "@/components/category-card";

export const Route = createFileRoute("/categories/")({
  head: () => ({
    meta: [
      { title: "Service categories — NexusZim" },
      {
        name: "description",
        content:
          "Browse all service categories on NexusZim — events, visa & docs, transport, personal services and more.",
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <div className="bg-background pt-20 min-h-screen">
      {/* Header strip */}
      <div className="bg-[#00301c] py-12">
        <div className="container-page">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50 mb-2">Service Network</p>
          <h1 className="font-display text-4xl font-bold text-white">
            Browse by Category
          </h1>
          <p className="mt-3 max-w-lg text-base text-white/70">
            Find verified service providers across all major categories in Zimbabwe.
          </p>
        </div>
      </div>

      <div className="container-page py-12 pb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

