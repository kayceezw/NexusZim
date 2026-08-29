import { useQuery } from "@tanstack/react-query";
import { fetchMarketRates, type MarketRate } from "@/lib/queries";

function TickerSegment({ rate }: { rate: MarketRate }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap">
      <span className="text-cream/70">{rate.category}</span>
      <span className="ml-2 text-gold-hi font-semibold">
        ${rate.rateLow}–${rate.rateHigh}
      </span>
      <span className="ml-2 text-cream/50">
        avg <span className="text-gold">${rate.rateAvg}</span>
      </span>
      <span className="ml-2 text-cream/40">
        · {rate.providerCount} {rate.providerCount === 1 ? "provider" : "providers"}
      </span>
    </span>
  );
}

/** Gold diamond separator between ticker segments. */
function Diamond() {
  return (
    <span
      aria-hidden
      className="mx-5 inline-block h-1.5 w-1.5 rotate-45 bg-gold shrink-0 align-middle"
    />
  );
}

function TickerRun({ rates }: { rates: MarketRate[] }) {
  return (
    <div
      // aria-hidden on the duplicated content is set by the caller; this run is
      // rendered twice for a seamless -50% loop.
      className="flex items-center shrink-0"
    >
      {rates.map((r, i) => (
        <span key={`${r.categoryId}-${i}`} className="flex items-center">
          <TickerSegment rate={r} />
          <Diamond />
        </span>
      ))}
    </div>
  );
}

/**
 * Breaking-news style market wire that scrolls the live rate index continuously
 * right→left, pausing on hover. Renders the segment list twice and translates
 * -50% for a seamless loop. Falls back to a static line under reduced-motion.
 */
export function IntelTicker() {
  const { data: rates, isLoading } = useQuery({
    queryKey: ["intel", "ticker"],
    queryFn: fetchMarketRates,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="bg-forest-ink border-y border-cream/10">
        <div className="container-page flex items-center gap-3 py-2.5">
          <WireTag />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream/40">
            Market wire initializing…
          </span>
        </div>
      </div>
    );
  }

  if (!rates || rates.length === 0) return null;

  return (
    <div
      className="relative bg-forest-ink border-y border-cream/10 overflow-hidden"
      role="marquee"
      aria-label="Live market rate wire"
    >
      <div className="flex items-stretch">
        {/* LIVE / MARKET WIRE tag pinned left */}
        <div className="relative z-10 flex items-center shrink-0 bg-forest-ink pl-6 pr-4 py-2.5 border-r border-cream/10">
          <WireTag />
        </div>

        {/* Fade edge to soften where segments emerge behind the tag */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12"
          style={{
            background: "linear-gradient(90deg, transparent, var(--color-forest-ink))",
          }}
        />

        {/* Scrolling track - group enables pause-on-hover */}
        <div className="group flex-1 overflow-hidden py-2.5">
          <div className="flex w-max animate-ticker font-mono text-[11px] uppercase tracking-[0.08em] group-hover:[animation-play-state:paused]">
            <TickerRun rates={rates} />
            <div aria-hidden>
              <TickerRun rates={rates} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WireTag() {
  return (
    <span className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-gold/60 animate-ping-slow" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
      </span>
      Market Wire
    </span>
  );
}
