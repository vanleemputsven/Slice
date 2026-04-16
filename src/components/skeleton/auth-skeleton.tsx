import { SliceSkeletonBar, SliceSkeletonRoot } from "./slice-skeleton";

/** Client hydration placeholder — matches login/welcome `!mounted` shell. */
export function AuthBootSkeleton() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-canvas px-4">
      <SliceSkeletonRoot className="flex w-full max-w-md flex-col items-center gap-4">
        <SliceSkeletonBar className="h-10 w-44 rounded-[var(--slice-radius-md)]" />
        <SliceSkeletonBar className="h-3.5 max-w-[12rem] rounded-full bg-white/[0.06]" />
        <div
          className="h-44 w-full rounded-[var(--slice-radius-xl)] bg-white/[0.04] ring-1 ring-white/[0.07]"
          aria-hidden
        />
      </SliceSkeletonRoot>
    </div>
  );
}

const authDots = (
  <div className="mb-10 flex items-center justify-center gap-2 sm:mb-12" aria-hidden>
    {Array.from({ length: 3 }).map((_, i) => (
      <span
        key={i}
        className={`block h-1.5 rounded-full bg-white/[0.12] ${
          i === 0 ? "w-9" : "w-1.5"
        }`}
      />
    ))}
  </div>
);

/** Full-page shell for `/login` while `LoginForm` suspends. */
export function LoginPageSkeleton() {
  return (
    <SliceSkeletonRoot className="relative min-h-screen overflow-x-hidden bg-canvas px-4 pb-12 pt-14 text-fg sm:pb-16 sm:pt-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle at center, rgb(255 255 255 / 0.055) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 78% 65% at 50% 18%, black, transparent)",
        }}
      />
      <SliceSkeletonBar className="absolute right-5 top-5 z-20 h-9 w-[5.5rem] rounded-full bg-white/[0.07]" />
      <div className="relative mx-auto flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col items-center gap-3">
          <SliceSkeletonBar className="h-10 w-44 rounded-[var(--slice-radius-md)]" />
          <SliceSkeletonBar className="h-3.5 w-36 rounded-full bg-white/[0.06]" />
        </div>
        <div className="slice-card relative overflow-hidden p-6 sm:p-8">
          <div className="relative space-y-6">
            <SliceSkeletonBar className="h-11 w-full rounded-full bg-white/[0.07]" />
            <div className="space-y-2">
              <SliceSkeletonBar className="h-3 w-24 rounded-full bg-white/[0.06]" />
              <SliceSkeletonBar className="h-12 w-full rounded-[var(--slice-radius-md)] bg-white/[0.06]" />
            </div>
            <div className="space-y-2">
              <SliceSkeletonBar className="h-3 w-20 rounded-full bg-white/[0.06]" />
              <SliceSkeletonBar className="h-12 w-full rounded-[var(--slice-radius-md)] bg-white/[0.06]" />
            </div>
            <SliceSkeletonBar className="h-12 w-full rounded-full bg-white/[0.09]" />
            <SliceSkeletonBar className="h-11 w-full rounded-full bg-white/[0.06]" />
          </div>
        </div>
      </div>
    </SliceSkeletonRoot>
  );
}

/** Full-page shell for `/welcome` while server content resolves. */
export function WelcomePageSkeleton() {
  return (
    <SliceSkeletonRoot className="relative min-h-screen overflow-x-hidden bg-canvas px-4 pb-20 pt-14 text-fg sm:pb-24 sm:pt-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle at center, rgb(255 255 255 / 0.055) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 78% 65% at 50% 14%, black, transparent)",
        }}
      />
      <SliceSkeletonBar className="absolute right-5 top-5 z-20 h-9 w-[5.5rem] rounded-full bg-white/[0.07]" />
      <div className="relative mx-auto w-full max-w-md">
        {authDots}
        <div className="flex flex-col items-center gap-3 text-center">
          <SliceSkeletonBar className="h-10 w-44 rounded-[var(--slice-radius-md)]" />
          <SliceSkeletonBar className="mx-auto h-4 max-w-sm rounded-full bg-white/[0.06]" />
          <SliceSkeletonBar className="mx-auto h-4 max-w-xs rounded-full bg-white/[0.05]" />
        </div>
        <div className="slice-card relative mt-10 overflow-hidden p-6 sm:p-8">
          <div className="space-y-4">
            <SliceSkeletonBar className="h-4 w-full max-w-[28rem] rounded-full bg-white/[0.06]" />
            <SliceSkeletonBar className="h-4 w-full max-w-md rounded-full bg-white/[0.05]" />
            <SliceSkeletonBar className="mt-6 h-12 w-full max-w-md rounded-[var(--slice-radius-md)] bg-white/[0.06]" />
            <div className="mt-10 flex justify-end border-t border-white/[0.07] pt-8">
              <SliceSkeletonBar className="h-11 w-40 rounded-full bg-white/[0.08]" />
            </div>
          </div>
        </div>
      </div>
    </SliceSkeletonRoot>
  );
}
