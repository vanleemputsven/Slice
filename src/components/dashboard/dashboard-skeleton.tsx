import { SliceSkeletonBar, SliceSkeletonRoot } from "@/components/skeleton/slice-skeleton";

export function DashboardSkeleton() {
  return (
    <SliceSkeletonRoot className="space-y-10">
      <section className="slice-card p-5 sm:p-6">
        <div className="space-y-4">
          <SliceSkeletonBar className="h-3 w-36 rounded-full bg-white/[0.06]" />
          <SliceSkeletonBar className="h-10 w-56 max-w-[85%] sm:h-11 sm:w-72" />
          <SliceSkeletonBar className="h-4 max-w-lg rounded-full bg-white/[0.06]" />
          <div className="mt-2 overflow-hidden rounded-lg bg-white/[0.04]">
            <SliceSkeletonBar className="h-12 w-full rounded-none sm:h-14" />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <SliceSkeletonBar className="h-9 w-28 rounded-full bg-white/[0.06]" />
            <SliceSkeletonBar className="h-9 w-32 rounded-full bg-white/[0.06]" />
            <SliceSkeletonBar className="h-9 w-24 rounded-full bg-white/[0.05]" />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-3">
          <SliceSkeletonBar className="h-9 w-52 max-w-[90%] sm:h-10 sm:w-64" />
          <SliceSkeletonBar className="h-4 w-full max-w-md rounded-full bg-white/[0.06]" />
        </div>
        <SliceSkeletonBar className="h-10 w-44 shrink-0 rounded-full bg-white/[0.07] sm:self-auto" />
      </div>

      <section className="slice-card p-5 sm:p-6">
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <SliceSkeletonBar className="h-3 w-28 rounded-full bg-white/[0.06]" />
              <SliceSkeletonBar className="h-9 w-[min(100%,12rem)]" />
              <SliceSkeletonBar className="h-3 w-full max-w-[10rem] rounded-full bg-white/[0.05]" />
            </div>
          ))}
        </div>
      </section>

      <section className="slice-card overflow-hidden">
        <div className="grid lg:grid-cols-12 lg:divide-x lg:divide-white/[0.07]">
          <div className="space-y-4 p-5 sm:p-6 lg:col-span-5">
            <SliceSkeletonBar className="h-5 w-40" />
            <SliceSkeletonBar className="h-4 max-w-sm rounded-full bg-white/[0.06]" />
            <SliceSkeletonBar className="h-24 w-full rounded-[var(--slice-radius-lg)] bg-white/[0.05]" />
          </div>
          <div className="space-y-3 p-5 sm:p-6 lg:col-span-7">
            <SliceSkeletonBar className="h-5 w-48" />
            {Array.from({ length: 3 }).map((_, i) => (
              <SliceSkeletonBar
                key={i}
                className="h-12 w-full rounded-[var(--slice-radius-md)] bg-white/[0.04]"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="slice-card p-5 sm:p-6">
        <SliceSkeletonBar className="h-5 w-44" />
        <SliceSkeletonBar className="mt-2 h-64 w-full rounded-[var(--slice-radius-lg)] bg-white/[0.04] sm:h-72" />
      </section>

      <section className="slice-card overflow-hidden">
        <div className="grid lg:grid-cols-5 lg:divide-x lg:divide-white/[0.07]">
          <div className="space-y-4 p-5 sm:p-6 lg:col-span-3">
            <SliceSkeletonBar className="h-6 w-52 max-w-full" />
            <SliceSkeletonBar className="h-4 max-w-md rounded-full bg-white/[0.06]" />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <SliceSkeletonBar className="h-3 w-24 rounded-full bg-white/[0.06]" />
                <SliceSkeletonBar className="h-11 w-full rounded-[var(--slice-radius-md)] bg-white/[0.06]" />
              </div>
              <div className="space-y-2">
                <SliceSkeletonBar className="h-3 w-28 rounded-full bg-white/[0.06]" />
                <SliceSkeletonBar className="h-11 w-full rounded-[var(--slice-radius-md)] bg-white/[0.06]" />
              </div>
            </div>
            <div className="space-y-3 border-t border-white/[0.07] pt-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 border-b border-white/[0.05] py-3 last:border-0"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <SliceSkeletonBar className="h-3.5 w-[min(100%,14rem)] rounded-full bg-white/[0.07]" />
                    <SliceSkeletonBar className="h-3 w-32 rounded-full bg-white/[0.05]" />
                  </div>
                  <SliceSkeletonBar className="h-4 w-16 shrink-0 rounded-md bg-white/[0.06]" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 p-5 sm:p-6 lg:col-span-2">
            <SliceSkeletonBar className="h-6 w-40" />
            <SliceSkeletonBar className="h-3 w-full max-w-[14rem] rounded-full bg-white/[0.06]" />
            <ul className="mt-2 divide-y divide-white/[0.07]" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                  <div className="min-w-0 flex-1 space-y-2">
                    <SliceSkeletonBar className="h-3.5 w-[min(100%,11rem)] rounded-full bg-white/[0.07]" />
                    <SliceSkeletonBar className="h-3 w-36 rounded-full bg-white/[0.05]" />
                  </div>
                  <SliceSkeletonBar className="h-4 w-14 shrink-0 rounded-md bg-white/[0.06]" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </SliceSkeletonRoot>
  );
}
