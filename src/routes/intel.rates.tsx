import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

export const Route = createFileRoute("/intel/rates")({
  component: MarketRates,
});

type RateRow = {
  id: string; category: string; rate_low: number | null; rate_high: number | null;
  unit: string | null; notes: string | null; updated_at: string;
};

const SEED_RATES: RateRow[] = [
  { id: "s1", category: "DJ Services (Standard)", rate_low: 150, rate_high: 350, unit: "per event", notes: "+10% vs last quarter", updated_at: "2026-06-01T00:00:00Z" },
  { id: "s2", category: "Photography (8 hrs)", rate_low: 400, rate_high: 900, unit: "per day", notes: "Stable", updated_at: "2026-06-01T00:00:00Z" },
  { id: "s3", category: "Event Security", rate_low: 15, rate_high: 45, unit: "per guard/hr", notes: "+5%", updated_at: "2026-06-01T00:00:00Z" },
  { id: "s4", category: "Catering (Full Buffet)", rate_low: 18, rate_high: 35, unit: "per head", notes: "-2%", updated_at: "2026-06-01T00:00:00Z" },
  { id: "s5", category: "Sound & Lighting (Small)", rate_low: 250, rate_high: 600, unit: "per event", notes: "Stable", updated_at: "2026-06-01T00:00:00Z" },
  { id: "s6", category: "MC / Event Host", rate_low: 200, rate_high: 500, unit: "per event", notes: "+8%", updated_at: "2026-06-01T00:00:00Z" },
  { id: "s7", category: "Bridal Makeup Artist", rate_low: 80, rate_high: 250, unit: "per session", notes: "+15%", updated_at: "2026-06-01T00:00:00Z" },
];

function shortLabel(cat: string): string {
  const map: Record<string, string> = {
    "DJ Services (Standard)": "DJ",
    "Photography (8 hrs)": "Photo",
    "Event Security": "Security",
    "Catering (Full Buffet)": "Catering",
    "Sound & Lighting (Small)": "AV",
    "MC / Event Host": "MC",
    "Bridal Makeup Artist": "Makeup",
  };
  return map[cat] ?? cat.split(" ")[0];
}

function parseTrend(notes: string | null): "up" | "down" | "stable" {
  if (!notes) return "stable";
  const n = notes.toLowerCase();
  if (n.startsWith("+") || n.includes("up")) return "up";
  if (n.startsWith("-") || n.includes("down")) return "down";
  return "stable";
}

const GOLD = "#C9A84C";
const GOLD_MUTED = "rgba(201,168,76,0.25)";

function CustomTooltip({ active, payload, label, rates }: {
  active?: boolean; payload?: Array<{ value: number }>; label?: string;
  rates: RateRow[];
}) {
  if (!active || !payload?.length) return null;
  const rate = rates.find((r) => shortLabel(r.category) === label);
  if (!rate) return null;
  return (
    <div className="bg-card border border-gold/30 p-4 font-mono text-[10px] uppercase tracking-wider shadow-xl">
      <p className="font-bold text-gold mb-2">{rate.category}</p>
      <p className="text-foreground/60">{rate.unit ?? "—"}</p>
      <p className="mt-2 text-foreground font-bold">${rate.rate_low ?? "?"} — ${rate.rate_high ?? "?"}</p>
    </div>
  );
}

function MarketRates() {
  const { data: dbRates } = useQuery({
    queryKey: ["intel", "rates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("market_rate_index").select("*").order("category");
      if (error) throw error;
      return data ?? [];
    },
  });

  const rates: RateRow[] = (dbRates && dbRates.length > 0) ? dbRates as RateRow[] : SEED_RATES;
  const isSeeded = !dbRates || dbRates.length === 0;

  const lastUpdated = rates.reduce((latest, r) => {
    return r.updated_at > latest ? r.updated_at : latest;
  }, rates[0]?.updated_at ?? "");

  const chartData = rates.map((r) => ({
    name: shortLabel(r.category),
    low: r.rate_low ?? 0,
    spread: (r.rate_high ?? 0) - (r.rate_low ?? 0),
  }));

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-gold/10 pb-8">
        <div>
          <h2 className="font-display text-3xl font-bold text-foreground">Market Rate Index</h2>
          <p className="mt-2 font-body text-sm text-foreground/70 max-w-xl">
            Average rates for key event service categories in Zimbabwe.
            {isSeeded && (
              <span className="ml-1 font-mono text-[9px] text-gold uppercase tracking-widest">(Seed data — add live rates via Admin → Intel)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gold/5 border border-gold/20 px-4 py-2">
          <Info className="h-4 w-4 text-gold" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-gold">
            Updated {new Date(lastUpdated).toLocaleDateString("en-ZW", { month: "long", year: "numeric" })}
          </span>
        </div>
      </div>

      <div className="border border-gold/10 bg-card p-8">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-8">Rate Range Visualization (USD)</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barGap={2} barCategoryGap="30%">
            <XAxis
              dataKey="name"
              tick={{ fontFamily: "JetBrains Mono", fontSize: 10, fill: "rgba(232,228,220,0.4)", fontWeight: 700 }}
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
            <Tooltip content={<CustomTooltip rates={rates} />} cursor={{ fill: "rgba(201,168,76,0.04)" }} />
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
        {rates.map((rate) => {
          const trend = parseTrend(rate.notes);
          return (
            <div
              key={rate.id}
              className="group flex flex-col md:flex-row md:items-center justify-between border border-gold/10 bg-card p-6 transition-all hover:border-gold/30"
            >
              <div className="flex-1">
                <p className="font-display text-xl font-bold text-foreground group-hover:text-gold transition-colors">
                  {rate.category}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-foreground/40">{rate.unit ?? "—"}</p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-8 md:mt-0">
                <div className="text-center md:text-right">
                  <p className="font-mono text-[9px] uppercase tracking-tighter text-foreground/40">Market Range</p>
                  <p className="mt-1 font-display text-2xl font-bold text-foreground">
                    ${rate.rate_low ?? "?"} — ${rate.rate_high ?? "?"}
                  </p>
                </div>

                <div className="flex items-center gap-3 border-l border-foreground/10 pl-8">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-tighter text-foreground/40">Trend</p>
                    <div className="mt-1 flex items-center gap-2">
                      {trend === "up" && <TrendingUp className="h-4 w-4 text-rose-500" />}
                      {trend === "down" && <TrendingDown className="h-4 w-4 text-emerald-500" />}
                      {trend === "stable" && <Minus className="h-4 w-4 text-foreground/30" />}
                      <span className={`font-mono text-xs font-bold ${
                        trend === "up" ? "text-rose-500" : trend === "down" ? "text-emerald-500" : "text-foreground/40"
                      }`}>
                        {rate.notes ?? "Stable"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border border-gold/20 bg-gold/5 p-8">
        <h4 className="font-display text-lg font-bold text-gold uppercase tracking-widest">Operator's Note</h4>
        <p className="mt-4 font-body text-sm text-foreground/70 leading-relaxed">
          These rates are based on verified contracts brokered via NexusZim and public market surveys.
          Elite tier providers may charge premium rates above the high-end index due to audited portfolios
          and NexusZim endorsement.
        </p>
      </div>
    </div>
  );
}
