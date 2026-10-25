import { brandMarkFor } from "@/lib/subscriptions/brand-mark";

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
  const mark = brandMarkFor({ iconKey, name: name ?? provider, provider });
  const letters = (name ?? provider)
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className={`grid shrink-0 place-content-center ${sizeCls[size]}`}
      aria-hidden
    >
      {mark ? (
        <svg viewBox="0 0 24 24" className="size-7">
          <path d={mark.path} fill={mark.glyph} />
        </svg>
      ) : (
        <span className="grid size-full place-content-center rounded-lg bg-white/[0.06] text-xs font-medium text-fg-secondary">
          {letters || "?"}
        </span>
      )}
    </span>
  );
}
