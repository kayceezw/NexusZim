import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Hallmark } from "@/components/registry/hallmark";
import { LedgerRow } from "@/components/registry/ledger";
import { PhotoUpload } from "@/components/registry/photo-upload";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Phone, Share2, ExternalLink } from "lucide-react";
import {
  fetchProvider,
  fetchSimilarProviders,
  fetchProviderReviews,
  providerInitials,
  providerAvatarColor,
  providerRegistryId,
  type ProviderListing,
  type ReviewRow,
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
          { title: `${loaderData.provider.business_name} — NexusZim` },
          { name: "description", content: loaderData.provider.bio ?? undefined },
        ]
      : [],
  }),
  component: ProviderProfilePage,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-2xl text-text">Provider not found</h1>
      <Link
        to="/search"
        className="mt-4 inline-block font-sans text-sm text-forest hover:underline"
      >
        Back to directory
      </Link>
    </div>
  ),
});

const VERIFICATION_CHECKS = [
  { key: "Identity documents", minTier: 2 },
  { key: "Business registration (CR14/CR6)", minTier: 2 },
  { key: "Positive rating history", minTier: 3 },
  { key: "Portfolio audit by NexusZim desk", minTier: 3 },
  { key: "On-site premises visit", minTier: 4 },
];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-[3px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24">
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            fill={i <= filled ? "#e7a020" : "none"}
            stroke={i <= filled ? "#e7a020" : "#dedacb"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

function PhotoGallery({ photos, businessName }: { photos: string[]; businessName: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
        {photos.map((url, i) => (
          <button
            key={url}
            onClick={() => setLightboxIndex(i)}
            className="aspect-[4/3] rounded-[6px] overflow-hidden bg-forest/10 hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-forest"
          >
            <img
              src={url}
              alt={`${businessName} photo ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-forest-ink/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 text-cream/60 hover:text-cream font-sans text-2xl leading-none"
          >
            ✕
          </button>
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
              className="absolute left-4 text-cream/60 hover:text-cream font-sans text-2xl"
            >
              ←
            </button>
          )}
          {lightboxIndex < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
              className="absolute right-16 text-cream/60 hover:text-cream font-sans text-2xl"
            >
              →
            </button>
          )}
          <img
            src={photos[lightboxIndex]}
            alt={`${businessName} photo ${lightboxIndex + 1}`}
            className="max-h-[85vh] max-w-full rounded-[6px] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 font-mono text-[11px] text-cream/40 uppercase tracking-widest">
            {lightboxIndex + 1} / {photos.length}
          </p>
        </div>
      )}
    </>
  );
}

function ProviderProfilePage() {
  const { provider: initialProvider, providerId } = Route.useLoaderData();
  const { user, roles } = useAuth();
  const isProvider = roles.includes("service_provider");
  const isOwnProfile = isProvider && user?.id === providerId;

  const [copied, setCopied] = useState(false);

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

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  }

  if (!provider) return null;

  const regId = providerRegistryId(provider.user_id);
  const initials = providerInitials(provider.business_name);
  const avatarColor = providerAvatarColor(provider.user_id);
  const category = provider.categories;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return (
    <div className="bg-cream pt-16">
      {/* ─── PAGE HEADER ─── */}
      <div className="border-b border-hairline bg-cream-raised">
        <div className="container-page py-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-text-soft hover:text-forest transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Directory
            </Link>
            {category && (
              <>
                <span className="font-mono text-[11px] text-text-soft/50">/</span>
                <Link
                  to="/categories/$slug"
                  params={{ slug: category.slug }}
                  className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-soft hover:text-forest transition-colors"
                >
                  {category.name}
                </Link>
              </>
            )}
            <span className="font-mono text-[11px] text-text-soft/50">/</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-text">
              {provider.business_name}
            </span>
          </div>
        </div>

        <div className="container-page pb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Hallmark tier={provider.tier} />
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-soft">
                  {regId}
                </span>
                {provider.verified && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.06em] text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Verified
                  </span>
                )}
              </div>

              <h1
                className="font-display text-text"
                style={{
                  fontSize: "clamp(32px, 4.5vw, 56px)",
                  lineHeight: "1.06",
                  letterSpacing: "-0.02em",
                }}
              >
                {provider.business_name}
              </h1>

              <div className="flex flex-wrap items-center gap-4">
                {category && (
                  <span className="font-sans text-[13px] text-text-soft">
                    {category.name}
                  </span>
                )}
                {provider.city && (
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-soft">
                    <MapPin className="h-3 w-3" strokeWidth={1.5} />
                    {provider.city}
                  </span>
                )}
                {avgRating != null && (
                  <div className="flex items-center gap-2">
                    <Stars rating={avgRating} />
                    <span className="font-mono text-[11px] text-text-soft">
                      {avgRating.toFixed(1)} ({reviews.length})
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              {provider.whatsapp && (
                <a
                  href={`https://wa.me/${provider.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-gold px-6 py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Contact on WhatsApp
                </a>
              )}
              {!provider.whatsapp && provider.phone && (
                <a
                  href={`tel:${provider.phone}`}
                  className="flex items-center justify-center gap-2 bg-gold px-6 py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
                >
                  <Phone className="h-4 w-4" strokeWidth={1.5} />
                  Call now
                </a>
              )}
              <Link
                to="/request"
                className="border border-forest px-6 py-3 rounded-[3px] font-sans text-sm font-semibold text-forest hover:bg-forest hover:text-cream transition-colors text-center"
              >
                Post a brief
              </Link>
              <button
                onClick={handleShare}
                className="border border-hairline px-4 py-3 rounded-[3px] font-sans text-sm text-text-soft hover:border-forest hover:text-forest transition-colors flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" strokeWidth={1.5} />
                {copied ? "Copied!" : "Share"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left: 8 columns */}
          <main className="lg:col-span-8 space-y-8">
            {/* Avatar + About */}
            <section className="bg-cream-raised border border-hairline rounded-[6px] p-7">
              <div className="flex items-start gap-5 mb-6">
                <div
                  className={`flex-shrink-0 h-16 w-16 rounded-[6px] overflow-hidden flex items-center justify-center font-sans text-xl font-bold ${avatarColor}`}
                >
                  {(provider.photos?.length ?? 0) > 0 ? (
                    <img
                      src={provider.photos![0]}
                      alt={provider.business_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <h2 className="font-display text-2xl text-text">About</h2>
                  {provider.website && (
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1 font-sans text-[12px] text-text-soft hover:text-forest transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                      {provider.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  )}
                </div>
              </div>
              <p className="font-sans text-base text-text-soft leading-relaxed">
                {provider.bio ?? "No bio provided yet."}
              </p>
            </section>

            {/* Portfolio photos */}
            {(providerPhotos.length > 0 || isOwnProfile) && (
              <section className="bg-cream-raised border border-hairline rounded-[6px] p-7">
                <div className="mb-5">
                  <p className="eyebrow text-text-soft mb-2">
                    <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                    Provider photos
                  </p>
                  <h2 className="font-display text-2xl text-text">Premises and work</h2>
                  <p className="font-sans text-[13px] text-text-soft mt-1">
                    Photos shared by the provider as proof of premises and past engagements.
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
                  <PhotoGallery photos={providerPhotos} businessName={provider.business_name} />
                )}
              </section>
            )}

            {/* Reviews */}
            <section className="bg-cream-raised border border-hairline rounded-[6px] p-7">
              <h2 className="font-display text-2xl text-text mb-6">
                Client references
                <span className="font-sans text-base text-text-soft font-normal ml-3">
                  ({reviews.length})
                </span>
              </h2>

              {reviews.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-hairline rounded-[6px]">
                  <p className="font-sans text-[13px] text-text-soft">
                    No verified references on file yet.
                  </p>
                  <Link
                    to="/request"
                    className="mt-4 inline-flex items-center gap-1 font-sans text-[13px] font-semibold text-forest hover:text-gold-deep transition-colors"
                  >
                    Post a brief to work with this provider →
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {reviews.map((r) => (
                    <ReviewBlock key={r.id} review={r} />
                  ))}
                </div>
              )}
            </section>
          </main>

          {/* Right: Verification + CTA sidebar */}
          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24 lg:self-start">
            {/* Verification Record */}
            <div className="bg-forest-ink rounded-[6px] overflow-hidden">
              <div className="px-6 py-5 border-b border-cream/10">
                <p className="eyebrow text-cream/40">
                  <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                  Verification record
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-cream/40 mt-1">
                  {regId}
                </p>
                <div className="mt-3">
                  <HallmarkComp tier={provider.tier} className="!border-cream/30 !text-cream/70" />
                </div>
              </div>

              <div className="px-6 py-5 divide-y divide-cream/10">
                {VERIFICATION_CHECKS.map((check) => {
                  const passed = provider.tier >= check.minTier;
                  return (
                    <div
                      key={check.key}
                      className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <span className="font-sans text-[12px] text-cream/60">{check.key}</span>
                      <span
                        className={`font-mono text-[11px] shrink-0 ${passed ? "text-emerald-400" : "text-cream/20"}`}
                      >
                        {passed ? "✓ confirmed" : "pending"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="px-6 py-4 border-t border-cream/10">
                <p className="font-sans text-[11px] text-cream/30 leading-relaxed">
                  You pay the provider directly. NexusZim never holds your money.
                </p>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="bg-cream-raised border border-hairline rounded-[6px] p-6 space-y-3">
              {provider.whatsapp && (
                <a
                  href={`https://wa.me/${provider.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-gold py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Contact on WhatsApp
                </a>
              )}
              {provider.phone && (
                <a
                  href={`tel:${provider.phone}`}
                  className="flex items-center justify-center gap-2 w-full border border-forest py-3 rounded-[3px] font-sans text-sm font-semibold text-forest hover:bg-forest hover:text-cream transition-colors"
                >
                  <Phone className="h-4 w-4" strokeWidth={1.5} />
                  {provider.phone}
                </a>
              )}
              <Link
                to="/request"
                className="block w-full text-center border border-hairline py-3 rounded-[3px] font-sans text-sm text-text-soft hover:border-forest hover:text-forest transition-colors"
              >
                Post a brief instead
              </Link>
              <p className="font-sans text-[11px] text-text-soft leading-relaxed text-center">
                Pricing is agreed directly with the provider.
              </p>
            </div>

            {/* Ledger */}
            <div className="bg-cream-raised border border-hairline rounded-[6px] p-5">
              <p className="eyebrow text-text-soft mb-3">
                <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
                On file
              </p>
              <LedgerRow label="Registry ID" value={regId} verified={false} />
              {provider.city && (
                <LedgerRow label="City" value={provider.city} verified={false} />
              )}
              {category && (
                <LedgerRow label="Category" value={category.name} verified={false} />
              )}
              {provider.verified && (
                <LedgerRow
                  label="Status"
                  value="Verified"
                  verified={true}
                />
              )}
              {provider.website && (
                <LedgerRow label="Website" value={provider.website.replace(/^https?:\/\//, "").replace(/\/$/, "")} verified={false} />
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* ─── SIMILAR PROVIDERS ─── */}
      {similarProviders.length > 0 && (
        <div className="bg-cream-raised border-t border-hairline py-16">
          <div className="container-page">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl text-text">
                Other {category?.name ?? "providers"} on register
              </h2>
              <Link
                to="/search"
                className="font-sans text-sm font-semibold text-forest hover:text-gold-deep transition-colors flex items-center gap-1 group"
              >
                Full directory
                <span className="transition-transform group-hover:translate-x-[3px] duration-150">
                  →
                </span>
              </Link>
            </div>
            <div className="space-y-3">
              {similarProviders.map((p) => (
                <SimilarProviderRow key={p.user_id} provider={p} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MOBILE STICKY BAR ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-cream-raised border-t border-hairline px-4 py-3 flex gap-3">
        {provider.whatsapp && (
          <a
            href={`https://wa.me/${provider.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-gold py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </a>
        )}
        <Link
          to="/request"
          className="flex-1 border border-forest py-3 rounded-[3px] font-sans text-sm font-semibold text-forest text-center"
        >
          Post a brief
        </Link>
      </div>
    </div>
  );
}

function ReviewBlock({ review }: { review: ReviewRow }) {
  return (
    <blockquote className="border-l-[3px] border-gold pl-5 py-1">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-[2px]">
          {[1, 2, 3, 4, 5].map((i) => (
            <svg key={i} width="12" height="12" viewBox="0 0 24 24">
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                fill={i <= review.rating ? "#e7a020" : "none"}
                stroke={i <= review.rating ? "#e7a020" : "#dedacb"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ))}
        </div>
      </div>
      <p className="font-display text-lg text-text italic leading-relaxed">
        "{review.comment ?? "No comment left."}"
      </p>
      <footer className="mt-3 flex items-center gap-3">
        <div className="h-7 w-7 rounded-full bg-forest flex items-center justify-center text-cream font-sans text-xs font-bold shrink-0">
          {review.client_id.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <span className="font-sans text-[13px] font-medium text-text">Verified client</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-soft ml-2">
            {new Date(review.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-forest/60 ml-auto">
          Reference confirmed
        </span>
      </footer>
    </blockquote>
  );
}

function SimilarProviderRow({ provider }: { provider: ProviderListing }) {
  const initials = providerInitials(provider.business_name);
  const avatarColor = providerAvatarColor(provider.user_id);

  return (
    <div className="group bg-cream-raised border border-hairline rounded-[6px] hover:border-forest transition-all duration-150 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-150" />
      <div className="flex gap-0 min-h-[80px]">
        <div
          className={`flex-shrink-0 w-[64px] flex items-center justify-center font-sans text-base font-bold border-r border-hairline ${avatarColor}`}
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
        <div className="flex-1 px-4 py-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link
              to="/providers/$providerId"
              params={{ providerId: provider.user_id }}
              className="font-display text-base text-text group-hover:text-forest transition-colors"
            >
              {provider.business_name}
            </Link>
            <HallmarkComp tier={provider.tier} />
          </div>
          <p className="mt-1 font-mono text-[11px] text-text-soft">{provider.city}</p>
        </div>
      </div>
    </div>
  );
}
