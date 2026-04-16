import type { ComponentProps, ReactNode } from "react";

const BAR = "rounded-[var(--slice-radius-md)] bg-white/[0.08]";

type SliceSkeletonRootProps = {
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<"div">, "children" | "className">;

export function SliceSkeletonRoot({
  children,
  className = "",
  ...rest
}: SliceSkeletonRootProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={["animate-pulse", className].filter(Boolean).join(" ")}
      {...rest}
    >
      <span className="sr-only">Loading…</span>
      {children}
    </div>
  );
}

export function SliceSkeletonBar({
  className = "",
  ...rest
}: ComponentProps<"div">) {
  return (
    <div
      className={[BAR, className].filter(Boolean).join(" ")}
      aria-hidden
      {...rest}
    />
  );
}
