"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, Plus, RotateCcw, Share2, Trash2 } from "lucide-react";
import { useSubscriptions } from "@/components/providers/subscriptions-provider";
import { ProviderAvatar } from "@/components/subscriptions/provider-avatar";
import { SubscriptionFormDialog } from "@/components/subscriptions/subscription-form-dialog";
import { SubscriptionsSkeleton } from "@/components/subscriptions/subscriptions-skeleton";
import type {
  SubscriptionFormInput,
  SubscriptionRecord,
} from "@/lib/validation/subscription";
import {
  daysUntil,
  getMonthlyMyShare,
  getMonthlyTotalPrice,
  getNextPaymentOnOrAfter,
} from "@/lib/subscriptions/calculations";
import { SUBSCRIPTION_CATEGORIES } from "@/lib/subscriptions/categories";
import { formatCurrency } from "@/lib/utils/currency";
import { subscriptionCategoryLabel } from "@/lib/i18n/category-labels";
import { sliceDateLocale, sliceNumberLocale } from "@/lib/i18n/locale";
import { useSliceT } from "@/lib/i18n/use-slice-t";
import { HEADER_CONTROL_SHELL } from "@/components/layout/header-controls";

type SortKey = "cost" | "next" | "name" | "category";
type FilterShared = "all" | "shared" | "solo";

/** Matches header nav / language toggle — one visual system */
function segmentClass(active: boolean) {
  return `shrink-0 snap-start rounded-full px-3.5 py-2 text-sm font-semibold transition-[background,color,box-shadow] ${
    active
      ? "bg-white/12 text-fg shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]"
      : "text-fg-secondary hover:bg-white/[0.06] hover:text-fg"
  }`;
}

const hideScrollbar =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

export function SubscriptionsClient() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const { t, locale } = useSliceT();
  const dateLoc = sliceDateLocale(locale);
  const numberLoc = sliceNumberLocale(locale);

  const {
    ready,
    subscriptions,
    preferences,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    resetToDemo,
    clearAll,
  } = useSubscriptions();

  const billingLabel = (s: SubscriptionRecord) => {
    switch (s.billingCycle) {
      case "monthly":
        return t("subs.billingMonthly");
      case "yearly":
        return t("subs.billingYearly");
      case "custom":
        return t("subs.billingCustom", {
          months: s.customPeriodMonths ?? "?",
        });
      default:
        return "";
    }
  };

  const [sort, setSort] = useState<SortKey>("next");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterShared, setFilterShared] = useState<FilterShared>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionRecord | null>(null);

  const cur = preferences.currency ?? "USD";

  const filteredSorted = useMemo(() => {
    let rows = [...subscriptions];
    if (filterCategory !== "all") {
      rows = rows.filter((s) => s.category === filterCategory);
    }
    if (filterShared === "shared") rows = rows.filter((s) => s.shared);
    if (filterShared === "solo") rows = rows.filter((s) => !s.shared);

    const now = new Date();
    rows.sort((a, b) => {
      if (sort === "cost") {
        return getMonthlyMyShare(b) - getMonthlyMyShare(a);
      }
      if (sort === "next") {
        return (
          getNextPaymentOnOrAfter(a, now).getTime() -
          getNextPaymentOnOrAfter(b, now).getTime()
        );
      }
      if (sort === "category") {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
    return rows;
  }, [subscriptions, filterCategory, filterShared, sort]);

  useEffect(() => {
    if (!ready || !highlightId) return;
    const id = requestAnimationFrame(() => {
      document
        .querySelector(`[data-subscription-row="${CSS.escape(highlightId)}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => cancelAnimationFrame(id);
  }, [ready, highlightId, filteredSorted]);

  if (!ready) {
    return <SubscriptionsSkeleton />;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl">
            {t("subs.title")}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-fg-secondary">
            {t("subs.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="slice-btn-secondary"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" aria-hidden />
            {t("subs.add")}
          </button>
          <button
            type="button"
            className="slice-btn-secondary"
            onClick={() => resetToDemo()}
          >
            <RotateCcw className="size-4" aria-hidden />
            {t("subs.loadDemo")}
          </button>
          <button
            type="button"
            className="slice-btn-secondary border-danger/40 text-danger hover:border-danger"
            onClick={() => {
              if (
                typeof window !== "undefined" &&
                window.confirm(t("subs.clearConfirm"))
              ) {
                clearAll();
              }
            }}
          >
            {t("subs.clearData")}
          </button>
        </div>
      </header>

      <SubscriptionFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        initial={editing}
        onSubmit={(vals: SubscriptionFormInput) => {
          if (editing) updateSubscription(editing.id, vals);
          else addSubscription(vals);
        }}
      />

      {subscriptions.length === 0 ? (
        <div className="slice-card border-dashed border-border-subtle p-10 text-center">
          <p className="text-lg font-bold text-fg">{t("subs.emptyTitle")}</p>
          <p className="mt-2 text-sm text-muted">{t("subs.emptyHint")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className="slice-btn-primary"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              {t("subs.addSubscription")}
            </button>
            <button
              type="button"
              className="slice-btn-secondary"
              onClick={() => resetToDemo()}
            >
              {t("subs.loadDemoSet")}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:p-4"
            role="region"
            aria-label={t("subs.filterRegion")}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-8">
              <div className="min-w-0 flex-1">
                <p id="subs-filter-cat" className="slice-label mb-2">
                  {t("subs.category")}
                </p>
                <div
                  className="rounded-xl bg-white/[0.03] p-1 ring-1 ring-white/[0.06]"
                  role="group"
                  aria-labelledby="subs-filter-cat"
                >
                  <div
                    className={`flex flex-nowrap gap-1 overflow-x-auto px-0.5 py-0.5 ${hideScrollbar}`}
                  >
                    <button
                      type="button"
                      aria-pressed={filterCategory === "all"}
                      className={segmentClass(filterCategory === "all")}
                      onClick={() => setFilterCategory("all")}
                    >
                      {t("subs.all")}
                    </button>
                    {SUBSCRIPTION_CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={filterCategory === c}
                        className={segmentClass(filterCategory === c)}
                        onClick={() => setFilterCategory(c)}
                      >
                        {subscriptionCategoryLabel(c, locale)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:gap-5 lg:shrink-0">
                <div className="min-w-0 sm:w-[min(100%,14rem)]">
                  <p id="subs-filter-share" className="slice-label mb-2">
                    {t("subs.sharing")}
                  </p>
                  <div
                    role="group"
                    aria-labelledby="subs-filter-share"
                    className={`flex max-w-full flex-nowrap gap-1 overflow-x-auto ${hideScrollbar} ${HEADER_CONTROL_SHELL}`}
                  >
                    <button
                      type="button"
                      aria-pressed={filterShared === "all"}
                      className={segmentClass(filterShared === "all")}
                      onClick={() => setFilterShared("all")}
                    >
                      {t("subs.all")}
                    </button>
                    <button
                      type="button"
                      aria-pressed={filterShared === "shared"}
                      className={segmentClass(filterShared === "shared")}
                      onClick={() => setFilterShared("shared")}
                    >
                      {t("subs.shared")}
                    </button>
                    <button
                      type="button"
                      aria-pressed={filterShared === "solo"}
                      className={segmentClass(filterShared === "solo")}
                      onClick={() => setFilterShared("solo")}
                    >
                      {t("subs.notShared")}
                    </button>
                  </div>
                </div>

                <div className="min-w-0 flex-1 sm:min-w-[min(100%,22rem)]">
                  <p id="subs-filter-sort" className="slice-label mb-2">
                    {t("subs.sortBy")}
                  </p>
                  <div
                    role="group"
                    aria-labelledby="subs-filter-sort"
                    className={`flex max-w-full flex-nowrap gap-1 overflow-x-auto ${hideScrollbar} ${HEADER_CONTROL_SHELL}`}
                  >
                    {(
                      [
                        ["next", "subs.sortNext"],
                        ["cost", "subs.sortCost"],
                        ["name", "subs.sortName"],
                        ["category", "subs.sortCategory"],
                      ] as const
                    ).map(([key, labelKey]) => (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={sort === key}
                        className={segmentClass(sort === key)}
                        onClick={() => setSort(key)}
                      >
                        {t(labelKey)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p
              className="mt-3 border-t border-white/[0.05] pt-3 text-xs text-muted"
              aria-live="polite"
            >
              {t("subs.listSummary", {
                shown: filteredSorted.length,
                total: subscriptions.length,
              })}
            </p>
          </div>

          <div className="slice-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/[0.06] bg-white/[0.02] text-xs font-semibold text-muted">
                  <tr>
                    <th className="px-4 py-3.5 font-medium">{t("subs.colService")}</th>
                    <th className="px-4 py-3.5 font-medium">{t("subs.colCategory")}</th>
                    <th className="px-4 py-3.5 font-medium">{t("subs.colBilling")}</th>
                    <th className="px-4 py-3.5 font-medium tabular-nums">
                      {t("subs.colFullMo")}
                    </th>
                    <th className="px-4 py-3.5 font-medium tabular-nums">
                      {t("subs.colYoursMo")}
                    </th>
                    <th className="px-4 py-3.5 font-medium">{t("subs.colNext")}</th>
                    <th className="px-4 py-3.5 font-medium">{t("subs.colSplit")}</th>
                    <th className="px-4 py-3 font-medium sr-only">{t("subs.colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSorted.map((s) => {
                    const next = getNextPaymentOnOrAfter(s, new Date());
                    const d = daysUntil(next, new Date());
                    const soon =
                      s.active && d >= 0 && d <= 7 ? "text-warning" : "text-muted";
                    return (
                      <tr
                        key={s.id}
                        data-subscription-row={s.id}
                        className={`border-b border-border-subtle/70 last:border-0 hover:bg-surface-alt/30 ${
                          highlightId === s.id
                            ? "bg-accent/[0.09] ring-1 ring-inset ring-accent/35"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <ProviderAvatar provider={s.provider} size="sm" />
                            <div>
                              <p className="font-medium text-fg">
                                {s.name}
                                {!s.active && (
                                  <span className="ml-2 text-xs font-normal text-muted">
                                    {t("subs.inactive")}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted">{s.provider}</p>
                              {(s.notes || s.reviewFlag) && (
                                <p className="mt-1 text-[11px] text-fg-secondary">
                                  {s.reviewFlag && (
                                    <span className="mr-2 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning">
                                      {t("subs.reviewBadge")}
                                    </span>
                                  )}
                                  {s.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-fg-secondary">
                          {subscriptionCategoryLabel(s.category, locale)}
                        </td>
                        <td className="px-4 py-3 text-fg-secondary">
                          {billingLabel(s)}
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums text-fg-secondary">
                          {formatCurrency(getMonthlyTotalPrice(s), cur, numberLoc)}
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums font-semibold text-fg">
                          {formatCurrency(getMonthlyMyShare(s), cur, numberLoc)}
                        </td>
                        <td className={`px-4 py-3 tabular-nums ${soon}`}>
                          {next.toLocaleDateString(dateLoc, {
                            month: "short",
                            day: "numeric",
                          })}
                          <span className="ml-1 text-xs text-muted">
                            (
                            {d < 0
                              ? t("subs.past")
                              : t("subs.daysSuffix", { days: d })}
                            )
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {s.shared ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-semibold text-accent-bright">
                              <Share2 className="size-3.5" aria-hidden />
                              ÷{s.shareCount ?? "—"}
                            </span>
                          ) : (
                            <span className="text-xs text-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              className="rounded-lg p-2 text-muted hover:bg-surface-alt hover:text-fg"
                              aria-label={t("subs.editAria", { name: s.name })}
                              onClick={() => {
                                setEditing(s);
                                setFormOpen(true);
                              }}
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              type="button"
                              className="border border-transparent p-2 text-muted hover:border-danger/30 hover:bg-danger/10 hover:text-danger"
                              aria-label={t("subs.deleteAria", { name: s.name })}
                              onClick={() => {
                                if (
                                  typeof window !== "undefined" &&
                                  window.confirm(
                                    t("subs.deleteConfirm", { name: s.name })
                                  )
                                ) {
                                  deleteSubscription(s.id);
                                }
                              }}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
