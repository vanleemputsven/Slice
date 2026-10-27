import type { ResolvedBrandMark } from "@/lib/subscriptions/brand-mark";

export function BrandGlyph({
  mark,
  className,
}: {
  mark: ResolvedBrandMark;
  className?: string;
}) {
  return (
    <svg viewBox={mark.viewBox} className={className} aria-hidden>
      {mark.paths.map((d, index) =>
        mark.stroke ? (
          <path
            key={index}
            d={d}
            fill="none"
            stroke={mark.fills?.[index] ?? mark.glyph}
            strokeWidth={mark.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path key={index} d={d} fill={mark.fills?.[index] ?? mark.glyph} />
        ),
      )}
    </svg>
  );
}
