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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex items-center gap-4 mb-10">
        <span className="h-px w-16 bg-gold/20" />
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">404 Error</span>
        <span className="h-px w-16 bg-gold/20" />
      </div>
      <h1
        className="font-display font-extrabold text-foreground tracking-tight leading-none"
        style={{ fontSize: "clamp(72px, 12vw, 140px)" }}
      >
        Not Found.
      </h1>
      <p className="mt-8 text-base text-foreground/60 max-w-sm leading-relaxed">
        This route doesn't exist in our network. You may have followed an expired link or mistyped the URL.
      </p>
      <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
        <Link
          to="/"
          className="bg-gold px-10 py-4 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors rounded"
        >
          Return Home
        </Link>
        <Link
          to="/search"
          className="border-2 border-gold px-10 py-4 font-display text-sm font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-white transition-colors rounded"
        >
          Browse Directory
        </Link>
      </div>
      <p className="mt-16 text-xs text-foreground/30 tracking-widest uppercase">
        NexusZim · Zimbabwe's Trusted Services Network
      </p>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex items-center gap-4 mb-10">
        <span className="h-px w-16 bg-gold/20" />
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">System Error</span>
        <span className="h-px w-16 bg-gold/20" />
      </div>
      <h1 className="font-display text-5xl font-extrabold text-foreground tracking-tight">
        Something broke.
      </h1>
      <p className="mt-6 text-base text-foreground/60 max-w-sm leading-relaxed">
        An unexpected error occurred. You can try refreshing or head back to the main platform.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="bg-gold px-10 py-4 font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-foreground transition-colors rounded"
        >
          Try Again
        </button>
        <a
          href="/"
          className="border-2 border-gold px-10 py-4 font-display text-sm font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-white transition-colors rounded"
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
      { property: "og:title", content: "NexusZim — Trusted services in Zimbabwe" },
      {
        property: "og:description",
        content:
          "Zimbabwe's service marketplace. Browse providers, post requests, get quotes, and book with confidence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "icon", href: "/icon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/icon.png" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap",
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
