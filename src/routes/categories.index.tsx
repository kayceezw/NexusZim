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
    <div className="container-page py-20 md:py-24">
      <div className="max-w-2xl">
        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-gold">
          Categories
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-cream md:text-5xl">
          Find the right <span className="italic font-medium text-gold">service.</span>
        </h1>
        <p className="mt-4 max-w-lg font-sans text-base font-light leading-[1.7] text-cream/70">
          Browse every category on NexusZim. New service types are added all
          the time.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-3">
        {CATEGORIES.map((c) => (
          <CategoryCard key={c.slug} category={c} />
        ))}
      </div>
    </div>
  );
}
