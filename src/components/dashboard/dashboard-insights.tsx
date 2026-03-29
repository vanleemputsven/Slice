"use client";

import type { CostInsight } from "@/lib/subscriptions/insights";
import { useSliceT } from "@/lib/i18n/use-slice-t";

function VariantLabel({ variant }: { variant: CostInsight["variant"] }) {
  const { t } = useSliceT();
  if (variant === "warning") {
    return (
      <span className="text-[11px] font-medium uppercase tracking-wide text-warning">
        {t("insights.badgeReview")}
      </span>
    );
  }
  if (variant === "accent") {
    return (
      <span className="text-[11px] font-medium uppercase tracking-wide text-accent-bright">
        {t("insights.badgeCompare")}
      </span>
    );
  }
  return (
    <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
      {t("insights.badgeInfo")}
    </span>
  );
}

export function DashboardInsights({
  items,
  embedded = false,
}: {
  items: CostInsight[];
  embedded?: boolean;
}) {
  const { t } = useSliceT();
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="insights-heading"
      className={embedded ? "min-w-0" : "slice-card p-5 sm:p-6"}
    >
      <h2
        id="insights-heading"
        className="text-base font-semibold text-fg sm:text-lg"
      >
        {t("insights.heading")}
      </h2>
      <p className="mt-1 text-xs text-muted">{t("insights.hint")}</p>

      <ol className="mt-5 list-none space-y-0 divide-y divide-white/[0.07] border-t border-white/[0.07]">
        {items.map((i, index) => (
          <li key={i.id} className="py-4 first:pt-4">
            <div className="flex gap-3 sm:gap-4">
              <span
                className="mt-0.5 w-6 shrink-0 text-right font-mono text-xs tabular-nums text-muted"
                aria-hidden
              >
                {index + 1}.
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <VariantLabel variant={i.variant} />
                  <span className="min-w-0 text-sm font-medium text-fg">
                    {i.title}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-fg-secondary">
                  {i.description}
                </p>
                {i.tip ? (
                  <p className="border-l-2 border-accent/35 pl-3 text-sm leading-relaxed text-muted">
                    {i.tip}
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
