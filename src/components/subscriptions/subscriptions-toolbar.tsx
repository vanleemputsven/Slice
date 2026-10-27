"use client";

import { Search, X } from "lucide-react";
import {
  SegmentedControl,
  ToggleChip,
} from "@/components/ui/segmented-control";
import { subscriptionCategoryLabel } from "@/lib/i18n/category-labels";
import type { AppLocale } from "@/lib/i18n/locale";
import { useSliceT } from "@/lib/i18n/use-slice-t";
import { SUBSCRIPTION_CATEGORIES } from "@/lib/subscriptions/categories";

export type SortKey = "cost" | "next" | "name";
export type FilterShared = "all" | "shared" | "solo";

const selectClass =
  "h-11 min-w-0 appearance-none rounded-[var(--slice-radius-md)] border border-white/[0.09] bg-[rgb(var(--slice-canvas)/0.55)] px-3 pr-9 text-sm text-fg shadow-[inset_0_1px_2px_rgb(0_0_0/0.2)] transition-[border-color,box-shadow] focus-visible:border-[rgb(var(--slice-accent-bright)/0.55)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgb(var(--slice-accent)/0.18),inset_0_1px_2px_rgb(0_0_0/0.2)]";

const selectChevron = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat" as const,
  backgroundPosition: "right 0.75rem center",
};

export type SubscriptionsToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (value: string) => void;
  filterShared: FilterShared;
  onFilterSharedChange: (value: FilterShared) => void;
  filterDueSoon: boolean;
  onFilterDueSoonChange: (value: boolean) => void;
  filterReview: boolean;
  onFilterReviewChange: (value: boolean) => void;
  showReviewFilter: boolean;
  sort: SortKey;
  onSortChange: (value: SortKey) => void;
  shown: number;
  total: number;
  locale: AppLocale;
};

export function SubscriptionsToolbar({
  query,
  onQueryChange,
  filterCategory,
  onFilterCategoryChange,
  filterShared,
  onFilterSharedChange,
  filterDueSoon,
  onFilterDueSoonChange,
  filterReview,
  onFilterReviewChange,
  showReviewFilter,
  sort,
  onSortChange,
  shown,
  total,
  locale,
}: SubscriptionsToolbarProps) {
  const { t } = useSliceT();

  const filtersActive =
    query.trim().length > 0 ||
    filterCategory !== "all" ||
    filterShared !== "all" ||
    filterDueSoon ||
    filterReview;

  const clearFilters = () => {
    onQueryChange("");
    onFilterCategoryChange("all");
    onFilterSharedChange("all");
    onFilterDueSoonChange(false);
    onFilterReviewChange(false);
  };

  return (
    <div
      className="space-y-3"
      role="region"
      aria-label={t("subs.filterRegion")}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">{t("subs.searchLabel")}</span>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            type="search"
            className="slice-input mt-0 h-11 w-full py-0 pl-10 pr-3 text-sm"
            placeholder={t("subs.searchPlaceholder")}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center">
          <label className="relative min-w-0 sm:min-w-[11.5rem]">
            <span className="sr-only">{t("subs.category")}</span>
            <select
              className={`${selectClass} w-full`}
              value={filterCategory}
              onChange={(event) => onFilterCategoryChange(event.target.value)}
              style={selectChevron}
            >
              <option value="all">{t("subs.categoryAll")}</option>
              {SUBSCRIPTION_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {subscriptionCategoryLabel(category, locale)}
                </option>
              ))}
            </select>
          </label>

          <label className="relative min-w-0 sm:min-w-[11.5rem]">
            <span className="sr-only">{t("subs.sortBy")}</span>
            <select
              className={`${selectClass} w-full`}
              value={sort}
              onChange={(event) => onSortChange(event.target.value as SortKey)}
              aria-label={t("subs.sortAria")}
              style={selectChevron}
            >
              <option value="next">{t("subs.sortNext")}</option>
              <option value="cost">{t("subs.sortCost")}</option>
              <option value="name">{t("subs.sortName")}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <SegmentedControl
          value={filterShared}
          onChange={onFilterSharedChange}
          ariaLabel={t("subs.sharingAria")}
          size="sm"
          options={[
            { value: "all", label: t("subs.all") },
            { value: "shared", label: t("subs.shared") },
            { value: "solo", label: t("subs.notShared") },
          ]}
        />

        <div className="flex flex-wrap items-center gap-1.5">
          <ToggleChip
            pressed={filterDueSoon}
            onPressedChange={onFilterDueSoonChange}
          >
            {t("subs.filterDueSoon")}
          </ToggleChip>
          {showReviewFilter ? (
            <ToggleChip
              pressed={filterReview}
              onPressedChange={onFilterReviewChange}
            >
              {t("subs.filterReview")}
            </ToggleChip>
          ) : null}
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-2 text-xs text-muted">
          <p aria-live="polite">
            {t("subs.listSummary", { shown, total })}
          </p>
          {filtersActive ? (
            <button
              type="button"
              className="inline-flex min-h-8 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-fg-secondary transition-[background,color] duration-150 hover:bg-white/[0.06] hover:text-fg"
              onClick={clearFilters}
            >
              <X className="size-3.5" aria-hidden />
              {t("subs.clearFilters")}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
