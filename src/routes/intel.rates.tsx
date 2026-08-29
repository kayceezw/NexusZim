import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Info, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { fetchMarketRates, type MarketRate } from "@/lib/queries";

export const Route = createFileRoute("/intel/rates")({
  component: MarketRates,
});

const GOLD = "#C9A84C";
const GOLD_MUTED = "rgba(201,168,76,0.25)";

/** Compact axis label from a category name (first meaningful word). */
function shortLabel(name: string): string {
  const w = name.split(/[\s&,]+/).filter(Boolean);
  return (w[0] ?? name).slice(0, 10);
}

function CustomTooltip({
  active,
  payload,
  label,
  rates,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  rates: MarketRate[];
}) {
  if (!active || !payload?.length) return null;
  const rate = rates.find((r) => shortLabel(r.category) === label);
  if (!rate) return null;
  return (
    <div className="bg-card border border-gold/30 p-4 font-mono text-[10px] uppercase tracking-wider shadow-xl">
      <p className="font-bold text-gold mb-2">{rate.category}</p>
      <p className="text-foreground/60">
        {rate.serviceCount} service{rate.serviceCount === 1 ? "" : "s"} · {rate.providerCount}{" "}
        provider{rate.providerCount === 1 ? "" : "s"}
      </p>
      <p className="mt-2 text-foreground font-bold">
        ${rate.rateLow.toLocaleString()} - ${rate.rateHigh.toLocaleString()}
      </p>
    </div>
  );
}

function MarketRates() {
  const {
    data: rates = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["intel", "market-rates"],
    queryFn: fetchMarketRates,
  });

  const chartData = rates.slice(0, 12).map((r) => ({
    name: shortLabel(r.category),
    low: r.rateLow,
    spread: r.rateHigh - r.rateLow,
  }));

  const totalProviders = rates.reduce((n, r) => n + r.providerCount, 0);

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-gold/10 pb-8">
        <div>
          <h2 className="font-display text-3xl font-bold text-foreground">Market Rate Index</h2>
          <p className="mt-2 font-body text-sm text-foreground/70 max-w-xl">
            Live price ranges computed from the actual priced services and verified providers in the
            NexusZim registry, updated automatically as the market grows.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gold/5 border border-gold/20 px-4 py-2">
          <BarChart3 className="h-4 w-4 text-gold" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-gold">
            {rates.length} categor{rates.length === 1 ? "y" : "ies"} · {totalProviders} provider
            {totalProviders === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Loading / empty / error states - no fabricated numbers */}
      {isLoading ? (
        <div className="border border-gold/10 bg-card p-12 text-center font-mono text-[11px] uppercase tracking-widest text-foreground/40">
          Loading live market data…
        </div>
      ) : isError ? (
        <div className="border border-rose-500/30 bg-rose-500/10 p-8 text-center font-mono text-[11px] uppercase tracking-widest text-rose-600 dark:text-rose-400">
          Could not load market data. Please try again.
        </div>
      ) : rates.length === 0 ? (
        <div className="border border-gold/20 bg-gold/5 p-10 text-center">
          <Info className="h-5 w-5 text-gold mx-auto mb-3" />
          <p className="font-display text-lg text-foreground">Market data is being built.</p>
          <p className="mt-2 font-body text-sm text-foreground/60 max-w-md mx-auto">
            Rate intelligence appears here as priced services and verified providers are added to
            the registry. No estimated or placeholder figures are shown.
          </p>
        </div>
      ) : (
        <>
          <div className="border border-gold/10 bg-card p-8">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-8">
              Rate Range Visualization (USD)
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barGap={2} barCategoryGap="30%">
                <XAxis
                  dataKey="name"
                  tick={{
                    fontFamily: "JetBrains Mono",
                    fontSize: 10,
                    fill: "rgba(232,228,220,0.4)",
                    fontWeight: 700,
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontFamily: "JetBrains Mono", fontSize: 10, fill: "rgba(232,228,220,0.3)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v}`}
                  width={48}
                />
                <Tooltip
                  content={<CustomTooltip rates={rates} />}
                  cursor={{ fill: "rgba(201,168,76,0.04)" }}
                />
                <Bar dataKey="low" stackId="a" fill={GOLD_MUTED} radius={0} />
                <Bar dataKey="spread" stackId="a" fill={GOLD} radius={0}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={GOLD} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-4 font-mono text-[9px] text-foreground/30 uppercase tracking-widest text-center">
              Dark bar = high end · Muted bar = base rate · Hover for details
            </p>
          </div>

          <div className="grid gap-4">
            {rates.map((rate) => (
              <div
                key={rate.categoryId}
                className="group flex flex-col md:flex-row md:items-center justify-between border border-gold/10 bg-card p-6 transition-all hover:border-gold/30"
              >
                <div className="flex-1">
                  <p className="font-display text-xl font-bold text-foreground group-hover:text-gold transition-colors">
                    {rate.category}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                    {rate.serviceCount} priced service{rate.serviceCount === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-8 md:mt-0">
                  <div className="text-center md:text-right">
                    <p className="font-mono text-[9px] uppercase tracking-tighter text-foreground/40">
                      Market Range
                    </p>
                    <p className="mt-1 font-display text-2xl font-bold text-foreground">
                      ${rate.rateLow.toLocaleString()} - ${rate.rateHigh.toLocaleString()}
                    </p>
                    <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-foreground/40">
                      avg ${rate.rateAvg.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 border-l border-foreground/10 pl-8">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-tighter text-foreground/40">
                        Providers
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Users className="h-4 w-4 text-gold" />
                        <span className="font-mono text-sm font-bold text-foreground">
                          {rate.providerCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border border-gold/20 bg-gold/5 p-8">
            <h4 className="font-display text-lg font-bold text-gold uppercase tracking-widest">
              Methodology
            </h4>
            <p className="mt-4 font-body text-sm text-foreground/70 leading-relaxed">
              Ranges are computed directly from the listed base prices of services in each category
              and the count of verified providers operating in it. Figures update automatically as
              providers and priced services are added. There are no manual estimates or placeholder
              values. Categories without priced services are omitted until data exists.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
