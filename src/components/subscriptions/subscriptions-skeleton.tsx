import { SliceSkeletonBar, SliceSkeletonRoot } from "@/components/skeleton/slice-skeleton";

export function SubscriptionsSkeleton() {
  return (
    <SliceSkeletonRoot className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-3">
          <SliceSkeletonBar className="h-9 w-[min(100%,18rem)] sm:h-10 sm:w-72" />
          <SliceSkeletonBar className="h-4 w-full max-w-2xl rounded-full bg-white/[0.06]" />
          <SliceSkeletonBar className="h-4 w-full max-w-xl rounded-full bg-white/[0.05]" />
        </div>
        <div className="flex flex-wrap gap-2">
          <SliceSkeletonBar className="h-10 w-[7.5rem] rounded-full bg-white/[0.07]" />
          <SliceSkeletonBar className="h-10 w-[8.5rem] rounded-full bg-white/[0.07]" />
          <SliceSkeletonBar className="h-10 w-[7rem] rounded-full bg-white/[0.06]" />
        </div>
      </header>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-8">
          <div className="min-w-0 flex-1 space-y-2">
            <SliceSkeletonBar className="h-3 w-24 rounded-full bg-white/[0.06]" />
            <div className="rounded-xl bg-white/[0.03] p-2 ring-1 ring-white/[0.06]">
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SliceSkeletonBar
                    key={i}
                    className="h-9 w-[4.5rem] rounded-full bg-white/[0.07]"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:gap-5 lg:shrink-0">
            <div className="min-w-0 space-y-2 sm:w-[min(100%,14rem)]">
              <SliceSkeletonBar className="h-3 w-20 rounded-full bg-white/[0.06]" />
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SliceSkeletonBar
                    key={i}
                    className="h-9 flex-1 rounded-full bg-white/[0.07]"
                  />
                ))}
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-2 sm:min-w-[min(100%,22rem)]">
              <SliceSkeletonBar className="h-3 w-16 rounded-full bg-white/[0.06]" />
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SliceSkeletonBar
                    key={i}
                    className="h-9 w-[5.25rem] rounded-full bg-white/[0.07]"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 border-t border-white/[0.05] pt-3">
          <SliceSkeletonBar className="h-3 w-48 rounded-full bg-white/[0.06]" />
        </div>
      </div>

      <div className="slice-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm" aria-hidden>
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {Array.from({ length: 8 }).map((_, i) => (
                  <th key={i} className="px-4 py-3.5">
                    <SliceSkeletonBar className="h-3 w-[min(100%,4.5rem)] rounded-full bg-white/[0.08]" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, row) => (
                <tr
                  key={row}
                  className="border-b border-border-subtle/70 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <SliceSkeletonBar className="size-9 shrink-0 rounded-full bg-white/[0.08]" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <SliceSkeletonBar className="h-3.5 w-[min(100%,12rem)] rounded-full bg-white/[0.08]" />
                        <SliceSkeletonBar className="h-3 w-24 rounded-full bg-white/[0.06]" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <SliceSkeletonBar className="h-3.5 w-20 rounded-full bg-white/[0.07]" />
                  </td>
                  <td className="px-4 py-3">
                    <SliceSkeletonBar className="h-3.5 w-16 rounded-full bg-white/[0.07]" />
                  </td>
                  <td className="px-4 py-3">
                    <SliceSkeletonBar className="h-3.5 w-14 rounded-full bg-white/[0.07]" />
                  </td>
                  <td className="px-4 py-3">
                    <SliceSkeletonBar className="h-3.5 w-14 rounded-full bg-white/[0.07]" />
                  </td>
                  <td className="px-4 py-3">
                    <SliceSkeletonBar className="h-3.5 w-20 rounded-full bg-white/[0.07]" />
                  </td>
                  <td className="px-4 py-3">
                    <SliceSkeletonBar className="h-6 w-14 rounded-full bg-white/[0.07]" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <SliceSkeletonBar className="size-9 rounded-lg bg-white/[0.06]" />
                      <SliceSkeletonBar className="size-9 rounded-lg bg-white/[0.06]" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SliceSkeletonRoot>
  );
}
