"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, Plus, RotateCcw, Share2, Trash2 } from "lucide-react";
import { useSubscriptions } from "@/components/providers/subscriptions-provider";
import { ProviderAvatar } from "@/components/subscriptions/provider-avatar";
import { SubscriptionFormDialog } from "@/components/subscriptions/subscription-form-dialog";
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

type SortKey = "cost" | "next" | "name" | "category";
type FilterShared = "all" | "shared" | "solo";

function cycleLabel(
  s: SubscriptionRecord
): string {
  switch (s.billingCycle) {
    case "monthly":
      return "Monthly";
    case "yearly":
      return "Yearly";
    case "custom":
      return `Every ${s.customPeriodMonths ?? "?"} mo`;
    default:
      return "";
  }
}

function tabClass(active: boolean) {
  return `shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
    active
      ? "bg-white/14 text-fg shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]"
      : "text-fg-secondary hover:bg-white/[0.06] hover:text-fg"
  }`;
}

export function SubscriptionsClient() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");

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
    return (
      <div className="animate-pulse space-y-4" aria-hidden>
        <div className="h-10 w-64 rounded-2xl bg-white/[0.06]" />
        <div className="h-28 rounded-2xl bg-white/[0.04]" />
        <div className="slice-card h-96" />
      </div>
    );
  }

  return (
    <div className="animate-slice-in space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl">
            Subscriptions
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-fg-secondary">
            Full price, your share of shared plans, billing cycle, and next
            payment date.
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
            Add
          </button>
          <button
            type="button"
            className="slice-btn-secondary"
            onClick={() => resetToDemo()}
          >
            <RotateCcw className="size-4" aria-hidden />
            Load demo
          </button>
          <button
            type="button"
            className="slice-btn-secondary border-danger/40 text-danger hover:border-danger"
            onClick={() => {
              if (
                typeof window !== "undefined" &&
                window.confirm("Clear all subscriptions and preferences on this device?")
              ) {
                clearAll();
              }
            }}
          >
            Clear data
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
          <p className="text-lg font-bold text-fg">No subscriptions yet</p>
          <p className="mt-2 text-sm text-muted">
            Add a subscription to get started, or load sample data to preview
            the dashboard.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className="slice-btn-primary"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Add subscription
            </button>
            <button
              type="button"
              className="slice-btn-secondary"
              onClick={() => resetToDemo()}
            >
              Load demo set
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5"
            role="region"
            aria-label="Filter and sort subscriptions"
          >
            <div>
              <p className="text-xs font-semibold text-muted">Category</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  className={tabClass(filterCategory === "all")}
                  onClick={() => setFilterCategory("all")}
                >
                  All
                </button>
                {SUBSCRIPTION_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={tabClass(filterCategory === c)}
                    onClick={() => setFilterCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted">Sharing</p>
              <div
                className="mt-2 flex flex-wrap gap-1.5"
                role="tablist"
                aria-label="Sharing filter"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={filterShared === "all"}
                  className={tabClass(filterShared === "all")}
                  onClick={() => setFilterShared("all")}
                >
                  All
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filterShared === "shared"}
                  className={tabClass(filterShared === "shared")}
                  onClick={() => setFilterShared("shared")}
                >
                  Shared
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filterShared === "solo"}
                  className={tabClass(filterShared === "solo")}
                  onClick={() => setFilterShared("solo")}
                >
                  Not shared
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted">Sort by</p>
              <div
                className="mt-2 flex flex-wrap gap-1.5"
                role="tablist"
                aria-label="Sort order"
              >
                {(
                  [
                    ["next", "Next payment"],
                    ["cost", "Your cost"],
                    ["name", "Name"],
                    ["category", "Category"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={sort === key}
                    className={tabClass(sort === key)}
                    onClick={() => setSort(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="slice-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/[0.06] bg-white/[0.02] text-xs font-semibold text-muted">
                  <tr>
                    <th className="px-4 py-3.5 font-medium">Service</th>
                    <th className="px-4 py-3.5 font-medium">Category</th>
                    <th className="px-4 py-3.5 font-medium">Billing</th>
                    <th className="px-4 py-3.5 font-medium tabular-nums">
                      Full / mo
                    </th>
                    <th className="px-4 py-3.5 font-medium tabular-nums">
                      Yours / mo
                    </th>
                    <th className="px-4 py-3.5 font-medium">Next</th>
                    <th className="px-4 py-3.5 font-medium">Split</th>
                    <th className="px-4 py-3 font-medium sr-only">Actions</th>
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
                                    (inactive)
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted">{s.provider}</p>
                              {(s.notes || s.reviewFlag) && (
                                <p className="mt-1 text-[11px] text-fg-secondary">
                                  {s.reviewFlag && (
                                    <span className="mr-2 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning">
                                      Review
                                    </span>
                                  )}
                                  {s.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-fg-secondary">{s.category}</td>
                        <td className="px-4 py-3 text-fg-secondary">
                          {cycleLabel(s)}
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums text-fg-secondary">
                          {formatCurrency(getMonthlyTotalPrice(s), cur)}
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums font-semibold text-fg">
                          {formatCurrency(getMonthlyMyShare(s), cur)}
                        </td>
                        <td className={`px-4 py-3 tabular-nums ${soon}`}>
                          {next.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                          <span className="ml-1 text-xs text-muted">
                            ({d < 0 ? "past" : `${d}d`})
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
                              aria-label={`Edit ${s.name}`}
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
                              aria-label={`Delete ${s.name}`}
                              onClick={() => {
                                if (
                                  typeof window !== "undefined" &&
                                  window.confirm(`Delete ${s.name}?`)
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
