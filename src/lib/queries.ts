import { supabase } from "@/integrations/supabase/client";

export type ProviderListing = {
  user_id: string;
  business_name: string;
  bio: string | null;
  category_id: string | null;
  city: string | null;
  tier: number;
  verified: boolean;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  photos: string[] | null;
  created_at: string;
  updated_at: string;
  categories: { id: string; name: string; slug: string; description: string | null } | null;
};

export type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  provider_count: number;
};

export type PlatformStats = {
  totalProviders: number;
  totalCategories: number;
  trustCertified: number;
  citiesCount: number;
};

export type ReviewRow = {
  id: string;
  client_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

const AVATAR_COLORS = [
  "bg-forest text-cream",
  "bg-gold text-forest-ink",
  "bg-forest-soft text-cream",
  "bg-gold-deep text-cream",
];

export function providerAvatarColor(userId: string): string {
  const n = userId.charCodeAt(0) + userId.charCodeAt(Math.max(0, userId.length - 1));
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

export function providerInitials(businessName: string): string {
  return businessName
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";
}

export function providerRegistryId(userId: string): string {
  return `NX-${userId.slice(0, 8).toUpperCase()}`;
}

export async function fetchFeaturedProviders(): Promise<ProviderListing[]> {
  const { data, error } = await supabase
    .from("provider_profiles")
    .select("*, categories(id, name, slug, description)")
    .gte("tier", 2)
    .order("tier", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(4);
  if (error) throw error;
  return (data ?? []) as unknown as ProviderListing[];
}

export type FetchProvidersParams = {
  search?: string;
  city?: string;
  categorySlug?: string;
  minTier?: number;
  sortBy?: "tier" | "name" | "city" | "newest";
  limit?: number;
  offset?: number;
};

export async function fetchProviders(params: FetchProvidersParams = {}): Promise<ProviderListing[]> {
  const { search, city, categorySlug, minTier = 1, sortBy = "tier", limit = 60, offset = 0 } =
    params;

  let categoryId: string | null = null;
  if (categorySlug && categorySlug !== "all") {
    const { data: catData } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();
    categoryId = catData?.id ?? null;
    if (!categoryId) return [];
  }

  let query = supabase
    .from("provider_profiles")
    .select("*, categories(id, name, slug, description)");

  if (city && city !== "all") query = query.eq("city", city);
  if (minTier > 1) query = query.gte("tier", minTier);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (search) {
    query = query.or(
      `business_name.ilike.%${search}%,bio.ilike.%${search}%,city.ilike.%${search}%`,
    );
  }

  if (sortBy === "tier") {
    query = query.order("tier", { ascending: false }).order("updated_at", { ascending: false });
  } else if (sortBy === "name") {
    query = query.order("business_name");
  } else if (sortBy === "city") {
    query = query.order("city").order("business_name");
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ProviderListing[];
}

export async function fetchProvider(userId: string): Promise<ProviderListing | null> {
  const { data, error } = await supabase
    .from("provider_profiles")
    .select("*, categories(id, name, slug, description)")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as ProviderListing | null;
}

export async function fetchProvidersByCategory(
  categorySlug: string,
  limit = 20,
): Promise<ProviderListing[]> {
  const { data: cat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();
  if (!cat?.id) return [];

  const { data, error } = await supabase
    .from("provider_profiles")
    .select("*, categories(id, name, slug, description)")
    .eq("category_id", cat.id)
    .order("tier", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as ProviderListing[];
}

export async function fetchCategories(): Promise<CategoryWithCount[]> {
  const { data: cats, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  if (!cats?.length) return [];

  const { data: provRows } = await supabase.from("provider_profiles").select("category_id");
  const countMap: Record<string, number> = {};
  (provRows ?? []).forEach((row) => {
    if (row.category_id) countMap[row.category_id] = (countMap[row.category_id] ?? 0) + 1;
  });

  return cats.map((cat) => ({ ...cat, provider_count: countMap[cat.id] ?? 0 }));
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  const [
    { count: totalProviders },
    { count: totalCategories },
    { count: trustCertified },
    { data: cityData },
  ] = await Promise.all([
    supabase.from("provider_profiles").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("provider_profiles").select("*", { count: "exact", head: true }).gte("tier", 3),
    supabase.from("provider_profiles").select("city"),
  ]);

  const uniqueCities = new Set((cityData ?? []).map((r) => r.city).filter(Boolean)).size;

  return {
    totalProviders: totalProviders ?? 0,
    totalCategories: totalCategories ?? 0,
    trustCertified: trustCertified ?? 0,
    citiesCount: uniqueCities,
  };
}

export async function fetchProviderReviews(providerId: string): Promise<ReviewRow[]> {
  const { data } = await supabase
    .from("reviews")
    .select("id, client_id, rating, comment, created_at")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false })
    .limit(10);
  return data ?? [];
}

export async function fetchSimilarProviders(
  categoryId: string,
  excludeUserId: string,
  limit = 3,
): Promise<ProviderListing[]> {
  const { data } = await supabase
    .from("provider_profiles")
    .select("*, categories(id, name, slug, description)")
    .eq("category_id", categoryId)
    .neq("user_id", excludeUserId)
    .order("tier", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as ProviderListing[];
}

export async function fetchCitiesWithCounts(): Promise<{ city: string; count: number }[]> {
  const { data } = await supabase.from("provider_profiles").select("city");
  const countMap: Record<string, number> = {};
  (data ?? []).forEach((row) => {
    if (row.city) countMap[row.city] = (countMap[row.city] ?? 0) + 1;
  });
  return Object.entries(countMap)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count);
}
