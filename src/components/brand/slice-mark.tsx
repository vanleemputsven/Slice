export function SliceMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="relative grid size-9 shrink-0 place-content-center overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/10"
        aria-hidden
      >
        <span
          className="absolute inset-0 bg-gradient-to-br from-accent-bright via-accent to-accent-deep opacity-95"
          style={{
            clipPath: "polygon(0 0, 100% 0, 55% 100%, 0 100%)",
          }}
        />
        <span className="relative font-display text-sm font-extrabold text-white drop-shadow-sm">
          S
        </span>
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight text-fg">
        Slice
      </span>
    </span>
  );
}
