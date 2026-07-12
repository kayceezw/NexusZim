import { cn } from "@/lib/utils";

type AspectRatio = "square" | "4/3" | "16/10" | "21/6" | "3/2";

const ASPECT_CLASS: Record<AspectRatio, string> = {
  square: "aspect-square",
  "4/3": "aspect-[4/3]",
  "16/10": "aspect-[16/10]",
  "21/6": "aspect-[21/6]",
  "3/2": "aspect-[3/2]",
};

interface ImageSlotProps {
  src?: string;
  alt?: string;
  aspectRatio?: AspectRatio;
  caption?: string;
  className?: string;
  date?: string;
}

export function ImageSlot({
  src,
  alt = "",
  aspectRatio = "4/3",
  caption,
  className,
  date,
}: ImageSlotProps) {
  return (
    <figure className={cn("relative overflow-hidden", className)}>
      <div
        className={cn(
          "w-full overflow-hidden bg-[#1A4630] rounded-[6px]",
          ASPECT_CLASS[aspectRatio],
        )}
      >
        {src ? (
          <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span
              aria-hidden
              className="inline-block h-8 w-8 rotate-45 rounded-sm border-2 border-[#FDFCF9]/20"
            />
          </div>
        )}
      </div>

      {caption && (
        <figcaption className="mt-3 flex items-start gap-3">
          <span aria-hidden className="mt-1 h-px w-6 shrink-0 bg-[#E7A020]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#5C6B60] leading-relaxed">
            {caption}
            {date && <span className="ml-2 text-[#5C6B60]/60">{date}</span>}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
