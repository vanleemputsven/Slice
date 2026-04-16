"use client";

import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { Loader2 } from "lucide-react";
import { HEADER_CONTROL_SHELL } from "@/components/layout/header-controls";
import { AuthBootSkeleton } from "@/components/skeleton/auth-skeleton";
import type { AppLocale } from "@/lib/i18n/locale";
import { sliceT, type SliceMessageKey } from "@/lib/i18n/messages";
import {
  welcomeCurrencyCodes,
  welcomeProfileFormSchema,
  type WelcomeCurrencyCode,
  type WelcomeProfileFormFieldValues,
} from "@/lib/validation/welcome-profile";

import { completeWelcomeProfile, skipWelcomeProfile } from "./actions";

const LOGIN_LOCALE_KEY = "slice-login-locale";
const WELCOME_STEPS = 3;

function readLoginLocale(): AppLocale {
  if (typeof window === "undefined") return "en";
  try {
    const s = sessionStorage.getItem(LOGIN_LOCALE_KEY);
    if (s === "nl" || s === "en") return s;
  } catch {
    /* ignore */
  }
  return "en";
}

type WelcomeFormProps = {
  nextPath: string;
  initialLocale: AppLocale;
  initialCurrency: WelcomeCurrencyCode;
  initialPreferredName: string;
};

const storyBody = "text-base leading-[1.8] text-fg-secondary sm:text-[1.0625rem] sm:leading-[1.78]";

/** Soft line above actions so the bar reads as one piece. */
const welcomeFooterEdge =
  "mt-10 border-t border-white/[0.07] pt-8";

/** Only primary — right aligned (Volgende / slot 1). */
const welcomeFooterSolo = `${welcomeFooterEdge} flex w-full justify-end`;

/** Terug links, primaire actie rechts — zelfde basislijn. */
const welcomeFooterPair = `${welcomeFooterEdge} flex w-full flex-row flex-wrap items-center justify-between gap-x-4 gap-y-3`;

/** Houdt coral-knop op dezelfde rechterpositie als bij de taalstap. */
const welcomePrimarySlot =
  "flex min-w-0 flex-1 justify-end sm:shrink-0";

const welcomePrimaryBtn =
  "slice-btn-primary min-h-[2.75rem] w-full max-w-md justify-center sm:w-auto sm:min-w-[12rem] disabled:pointer-events-none disabled:opacity-60";

const welcomeBackBtn =
  "slice-btn-secondary min-h-[2.75rem] shrink-0 justify-center px-5 sm:min-w-[10rem] disabled:pointer-events-none disabled:opacity-60";

/** Vertical rhythm between warmup / story blocks / footer — every step uses this. */
const welcomeStepStack = "space-y-10 sm:space-y-12";

/** Optional opening paragraphs only on step 1 (language); same spacing everywhere it appears. */
const welcomeWarmupProse = "space-y-8";

/** Hint / secondary line under a control. */
const welcomeHint = "text-sm leading-relaxed text-muted";

/**
 * Every question: lead copy, then this slot (controls + hints). Keeps layout identical per step.
 */
function WelcomeControlSlot({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex max-w-md flex-col gap-3">{children}</div>
  );
}

function StorySection({
  children,
  reduceMotion,
}: {
  children: ReactNode;
  reduceMotion: boolean | null;
}) {
  return (
    <section className="relative border-l-2 border-accent/35 pl-5 sm:pl-6">
      <motion.div
        initial={
          reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.4, ease: [0.26, 0.08, 0.25, 1] }
        }
      >
        {children}
      </motion.div>
    </section>
  );
}

export function WelcomeForm({
  nextPath,
  initialLocale,
  initialCurrency,
  initialPreferredName,
}: WelcomeFormProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [locale, setLocale] = useState<AppLocale>(initialLocale);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState<"save" | "skip" | null>(null);
  const [rootError, setRootError] = useState<string | null>(null);

  const t = useCallback(
    (key: SliceMessageKey, vars?: Record<string, string | number>) =>
      sliceT(locale, key, vars),
    [locale]
  );

  /* eslint-disable react-hooks/set-state-in-effect -- mirror login: sessionStorage locale vs server default */
  useLayoutEffect(() => {
    const stored = readLoginLocale();
    setLocale(stored !== initialLocale ? stored : initialLocale);
    setMounted(true);
  }, [initialLocale]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale === "nl" ? "nl" : "en";
  }, [locale]);

  const setUiLocale = useCallback((next: AppLocale) => {
    setLocale(next);
    try {
      sessionStorage.setItem(LOGIN_LOCALE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const form = useForm<WelcomeProfileFormFieldValues>({
    resolver: zodResolver(welcomeProfileFormSchema),
    defaultValues: {
      preferredName: initialPreferredName,
      locale: initialLocale,
      currency: initialCurrency,
    },
  });

  useEffect(() => {
    form.setValue("locale", locale);
  }, [locale, form]);

  const rm = reduceMotion ?? false;

  const introTransition = rm
    ? { duration: 0.2 }
    : { duration: 0.45, ease: [0.26, 0.08, 0.25, 1] as const };

  const stepMotion = rm
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: 28 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
      };

  const onSave = form.handleSubmit(async (values) => {
    setRootError(null);
    setSubmitting("save");
    try {
      const result = await completeWelcomeProfile(values);
      if (!result.ok) {
        setRootError(t("welcome.errorSave"));
        setSubmitting(null);
        return;
      }
      router.refresh();
      router.push(nextPath);
    } catch {
      setRootError(t("welcome.errorSave"));
      setSubmitting(null);
    }
  });

  async function onSkip() {
    setRootError(null);
    setSubmitting("skip");
    try {
      const result = await skipWelcomeProfile();
      if (!result.ok) {
        setRootError(t("welcome.errorSave"));
        setSubmitting(null);
        return;
      }
      router.refresh();
      router.push(nextPath);
    } catch {
      setRootError(t("welcome.errorSave"));
      setSubmitting(null);
    }
  }

  async function goNextFromNameStep() {
    setRootError(null);
    const ok = await form.trigger("preferredName");
    if (!ok) return;
    setStep(2);
  }

  const nameErr = form.formState.errors.preferredName?.message;
  const nameMessage = useMemo(() => {
    if (nameErr === "max_name") return t("welcome.nameTooLong");
    if (typeof nameErr === "string" && nameErr.length > 0) return nameErr;
    return null;
  }, [nameErr, t]);

  if (!mounted) {
    return <AuthBootSkeleton />;
  }

  const progressDots = (
    <ol
      className="mb-10 flex items-center justify-center gap-2 sm:mb-12"
      aria-label={t("welcome.stepProgressAria")}
    >
      {Array.from({ length: WELCOME_STEPS }, (_, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <li key={i} className="list-none">
            <span
              className={`block h-1.5 rounded-full transition-[width,background] duration-300 ease-out ${
                active
                  ? "w-9 bg-accent-bright"
                  : done
                    ? "w-1.5 bg-accent/55"
                    : "w-1.5 bg-white/14"
              }`}
              aria-current={active ? "step" : undefined}
            />
          </li>
        );
      })}
    </ol>
  );

  return (
    <motion.div
      className="relative min-h-screen overflow-x-hidden px-4 pb-20 pt-14 text-fg sm:pb-24 sm:pt-16"
      initial={rm ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={introTransition}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle at center, rgb(255 255 255 / 0.055) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 78% 65% at 50% 14%, black, transparent)",
        }}
      />

      <div
        className="absolute right-3 top-3 z-20 sm:right-5 sm:top-5"
        role="group"
        aria-label={t("language.toggleAria")}
      >
        <div
          className={`relative inline-flex min-h-0 ${HEADER_CONTROL_SHELL} py-0.5 pl-0.5 pr-0.5`}
        >
          <span
            className="pointer-events-none absolute inset-y-1 w-[calc(50%-5px)] rounded-full bg-white/12 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] transition-[left] duration-200 ease-out"
            style={{
              left: locale === "nl" ? "4px" : "calc(50% + 2px)",
            }}
            aria-hidden
          />
          <button
            type="button"
            className={`relative z-[1] flex min-w-[2.75rem] items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition-[color] ${
              locale === "nl" ? "text-fg" : "text-fg-secondary hover:text-fg"
            }`}
            onClick={() => {
              setUiLocale("nl");
            }}
          >
            NL
          </button>
          <button
            type="button"
            className={`relative z-[1] flex min-w-[2.75rem] items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition-[color] ${
              locale === "en" ? "text-fg" : "text-fg-secondary hover:text-fg"
            }`}
            onClick={() => {
              setUiLocale("en");
            }}
          >
            EN
          </button>
        </div>
      </div>

      <article className="relative mx-auto max-w-xl">
        <header className="mb-8 flex flex-col items-center gap-3 text-center sm:mb-10">
          <motion.div
            initial={rm ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={
              rm
                ? { duration: 0.15 }
                : {
                    type: "spring",
                    stiffness: 380,
                    damping: 28,
                    mass: 0.55,
                  }
            }
          >
            <Image
              src="/logo.svg"
              alt="Slice"
              width={220}
              height={76}
              className="h-10 w-auto max-w-[min(100%,14rem)] object-contain sm:h-11"
              priority
              unoptimized
            />
          </motion.div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-accent-bright">
            {t("welcome.kicker")}
          </p>
          <p className="text-sm font-medium tabular-nums text-muted">
            {t("welcome.stepLabel", {
              current: step + 1,
              total: WELCOME_STEPS,
            })}
          </p>
        </header>

        {progressDots}

        <form onSubmit={onSave} noValidate>
          <AnimatePresence mode="wait" initial={false}>
            {step === 0 ? (
              <motion.div
                key="step-0"
                role="group"
                aria-labelledby="welcome-step-0-title"
                initial={stepMotion.initial}
                animate={stepMotion.animate}
                exit={stepMotion.exit}
                transition={
                  rm
                    ? { duration: 0.12 }
                    : { duration: 0.28, ease: [0.33, 1, 0.68, 1] }
                }
                className={welcomeStepStack}
              >
                <h2 id="welcome-step-0-title" className="sr-only">
                  {t("welcome.localeLabel")}
                </h2>
                <div className={welcomeWarmupProse}>
                  <p className={storyBody}>{t("welcome.narrativeP1")}</p>
                  <p className={storyBody}>{t("welcome.narrativeP2")}</p>
                </div>
                <StorySection reduceMotion={reduceMotion}>
                  <p id="welcome-locale-story" className={storyBody}>
                    {t("welcome.narrativeLocale")}
                  </p>
                  <WelcomeControlSlot>
                    <div
                      className={`relative flex w-full ${HEADER_CONTROL_SHELL}`}
                      role="group"
                      aria-labelledby="welcome-locale-story"
                    >
                      <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-y-1 w-[calc(50%-6px)] rounded-full bg-white/14 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)]"
                        initial={false}
                        animate={{
                          left: locale === "nl" ? 4 : "calc(50% + 2px)",
                        }}
                        transition={
                          rm
                            ? { duration: 0.15 }
                            : { type: "spring", stiffness: 420, damping: 32 }
                        }
                      />
                      <button
                        type="button"
                        className={`relative z-[1] flex w-1/2 items-center justify-center rounded-full px-3 py-2.5 text-sm font-semibold transition-[color] ${
                          locale === "nl"
                            ? "text-fg"
                            : "text-fg-secondary hover:text-fg"
                        }`}
                        onClick={() => {
                          setUiLocale("nl");
                          form.setValue("locale", "nl");
                        }}
                      >
                        Nederlands
                      </button>
                      <button
                        type="button"
                        className={`relative z-[1] flex w-1/2 items-center justify-center rounded-full px-3 py-2.5 text-sm font-semibold transition-[color] ${
                          locale === "en"
                            ? "text-fg"
                            : "text-fg-secondary hover:text-fg"
                        }`}
                        onClick={() => {
                          setUiLocale("en");
                          form.setValue("locale", "en");
                        }}
                      >
                        English
                      </button>
                    </div>
                  </WelcomeControlSlot>
                </StorySection>
                <div className={welcomeFooterSolo}>
                  <motion.button
                    type="button"
                    disabled={submitting !== null}
                    onClick={() => setStep(1)}
                    className={welcomePrimaryBtn}
                    whileTap={
                      rm || submitting !== null ? undefined : { scale: 0.98 }
                    }
                  >
                    {t("welcome.next")}
                  </motion.button>
                </div>
              </motion.div>
            ) : null}

            {step === 1 ? (
              <motion.div
                key="step-1"
                role="group"
                aria-labelledby="welcome-step-1-title"
                initial={stepMotion.initial}
                animate={stepMotion.animate}
                exit={stepMotion.exit}
                transition={
                  rm
                    ? { duration: 0.12 }
                    : { duration: 0.28, ease: [0.33, 1, 0.68, 1] }
                }
                className={welcomeStepStack}
              >
                <h2 id="welcome-step-1-title" className="sr-only">
                  {t("welcome.nameLabel")}
                </h2>
                <StorySection reduceMotion={reduceMotion}>
                  <p id="welcome-name-story" className={storyBody}>
                    {t("welcome.narrativeName")}
                  </p>
                  <WelcomeControlSlot>
                    <label htmlFor="welcome-name" className="sr-only">
                      {t("welcome.nameLabel")}
                    </label>
                    <input
                      id="welcome-name"
                      type="text"
                      autoComplete="nickname given-name"
                      placeholder={t("welcome.namePlaceholder")}
                      aria-invalid={!!nameMessage}
                      aria-describedby="welcome-name-story welcome-name-hint"
                      className="w-full border-0 border-b border-white/22 bg-transparent py-2.5 font-display text-lg font-semibold tracking-tight text-fg placeholder:text-muted/75 focus:border-accent-bright focus:outline-none focus:ring-0"
                      {...form.register("preferredName")}
                    />
                    <p id="welcome-name-hint" className={welcomeHint}>
                      {t("welcome.nameHint")}
                    </p>
                    {nameMessage ? (
                      <span className="text-sm font-medium text-danger">
                        {nameMessage}
                      </span>
                    ) : null}
                  </WelcomeControlSlot>
                </StorySection>
                <div className={welcomeFooterPair}>
                  <motion.button
                    type="button"
                    disabled={submitting !== null}
                    onClick={() => setStep(0)}
                    className={welcomeBackBtn}
                    whileTap={
                      rm || submitting !== null ? undefined : { scale: 0.98 }
                    }
                  >
                    {t("welcome.back")}
                  </motion.button>
                  <div className={welcomePrimarySlot}>
                    <motion.button
                      type="button"
                      disabled={submitting !== null}
                      onClick={() => void goNextFromNameStep()}
                      className={welcomePrimaryBtn}
                      whileTap={
                        rm || submitting !== null ? undefined : { scale: 0.98 }
                      }
                    >
                      {t("welcome.next")}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : null}

            {step === 2 ? (
              <motion.div
                key="step-2"
                role="group"
                aria-labelledby="welcome-step-2-title"
                initial={stepMotion.initial}
                animate={stepMotion.animate}
                exit={stepMotion.exit}
                transition={
                  rm
                    ? { duration: 0.12 }
                    : { duration: 0.28, ease: [0.33, 1, 0.68, 1] }
                }
                className={welcomeStepStack}
              >
                <h2 id="welcome-step-2-title" className="sr-only">
                  {t("welcome.currencyLabel")}
                </h2>
                <StorySection reduceMotion={reduceMotion}>
                  <p id="welcome-currency-story" className={storyBody}>
                    {t("welcome.narrativeCurrency")}
                  </p>
                  <WelcomeControlSlot>
                    <label htmlFor="welcome-currency" className="sr-only">
                      {t("welcome.currencyLabel")}
                    </label>
                    <select
                      id="welcome-currency"
                      aria-labelledby="welcome-currency-story"
                      aria-describedby="welcome-currency-hint"
                      className="w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-base font-medium text-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-sm transition-[border-color,background] focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
                      {...form.register("currency")}
                    >
                      {welcomeCurrencyCodes.map((code) => (
                        <option key={code} value={code} className="bg-surface">
                          {code}
                        </option>
                      ))}
                    </select>
                    <p id="welcome-currency-hint" className={welcomeHint}>
                      {t("welcome.currencyHint")}
                    </p>
                  </WelcomeControlSlot>
                </StorySection>
                <StorySection reduceMotion={reduceMotion}>
                  <p className={`${storyBody} text-fg/95`}>
                    {t("welcome.narrativeClosing")}
                  </p>
                  <WelcomeControlSlot>
                    <p className={storyBody}>{t("welcome.skipHint")}</p>
                  </WelcomeControlSlot>
                </StorySection>

                {rootError ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-accent/30 bg-accent/[0.08] px-4 py-3 text-sm leading-relaxed text-fg"
                  >
                    {rootError}
                  </div>
                ) : null}

                <div className={welcomeFooterPair}>
                  <motion.button
                    type="button"
                    disabled={submitting !== null}
                    onClick={() => setStep(1)}
                    className={welcomeBackBtn}
                    whileTap={
                      rm || submitting !== null ? undefined : { scale: 0.98 }
                    }
                  >
                    {t("welcome.back")}
                  </motion.button>
                  <div className={welcomePrimarySlot}>
                    <motion.button
                      type="submit"
                      disabled={submitting !== null}
                      className={welcomePrimaryBtn}
                      whileTap={
                        rm || submitting !== null ? undefined : { scale: 0.98 }
                      }
                    >
                      {submitting === "save" ? (
                        <>
                          <Loader2
                            className="size-4 shrink-0 animate-spin"
                            aria-hidden
                          />
                          {t("auth.loading")}
                        </>
                      ) : (
                        t("welcome.submit")
                      )}
                    </motion.button>
                  </div>
                </div>
                <div className="flex w-full justify-end pt-3">
                  <button
                    type="button"
                    disabled={submitting !== null}
                    onClick={() => void onSkip()}
                    className="max-w-md text-right text-sm font-medium text-fg-secondary underline decoration-white/25 underline-offset-[6px] transition-[color,decoration-color] hover:text-fg hover:decoration-accent-bright/50 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {submitting === "skip" ? (
                      <span className="inline-flex items-center justify-end gap-2">
                        <Loader2
                          className="size-4 shrink-0 animate-spin"
                          aria-hidden
                        />
                        {t("auth.loading")}
                      </span>
                    ) : (
                      t("welcome.skip")
                    )}
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </form>
      </article>
    </motion.div>
  );
}
