type Size = "sm" | "md" | "lg";

const sizeCls: Record<Size, string> = {
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-14 text-base",
};

export function ProviderAvatar({
  provider,
  size = "md",
}: {
  provider: string;
  size?: Size;
}) {
  const letters = provider
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`grid place-content-center rounded-2xl bg-white/[0.06] font-mono font-semibold uppercase tracking-tight text-accent-bright ring-1 ring-white/10 ${sizeCls[size]}`}
      aria-hidden
    >
      {letters || "?"}
    </div>
  );
}
