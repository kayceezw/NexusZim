import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  findCategory,
  findProvider,
  reviewsForProvider,
  PROVIDERS,
  type Category,
  type Provider,
  type Review,
} from "@/lib/mock-data";
import { Hallmark } from "@/components/registry/hallmark";
import { LedgerRow } from "@/components/registry/ledger";
import { PhotoUpload } from "@/components/registry/photo-upload";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/providers/$providerId")({
  loader: ({
    params,
  }): { provider: Provider; category: Category | undefined; reviews: Review[] } => {
    const provider = findProvider(params.providerId);
    if (!provider) throw notFound();
    return {
      provider,
      category: findCategory(provider.category),
      reviews: reviewsForProvider(provider.id),
    };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.provider.business} — NexusZim` },
          { name: "description", content: loaderData.provider.bio },
        ]
      : [],
  }),
  component: ProviderProfilePage,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-2xl text-text">Provider not found</h1>
      <Link to="/search" className="mt-4 inline-block font-sans text-sm text-forest hover:underline">
        Back to directory
      </Link>
    </div>
  ),
});

function registryId(provider: Provider): string {
  const idx = PROVIDERS.findIndex((p) => p.id === provider.id);
  return `NX-2024-${String(idx + 147).padStart(5, "0")}`;
}

const VERIFICATION_CHECKS = [
  { key: "Identity documents", minTier: 2 },
  { key: "Business registration (CR14/CR6)", minTier: 2 },
  { key: "Positive rating history", minTier: 3 },
  { key: "Portfolio audit by NexusZim desk", minTier: 3 },
  { key: "On-site premises visit", minTier: 4 },
];

function ProviderProfilePage() {
  const { provider, category, reviews } = Route.useLoaderData() as {
    provider: Provider;
    category: Category | undefined;
    reviews: Review[];
  };

  const { user, roles } = useAuth();
  const isProvider = roles.includes("service_provider");
  const [providerPhotos, setProviderPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("provider_profiles")
      .select("photos")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.photos) setProviderPhotos(data.photos as string[]);
      });
  }, [user]);

  async function handlePhotosChange(urls: string[]) {
    if (!user) return;
    setProviderPhotos(urls);
    await supabase
      .from("provider_profiles")
      .update({ photos: urls })
      .eq("user_id", user.id);
  }

  const regId = registryId(provider);
  const similarProviders = PROVIDERS.filter(
    (p) => p.category === provider.category && p.id !== provider.id
  ).slice(0, 3);

  return (
    <div className="bg-cream pt-16">

      {/* ─── PAGE HEADER ─── */}
      <div className="border-b border-hairline bg-cream-raised">
        <div className="container-page py-6">
          {/* Breadcrumb */}
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-text-soft hover:text-forest transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Directory
          </Link>
          {category && (
            <span className="font-mono text-[11px] text-text-soft/50 mx-2">/</span>
          )}
          {category && (
            <Link
              to="/categories/$slug"
              params={{ slug: category.slug }}
              className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-soft hover:text-forest transition-colors"
            >
              {category.name}
            </Link>
          )}
        </div>

        <div className="container-page pb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Hallmark tier={provider.tier} />
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-soft">
                  {regId}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] ${
                    provider.availability === "available"
                      ? "text-emerald-600"
                      : provider.availability === "busy"
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      provider.availability === "available"
                        ? "bg-emerald-500"
                        : provider.availability === "busy"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                  />
                  {provider.availability === "available"
                    ? "Available"
                    : provider.availability === "busy"
                    ? "Busy"
                    : "Fully booked"}
                </span>
              </div>

              <h1
                className="font-display text-text"
                style={{ fontSize: "clamp(32px, 4.5vw, 56px)", lineHeight: "1.06", letterSpacing: "-0.02em" }}
              >
                {provider.business}
              </h1>

              <div className="flex flex-wrap items-center gap-4">
                <span className="font-sans text-[13px] text-text-soft">
                  Operated by <span className="text-text font-medium">{provider.name}</span>
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-soft">
                  <MapPin className="h-3 w-3" strokeWidth={1.5} />
                  {provider.city}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-text-soft">
                  <Clock className="h-3 w-3" strokeWidth={1.5} />
                  {provider.responseTime}
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                to="/book/$providerId"
                params={{ providerId: provider.id }}
                className="bg-gold px-6 py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors text-center"
              >
                Request an introduction
              </Link>
              <Link
                to="/request"
                search={{ category: provider.category, providerId: provider.id }}
                className="border border-forest px-6 py-3 rounded-[3px] font-sans text-sm font-semibold text-forest hover:bg-forest hover:text-cream transition-colors text-center"
              >
                Request a quote
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-12">

          {/* Left: 8 columns */}
          <main className="lg:col-span-8 space-y-8">

            {/* About */}
            <section className="bg-cream-raised border border-hairline rounded-[6px] p-7">
              <h2 className="font-display text-2xl text-text mb-4">About</h2>
              <p className="font-sans text-base text-text-soft leading-relaxed">{provider.bio}</p>

              <div className="mt-7 grid grid-cols-3 gap-3 pt-6 border-t border-hairline">
                <div className="text-center p-4 bg-cream rounded-[6px]">
                  <p className="font-display text-2xl text-forest">{provider.completedJobs}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">Engagements</p>
                </div>
                <div className="text-center p-4 bg-cream rounded-[6px]">
                  <p className="font-display text-2xl text-forest">{provider.rating}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">Avg rating</p>
                </div>
                <div className="text-center p-4 bg-cream rounded-[6px]">
                  <p className="font-display text-2xl text-forest">
                    {provider.responseTime.replace("Replies in ~", "").trim()}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-text-soft">Response</p>
                </div>
              </div>
            </section>

            {/* Services */}
            <section className="bg-cream-raised border border-hairline rounded-[6px] p-7">
              <h2 className="font-display text-2xl text-text mb-5">Services offered</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {provider.services.map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-3 border border-hairline rounded-[3px] px-4 py-3 hover:border-forest transition-colors"
                  >
                    <span className="font-mono text-[11px] text-forest/60">✓</span>
                    <span className="font-sans text-[13px] text-text">{s}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Provider photos */}
            {(providerPhotos.length > 0 || isProvider) && (
              <section className="bg-cream-raised border border-hairline rounded-[6px] p-7">
                <div className="mb-5">
                  <p className="eyebrow text-text-soft mb-2">
                    <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
                    Provider photos
                  </p>
                  <h2 className="font-display text-2xl text-text">
                    Premises and work
                  </h2>
                  <p className="font-sans text-[13px] text-text-soft mt-1">
                    Photos shared by the provider as proof of premises and past engagements.
                  </p>
                </div>

                {isProvider && user ? (
                  <PhotoUpload
                    userId={user.id}
                    photos={providerPhotos}
                    maxPhotos={5}
                    onChange={handlePhotosChange}
                    label="Your proof photos"
                  />
                ) : providerPhotos.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-3">
                    {providerPhotos.map((url, i) => (
                      <div
                        key={url}
                        className="aspect-[4/3] rounded-[6px] overflow-hidden bg-[#1A4630]"
                      >
                        <img
                          src={url}
                          alt={`${provider.business} photo ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
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
              {reviews.length === 0 && (
                <p className="font-sans text-[13px] text-text-soft">No verified references on file yet.</p>
              )}
              <div className="space-y-4">
                {reviews.map((r) => (
                  <blockquote
                    key={r.id}
                    className="border-l-[3px] border-gold pl-5 py-1"
                  >
                    <p className="font-display text-lg text-text italic leading-relaxed">
                      "{r.text}"
                    </p>
                    <footer className="mt-3 flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-forest flex items-center justify-center text-cream font-sans text-xs font-bold shrink-0">
                        {r.client.charAt(0)}
                      </div>
                      <div>
                        <span className="font-sans text-[13px] font-medium text-text">{r.client}</span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-soft ml-2">
                          {r.date}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-forest/60 ml-auto">
                        Reference confirmed by NexusZim
                      </span>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </section>
          </main>

          {/* Right: sticky Verification Record panel — 4 columns */}
          <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24 lg:self-start">

            {/* Verification Record — forest-ink panel */}
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
                  <Hallmark
                    tier={provider.tier}
                    className="!border-cream/30 !text-cream/70"
                  />
                </div>
              </div>

              <div className="px-6 py-5 divide-y divide-cream/10">
                {VERIFICATION_CHECKS.map((check) => {
                  const passed = provider.tier >= check.minTier;
                  return (
                    <div key={check.key} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <span className="font-sans text-[12px] text-cream/60">{check.key}</span>
                      <span className={`font-mono text-[11px] shrink-0 ${passed ? "text-emerald-400" : "text-cream/20"}`}>
                        {passed ? "✓ confirmed" : "pending"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {provider.verifiedAt && (
                <div className="px-6 py-4 border-t border-cream/10">
                  <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.08em]">
                    <span className="text-cream/30">Last audit</span>
                    <span className="text-cream/50">{provider.verifiedAt}</span>
                  </div>
                </div>
              )}

              <div className="px-6 py-4 border-t border-cream/10">
                <p className="font-sans text-[11px] text-cream/30 leading-relaxed">
                  You pay the provider directly. NexusZim never holds your money.
                </p>
              </div>
            </div>

            {/* Pricing + CTA */}
            <div className="bg-cream-raised border border-hairline rounded-[6px] p-6">
              <div className="mb-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-text-soft">Starting from</p>
                <p className="font-display text-4xl text-text mt-1">
                  ${provider.priceFrom}
                  <span className="font-sans text-base font-normal text-text-soft ml-1">/ project</span>
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  to="/book/$providerId"
                  params={{ providerId: provider.id }}
                  className="block w-full text-center bg-gold py-3 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
                >
                  Request an introduction
                </Link>
                <Link
                  to="/request"
                  search={{ category: provider.category, providerId: provider.id }}
                  className="block w-full text-center border border-forest py-3 rounded-[3px] font-sans text-sm font-semibold text-forest hover:bg-forest hover:text-cream transition-colors"
                >
                  Request a quote
                </Link>
              </div>

              <p className="mt-4 font-sans text-[11px] text-text-soft leading-relaxed text-center">
                Pricing is indicative. Final rates are agreed directly with the provider.
              </p>
            </div>

            {/* Ledger summary */}
            <div className="bg-cream-raised border border-hairline rounded-[6px] p-5">
              <p className="eyebrow text-text-soft mb-3">
                <span className="inline-block h-1.5 w-1.5 rotate-45 border border-current shrink-0" />
                On file
              </p>
              <LedgerRow label="Registry ID" value={regId} verified={false} />
              <LedgerRow label="City" value={provider.city} verified={false} />
              <LedgerRow label="Engagements" value={String(provider.completedJobs)} verified={false} />
              {provider.verifiedAt && (
                <LedgerRow label="Verified" value={provider.verifiedAt} verified={true} />
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
              <Link to="/search" className="font-sans text-sm font-semibold text-forest hover:text-gold-deep transition-colors flex items-center gap-1 group">
                Full directory
                <span className="transition-transform group-hover:translate-x-[3px] duration-150">→</span>
              </Link>
            </div>
            <div className="space-y-3">
              {similarProviders.map((p) => (
                <div key={p.id} className="group bg-cream-raised border border-hairline rounded-[6px] hover:border-forest transition-all duration-150 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-150" />
                  <div className="flex gap-0 min-h-[80px]">
                    <div className={`flex-shrink-0 w-[64px] flex items-center justify-center font-sans text-base font-bold border-r border-hairline ${p.avatarColor}`}>
                      {p.initials}
                    </div>
                    <div className="flex-1 px-4 py-3 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to="/providers/$providerId"
                          params={{ providerId: p.id }}
                          className="font-display text-base text-text group-hover:text-forest transition-colors"
                        >
                          {p.business}
                        </Link>
                        <Hallmark tier={p.tier} />
                      </div>
                      <p className="mt-1 font-mono text-[11px] text-text-soft">{p.city}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
