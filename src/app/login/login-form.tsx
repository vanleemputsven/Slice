"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSupabasePublicConfig } from "@/lib/supabase/env";
import { HEADER_CONTROL_SHELL } from "@/components/layout/header-controls";
import type { AppLocale } from "@/lib/i18n/locale";
import { sliceT, type SliceMessageKey } from "@/lib/i18n/messages";
import {
  createAuthLoginFormSchema,
  type AuthLoginFormInput,
} from "@/lib/validation/auth-credentials";

const LOGIN_LOCALE_KEY = "slice-login-locale";

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

type AuthFeedback = {
  kind: "error" | "success";
  text: string;
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const urlError = searchParams.get("error");
  const reduceMotion = useReducedMotion();
  const [locale, setLocale] = useState<AppLocale>("en");
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const t = useCallback(
    (key: SliceMessageKey, vars?: Record<string, string | number>) =>
      sliceT(locale, key, vars),
    [locale]
  );

  /* eslint-disable react-hooks/set-state-in-effect -- sessionStorage + hydration */
  useLayoutEffect(() => {
    setLocale(readLoginLocale());
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale === "nl" ? "nl" : "en";
  }, [locale]);

  const setLoginLocale = useCallback((next: AppLocale) => {
    setLocale(next);
    try {
      sessionStorage.setItem(LOGIN_LOCALE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const loginSchema = useMemo(
    () =>
      createAuthLoginFormSchema(() => ({
        passwordMismatch: sliceT(locale, "auth.passwordMismatch"),
        passwordConfirmRequired: sliceT(
          locale,
          "auth.passwordConfirmRequired"
        ),
      })),
    [locale]
  );

  const form = useForm<AuthLoginFormInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      mode: "signin",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const urlFeedback = useMemo((): AuthFeedback | null => {
    if (urlError === "auth") {
      return { kind: "error", text: t("auth.callbackError") };
    }
    if (urlError === "config") {
      return { kind: "error", text: t("auth.configError") };
    }
    return null;
  }, [urlError, t]);

  const displayFeedback = feedback ?? urlFeedback;

  function switchMode(next: "signin" | "signup") {
    setMode(next);
    form.setValue("mode", next);
    form.setValue("passwordConfirm", "");
    setFeedback(null);
    form.clearErrors();
    setShowPassword(false);
    setShowPasswordConfirm(false);
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setFeedback(null);
    try {
      getSupabasePublicConfig();
    } catch {
      setFeedback({ kind: "error", text: t("auth.configError") });
      return;
    }

    const supabase = createClient();
    if (values.mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        setFeedback({ kind: "error", text: t("auth.signInFailed") });
        return;
      }
      router.refresh();
      router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
      return;
    }

    const origin = window.location.origin;
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
    if (error) {
      setFeedback({ kind: "error", text: t("auth.signUpFailed") });
      return;
    }
    if (data.session) {
      router.refresh();
      router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
      return;
    }
    setFeedback({ kind: "success", text: t("auth.confirmEmail") });
  });

  const segmentClass = (active: boolean) =>
    `relative z-[1] flex w-1/2 min-w-0 items-center justify-center rounded-full px-3 py-2.5 text-sm font-semibold transition-[color,transform] duration-200 ${
      active
        ? "text-fg"
        : "text-fg-secondary hover:text-fg"
    } ${active && !reduceMotion ? "scale-[1.02]" : ""}`;

  const introTransition = reduceMotion
    ? { duration: 0.2 }
    : { duration: 0.45, ease: [0.26, 0.08, 0.25, 1] as const };

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-canvas px-4">
        <div className="flex flex-col items-center gap-4 opacity-60">
          <div className="h-10 w-40 rounded-md bg-white/[0.07]" />
          <div className="h-3 w-32 rounded-full bg-white/[0.05]" />
          <div className="h-36 w-full max-w-md rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.06]" />
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
          …
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="relative min-h-screen overflow-x-hidden px-4 pb-12 pt-14 text-fg sm:pb-16 sm:pt-16"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
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
            "radial-gradient(ellipse 78% 65% at 50% 18%, black, transparent)",
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
            onClick={() => setLoginLocale("nl")}
          >
            NL
          </button>
          <button
            type="button"
            className={`relative z-[1] flex min-w-[2.75rem] items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition-[color] ${
              locale === "en" ? "text-fg" : "text-fg-secondary hover:text-fg"
            }`}
            onClick={() => setLoginLocale("en")}
          >
            EN
          </button>
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={
              reduceMotion
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
          <p className="font-display text-sm font-semibold tracking-wide text-fg-secondary">
            {t("boot.tagline")}
          </p>
        </div>

        <div className="slice-card relative overflow-hidden p-6 sm:p-8">
          <div
            className="pointer-events-none absolute -right-16 -top-24 h-48 w-48 rounded-full bg-accent/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-accent-bright/10 blur-3xl"
            aria-hidden
          />

          <div className="relative">
            <div
              role="tablist"
              aria-label={t("auth.modeTabsAria")}
              className={`relative mb-8 flex w-full ${HEADER_CONTROL_SHELL}`}
            >
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-y-1 w-[calc(50%-6px)] rounded-full bg-white/14 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)]"
                initial={false}
                animate={{
                  left: mode === "signin" ? 4 : "calc(50% + 2px)",
                }}
                transition={
                  reduceMotion
                    ? { duration: 0.15 }
                    : { type: "spring", stiffness: 420, damping: 32 }
                }
              />
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signin"}
                id="tab-signin"
                className={segmentClass(mode === "signin")}
                onClick={() => switchMode("signin")}
              >
                {t("auth.signInTitle")}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signup"}
                id="tab-signup"
                className={segmentClass(mode === "signup")}
                onClick={() => switchMode("signup")}
              >
                {t("auth.signUpTitle")}
              </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                role="tabpanel"
                aria-labelledby={mode === "signin" ? "tab-signin" : "tab-signup"}
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 8 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -6 }
                }
                transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
              >
                <p className="font-display text-lg font-bold tracking-tight text-fg">
                  {mode === "signin"
                    ? t("auth.kickerSignIn")
                    : t("auth.kickerSignUp")}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
                  {t("auth.blurb")}
                </p>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {displayFeedback ? (
                <motion.div
                  key={
                    displayFeedback.kind === "success"
                      ? "success"
                      : `err-${displayFeedback.text.slice(0, 24)}`
                  }
                  role={displayFeedback.kind === "success" ? "status" : "alert"}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
                  className={`mt-4 rounded-xl border px-3.5 py-3 text-sm leading-snug ${
                    displayFeedback.kind === "success"
                      ? "border-success/35 bg-success/10 text-fg"
                      : "border-accent/35 bg-accent/10 text-fg"
                  }`}
                >
                  {displayFeedback.text}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <form
              className="mt-6 flex flex-col gap-5"
              onSubmit={onSubmit}
              noValidate
            >
              <div className="flex flex-col gap-1">
                <label htmlFor="login-email" className="slice-label">
                  {t("auth.email")}
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("auth.emailPlaceholder")}
                  className="slice-input"
                  aria-invalid={!!form.formState.errors.email}
                  {...form.register("email")}
                />
                {form.formState.errors.email ? (
                  <span className="text-xs font-medium text-danger">
                    {form.formState.errors.email.message}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-2">
                  <label htmlFor="login-password" className="slice-label">
                    {t("auth.password")}
                  </label>
                  {mode === "signup" ? (
                    <span className="text-[11px] text-muted">
                      {t("auth.passwordHelp")}
                    </span>
                  ) : null}
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "signin" ? "current-password" : "new-password"
                    }
                    className="slice-input pr-12"
                    aria-invalid={!!form.formState.errors.password}
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? t("auth.hidePassword")
                        : t("auth.showPassword")
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-1.5 my-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-[color,background] hover:bg-white/[0.06] hover:text-fg"
                  >
                    {showPassword ? (
                      <EyeOff className="size-[1.15rem]" aria-hidden />
                    ) : (
                      <Eye className="size-[1.15rem]" aria-hidden />
                    )}
                  </button>
                </div>
                {form.formState.errors.password ? (
                  <span className="text-xs font-medium text-danger">
                    {form.formState.errors.password.message}
                  </span>
                ) : null}
              </div>

              <AnimatePresence initial={false}>
                {mode === "signup" ? (
                  <motion.div
                    key="password-confirm"
                    initial={
                      reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
                    className="flex flex-col gap-1"
                  >
                    <label
                      htmlFor="login-password-confirm"
                      className="slice-label"
                    >
                      {t("auth.passwordConfirm")}
                    </label>
                    <div className="relative">
                      <input
                        id="login-password-confirm"
                        type={showPasswordConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        className="slice-input pr-12"
                        aria-invalid={
                          !!form.formState.errors.passwordConfirm
                        }
                        {...form.register("passwordConfirm")}
                      />
                      <button
                        type="button"
                        aria-label={
                          showPasswordConfirm
                            ? t("auth.hidePassword")
                            : t("auth.showPassword")
                        }
                        aria-pressed={showPasswordConfirm}
                        onClick={() =>
                          setShowPasswordConfirm((v) => !v)
                        }
                        className="absolute inset-y-0 right-1.5 my-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-[color,background] hover:bg-white/[0.06] hover:text-fg"
                      >
                        {showPasswordConfirm ? (
                          <EyeOff className="size-[1.15rem]" aria-hidden />
                        ) : (
                          <Eye className="size-[1.15rem]" aria-hidden />
                        )}
                      </button>
                    </div>
                    {form.formState.errors.passwordConfirm ? (
                      <span className="text-xs font-medium text-danger">
                        {form.formState.errors.passwordConfirm.message}
                      </span>
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="slice-btn-primary w-full justify-center disabled:transform-none"
                whileTap={
                  reduceMotion || form.formState.isSubmitting
                    ? undefined
                    : { scale: 0.98 }
                }
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2
                      className="size-4 shrink-0 animate-spin"
                      aria-hidden
                    />
                    {t("auth.loading")}
                  </>
                ) : mode === "signin" ? (
                  t("auth.signInCta")
                ) : (
                  t("auth.signUpCta")
                )}
              </motion.button>
            </form>

            <p className="mt-6 text-center text-sm text-fg-secondary">
              {mode === "signin" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
              <button
                type="button"
                className="font-semibold text-accent-bright underline decoration-accent-bright/40 underline-offset-4 transition-[text-decoration-color,color] hover:decoration-accent-bright"
                onClick={() =>
                  switchMode(mode === "signin" ? "signup" : "signin")
                }
              >
                {mode === "signin"
                  ? t("auth.switchSignUp")
                  : t("auth.switchSignIn")}
              </button>
            </p>

            <div className="mt-8 flex justify-center border-t border-white/[0.06] pt-6">
              <Link
                href="/"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-fg"
              >
                <span className="transition-transform group-hover:-translate-x-0.5">
                  ←
                </span>
                {t("auth.backToSlice")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
