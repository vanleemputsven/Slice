import { SliceSkeletonBar, SliceSkeletonRoot } from "@/components/skeleton/slice-skeleton";

export function SettingsSkeleton() {
  return (
    <SliceSkeletonRoot className="space-y-8">
      <header className="space-y-3">
        <SliceSkeletonBar className="h-9 w-48 max-w-[90%] sm:h-10 sm:w-56" />
        <SliceSkeletonBar className="h-4 w-full max-w-2xl rounded-full bg-white/[0.06]" />
        <SliceSkeletonBar className="h-4 w-full max-w-xl rounded-full bg-white/[0.05]" />
      </header>

      <section className="slice-card p-5 sm:p-6">
        <SliceSkeletonBar className="h-6 w-56 max-w-[80%]" />
        <SliceSkeletonBar className="mt-2 h-4 w-full max-w-2xl rounded-full bg-white/[0.06]" />
        <div className="mt-6 grid gap-6 sm:max-w-md">
          <div className="space-y-2">
            <SliceSkeletonBar className="h-3 w-28 rounded-full bg-white/[0.06]" />
            <SliceSkeletonBar className="h-11 w-full rounded-[var(--slice-radius-md)] bg-white/[0.06]" />
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            <SliceSkeletonBar className="h-3 w-32 rounded-full bg-white/[0.06]" />
            <SliceSkeletonBar className="mt-2 h-8 w-40" />
          </div>
        </div>
      </section>

      <section className="slice-card border-danger/35 p-5 sm:p-6">
        <SliceSkeletonBar className="h-6 w-44" />
        <SliceSkeletonBar className="mt-3 h-5 w-64 max-w-full" />
        <SliceSkeletonBar className="mt-2 h-4 w-full max-w-2xl rounded-full bg-white/[0.06]" />
        <SliceSkeletonBar className="mt-2 h-4 w-full max-w-xl rounded-full bg-white/[0.05]" />
        <SliceSkeletonBar className="mt-6 h-11 w-full max-w-xs rounded-full bg-white/[0.07]" />
      </section>
    </SliceSkeletonRoot>
  );
}
