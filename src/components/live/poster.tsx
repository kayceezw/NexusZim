import {
  POSTER_PALETTES,
  type LiveEvent,
  categoryLabel,
  eventCity,
  formatEventDate,
} from "@/lib/live-data";

/**
 * Typographic poster artwork for an event — bold serif title on a deep
 * colour field, in place of stock photography. Scales from card thumbnails
 * to detail-page heroes via the `size` prop.
 */
export function EventPoster({
  event,
  size = "card",
  className = "",
}: {
  event: LiveEvent;
  size?: "card" | "hero" | "mini";
  className?: string;
}) {
  const pal = POSTER_PALETTES[event.palette];
  const titleClass =
    size === "hero"
      ? "text-[clamp(2.5rem,6vw,5rem)]"
      : size === "mini"
        ? "text-lg"
        : "text-[clamp(1.5rem,2.2vw,2rem)]";

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden select-none ${className}`}
      style={{ backgroundColor: pal.bg, color: pal.fg }}
      aria-hidden
    >
      {/* oversized ghost year for texture */}
      <span
        className="pointer-events-none absolute -right-3 -bottom-6 font-display leading-none opacity-[0.07]"
        style={{ fontSize: size === "hero" ? "16rem" : "8rem", color: pal.fg }}
      >
        {new Date(event.date).getFullYear().toString().slice(-2)}
      </span>
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-30"
        style={{ backgroundColor: pal.accent }}
      />

      <div className={size === "hero" ? "p-8 lg:p-12" : size === "mini" ? "p-3" : "p-5"}>
        <p
          className="font-mono uppercase tracking-[0.16em]"
          style={{ color: pal.accent, fontSize: size === "mini" ? "8px" : "10px" }}
        >
          {categoryLabel(event.category)}
          <span className="mx-2 opacity-40">·</span>
          {eventCity(event)}
        </p>
        <p className={`mt-2 font-display leading-[1.02] tracking-tight ${titleClass}`}>
          {event.title}
        </p>
      </div>

      <div
        className={`flex items-end justify-between gap-3 ${size === "hero" ? "p-8 lg:p-12" : size === "mini" ? "p-3" : "p-5"}`}
      >
        <p
          className="font-mono uppercase tracking-[0.14em] opacity-70"
          style={{ fontSize: size === "mini" ? "8px" : "10px" }}
        >
          {formatEventDate(event.date)}
        </p>
        <span
          className="inline-block h-1.5 w-1.5 rotate-45 shrink-0"
          style={{ backgroundColor: pal.accent }}
        />
      </div>
    </div>
  );
}
