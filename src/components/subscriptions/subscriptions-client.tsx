"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useSubscriptions } from "@/components/providers/subscriptions-provider";
import { GuidedAddDialog } from "@/components/subscriptions/guided-add-dialog";
import { ProviderAvatar } from "@/components/subscriptions/provider-avatar";
import { SubscriptionFormDialog } from "@/components/subscriptions/subscription-form-dialog";
import { SubscriptionsSkeleton } from "@/components/subscriptions/subscriptions-skeleton";
import {
  SubscriptionsToolbar,
  type FilterShared,
  type SortKey,
} from "@/components/subscriptions/subscriptions-toolbar";
import type {
  SubscriptionFormInput,
  SubscriptionRecord,
} from "@/lib/validation/subscription";
import {
  daysUntil,
  formatCalendarDate,
  getMonthlyMyShare,
  getMonthlyTotalPrice,
  getNextPaymentOnOrAfter,
  nextCycleDate,
} from "@/lib/subscriptions/calculations";
import { matchesRegisterQuery } from "@/lib/subscriptions/register";
import { formatCurrency } from "@/lib/utils/currency";
import { subscriptionCategoryLabel } from "@/lib/i18n/category-labels";
import { sliceDateLocale, sliceNumberLocale } from "@/lib/i18n/locale";
import { useSliceT } from "@/lib/i18n/use-slice-t";
import { useLocalToday } from "@/lib/ui/use-local-today";

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
  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterShared, setFilterShared] = useState<FilterShared>("all");
  const [filterDueSoon, setFilterDueSoon] = useState(false);
  const [filterReview, setFilterReview] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionRecord | null>(null);

  const cur = preferences.currency ?? "USD";
  const today = useLocalToday();

  const markCharged = (s: SubscriptionRecord, due: Date) => {
    const dueOn = formatCalendarDate(due);
    const advanced = nextCycleDate(s, dueOn);
    if (!advanced) return;
    updateSubscription(s.id, {
      name: s.name,
      provider: s.provider,
      iconKey: s.iconKey ?? "",
      category: s.category,
      billingCycle: s.billingCycle,
      customPeriodMonths: s.customPeriodMonths,
      totalPrice: s.totalPrice,
      currency: s.currency,
      shared: s.shared,
      shareCount: s.shareCount,
      nextPaymentDate: advanced,
      notes: s.notes ?? "",
      active: s.active,
      reviewFlag: s.reviewFlag ?? false,
    });
  };

  const chargeOf = (s: SubscriptionRecord) => {
    if (!today) {
      const [year, month, day] = s.nextPaymentDate.split("-").map(Number);
      const label =
        year && month && day
          ? new Date(year, month - 1, day).toLocaleDateString(dateLoc, {
              month: "short",
              day: "numeric",
            })
          : s.nextPaymentDate;
      return {
        next: null as Date | null,
        label,
        relative: null as string | null,
        marked: false,
      };
    }
    const next = getNextPaymentOnOrAfter(s, today);
    const days = daysUntil(next, today);
    return {
      next,
      label: next.toLocaleDateString(dateLoc, {
        month: "short",
        day: "numeric",
      }),
      relative: days < 0 ? t("subs.past") : t("subs.daysSuffix", { days }),
      marked: s.active && days >= 0 && days <= preferences.reminderLeadDays,
    };
  };

  const showReviewFilter = useMemo(
    () => subscriptions.some((s) => s.reviewFlag),
    [subscriptions]
  );

  useEffect(() => {
    if (!showReviewFilter && filterReview) setFilterReview(false);
  }, [showReviewFilter, filterReview]);

  const filteredSorted = useMemo(() => {
    let rows = subscriptions.filter((s) => matchesRegisterQuery(s, query));
    if (filterCategory !== "all") {
      rows = rows.filter((s) => s.category === filterCategory);
    }
    if (filterShared === "shared") rows = rows.filter((s) => s.shared);
    if (filterShared === "solo") rows = rows.filter((s) => !s.shared);
    if (filterDueSoon && today) {
      rows = rows.filter((s) => {
        if (!s.active) return false;
        const next = getNextPaymentOnOrAfter(s, today);
        const until = daysUntil(next, today);
        return until >= 0 && until <= preferences.reminderLeadDays;
      });
    }
    if (filterReview) {
      rows = rows.filter((s) => Boolean(s.reviewFlag));
    }

    const now = today ?? new Date();
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
      return a.name.localeCompare(b.name);
    });
    return rows;
  }, [
    subscriptions,
    query,
    filterCategory,
    filterShared,
    filterDueSoon,
    filterReview,
    sort,
    today,
    preferences.reminderLeadDays,
  ]);

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
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-fg">
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
              setFormOpen(false);
              setGuideOpen(true);
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

      <GuidedAddDialog
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        onSubmit={(values) => addSubscription(values)}
        onFullForm={() => {
          setGuideOpen(false);
          setEditing(null);
          setFormOpen(true);
        }}
      />
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
                setFormOpen(false);
                setGuideOpen(true);
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
          <SubscriptionsToolbar
            query={query}
            onQueryChange={setQuery}
            filterCategory={filterCategory}
            onFilterCategoryChange={setFilterCategory}
            filterShared={filterShared}
            onFilterSharedChange={setFilterShared}
            filterDueSoon={filterDueSoon}
            onFilterDueSoonChange={setFilterDueSoon}
            filterReview={filterReview}
            onFilterReviewChange={setFilterReview}
            showReviewFilter={showReviewFilter}
            sort={sort}
            onSortChange={setSort}
            shown={filteredSorted.length}
            total={subscriptions.length}
            locale={locale}
          />

          {filteredSorted.length === 0 ? (
            <p className="py-8 text-sm text-fg-secondary md:hidden">
              {t("subs.noMatches")}
            </p>
          ) : (
            <ul className="divide-y divide-white/[0.08] md:hidden">
              {filteredSorted.map((s) => {
                const charge = chargeOf(s);
                return (
                  <li key={s.id} data-subscription-row={s.id} className="py-4">
                    <div className="flex items-start gap-3">
                      <ProviderAvatar
                        name={s.name}
                        provider={s.provider}
                        iconKey={s.iconKey}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-fg">
                          {s.name}
                          {!s.active ? (
                            <span className="ml-2 text-xs font-normal text-muted">
                              {t("subs.inactive")}
                            </span>
                          ) : null}
                        </p>
                        <p className="truncate text-sm text-fg-secondary">
                          {subscriptionCategoryLabel(s.category, locale)},{" "}
                          {billingLabel(s)}
                        </p>
                        <p className="mt-1 font-mono text-base font-semibold tabular-nums text-fg">
                          {formatCurrency(getMonthlyMyShare(s), cur, numberLoc)}
                          <span className="ml-2 text-xs font-sans font-normal text-muted">
                            {t("subs.colYoursMo")}
                          </span>
                        </p>
                        <p
                          className={`mt-0.5 text-sm tabular-nums ${
                            charge.marked ? "text-accent" : "text-muted"
                          }`}
                        >
                          {charge.label}
                          {charge.relative ? ` (${charge.relative})` : ""}
                          {charge.marked
                            ? ` ${t("dashboard.horizonMarked")}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {s.active && charge.next ? (
                        <button
                          type="button"
                          className="slice-btn-secondary px-3 text-sm"
                          aria-label={t("dashboard.horizonRecordAria", {
                            name: s.name,
                          })}
                          onClick={() => markCharged(s, charge.next as Date)}
                        >
                          {t("dashboard.horizonRecord")}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted transition-[background,color,transform] duration-150 hover:bg-white/[0.06] hover:text-fg active:scale-[0.97]"
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
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted transition-[background,color,transform] duration-150 hover:bg-danger/10 hover:text-danger active:scale-[0.97]"
                        aria-label={t("subs.deleteAria", { name: s.name })}
                        onClick={() => {
                          if (
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
                  </li>
                );
              })}
            </ul>
          )}

          <div className="slice-card hidden overflow-hidden md:block">
            <div className="slice-register-scroll">
              <table className="slice-register-table">
                <colgroup>
                  <col style={{ width: "24%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "17%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">{t("subs.colService")}</th>
                    <th scope="col">{t("subs.colCategory")}</th>
                    <th scope="col">{t("subs.colBilling")}</th>
                    <th scope="col" data-align="end">
                      {t("subs.colFull")}
                      <span className="slice-register-unit">
                        {t("subs.colPerMonth")}
                      </span>
                    </th>
                    <th scope="col" data-align="end">
                      {t("subs.colYours")}
                      <span className="slice-register-unit">
                        {t("subs.colPerMonth")}
                      </span>
                    </th>
                    <th scope="col" data-align="end">
                      {t("subs.colNext")}
                    </th>
                    <th scope="col" data-align="end">
                      {t("subs.colSplit")}
                    </th>
                    <th scope="col" className="slice-register-actions">
                      <span className="sr-only">{t("subs.colActions")}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSorted.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-10 text-sm text-fg-secondary"
                      >
                        {t("subs.noMatches")}
                      </td>
                    </tr>
                  ) : null}
                  {filteredSorted.map((s) => {
                    const charge = chargeOf(s);
                    return (
                      <tr
                        key={s.id}
                        data-subscription-row={s.id}
                        data-highlighted={
                          highlightId === s.id ? "true" : undefined
                        }
                        className="slice-table-row group border-b border-white/[0.045] last:border-0"
                      >
                        <td className="slice-table-sticky sticky left-0 z-10">
                          <div className="flex min-w-0 items-center gap-3">
                            <ProviderAvatar
                              name={s.name}
                              provider={s.provider}
                              iconKey={s.iconKey}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-fg">
                                {s.name}
                                {!s.active && (
                                  <span className="ml-2 text-xs font-normal text-muted">
                                    {t("subs.inactive")}
                                  </span>
                                )}
                              </p>
                              <p className="truncate text-xs text-muted">
                                {s.provider}
                              </p>
                              {(s.notes || s.reviewFlag) && (
                                <p className="mt-1 truncate text-[11px] text-fg-secondary">
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
                        <td className="truncate text-fg-secondary">
                          {subscriptionCategoryLabel(s.category, locale)}
                        </td>
                        <td className="whitespace-nowrap text-fg-secondary">
                          {billingLabel(s)}
                        </td>
                        <td
                          data-align="end"
                          className="font-mono tabular-nums text-fg-secondary"
                        >
                          {formatCurrency(
                            getMonthlyTotalPrice(s),
                            cur,
                            numberLoc
                          )}
                        </td>
                        <td
                          data-align="end"
                          className="font-mono tabular-nums font-semibold text-fg"
                        >
                          {formatCurrency(
                            getMonthlyMyShare(s),
                            cur,
                            numberLoc
                          )}
                        </td>
                        <td
                          data-align="end"
                          className={`whitespace-nowrap tabular-nums ${
                            charge.marked ? "text-accent" : "text-muted"
                          }`}
                        >
                          {charge.label}
                          {charge.relative ? (
                            <span className="ml-1 text-xs text-muted">
                              ({charge.relative})
                            </span>
                          ) : null}
                        </td>
                        <td data-align="end">
                          {s.shared ? (
                            <span className="font-mono text-sm tabular-nums text-fg">
                              ÷{s.shareCount ?? "—"}
                            </span>
                          ) : (
                            <span className="text-xs text-muted">—</span>
                          )}
                        </td>
                        <td className="slice-register-actions">
                          <div className="flex justify-end gap-1 opacity-70 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                            {s.active && charge.next ? (
                              <button
                                type="button"
                                className="min-h-11 rounded-lg px-3 text-xs font-semibold text-fg-secondary transition-[background,color,transform] duration-150 hover:bg-white/[0.06] hover:text-fg active:scale-[0.97]"
                                aria-label={t("dashboard.horizonRecordAria", {
                                  name: s.name,
                                })}
                                onClick={() =>
                                  markCharged(s, charge.next as Date)
                                }
                              >
                                {t("dashboard.horizonRecord")}
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted transition-[background,color,transform] duration-150 hover:bg-white/[0.06] hover:text-fg active:scale-[0.97]"
                              aria-label={t("subs.editAria", {
                                name: s.name,
                              })}
                              onClick={() => {
                                setEditing(s);
                                setFormOpen(true);
                              }}
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              type="button"
                              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted transition-[background,color,transform] duration-150 hover:bg-danger/10 hover:text-danger active:scale-[0.97]"
                              aria-label={t("subs.deleteAria", {
                                name: s.name,
                              })}
                              onClick={() => {
                                if (
                                  typeof window !== "undefined" &&
                                  window.confirm(
                                    t("subs.deleteConfirm", {
                                      name: s.name,
                                    })
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
