"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { BrandGlyph } from "@/components/subscriptions/brand-glyph";
import { pictogramFor } from "@/lib/subscriptions/pictogram";
import { brandMarkFor } from "@/lib/subscriptions/brand-mark";
import {
  CATALOG_CHECKED,
  CATALOG_GROUPS,
  CATALOG_REGIONS,
  buildCatalogCharge,
  catalogCopy,
  catalogService,
  serviceLabel,
  defaultCatalogRegion,
  defaultNextChargeDate,
  findPlan,
  fromPlan,
  monthlyPersonalShare,
  parseMoney,
  plansFor,
  serviceMatches,
  servicesForRegion,
  suggestedPlan,
  type CatalogCycle,
  type CatalogGroup,
  type CatalogPlan,
  type CatalogRegion,
  type CatalogService,
} from "@/lib/subscriptions/catalog";
import type { SliceMessageKey } from "@/lib/i18n/messages";
import { sliceNumberLocale } from "@/lib/i18n/locale";
import { useSliceT } from "@/lib/i18n/use-slice-t";
import { useSubscriptions } from "@/components/providers/subscriptions-provider";
import { formatCurrency } from "@/lib/utils/currency";
import type { SubscriptionFormInput } from "@/lib/validation/subscription";

type Step = "pick" | "plan" | "saved";

type PickItem = {
  key: string;
  serviceId: string | null;
  customName: string;
};

type Draft = {
  planId: string | null;
  cycle: CatalogCycle;
  listed: boolean;
  amount: string;
  shared: boolean;
  people: string;
  date: string;
};

const GROUP_LABEL: Record<CatalogGroup, SliceMessageKey> = {
  streaming: "guided.group.streaming",
  music: "guided.group.music",
  cloud: "guided.group.cloud",
  ai: "guided.group.ai",
  play: "guided.group.play",
  home: "guided.group.home",
};

const REGION_LABEL: Record<CatalogRegion, SliceMessageKey> = {
  BE: "guided.region.BE",
  NL: "guided.region.NL",
  FR: "guided.region.FR",
  DE: "guided.region.DE",
  GB: "guided.region.GB",
  US: "guided.region.US",
};

function initDraft(item: PickItem, region: CatalogRegion, date: string): Draft {
  const service = item.serviceId ? catalogService(item.serviceId) : undefined;
  const suggested = service ? suggestedPlan(service, region) : null;
  if (!suggested) {
    return {
      planId: null,
      cycle: "monthly",
      listed: false,
      amount: "",
      shared: false,
      people: "2",
      date,
    };
  }
  return {
    planId: suggested.id,
    cycle: suggested.cycle,
    listed: true,
    amount: String(suggested.amount),
    shared: false,
    people: String(suggested.household ?? 2),
    date,
  };
}

function itemName(item: PickItem, locale: "en" | "nl"): string {
  if (item.serviceId) {
    const service = catalogService(item.serviceId);
    return service ? serviceLabel(service, locale) : item.customName;
  }
  return item.customName;
}

function chargeFrom(
  item: PickItem,
  draft: Draft,
  region: CatalogRegion,
  locale: "en" | "nl"
): SubscriptionFormInput | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) return null;
  const typed = draft.listed ? null : parseMoney(draft.amount);
  if (!draft.listed && typed == null) return null;
  const people = Number(draft.people);
  return buildCatalogCharge({
    serviceId: item.serviceId,
    customName: item.customName,
    region,
    locale,
    planId: draft.planId,
    cycle: draft.cycle,
    listed: draft.listed,
    amount: typed ?? 1,
    shared: draft.shared,
    shareCount: draft.shared ? people : null,
    nextPaymentDate: draft.date,
  });
}

function pressable(on: boolean) {
  return `rounded-xl border px-3 py-3 text-left transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] motion-reduce:transform-none ${
    on
      ? "border-accent bg-white/[0.06] text-fg"
      : "border-white/10 text-fg-secondary hover:bg-white/[0.04] hover:text-fg"
  }`;
}

export function GuidedAddDialog({
  open,
  onClose,
  onSubmit,
  onFullForm,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: SubscriptionFormInput) => void;
  onFullForm: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { t, locale } = useSliceT();
  const { preferences, subscriptions } = useSubscriptions();
  const currency = (preferences.currency ?? "EUR").slice(0, 3).toUpperCase();
  const numberLocale = sliceNumberLocale(locale);

  const [step, setStep] = useState<Step>("pick");
  const [region, setRegion] = useState<CatalogRegion>("BE");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PickItem[]>([]);
  const [queue, setQueue] = useState<PickItem[]>([]);
  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [saved, setSaved] = useState<SubscriptionFormInput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [chargeDate, setChargeDate] = useState(defaultNextChargeDate);
  const submitted = useRef(new Set<string>());

  function reset() {
    setStep("pick");
    setRegion(defaultCatalogRegion(currency));
    setQuery("");
    setSelected([]);
    setQueue([]);
    setIndex(0);
    setDrafts({});
    setSaved([]);
    setError(null);
    setCustomName("");
    setChargeDate(defaultNextChargeDate());
    submitted.current = new Set();
  }

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [open]);

  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current) reset();
    wasOpen.current = open;
  }, [open, currency]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    el.addEventListener("cancel", onCancel);
    return () => el.removeEventListener("cancel", onCancel);
  }, [onClose]);

  const checkedLabel = new Intl.DateTimeFormat(numberLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${CATALOG_CHECKED}T12:00:00`));

  const visible = servicesForRegion(region).filter((service) =>
    serviceMatches(service, query)
  );
  const current = queue[index] ?? null;
  const currentService = current?.serviceId
    ? catalogService(current.serviceId)
    : undefined;
  const currentDraft = current
    ? drafts[current.key] ?? initDraft(current, region, chargeDate)
    : null;

  function owned(service: CatalogService) {
    return subscriptions.some((row) => {
      if (service.iconKey && row.iconKey === service.iconKey) return true;
      const labels = [service.name, serviceLabel(service, "en"), serviceLabel(service, "nl")].map(
        (value) => value.toLowerCase()
      );
      return labels.includes(row.name.toLowerCase()) || labels.includes(row.provider.toLowerCase());
    });
  }

  function patchDraft(key: string, patch: Partial<Draft>, base: Draft) {
    setDrafts((prev) => ({ ...prev, [key]: { ...base, ...prev[key], ...patch } }));
  }

  function toggleService(service: CatalogService) {
    setError(null);
    setSelected((prev) => {
      const exists = prev.some((item) => item.serviceId === service.id);
      if (exists) return prev.filter((item) => item.serviceId !== service.id);
      return [...prev, { key: service.id, serviceId: service.id, customName: "" }];
    });
  }

  function chooseRegion(next: CatalogRegion) {
    setRegion(next);
    setDrafts({});
    setError(null);
    setSelected((prev) =>
      prev.filter((item) => {
        if (!item.serviceId) return true;
        const service = catalogService(item.serviceId);
        return Boolean(service && (!service.only || service.only.includes(next)));
      })
    );
  }

  function addCustom() {
    const name = customName.trim();
    if (!name) {
      setError(t("guided.nameError"));
      return;
    }
    setSelected((prev) => [
      ...prev,
      { key: `custom:${crypto.randomUUID()}`, serviceId: null, customName: name },
    ]);
    setCustomName("");
    setError(null);
  }

  function startPlans() {
    if (selected.length === 0) return;
    setQueue(selected);
    setIndex(0);
    setError(null);
    setStep("plan");
  }

  function remember(built: SubscriptionFormInput[], stay: PickItem[]) {
    for (const row of built) onSubmit(row);
    const nextSaved = [...saved, ...built];
    setSaved(nextSaved);
    setQueue(stay);
    setSelected(stay);
    setError(null);
    if (stay.length === 0) {
      setStep("saved");
      setIndex(0);
      return;
    }
    setIndex(0);
  }

  function confirmCurrent() {
    if (!current || !currentDraft || submitted.current.has(current.key)) return;
    const built = chargeFrom(current, currentDraft, region, locale);
    if (!built) {
      const people = Number(currentDraft.people);
      setError(
        currentDraft.shared && (!Number.isFinite(people) || people < 2)
          ? t("guided.peopleError")
          : !/^\d{4}-\d{2}-\d{2}$/.test(currentDraft.date)
            ? t("guided.dateError")
            : t("guided.needAmount")
      );
      return;
    }
    submitted.current.add(current.key);
    const stay = queue.filter((item) => item.key !== current.key);
    const nextIndex = Math.min(index, Math.max(stay.length - 1, 0));
    onSubmit(built);
    setSaved((prev) => [...prev, built]);
    setQueue(stay);
    setSelected(stay);
    setError(null);
    if (stay.length === 0) {
      setStep("saved");
      setIndex(0);
      return;
    }
    setIndex(nextIndex);
  }

  function addRest() {
    const built: SubscriptionFormInput[] = [];
    const stay: PickItem[] = [];
    for (const item of queue) {
      if (submitted.current.has(item.key)) continue;
      const draft = drafts[item.key] ?? initDraft(item, region, chargeDate);
      const row = chargeFrom(item, draft, region, locale);
      if (row) {
        submitted.current.add(item.key);
        built.push(row);
      } else stay.push(item);
    }
    if (built.length === 0) {
      setError(t("guided.needAmount"));
      return;
    }
    remember(built, stay);
  }

  function leaveOut() {
    if (!current) return;
    const stay = queue.filter((item) => item.key !== current.key);
    setQueue(stay);
    setSelected(stay);
    setError(null);
    if (stay.length === 0) {
      setStep(saved.length > 0 ? "saved" : "pick");
      setIndex(0);
      return;
    }
    setIndex(Math.min(index, stay.length - 1));
  }

  const title =
    step === "saved"
      ? saved.length === 1
        ? t("guided.saved", { name: saved[0]?.name ?? "" })
        : t("guided.savedMany", { count: saved.length })
      : step === "plan"
        ? itemName(
            current ?? { key: "", serviceId: null, customName: "" },
            locale
          )
        : t("guided.pickTitle");

  const savedTotal = saved.reduce((sum, row) => {
    const cycle = row.billingCycle === "yearly" ? "yearly" : "monthly";
    const share = monthlyPersonalShare(
      row.totalPrice,
      cycle,
      row.shared,
      row.shareCount ?? null
    );
    return sum + Math.round(share * 100);
  }, 0);
  const savedCurrency = saved[0]?.currency ?? "EUR";

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 h-[min(92dvh,48rem)] w-[min(100%-1.5rem,68rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface p-0 text-fg open:flex"
      aria-labelledby="guided-add-title"
    >
      <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5 sm:px-6">
        <div className="min-w-0">
          <h2
            id="guided-add-title"
            className="text-2xl font-semibold tracking-tight text-fg"
          >
            {title}
          </h2>
          {step === "pick" ? (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg-secondary">
              {t("guided.pickHint")}
            </p>
          ) : null}
          {step === "plan" ? (
            <p className="mt-2 text-sm text-fg-secondary">
              {t("guided.stillOpen", { count: queue.length })}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className="border border-transparent p-1.5 text-muted hover:text-fg"
          aria-label={t("form.closeAria")}
          onClick={onClose}
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      {step === "pick" ? (
        <PickStep
          region={region}
          query={query}
          selected={selected}
          visible={visible}
          customName={customName}
          error={error}
          numberLocale={numberLocale}
          owned={owned}
          onRegion={chooseRegion}
          onQuery={setQuery}
          onToggle={toggleService}
          onCustomName={setCustomName}
          onAddCustom={addCustom}
          onRemove={(key) =>
            setSelected((prev) => prev.filter((item) => item.key !== key))
          }
          t={t}
          locale={locale}
        />
      ) : null}

      {step === "plan" && current && currentDraft ? (
        <PlanStep
          queue={queue}
          index={index}
          service={currentService}
          draft={currentDraft}
          region={region}
          checkedLabel={checkedLabel}
          numberLocale={numberLocale}
          error={error}
          onJump={setIndex}
          onDraft={(patch) => patchDraft(current.key, patch, currentDraft)}
          t={t}
          locale={locale}
        />
      ) : null}

      {step === "saved" ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {saved.length > 0 &&
          saved.every((row) => row.currency === savedCurrency) ? (
            <p className="text-2xl font-semibold tabular-nums text-fg">
              {t("guided.savedTotal", {
                amount: formatCurrency(savedTotal / 100, savedCurrency, numberLocale),
              })}
            </p>
          ) : null}
          <p className="mt-2 max-w-xl text-sm text-fg-secondary">
            {t("guided.savedHint")}
          </p>
          <ul className="mt-5 space-y-3">
            {saved.map((row, rowIndex) => (
              <li key={`${row.name}-${rowIndex}`} className="flex items-baseline justify-between gap-4">
                <span className="min-w-0">
                  <span className="block font-medium text-fg">{row.name}</span>
                  {row.notes ? (
                    <span className="block text-sm text-fg-secondary">{row.notes}</span>
                  ) : null}
                </span>
                <span className="shrink-0 tabular-nums text-fg">
                  {formatCurrency(row.totalPrice, row.currency, numberLocale)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-auto flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4 sm:px-6">
        {step === "pick" ? (
          <button
            type="button"
            className="text-sm text-fg-secondary underline-offset-2 hover:text-fg hover:underline"
            onClick={onFullForm}
          >
            {t("guided.fullForm")}
          </button>
        ) : step === "plan" ? (
          <button
            type="button"
            className="slice-btn-secondary"
            onClick={() => {
              setError(null);
              setStep("pick");
            }}
          >
            {t("guided.backToList")}
          </button>
        ) : (
          <button type="button" className="slice-btn-secondary" onClick={reset}>
            {t("guided.more")}
          </button>
        )}

        {step === "pick" ? (
          <div className="flex items-center gap-3">
            <p className="text-sm tabular-nums text-fg-secondary">
              {t("guided.selectedCount", { count: selected.length })}
            </p>
            <button
              type="button"
              className="slice-btn-primary"
              disabled={selected.length === 0}
              onClick={startPlans}
            >
              {t("guided.choosePlans")}
            </button>
          </div>
        ) : null}

        {step === "plan" ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button type="button" className="slice-btn-secondary" onClick={leaveOut}>
              {t("guided.leaveOut")}
            </button>
            {queue.length > 1 ? (
              <button type="button" className="slice-btn-secondary" onClick={addRest}>
                {t("guided.addRest")}
              </button>
            ) : null}
            <button type="button" className="slice-btn-primary" onClick={confirmCurrent}>
              {t("guided.thisOne")}
            </button>
          </div>
        ) : null}

        {step === "saved" ? (
          <button type="button" className="slice-btn-primary" onClick={onClose}>
            {t("guided.done")}
          </button>
        ) : null}
      </div>
    </dialog>
  );
}

function PickStep({
  region,
  query,
  selected,
  visible,
  customName,
  error,
  numberLocale,
  owned,
  onRegion,
  onQuery,
  onToggle,
  onCustomName,
  onAddCustom,
  onRemove,
  t,
  locale,
}: {
  region: CatalogRegion;
  query: string;
  selected: PickItem[];
  visible: CatalogService[];
  customName: string;
  error: string | null;
  numberLocale: string;
  owned: (service: CatalogService) => boolean;
  onRegion: (region: CatalogRegion) => void;
  onQuery: (value: string) => void;
  onToggle: (service: CatalogService) => void;
  onCustomName: (value: string) => void;
  onAddCustom: () => void;
  onRemove: (key: string) => void;
  t: (key: SliceMessageKey, vars?: Record<string, string | number>) => string;
  locale: "en" | "nl";
}) {
  const customs = selected.filter((item) => item.serviceId == null);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={t("guided.regionAria")}
      >
        {CATALOG_REGIONS.map((code) => (
          <button
            key={code}
            type="button"
            aria-pressed={region === code}
            className={`min-h-11 rounded-full px-3 text-sm font-medium ${
              region === code
                ? "bg-white/10 text-fg"
                : "text-fg-secondary hover:text-fg"
            }`}
            onClick={() => onRegion(code)}
          >
            {t(REGION_LABEL[code])}
          </button>
        ))}
      </div>

      <label className="mt-4 block max-w-sm">
        <span className="sr-only">{t("guided.search")}</span>
        <input
          type="search"
          className="slice-input"
          placeholder={t("guided.searchPlaceholder")}
          value={query}
          onChange={(event) => onQuery(event.target.value)}
        />
      </label>

      {visible.length === 0 ? (
        <p className="mt-6 text-sm text-fg-secondary">{t("guided.emptySearch")}</p>
      ) : (
        CATALOG_GROUPS.map((group) => {
          const rows = visible.filter((service) => service.group === group);
          if (rows.length === 0) return null;
          return (
            <section key={group} className="mt-6">
              <h3 className="text-base font-semibold text-fg">{t(GROUP_LABEL[group])}</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {rows.map((service) => {
                  const on = selected.some((item) => item.serviceId === service.id);
                  const from = fromPlan(service, region);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      aria-pressed={on}
                      className={`relative flex min-h-24 items-center gap-3 rounded-xl border px-3 py-3 text-left transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] motion-reduce:transform-none ${
                        on
                          ? "border-accent bg-white/[0.06]"
                          : "border-white/10 hover:bg-white/[0.04]"
                      }`}
                      onClick={() => onToggle(service)}
                    >
                      {on ? (
                        <Check
                          className="absolute right-2 top-2 size-4 text-accent"
                          aria-hidden
                        />
                      ) : null}
                      <ServiceMark service={service} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-fg">
                          {serviceLabel(service, locale)}
                        </span>
                        <span className="mt-0.5 block truncate text-sm tabular-nums text-fg-secondary">
                          {from
                            ? t("guided.fromPrice", {
                                price: formatCurrency(
                                  from.amount,
                                  from.currency,
                                  numberLocale
                                ),
                              })
                            : t("guided.noPrice")}
                        </span>
                        {owned(service) ? (
                          <span className="mt-0.5 block truncate text-sm text-fg-secondary">
                            {t("guided.owned")}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })
      )}

      <section className="mt-6">
        <h3 className="text-base font-semibold text-fg">{t("guided.otherTitle")}</h3>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="block min-w-48 flex-1">
            <span className="sr-only">{t("guided.otherPlaceholder")}</span>
            <input
              className="slice-input"
              placeholder={t("guided.otherPlaceholder")}
              value={customName}
              onChange={(event) => onCustomName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onAddCustom();
                }
              }}
            />
          </label>
          <button type="button" className="slice-btn-secondary" onClick={onAddCustom}>
            {t("guided.otherAdd")}
          </button>
        </div>
        {customs.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {customs.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  className="rounded-full bg-white/10 px-3 py-2 text-sm text-fg"
                  onClick={() => onRemove(item.key)}
                >
                  {item.customName}
                  <span className="sr-only"> {t("guided.leaveOut")}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-secondary">
          {t("guided.weeklyHint")}
        </p>
      </section>

      {error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PlanStep({
  queue,
  index,
  service,
  draft,
  region,
  checkedLabel,
  numberLocale,
  error,
  onJump,
  onDraft,
  t,
  locale,
}: {
  queue: PickItem[];
  index: number;
  service: CatalogService | undefined;
  draft: Draft;
  region: CatalogRegion;
  checkedLabel: string;
  numberLocale: string;
  error: string | null;
  onJump: (index: number) => void;
  onDraft: (patch: Partial<Draft>) => void;
  t: (key: SliceMessageKey, vars?: Record<string, string | number>) => string;
  locale: "en" | "nl";
}) {
  const allPlans = service ? plansFor(service, region) : [];
  const cyclePlans = allPlans.filter((row) => row.cycle === draft.cycle);
  const yearly = allPlans.some((row) => row.cycle === "yearly");
  const showCycle = !service || allPlans.length === 0 || yearly;
  const chosen =
    service && draft.planId && draft.listed
      ? findPlan(service, region, draft.planId, draft.cycle)
      : undefined;
  const amount = draft.listed && chosen ? chosen.amount : parseMoney(draft.amount);
  const people = Number(draft.people);
  const share =
    amount != null
      ? monthlyPersonalShare(
          amount,
          draft.cycle,
          draft.shared,
          draft.shared ? people : null
        )
      : null;

  function selectPlan(row: CatalogPlan) {
    onDraft({
      planId: row.id,
      cycle: row.cycle,
      listed: true,
      amount: String(row.amount),
      people: row.household ? String(row.household) : draft.people,
    });
  }

  function setCycle(cycle: CatalogCycle) {
    if (!service) {
      onDraft({ cycle, listed: false });
      return;
    }
    const rows = plansFor(service, region, cycle);
    const match =
      rows.find((row) => row.id === draft.planId) ??
      rows.find((row) => row.id === service.suggest) ??
      rows[0];
    if (!match) {
      onDraft({ cycle, listed: false, planId: null });
      return;
    }
    onDraft({
      cycle,
      planId: match.id,
      listed: true,
      amount: String(match.amount),
      people: match.household ? String(match.household) : draft.people,
    });
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        {service ? <ServiceMark service={service} large /> : null}
        <p className="max-w-xl text-sm leading-relaxed text-fg-secondary">
          {allPlans.length > 0
            ? t("guided.planHint", {
                region: t(REGION_LABEL[region]),
                date: checkedLabel,
              })
            : t("guided.noPrice")}
        </p>
      </div>

      {queue.length > 1 ? (
        <div
          className="mt-4 flex gap-2 overflow-x-auto pb-1"
          aria-label={t("guided.queueAria")}
        >
          {queue.map((row, rowIndex) => (
            <button
              key={row.key}
              type="button"
              aria-current={rowIndex === index ? "true" : undefined}
              className={`shrink-0 rounded-full px-3 py-2 text-sm ${
                rowIndex === index
                  ? "bg-white/10 font-medium text-fg"
                  : "text-fg-secondary hover:text-fg"
              }`}
              onClick={() => onJump(rowIndex)}
            >
              {itemName(row, locale)}
            </button>
          ))}
        </div>
      ) : null}

      {showCycle ? (
        <div className="mt-4 grid max-w-sm grid-cols-2 gap-2" role="group">
          <button
            type="button"
            aria-pressed={draft.cycle === "monthly"}
            className={pressable(draft.cycle === "monthly")}
            onClick={() => setCycle("monthly")}
          >
            {t("guided.monthly")}
          </button>
          <button
            type="button"
            aria-pressed={draft.cycle === "yearly"}
            className={pressable(draft.cycle === "yearly")}
            onClick={() => setCycle("yearly")}
          >
            {t("guided.yearly")}
          </button>
        </div>
      ) : null}

      {cyclePlans.length > 0 ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {cyclePlans.map((row) => {
            const on = draft.listed && draft.planId === row.id;
            return (
              <button
                key={`${row.id}-${row.cycle}`}
                type="button"
                aria-pressed={on}
                className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-4 text-left transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.98] motion-reduce:transform-none ${
                  on
                    ? "border-accent bg-white/[0.06]"
                    : "border-white/10 hover:bg-white/[0.04]"
                }`}
                onClick={() => selectPlan(row)}
              >
                <span>
                  <span className="block text-base font-medium text-fg">
                    {catalogCopy(row.name, locale)}
                  </span>
                  <span className="mt-1 block text-sm text-fg-secondary">
                    {catalogCopy(row.detail, locale)}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-lg font-semibold tabular-nums text-fg">
                    {formatCurrency(row.amount, row.currency, numberLocale)}
                  </span>
                  <span className="block text-sm text-fg-secondary">
                    {row.cycle === "yearly" ? t("guided.perYear") : t("guided.perMonth")}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {cyclePlans.length > 0 && draft.listed ? (
        <button
          type="button"
          className="mt-3 text-sm text-fg-secondary underline-offset-2 hover:text-fg hover:underline"
          onClick={() => onDraft({ listed: false })}
        >
          {t("guided.customAmount")}
        </button>
      ) : null}

      {cyclePlans.length === 0 || !draft.listed ? (
        <label className="mt-4 block max-w-xs">
          <span className="text-sm font-medium text-fg">{t("guided.yourAmount")}</span>
          <input
            type="text"
            inputMode="decimal"
            className="slice-input text-lg tabular-nums"
            value={draft.amount}
            onChange={(event) =>
              onDraft({ amount: event.target.value, listed: false, planId: draft.planId })
            }
          />
          {cyclePlans.length > 0 ? (
            <button
              type="button"
              className="mt-2 text-sm text-fg-secondary underline-offset-2 hover:text-fg hover:underline"
              onClick={() => {
                const back = cyclePlans.find((row) => row.id === draft.planId) ?? cyclePlans[0];
                if (back) selectPlan(back);
              }}
            >
              {t("guided.useListed")}
            </button>
          ) : null}
        </label>
      ) : null}

      <div className="mt-6 max-w-md">
        <p className="text-sm font-medium text-fg">{t("guided.sharedTitle")}</p>
        {chosen?.household ? (
          <p className="mt-1 text-sm text-fg-secondary">
            {t("guided.household", { count: chosen.household })}
          </p>
        ) : null}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            aria-pressed={!draft.shared}
            className={pressable(!draft.shared)}
            onClick={() => onDraft({ shared: false })}
          >
            {t("guided.onlyMe")}
          </button>
          <button
            type="button"
            aria-pressed={draft.shared}
            className={pressable(draft.shared)}
            onClick={() => onDraft({ shared: true })}
          >
            {t("guided.yes")}
          </button>
        </div>
        {draft.shared ? (
          <label className="mt-3 block">
            <span className="text-sm font-medium text-fg">{t("guided.peopleLabel")}</span>
            <input
              type="number"
              min={2}
              step={1}
              className="slice-input tabular-nums"
              value={draft.people}
              onChange={(event) => onDraft({ people: event.target.value })}
            />
          </label>
        ) : null}
        {share != null && amount != null ? (
          <p className="mt-3 text-sm tabular-nums text-fg">
            {t("guided.yourShare", {
              amount: formatCurrency(
                share,
                chosen?.currency ?? (region === "GB" ? "GBP" : region === "US" ? "USD" : "EUR"),
                numberLocale
              ),
            })}
          </p>
        ) : null}
      </div>

      <label className="mt-6 block max-w-xs">
        <span className="text-sm font-medium text-fg">{t("guided.dateTitle")}</span>
        <span className="mt-1 block text-sm text-fg-secondary">{t("guided.dateHint")}</span>
        <input
          type="date"
          className="slice-input tabular-nums"
          value={draft.date}
          onChange={(event) => onDraft({ date: event.target.value })}
        />
      </label>

      {queue.length > 1 ? (
        <p className="mt-4 max-w-xl text-sm text-fg-secondary">{t("guided.addRestHint")}</p>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ServiceMark({
  service,
  large = false,
}: {
  service: CatalogService;
  large?: boolean;
}) {
  const mark = brandMarkFor({ iconKey: service.iconKey, name: service.name });
  const Pictogram = mark
    ? null
    : pictogramFor({ iconKey: service.iconKey, name: service.name });
  const box = large ? "size-12" : "size-10";
  if (mark) {
    return (
      <span className={`grid ${box} shrink-0 place-content-center`} aria-hidden>
        <BrandGlyph mark={mark} className={large ? "size-10" : "size-8"} />
      </span>
    );
  }
  if (Pictogram) {
    return (
      <span
        className={`grid ${box} shrink-0 place-content-center rounded-lg`}
        style={{ background: service.tile, color: service.ink }}
        aria-hidden
      >
        <Pictogram className={large ? "size-6" : "size-5"} strokeWidth={2.25} />
      </span>
    );
  }
  return (
    <span
      className={`grid ${box} shrink-0 place-content-center rounded-lg font-semibold leading-none ${
        service.letters.length > 2 ? "text-[10px] tracking-tight" : "text-sm"
      }`}
      style={{ background: service.tile, color: service.ink }}
      aria-hidden
    >
      {service.letters}
    </span>
  );
}
