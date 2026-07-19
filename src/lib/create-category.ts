import { createServerFn } from "@tanstack/react-start";

type CreateCategoryInput = {
  name: string;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const createCategoryFn = createServerFn({ method: "POST" })
  .inputValidator((data: CreateCategoryInput) => data)
  .handler(async (ctx) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const name = ctx.data.name.trim();
    const slug = slugify(name);

    // Reuse an existing category if the slug already exists
    const { data: existing } = await supabaseAdmin
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) return { id: existing.id };

    const { data: created, error } = await supabaseAdmin
      .from("categories")
      .insert({ name, slug })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    return { id: created.id };
  });
