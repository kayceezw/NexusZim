import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
      <p className="eyebrow text-text-soft mb-8">
        <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
        404 Error
      </p>
      <h1
        className="font-display text-text"
        style={{ fontSize: "clamp(72px, 12vw, 120px)", lineHeight: "1.02", letterSpacing: "-0.03em" }}
      >
        Not found.
      </h1>
      <p className="mt-8 font-sans text-base text-text-soft max-w-sm leading-relaxed">
        This route is not on the register. You may have followed an expired link or mistyped the URL.
      </p>
      <div className="mt-12 flex flex-col sm:flex-row justify-center gap-3">
        <Link
          to="/"
          className="bg-gold px-8 py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
        >
          Return Home
        </Link>
        <Link
          to="/search"
          className="border border-forest px-8 py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest hover:bg-forest hover:text-cream transition-colors"
        >
          Browse Directory
        </Link>
      </div>
      <p className="mt-16 font-mono text-[10px] uppercase tracking-[0.12em] text-text-soft/30">
        NexusZim Registry
      </p>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
      <p className="eyebrow text-text-soft mb-8">
        <span className="inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0" />
        System Error
      </p>
      <h1 className="font-display text-5xl text-text" style={{ letterSpacing: "-0.02em" }}>
        Something went wrong.
      </h1>
      <p className="mt-6 font-sans text-base text-text-soft max-w-sm leading-relaxed">
        An unexpected error occurred. Try refreshing, or go back to the main directory.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="bg-gold px-8 py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest-ink hover:bg-gold-deep transition-colors"
        >
          Try Again
        </button>
        <a
          href="/"
          className="border border-forest px-8 py-3.5 rounded-[3px] font-sans text-sm font-semibold text-forest hover:bg-forest hover:text-cream transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NexusZim — Zimbabwe's marketplace for trusted services" },
      {
        name: "description",
        content:
          "Find, request and book vetted service providers in Zimbabwe — events, visa & business docs, transport, personal services, and more.",
      },
      { name: "author", content: "NexusZim" },
      { property: "og:site_name", content: "NexusZim" },
      { property: "og:title", content: "NexusZim — Trusted services in Zimbabwe" },
      {
        property: "og:description",
        content:
          "Zimbabwe's service marketplace. Browse providers, post requests, get quotes, and book with confidence.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.nexuszim.co.zw" },
      { property: "og:image", content: "https://www.nexuszim.co.zw/icon.png" },
      { property: "og:locale", content: "en_ZW" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NexusZim — Trusted services in Zimbabwe" },
      {
        name: "twitter:description",
        content:
          "Zimbabwe's service marketplace. Browse providers, post requests, get quotes, and book with confidence.",
      },
      { name: "twitter:image", content: "https://www.nexuszim.co.zw/icon.png" },
    ],
    links: [
      { rel: "icon", href: "/icon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/icon.png" },
      { rel: "canonical", href: "https://www.nexuszim.co.zw" },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Archivo:wght@400;500;600;700&family=Spline+Sans+Mono:wght@400;500&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">
              <Outlet />
            </main>
            <SiteFooter />
          </div>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
