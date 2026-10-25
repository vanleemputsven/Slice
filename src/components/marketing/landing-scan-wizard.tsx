"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { useSubscriptions } from "@/components/providers/subscriptions-provider";
import { HEADER_CONTROL_SHELL } from "@/components/layout/header-controls";
import { subscriptionCategoryLabel } from "@/lib/i18n/category-labels";
import type { AppLocale } from "@/lib/i18n/locale";
import type { SliceMessageKey } from "@/lib/i18n/messages";
import {
  SUBSCRIPTION_CATEGORIES,
  type SubscriptionCategory,
} from "@/lib/subscriptions/categories";
import { formatCalendarDate } from "@/lib/subscriptions/calculations";
import {
  parseFirstListDraft,
  storeFirstListDraft,
} from "@/lib/subscriptions/first-list";

const WIZARD_QUESTIONS = 3;

const COUNT_OPTIONS = [
  { id: "c1", labelKey: "landing.wizardCount1" as const },
  { id: "c2", labelKey: "landing.wizardCount2" as const },
  { id: "c3", labelKey: "landing.wizardCount3" as const },
  { id: "c4", labelKey: "landing.wizardCount4" as const },
] as const;

const CATEGORY_OPTIONS = [
  { id: "stream", labelKey: "landing.wizardCatStream" as const },
  { id: "software", labelKey: "landing.wizardCatSoftware" as const },
  { id: "mobile", labelKey: "landing.wizardCatMobile" as const },
  { id: "fitness", labelKey: "landing.wizardCatFitness" as const },
  { id: "news", labelKey: "landing.wizardCatNews" as const },
  { id: "other", labelKey: "landing.wizardCatOther" as const },
] as const;

const BAND_OPTIONS = [
  { id: "b1", labelKey: "landing.wizardBand1" as const },
  { id: "b2", labelKey: "landing.wizardBand2" as const },
  { id: "b3", labelKey: "landing.wizardBand3" as const },
  { id: "b4", labelKey: "landing.wizardBand4" as const },
] as const;

const WIZARD_CATEGORY: Record<string, SubscriptionCategory> = {
  stream: "Entertainment",
  software: "Productivity",
  mobile: "Utilities",
  fitness: "Health",
  news: "Education",
  other: "Other",
};

type NameRow = {
  key: string;
  name: string;
  category: SubscriptionCategory;
  billingCycle: "monthly" | "yearly";
  totalPrice: string;
  nextPaymentDate: string;
};

function emptyNameRow(key: string, category: SubscriptionCategory): NameRow {
  return {
    key,
    name: "",
    category,
    billingCycle: "monthly",
    totalPrice: "",
    nextPaymentDate: formatCalendarDate(new Date()),
  };
}

export type LandingScanWizardProps = {
  isSignedIn: boolean;
  locale: AppLocale;
  t: (key: SliceMessageKey, vars?: Record<string, string | number>) => string;
};

export function LandingScanWizard({
  isSignedIn,
  locale,
  t,
}: LandingScanWizardProps) {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const { addSubscription, preferences, ready } = useSubscriptions();

  const [wizardStep, setWizardStep] = useState(0);
  const [countId, setCountId] = useState<string | null>(null);
  const [categorySet, setCategorySet] = useState<Set<string>>(() => new Set());
  const [bandId, setBandId] = useState<string | null>(null);
  const [nameRows, setNameRows] = useState<NameRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [wizardError, setWizardError] = useState<string | null>(null);

  const toggleCategory = useCallback((id: string) => {
    setCategorySet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setWizardError(null);
  }, []);

  const resetWizard = useCallback(() => {
    setWizardStep(0);
    setCountId(null);
    setCategorySet(new Set());
    setBandId(null);
    setNameRows([]);
    setSaving(false);
    setWizardError(null);
  }, []);

  const goNext = useCallback(() => {
    setWizardError(null);
    if (wizardStep === 0) {
      if (!countId) {
        setWizardError(t("landing.wizardPickOne"));
        return;
      }
      setWizardStep(1);
      return;
    }
    if (wizardStep === 1) {
      if (categorySet.size === 0) {
        setWizardError(t("landing.wizardPickCategories"));
        return;
      }
      setWizardStep(2);
      return;
    }
    if (wizardStep === 2) {
      if (!bandId) {
        setWizardError(t("landing.wizardPickOne"));
        return;
      }
      setNameRows((prev) => {
        const seeded = CATEGORY_OPTIONS.filter((option) =>
          categorySet.has(option.id)
        ).map((option) => {
          const category = WIZARD_CATEGORY[option.id] ?? "Other";
          const existing = prev.find((row) => row.key === option.id);
          return existing
            ? { ...existing, category }
            : emptyNameRow(option.id, category);
        });
        return seeded.length > 0 ? seeded : [emptyNameRow("extra", "Other")];
      });
      setWizardStep(3);
    }
  }, [bandId, categorySet, countId, t, wizardStep]);

  const goBack = useCallback(() => {
    setWizardError(null);
    if (wizardStep <= 0) return;
    setWizardStep((s) => s - 1);
  }, [wizardStep]);

  const saveNames = useCallback(() => {
    setWizardError(null);
    const completed: {
      name: string;
      category: SubscriptionCategory;
      billingCycle: "monthly" | "yearly";
      totalPrice: number;
      nextPaymentDate: string;
    }[] = [];
    for (const row of nameRows) {
      const name = row.name.trim();
      const priceText = row.totalPrice.trim();
      if (name === "" && priceText === "") continue;
      const parsed = parseFirstListDraft({
        rows: [
          {
            name,
            category: row.category,
            billingCycle: row.billingCycle,
            totalPrice: Number(priceText),
            nextPaymentDate: row.nextPaymentDate,
          },
        ],
      });
      if (!parsed) {
        setWizardError(t("landing.wizardRowError"));
        return;
      }
      completed.push(parsed[0]);
    }
    const draft = parseFirstListDraft({ rows: completed });
    if (!draft) {
      setWizardError(t("landing.wizardNone"));
      return;
    }
    setSaving(true);
    if (isSignedIn) {
      if (!ready) {
        setSaving(false);
        return;
      }
      const currency = (preferences.currency ?? "EUR").slice(0, 3).toUpperCase();
      for (const row of draft) {
        addSubscription({
          name: row.name,
          provider: row.name,
          iconKey: "",
          category: row.category,
          billingCycle: row.billingCycle,
          customPeriodMonths: undefined,
          totalPrice: row.totalPrice,
          currency,
          shared: false,
          shareCount: undefined,
          nextPaymentDate: row.nextPaymentDate,
          notes: "",
          active: true,
          reviewFlag: false,
        });
      }
      router.push("/dashboard");
      return;
    }
    storeFirstListDraft(draft);
    router.push("/login?next=/dashboard");
  }, [
    addSubscription,
    isSignedIn,
    nameRows,
    preferences.currency,
    ready,
    router,
    t,
  ]);

  const bandLabel = useMemo(() => {
    const key = BAND_OPTIONS.find((option) => option.id === bandId)?.labelKey;
    return key ? t(key) : "";
  }, [bandId, t]);

  const wizardProgressPct =
    wizardStep >= WIZARD_QUESTIONS
      ? 100
      : ((wizardStep + 1) / WIZARD_QUESTIONS) * 100;

  const stepTransition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.28, ease: [0.33, 1, 0.68, 1] as const };

  return (
    <motion.div
      role="region"
      aria-label={t("landing.wizardAria")}
      className="slice-card relative flex flex-col overflow-hidden p-6 sm:p-8 lg:min-h-[min(100%,26rem)] lg:flex-1"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={
        reduceMotion
          ? { duration: 0.2 }
          : { type: "spring", stiffness: 260, damping: 28 }
      }
    >
      <div
        className="pointer-events-none absolute -right-20 -top-28 h-56 w-56 rounded-full bg-accent/20 blur-3xl"
        aria-hidden
      />

      <motion.div
        key="scan-wizard"
        initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{
          duration: reduceMotion ? 0.15 : 0.5,
          ease: [0.33, 1, 0.68, 1],
        }}
        className="flex flex-col"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-sans text-lg font-bold leading-snug text-fg">
              {t("landing.demoTitle")}
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-fg-secondary">
              {t("landing.demoHint")}
            </p>
          </div>
          <div className="shrink-0">
            {wizardStep > 0 ? (
              <button
                type="button"
                onClick={resetWizard}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted transition-[color,background] hover:bg-white/[0.06] hover:text-fg"
              >
                {t("landing.wizardStartOver")}
              </button>
            ) : (
              <span
                className="pointer-events-none block rounded-full px-3 py-1.5 text-xs font-semibold opacity-0"
                aria-hidden
              >
                {t("landing.wizardStartOver")}
              </span>
            )}
          </div>
        </div>

        <div className="mt-5">
          <div
            className="h-1 overflow-hidden rounded-full bg-white/[0.07]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(wizardProgressPct)}
            aria-label={
              wizardStep < WIZARD_QUESTIONS
                ? t("landing.wizardStepLabel", {
                    current: wizardStep + 1,
                    total: WIZARD_QUESTIONS,
                  })
                : t("landing.wizardStepDone")
            }
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent-deep via-accent to-accent-bright"
              initial={false}
              animate={{ width: `${wizardProgressPct}%` }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 200, damping: 28 }
              }
            />
          </div>
          <p className="mt-2 text-center text-[11px] font-medium text-muted">
            {wizardStep < WIZARD_QUESTIONS
              ? t("landing.wizardStepLabel", {
                  current: wizardStep + 1,
                  total: WIZARD_QUESTIONS,
                })
              : t("landing.wizardStepDone")}
          </p>
        </div>

        <div className="relative mt-6 min-h-[19rem] flex-1 sm:min-h-[18rem]">
          <AnimatePresence initial={false} mode="wait">
            {wizardStep === 0 ? (
              <motion.div
                key="w0"
                initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
                transition={stepTransition}
                className="space-y-4"
              >
                <h2 className="font-sans text-base font-bold text-fg">
                  {t("landing.wizardQ1Title")}
                </h2>
                <p className="text-sm text-fg-secondary">{t("landing.wizardQ1Hint")}</p>
                <div
                  className={`grid grid-cols-2 gap-2 sm:grid-cols-4 ${HEADER_CONTROL_SHELL} !p-1.5`}
                  role="group"
                  aria-label={t("landing.wizardQ1Title")}
                >
                  {COUNT_OPTIONS.map((o) => {
                    const on = countId === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          setCountId(o.id);
                          setWizardError(null);
                        }}
                        className={`rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition-[background,color,box-shadow] ${
                          on
                            ? "bg-white/[0.14] text-fg shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)]"
                            : "text-fg-secondary hover:bg-white/[0.05] hover:text-fg"
                        }`}
                      >
                        {t(o.labelKey)}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}

            {wizardStep === 1 ? (
              <motion.div
                key="w1"
                initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
                transition={stepTransition}
                className="space-y-4"
              >
                <h2 className="font-sans text-base font-bold text-fg">
                  {t("landing.wizardQ2Title")}
                </h2>
                <p className="text-sm text-fg-secondary">{t("landing.wizardQ2Hint")}</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((o) => {
                    const on = categorySet.has(o.id);
                    return (
                      <button
                        key={o.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleCategory(o.id)}
                        className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-[background,color,box-shadow] sm:text-sm ${
                          on
                            ? "bg-accent/20 text-fg ring-1 ring-accent/40"
                            : "bg-white/[0.06] text-fg-secondary ring-1 ring-white/[0.08] hover:bg-white/[0.09] hover:text-fg"
                        }`}
                      >
                        {t(o.labelKey)}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}

            {wizardStep === 2 ? (
              <motion.div
                key="w2"
                initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
                transition={stepTransition}
                className="space-y-4"
              >
                <h2 className="font-sans text-base font-bold text-fg">
                  {t("landing.wizardQ3Title")}
                </h2>
                <p className="text-sm text-fg-secondary">{t("landing.wizardQ3Hint")}</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {BAND_OPTIONS.map((o) => {
                    const on = bandId === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          setBandId(o.id);
                          setWizardError(null);
                        }}
                        className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition-[background,color,box-shadow] ${
                          on
                            ? "bg-white/[0.14] text-fg shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)]"
                            : "bg-white/[0.04] text-fg-secondary ring-1 ring-white/[0.07] hover:bg-white/[0.07] hover:text-fg"
                        }`}
                      >
                        {t(o.labelKey)}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}

            {wizardStep === 3 ? (
              <motion.div
                key="w3"
                initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
                transition={stepTransition}
                className="space-y-5"
              >
                <div>
                  <h2 className="font-sans text-base font-bold text-fg">
                    {t("landing.wizardNamesTitle")}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
                    {t("landing.wizardNamesHint")}
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {t("landing.wizardSummaryLine3", {
                      band: bandLabel,
                    })}
                  </p>
                </div>
                <ul className="space-y-4">
                  {nameRows.map((row) => (
                    <li
                      key={row.key}
                      className="grid gap-2 rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/[0.06] sm:grid-cols-2"
                    >
                      <label className="block sm:col-span-2">
                        <span className="slice-label">{t("form.name")}</span>
                        <input
                          className="slice-input"
                          value={row.name}
                          onChange={(event) => {
                            const value = event.target.value;
                            setNameRows((prev) =>
                              prev.map((item) =>
                                item.key === row.key ? { ...item, name: value } : item
                              )
                            );
                          }}
                        />
                      </label>
                      <label className="block">
                        <span className="slice-label">{t("form.totalPrice")}</span>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className="slice-input tabular-nums"
                          value={row.totalPrice}
                          onChange={(event) => {
                            const value = event.target.value;
                            setNameRows((prev) =>
                              prev.map((item) =>
                                item.key === row.key
                                  ? { ...item, totalPrice: value }
                                  : item
                              )
                            );
                          }}
                        />
                      </label>
                      <label className="block">
                        <span className="slice-label">{t("form.billingCycle")}</span>
                        <select
                          className="slice-input"
                          value={row.billingCycle}
                          onChange={(event) => {
                            const value = event.target.value === "yearly" ? "yearly" : "monthly";
                            setNameRows((prev) =>
                              prev.map((item) =>
                                item.key === row.key
                                  ? { ...item, billingCycle: value }
                                  : item
                              )
                            );
                          }}
                        >
                          <option value="monthly">{t("form.billingMonthly")}</option>
                          <option value="yearly">{t("form.billingYearly")}</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="slice-label">{t("form.nextPayment")}</span>
                        <input
                          type="date"
                          className="slice-input"
                          value={row.nextPaymentDate}
                          onChange={(event) => {
                            const value = event.target.value;
                            setNameRows((prev) =>
                              prev.map((item) =>
                                item.key === row.key
                                  ? { ...item, nextPaymentDate: value }
                                  : item
                              )
                            );
                          }}
                        />
                      </label>
                      <label className="block">
                        <span className="slice-label">{t("form.category")}</span>
                        <select
                          className="slice-input"
                          value={row.category}
                          onChange={(event) => {
                            const value = event.target.value as SubscriptionCategory;
                            setNameRows((prev) =>
                              prev.map((item) =>
                                item.key === row.key
                                  ? { ...item, category: value }
                                  : item
                              )
                            );
                          }}
                        >
                          {SUBSCRIPTION_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {subscriptionCategoryLabel(category, locale)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </li>
                  ))}
                </ul>
                {nameRows.length < 8 ? (
                  <button
                    type="button"
                    className="text-sm font-semibold text-fg-secondary underline-offset-2 hover:text-fg hover:underline"
                    onClick={() =>
                      setNameRows((prev) => [
                        ...prev,
                        emptyNameRow(crypto.randomUUID(), "Other"),
                      ])
                    }
                  >
                    {t("landing.wizardAddRow")}
                  </button>
                ) : null}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={saving}
                    className="slice-btn-secondary !px-4"
                  >
                    {t("landing.wizardBack")}
                  </button>
                  <button
                    type="button"
                    onClick={saveNames}
                    disabled={saving || (isSignedIn && !ready)}
                    className="slice-btn-primary !px-5"
                  >
                    {isSignedIn
                      ? t("landing.wizardSave")
                      : t("landing.wizardSaveGuest")}
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {wizardStep < 3 ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
            <button
              type="button"
              onClick={goBack}
              disabled={wizardStep === 0}
              className="slice-btn-secondary !px-4 disabled:pointer-events-none disabled:opacity-35"
            >
              {t("landing.wizardBack")}
            </button>
            <button type="button" onClick={goNext} className="slice-btn-primary !px-5">
              {t("landing.wizardNext")}
            </button>
          </div>
        ) : null}

        {wizardError ? (
          <p className="mt-3 text-center text-sm font-medium text-danger" role="alert">
            {wizardError}
          </p>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
