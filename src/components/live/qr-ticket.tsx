import { useMemo } from "react";
import { encodeQR } from "@/lib/qr";

/** Renders a scannable QR code as a crisp SVG. */
export function QRCode({ value, className = "" }: { value: string; className?: string }) {
  const matrix = useMemo(() => encodeQR(value), [value]);
  const size = matrix.length;
  const quiet = 2;
  const dim = size + quiet * 2;

  const path = useMemo(() => {
    let d = "";
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c]) d += `M${c + quiet},${r + quiet}h1v1h-1z`;
      }
    }
    return d;
  }, [matrix, size]);

  return (
    <svg
      viewBox={`0 0 ${dim} ${dim}`}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`QR code: ${value}`}
    >
      <rect width={dim} height={dim} fill="#ffffff" />
      <path d={path} fill="#081f14" />
    </svg>
  );
}
