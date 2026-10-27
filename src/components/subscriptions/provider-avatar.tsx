import { BrandGlyph } from "@/components/subscriptions/brand-glyph";
import { brandMarkFor } from "@/lib/subscriptions/brand-mark";
import { catalogTileFor } from "@/lib/subscriptions/catalog";
import { pictogramFor } from "@/lib/subscriptions/pictogram";

type Size = "sm" | "md";

const sizeCls: Record<Size, string> = {
  sm: "size-8",
  md: "size-10",
};

export function ProviderAvatar({
  provider,
  name,
  iconKey,
  size = "md",
}: {
  provider: string;
  name?: string;
  iconKey?: string | null;
  size?: Size;
}) {
  const lookedUp = { iconKey, name: name ?? provider, provider };
  const mark = brandMarkFor(lookedUp);
  const tile = mark ? null : catalogTileFor(lookedUp);
  const Pictogram = tile ? pictogramFor(lookedUp) : null;
  const letters = (name ?? provider)
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const iconCls = size === "sm" ? "size-4" : "size-5";

  return (
    <span
      className={`grid shrink-0 place-content-center ${sizeCls[size]}`}
      aria-hidden
    >
      {mark ? (
        <BrandGlyph mark={mark} className={size === "sm" ? "size-6" : "size-8"} />
      ) : tile && Pictogram ? (
        <span
          className="grid size-full place-content-center rounded-lg"
          style={{ background: tile.tile, color: tile.ink }}
        >
          <Pictogram className={iconCls} strokeWidth={2.25} />
        </span>
      ) : tile ? (
        <span
          className={`grid size-full place-content-center rounded-lg font-semibold leading-none ${
            tile.letters.length > 2 ? "text-[10px] tracking-tight" : "text-xs"
          }`}
          style={{ background: tile.tile, color: tile.ink }}
        >
          {tile.letters}
        </span>
      ) : (
        <span className="grid size-full place-content-center rounded-lg bg-white/[0.06] text-xs font-medium text-fg-secondary">
          {letters || "?"}
        </span>
      )}
    </span>
  );
}
