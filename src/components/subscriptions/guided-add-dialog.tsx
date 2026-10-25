"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { formatCalendarDate } from "@/lib/subscriptions/calculations";
import {
  GUIDED_SERVICE_IDS,
  buildGuidedSubscription,
  guidedQuestionCount,
  type GuidedServiceId,
} from "@/lib/subscriptions/guided-add";
import type { SliceMessageKey } from "@/lib/i18n/messages";
import { useSliceT } from "@/lib/i18n/use-slice-t";
import { useSubscriptions } from "@/components/providers/subscriptions-provider";
import type { SubscriptionFormInput } from "@/lib/validation/subscription";

type Step = "service" | "name" | "price" | "date" | "share" | "saved";

const SERVICE_LABEL: Record<GuidedServiceId, SliceMessageKey> = {
  netflix: "guided.service.netflix",
  spotify: "guided.service.spotify",
  disney: "guided.service.disney",
  youtube: "guided.service.youtube",
  prime: "guided.service.prime",
  icloud: "guided.service.icloud",
  fitness: "guided.service.fitness",
  mobile: "guided.service.mobile",
  chatgpt: "guided.service.chatgpt",
  other: "guided.service.other",
};

function choiceClass(pressed: boolean) {
  return `rounded-xl border px-3 py-3 text-left text-sm font-medium ${
    pressed
      ? "border-white/20 bg-white/10 text-fg"
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
  const { t } = useSliceT();
  const { preferences } = useSubscriptions();
  const currency = (preferences.currency ?? "EUR").slice(0, 3).toUpperCase();

  const [step, setStep] = useState<Step>("service");
  const [serviceId, setServiceId] = useState<GuidedServiceId | null>(null);
  const [name, setName] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");
  const [shared, setShared] = useState<boolean | null>(null);
  const [people, setPeople] = useState("2");
  const [error, setError] = useState<string | null>(null);
  const [savedName, setSavedName] = useState("");

  function reset() {
    setStep("service");
    setServiceId(null);
    setName("");
    setBillingCycle("monthly");
    setPrice("");
    setDate(formatCalendarDate(new Date()));
    setShared(null);
    setPeople("2");
    setError(null);
    setSavedName("");
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
  }, [open]);

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

  const resolvedName =
    serviceId && serviceId !== "other" ? t(SERVICE_LABEL[serviceId]) : name.trim();

  const total = serviceId ? guidedQuestionCount(serviceId) : 4;
  const current =
    step === "service"
      ? 1
      : step === "name"
        ? 2
        : step === "price"
          ? serviceId === "other"
            ? 3
            : 2
          : step === "date"
            ? serviceId === "other"
              ? 4
              : 3
            : step === "share"
              ? total
              : total;

  function goNextFromService() {
    if (!serviceId) return;
    setError(null);
    setStep(serviceId === "other" ? "name" : "price");
  }

  function goNextFromName() {
    if (name.trim().length === 0) {
      setError(t("guided.nameError"));
      return;
    }
    setError(null);
    setStep("price");
  }

  function goNextFromPrice() {
    const amount = Number(price);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError(t("guided.priceError"));
      return;
    }
    setError(null);
    setStep("date");
  }

  function goNextFromDate() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    setError(null);
    setStep("share");
  }

  function save() {
    if (!serviceId || shared == null) return;
    const amount = Number(price);
    const count = Number(people);
    const built = buildGuidedSubscription({
      serviceId,
      name: resolvedName,
      billingCycle,
      totalPrice: amount,
      nextPaymentDate: date,
      shared,
      shareCount: shared ? count : null,
      currency,
    });
    if (!built) {
      setError(shared ? t("guided.peopleError") : t("guided.priceError"));
      return;
    }
    onSubmit(built);
    setSavedName(built.name);
    setError(null);
    setStep("saved");
  }

  function back() {
    setError(null);
    if (step === "name") setStep("service");
    else if (step === "price") setStep(serviceId === "other" ? "name" : "service");
    else if (step === "date") setStep("price");
    else if (step === "share") setStep("date");
  }

  const title =
    step === "saved"
      ? t("guided.saved", { name: savedName })
      : step === "service"
        ? t("guided.which")
        : step === "name"
          ? t("guided.nameTitle")
          : step === "price"
            ? t("guided.priceTitle")
            : step === "date"
              ? t("guided.dateTitle")
              : t("guided.sharedTitle");

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 w-[min(100%-1.5rem,36rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-surface p-0 text-fg"
      aria-labelledby="guided-add-title"
    >
      <div className="max-h-[85vh] overflow-y-auto p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="guided-add-title"
              className="text-xl font-semibold tracking-tight text-fg"
            >
              {title}
            </h2>
            {step !== "saved" ? (
              <p className="mt-1 text-sm text-muted">
                {t("guided.progress", { current, total })}
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

        {step === "service" ? (
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {GUIDED_SERVICE_IDS.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={serviceId === id}
                className={choiceClass(serviceId === id)}
                onClick={() => setServiceId(id)}
              >
                {t(SERVICE_LABEL[id])}
              </button>
            ))}
          </div>
        ) : null}

        {step === "name" ? (
          <label className="mt-5 block">
            <span className="sr-only">{t("guided.nameTitle")}</span>
            <input
              className="slice-input"
              value={name}
              autoFocus
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        ) : null}

        {step === "price" ? (
          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-2 gap-2" role="group">
              <button
                type="button"
                aria-pressed={billingCycle === "monthly"}
                className={choiceClass(billingCycle === "monthly")}
                onClick={() => setBillingCycle("monthly")}
              >
                {t("guided.monthly")}
              </button>
              <button
                type="button"
                aria-pressed={billingCycle === "yearly"}
                className={choiceClass(billingCycle === "yearly")}
              onClick={() => setBillingCycle("yearly")}
              >
                {t("guided.yearly")}
              </button>
            </div>
            <input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              className="slice-input tabular-nums"
              value={price}
              autoFocus
              aria-label={t("guided.priceTitle")}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
        ) : null}

        {step === "date" ? (
          <label className="mt-5 block">
            <span className="sr-only">{t("guided.dateTitle")}</span>
            <input
              type="date"
              className="slice-input tabular-nums"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
        ) : null}

        {step === "share" ? (
          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={shared === false}
                className={choiceClass(shared === false)}
                onClick={() => setShared(false)}
              >
                {t("guided.onlyMe")}
              </button>
              <button
                type="button"
                aria-pressed={shared === true}
                className={choiceClass(shared === true)}
                onClick={() => setShared(true)}
              >
                {t("guided.yes")}
              </button>
            </div>
            {shared ? (
              <label className="block">
                <span className="slice-label">{t("guided.peopleLabel")}</span>
                <input
                  type="number"
                  min={2}
                  step={1}
                  className="slice-input tabular-nums"
                  value={people}
                  onChange={(event) => setPeople(event.target.value)}
                />
              </label>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          {step === "service" ? (
            <button
              type="button"
              className="text-sm text-muted underline-offset-2 hover:text-fg hover:underline"
              onClick={onFullForm}
            >
              {t("guided.fullForm")}
            </button>
          ) : step !== "saved" ? (
            <button type="button" className="slice-btn-secondary" onClick={back}>
              {t("guided.back")}
            </button>
          ) : (
            <span />
          )}

          {step === "service" ? (
            <button
              type="button"
              className="slice-btn-primary"
              disabled={serviceId == null}
              onClick={goNextFromService}
            >
              {t("guided.next")}
            </button>
          ) : null}
          {step === "name" ? (
            <button type="button" className="slice-btn-primary" onClick={goNextFromName}>
              {t("guided.next")}
            </button>
          ) : null}
          {step === "price" ? (
            <button type="button" className="slice-btn-primary" onClick={goNextFromPrice}>
              {t("guided.next")}
            </button>
          ) : null}
          {step === "date" ? (
            <button type="button" className="slice-btn-primary" onClick={goNextFromDate}>
              {t("guided.next")}
            </button>
          ) : null}
          {step === "share" ? (
            <button
              type="button"
              className="slice-btn-primary"
              disabled={shared == null}
              onClick={save}
            >
              {t("guided.save")}
            </button>
          ) : null}
          {step === "saved" ? (
            <div className="flex gap-2">
              <button type="button" className="slice-btn-secondary" onClick={reset}>
                {t("guided.another")}
              </button>
              <button type="button" className="slice-btn-primary" onClick={onClose}>
                {t("guided.done")}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
