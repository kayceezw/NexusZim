import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import {
  DiamondField,
  RegistryChip,
  TierMarker,
  SectionHeading,
} from "@/components/registry";
import {
  ProfileCredentialsCard,
  type CredentialItem,
} from "@/components/registry/profile-credentials";
import { ProfileContactCard } from "@/components/registry/profile-contact";
import { PhotoUpload } from "@/components/registry/photo-upload";
import {
  fetchProvider,
  fetchSimilarProviders,
  fetchProviderReviews,
  providerInitials,
  providerAvatarColor,
  providerRegistryId,
  type ProviderListing,
} from "@/lib/queries";
import { Hallmark as HallmarkComp } from "@/components/registry/hallmark";

export const Route = createFileRoute("/providers/$providerId")({
  loader: async ({ params }) => {
    const provider = await fetchProvider(params.providerId);
    if (!provider) throw notFound();
    return { providerId: params.providerId, provider };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.provider.business_name} - NexusZim` },
          { name: "description", content: loaderData.provider.bio ?? undefined },
        ]
      : [],
  }),
  component: ProviderProfilePage,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-2xl text-foreground">Provider not found</h1>
      <Link
        to="/search"
        className="mt-4 inline-block font-sans text-sm text-primary hover:underline"
      >
        Return to Registry Search
      </Link>
    </div>
  ),
});

function ProviderProfilePage() {
  const { provider: initialProvider, providerId } = Route.useLoaderData();
  const { user, roles } = useAuth();
  const isProvider = roles.includes("service_provider");
  const isOwnProfile = isProvider && user?.id === providerId;

  const { data: provider = initialProvider } = useQuery({
    queryKey: ["provider", providerId],
    queryFn: () => fetchProvider(providerId),
    initialData: initialProvider,
    staleTime: 5 * 60 * 1000,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["provider-reviews", providerId],
    queryFn: () => fetchProviderReviews(providerId),
    staleTime: 5 * 60 * 1000,
  });

  const { data: similarProviders = [] } = useQuery({
    queryKey: ["similar-providers", provider?.category_id, providerId],
    queryFn: () =>
      provider?.category_id
        ? fetchSimilarProviders(provider.category_id, providerId, 3)
        : Promise.resolve([]),
    enabled: !!provider?.category_id,
    staleTime: 5 * 60 * 1000,
  });

  const [providerPhotos, setProviderPhotos] = useState<string[]>(provider?.photos ?? []);

  async function handlePhotosChange(urls: string[]) {
    if (!user) return;
    setProviderPhotos(urls);
    await supabase.from("provider_profiles").update({ photos: urls }).eq("user_id", user.id);
  }

  // ── Existing contact/booking action, preserved ──────────────────────────
  // Original page offered WhatsApp (preferred), phone fallback, then a posted
  // brief via /request. We keep that exact precedence and surface it behind the
  // new single "Request Secure Contact Info" primary button.
  const contactAction = useMemo(() => {
    if (!provider) return null;
    if (provider.whatsapp) {
      return {
        kind: "external" as const,
        href: `https://wa.me/${provider.whatsapp.replace(/\D/g, "")}`,
        label: "Request Secure Contact Info",
      };
    }
    if (provider.phone) {
      return {
        kind: "external" as const,
        href: `tel:${provider.phone}`,
        label: "Request Secure Contact Info",
      };
    }
    return {
      kind: "internal" as const,
      to: "/request",
      label: "Request Secure Contact Info",
    };
  }, [provider]);

  if (!provider) return null;

  const regId = providerRegistryId(provider.user_id);
  const initials = providerInitials(provider.business_name);
  const avatarColor = providerAvatarColor(provider.user_id);
  const category = provider.categories;
  const headshot = provider.photos?.[0] ?? null;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  // Trust Certified seal is driven by real tier/verified. Tier 3+ is certified.
  const isCertified = provider.tier >= 3;

  // Authorized Service Categories — derived from real data only. The provider's
  // registered category is authoritative; city (operating region) and tier scope
  // add truthful context without inventing services the provider never listed.
  const serviceCategories: string[] = [];
  if (category?.name) serviceCategories.push(category.name);
  if (provider.city) serviceCategories.push(`${provider.city} Region`);
  if (provider.verified) serviceCategories.push("Registry Verified");
  if (isCertified) serviceCategories.push("Trust Certified Scope");

  // Verified Credentials checklist — derived from the provider's real tier and
  // verified flags. Items a lower tier has not attained render as pending so the
  // record never overstates the provider's standing.
  const credentials: CredentialItem[] = [
    {
      label: "Registry Listing",
      sub: regId,
      confirmed: true,
    },
    {
      label: "Identity Verified",
      sub: provider.verified ? "STATUS_CONFIRMED" : "STATUS_PENDING",
      confirmed: provider.verified,
    },
    {
      label: "Business Registration",
      sub: provider.tier >= 2 ? "CR14 / CR6 ON FILE" : "AWAITING SUBMISSION",
      confirmed: provider.tier >= 2,
    },
    {
      label: "Reference History Reviewed",
      sub:
        reviews.length > 0
          ? `${reviews.length} VERIFIED REFERENCE${reviews.length === 1 ? "" : "S"}`
          : "NO REFERENCES ON FILE",
      confirmed: provider.tier >= 3 || reviews.length > 0,
    },
    {
      label: "Trust Certified Audit",
      sub: isCertified ? "DESK AUDIT PASSED" : "TIER 3 REQUIRED",
      confirmed: isCertified,
    },
  ];

  return (
    <div className="bg-background pt-16">
      <div className="container-page py-10">
        {/* ─── BREADCRUMB ─── */}
        <Link
          to="/search"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Return to Registry Search
        </Link>

        {/* ─── INSTITUTIONAL HEADER CARD ─── */}
        <section className="relative mt-6 overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-sm">
          <DiamondField tone={isCertified ? "gold" : "forest"} className="opacity-60" />

          <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:p-8">
            {/* Photo */}
            <div
              className={`flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius)] border border-border font-sans text-3xl font-bold sm:h-32 sm:w-32 ${avatarColor}`}
            >
              {headshot ? (
                <img
                  src={headshot}
                  alt={provider.business_name}
                  className="h-full w-full object-cover grayscale transition-all duration-300 hover:grayscale-0"
                />
              ) : (
                initials
              )}
            </div>

            {/* Identity block */}
            <div className="min-w-0 flex-1">
              <h1
                className="font-display leading-[1.05] tracking-[-0.02em] text-foreground"
                style={{ fontSize: "clamp(30px, 4vw, 48px)" }}
              >
                {provider.business_name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                {category && (
                  <span className="font-sans text-sm text-muted-foreground">
                    {category.name}
                  </span>
                )}
                {provider.city && (
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                    {provider.city}
                  </span>
                )}
                {avgRating != null && (
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                    {avgRating.toFixed(1)} / 5.0 ({reviews.length})
                  </span>
                )}
              </div>

              <div className="mt-4">
                <RegistryChip value={regId} copyable label="registry number" />
              </div>
            </div>

            {/* Trust seal pinned top-right */}
            <div className="shrink-0 sm:absolute sm:right-8 sm:top-8">
              <TierMarker tier={provider.tier} verified={provider.verified} variant="full" />
            </div>
          </div>
        </section>

        {/* ─── BENTO GRID ─── */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left column (span 2) */}
          <div className="flex flex-col gap-6 md:col-span-2">
            {/* Professional Record */}
            <section className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="mb-4 border-b border-border pb-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Professional Record
                </p>
              </div>
              <p className="font-sans text-[15px] leading-relaxed text-muted-foreground">
                {provider.bio ?? "This provider has not yet filed a professional record statement."}
              </p>
              {provider.website && (
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex font-mono text-[12px] uppercase tracking-[0.06em] text-primary hover:underline"
                >
                  {provider.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              )}
            </section>

            {/* Authorized Service Categories */}
            <section className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="mb-4 border-b border-border pb-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Authorized Service Categories
                </p>
              </div>
              {serviceCategories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {serviceCategories.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center rounded-[var(--radius-sm)] border border-border bg-surface/60 px-3 py-1.5 font-sans text-[13px] text-foreground"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="font-sans text-sm text-muted-foreground">
                  No authorized categories on file.
                </p>
              )}
            </section>

            {/* Provider photos — preserved owner-edit + gallery behaviour */}
            {(providerPhotos.length > 0 || isOwnProfile) && (
              <section className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm sm:p-8">
                <div className="mb-4 border-b border-border pb-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Filed Evidence
                  </p>
                </div>
                {isOwnProfile && user ? (
                  <PhotoUpload
                    userId={user.id}
                    photos={providerPhotos}
                    maxPhotos={8}
                    onChange={handlePhotosChange}
                    label="Your proof photos"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {providerPhotos.map((url, i) => (
                      <div
                        key={url}
                        className="aspect-[4/3] overflow-hidden rounded-[var(--radius-sm)] border border-border bg-surface"
                      >
                        <img
                          src={url}
                          alt={`${provider.business_name} filed evidence ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <ProfileCredentialsCard registryId={regId} items={credentials} />

            <ProfileContactCard>
              {contactAction?.kind === "external" ? (
                <a
                  href={contactAction.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cta gold-metal flex w-full items-center justify-center rounded-[var(--radius-sm)] px-6 py-3 font-sans text-sm font-semibold text-gold-foreground shadow-[var(--elev-sm)]"
                >
                  {contactAction.label}
                </a>
              ) : (
                <Link
                  to="/request"
                  className="btn-cta gold-metal flex w-full items-center justify-center rounded-[var(--radius-sm)] px-6 py-3 font-sans text-sm font-semibold text-gold-foreground shadow-[var(--elev-sm)]"
                >
                  {contactAction?.label ?? "Request Secure Contact Info"}
                </Link>
              )}
            </ProfileContactCard>
          </div>
        </div>

        {/* ─── SIMILAR PROVIDERS ─── */}
        {similarProviders.length > 0 && (
          <div className="mt-12 border-t border-border pt-10">
            <SectionHeading
              eyebrow="Registry"
              title={`Other ${category?.name ?? "Providers"} on Record`}
              subcopy="Comparable entries drawn from the same accredited category."
            />
            <div className="mt-6 space-y-3">
              {similarProviders.map((p) => (
                <SimilarProviderRow key={p.user_id} provider={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SimilarProviderRow({ provider }: { provider: ProviderListing }) {
  const initials = providerInitials(provider.business_name);
  const avatarColor = providerAvatarColor(provider.user_id);

  return (
    <div className="group relative overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-sm transition-all duration-150 hover:border-primary">
      <div className="flex min-h-[80px] gap-0">
        <div
          className={`flex w-[64px] shrink-0 items-center justify-center border-r border-border font-sans text-base font-bold ${avatarColor}`}
        >
          {provider.photos?.[0] ? (
            <img
              src={provider.photos[0]}
              alt={provider.business_name}
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1 px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <Link
              to="/providers/$providerId"
              params={{ providerId: provider.user_id }}
              className="font-display text-base text-foreground transition-colors group-hover:text-primary"
            >
              {provider.business_name}
            </Link>
            <HallmarkComp tier={provider.tier} />
          </div>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">{provider.city}</p>
        </div>
      </div>
    </div>
  );
}
