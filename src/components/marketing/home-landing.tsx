"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  BarChart3,
  ChevronDown,
  Clock,
  Lock,
  ShieldCheck,
  Split,
  Users,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AppLocale } from "@/lib/i18n/locale";
import { sliceT, type SliceMessageKey } from "@/lib/i18n/messages";
import { HEADER_CONTROL_SHELL } from "@/components/layout/header-controls";

const LOGIN_LOCALE_KEY = "slice-login-locale";

const SECTION_IDS = ["demo", "features", "how", "security"] as const;
type SectionId = (typeof SECTION_IDS)[number];

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

type HomeLandingProps = {
  isSignedIn: boolean;
};

export function HomeLanding({ isSignedIn }: HomeLandingProps) {
  const reduceMotion = useReducedMotion();
  const [locale, setLocale] = useState<AppLocale>("en");
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  const [wizardStep, setWizardStep] = useState(0);
  const [countId, setCountId] = useState<string | null>(null);
  const [categorySet, setCategorySet] = useState<Set<string>>(() => new Set());
  const [bandId, setBandId] = useState<string | null>(null);
  const [wizardError, setWizardError] = useState<string | null>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.32);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 28 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 28 });
  const spotX = useTransform(springX, (v) => `${v * 100}%`);
  const spotY = useTransform(springY, (v) => `${v * 100}%`);
  const spotlight = useMotionTemplate`radial-gradient(620px circle at ${spotX} ${spotY}, rgb(var(--slice-accent) / 0.12), transparent 55%)`;

  const { scrollY } = useScroll();
  const heroBlobY = useTransform(scrollY, [0, 420], [0, 90]);

  const demoSectionRef = useRef<HTMLDivElement | null>(null);
  const demoInView = useInView(demoSectionRef, {
    amount: 0.28,
    margin: "0px 0px -12% 0px",
  });
  const [isLgLayout, setIsLgLayout] = useState(false);
  const [viewportReady, setViewportReady] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [scanIntent, setScanIntent] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    if (y > 40) setHasScrolled(true);
  });

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsLgLayout(mq.matches);
    setViewportReady(true);
    const onChange = () => setIsLgLayout(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const tryOpenScan = useCallback(() => setScanIntent(true), []);

  const scanUnlockReady =
    reduceMotion ||
    (viewportReady &&
      demoInView &&
      (!isLgLayout || hasScrolled || scanIntent));

  const [scanRevealed, setScanRevealed] = useState(false);
  useEffect(() => {
    if (scanUnlockReady) setScanRevealed(true);
  }, [scanUnlockReady]);

  const t = useCallback(
    (key: SliceMessageKey, vars?: Record<string, string | number>) =>
      sliceT(locale, key, vars),
    [locale]
  );

  useLayoutEffect(() => {
    setLocale(readLoginLocale());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    if (window.location.hash === "#demo") setScanIntent(true);
  }, [mounted]);

  useLayoutEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale === "nl" ? "nl" : "en";
  }, [locale]);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (n): n is HTMLElement => !!n
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target.id;
        if (top && SECTION_IDS.includes(top as SectionId)) {
          setActiveSection(top as SectionId);
        }
      },
      {
        rootMargin: "-10% 0px -50% 0px",
        threshold: [0.08, 0.18, 0.28, 0.45],
      }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [mounted]);

  const setLoginLocale = useCallback((next: AppLocale) => {
    setLocale(next);
    try {
      sessionStorage.setItem(LOGIN_LOCALE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const smoothScrollId = useCallback(
    (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (id === "demo") tryOpenScan();
      if (reduceMotion) return;
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    },
    [reduceMotion, tryOpenScan]
  );

  const navLinkClass = useCallback(
    (id: string) => {
      const isActive = activeSection === id;
      return [
        "rounded-full px-3.5 py-2 text-xs font-medium transition-[color,background,box-shadow] sm:text-sm",
        isActive
          ? "bg-white/[0.1] text-fg shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)]"
          : "text-fg-secondary hover:bg-white/[0.07] hover:text-fg",
      ].join(" ");
    },
    [activeSection]
  );

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
      setWizardStep(3);
    }
  }, [bandId, categorySet.size, countId, t, wizardStep]);

  const goBack = useCallback(() => {
    setWizardError(null);
    if (wizardStep <= 0) return;
    setWizardStep((s) => s - 1);
  }, [wizardStep]);

  const featureItems = useMemo(
    () =>
      [
        {
          icon: BarChart3,
          titleKey: "landing.featureSubsTitle" as const,
          bodyKey: "landing.featureSubsBody" as const,
        },
        {
          icon: Users,
          titleKey: "landing.featureShareTitle" as const,
          bodyKey: "landing.featureShareBody" as const,
        },
        {
          icon: Split,
          titleKey: "landing.featureChartsTitle" as const,
          bodyKey: "landing.featureChartsBody" as const,
        },
        {
          icon: Clock,
          titleKey: "landing.featureWorkTitle" as const,
          bodyKey: "landing.featureWorkBody" as const,
        },
      ] as const,
    []
  );

  const summaryLines = useMemo(() => {
    const countLabel =
      COUNT_OPTIONS.find((o) => o.id === countId)?.labelKey ?? null;
    const bandLabel = BAND_OPTIONS.find((o) => o.id === bandId)?.labelKey ?? null;
    const cats = CATEGORY_OPTIONS.filter((o) => categorySet.has(o.id)).map(
      (o) => t(o.labelKey)
    );
    return {
      countLabel: countLabel ? t(countLabel) : "",
      categoriesText: cats.join(", "),
      bandLabel: bandLabel ? t(bandLabel) : "",
    };
  }, [bandId, categorySet, countId, t]);

  const onHeroPointer = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (reduceMotion) return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      mouseX.set(Math.min(1, Math.max(0, x)));
      mouseY.set(Math.min(1, Math.max(0, y)));
    },
    [mouseX, mouseY, reduceMotion]
  );

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
        <div className="flex flex-col items-center gap-4 opacity-60">
          <div className="h-10 w-40 rounded-md bg-white/[0.07]" />
          <div className="h-3 max-w-md rounded-full bg-white/[0.05] sm:w-96" />
          <div className="h-48 w-full max-w-lg rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.06]" />
        </div>
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] text-muted">
          …
        </p>
      </div>
    );
  }

  const primaryHref = isSignedIn ? "/dashboard" : "/login";
  const primaryLabel = isSignedIn
    ? t("landing.ctaDashboard")
    : t("landing.ctaStart");

  const wizardProgressPct =
    wizardStep >= WIZARD_QUESTIONS
      ? 100
      : ((wizardStep + 1) / WIZARD_QUESTIONS) * 100;

  const stepTransition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.28, ease: [0.33, 1, 0.68, 1] as const };

  return (
    <div className="relative min-h-screen overflow-x-hidden text-fg">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle at center, rgb(255 255 255 / 0.055) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 85% 70% at 50% 0%, black, transparent)",
        }}
      />

      <header className="slice-header-shell sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3.5 sm:px-6 sm:py-4 lg:px-8">
          <Link
            href="/"
            className="shrink-0 transition-opacity hover:opacity-90"
            aria-label={t("landing.logoAria")}
          >
            <Image
              src="/logo.svg"
              alt=""
              width={200}
              height={56}
              className="h-9 w-auto max-w-[min(100%,11rem)] object-contain sm:h-10"
              priority
              unoptimized
            />
          </Link>

          <nav
            className="order-3 flex w-full flex-wrap items-center justify-center gap-1 sm:order-none sm:w-auto sm:justify-end md:gap-1.5"
            aria-label={t("header.navMain")}
          >
            {(
              [
                ["features", "landing.navFeatures"],
                ["demo", "landing.navDemo"],
                ["how", "landing.navHow"],
                ["security", "landing.navSecurity"],
              ] as const
            ).map(([id, key]) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={smoothScrollId(id)}
                className={navLinkClass(id)}
                aria-current={activeSection === id ? "page" : undefined}
              >
                {t(key)}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div
              className={`relative inline-flex min-h-0 ${HEADER_CONTROL_SHELL} py-0.5 pl-0.5 pr-0.5`}
              role="group"
              aria-label={t("language.toggleAria")}
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

            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="slice-btn-primary px-4 py-2 text-xs sm:text-sm"
              >
                {t("landing.navDashboard")}
              </Link>
            ) : (
              <Link
                href="/login"
                className="slice-btn-secondary px-4 py-2 text-xs sm:text-sm"
              >
                {t("landing.navLogin")}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>
        <section
          className="relative mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8 lg:pb-28"
          onPointerMove={onHeroPointer}
          onPointerLeave={() => {
            mouseX.set(0.5);
            mouseY.set(0.32);
          }}
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
            style={reduceMotion ? undefined : { y: heroBlobY }}
          />
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-90"
            aria-hidden
            style={{ backgroundImage: spotlight }}
          />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch lg:gap-14">
            <div className="flex flex-col justify-center lg:py-4">
              <motion.p
                className="inline-flex w-fit items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-bright"
                initial={false}
                animate={{ opacity: 1, y: 0 }}
              >
                <span
                  className="h-px w-6 shrink-0 bg-accent-bright/80"
                  aria-hidden
                />
                {t("boot.tagline")}
              </motion.p>
              <motion.h1
                className="mt-5 max-w-xl text-balance font-sans text-fg"
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  ease: [0.26, 0.08, 0.25, 1],
                  delay: reduceMotion ? 0 : 0.04,
                }}
              >
                <span className="block text-xl font-semibold leading-snug text-fg-secondary sm:text-2xl">
                  {t("landing.heroKicker")}
                </span>
                <span className="mt-3 block text-3xl font-bold leading-[1.18] tracking-[-0.02em] sm:text-4xl sm:leading-[1.15] lg:text-[2.65rem] lg:leading-[1.12]">
                  {t("landing.heroTitle")}
                </span>
              </motion.h1>
              <motion.p
                className="mt-6 max-w-[34rem] text-base leading-[1.65] text-fg-secondary sm:text-[1.0625rem]"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: [0.33, 1, 0.68, 1],
                  delay: reduceMotion ? 0 : 0.12,
                }}
              >
                {t("landing.heroLead")}
              </motion.p>
              <motion.div
                className="mt-9 flex flex-wrap items-center gap-3"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: reduceMotion ? 0 : 0.18,
                }}
              >
                <Link href={primaryHref} className="slice-btn-primary">
                  {primaryLabel}
                </Link>
                <a
                  href="#demo"
                  onClick={smoothScrollId("demo")}
                  className="slice-btn-secondary gap-1.5"
                >
                  {t("landing.ctaScroll")}
                  <ChevronDown className="size-4 opacity-80" aria-hidden />
                </a>
              </motion.div>
            </div>

            <div
              ref={demoSectionRef}
              id="demo"
              className="relative scroll-mt-28 lg:flex lg:min-h-[min(100%,26rem)] lg:flex-col"
            >
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

                <AnimatePresence initial={false} mode="wait">
                  {!scanRevealed ? (
                    <motion.div
                      key="scan-teaser"
                      role="presentation"
                      initial={reduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={
                        reduceMotion
                          ? { opacity: 0, transition: { duration: 0.12 } }
                          : { opacity: 0, filter: "blur(10px)", transition: { duration: 0.38 } }
                      }
                      transition={{ duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
                      className="relative flex min-h-[19rem] flex-col items-center justify-center gap-6 py-6 text-center sm:min-h-[18rem]"
                    >
                      <div
                        className="pointer-events-none absolute inset-6 rounded-2xl opacity-[0.45]"
                        style={{
                          background:
                            "repeating-linear-gradient(0deg, transparent, transparent 11px, rgb(var(--slice-accent) / 0.045) 11px, rgb(var(--slice-accent) / 0.045) 12px)",
                          maskImage:
                            "linear-gradient(180deg, transparent, black 22%, black 78%, transparent)",
                        }}
                        aria-hidden
                      />
                      <motion.div
                        className="pointer-events-none absolute left-8 right-8 top-[22%] h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent"
                        aria-hidden
                        animate={
                          reduceMotion
                            ? {}
                            : {
                                top: ["22%", "50%", "78%", "22%"],
                              }
                        }
                        transition={{
                          duration: 5.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <p className="relative z-[1] max-w-[16rem] font-sans text-sm font-semibold leading-snug tracking-wide text-fg-secondary/90">
                        {t("landing.demoTeaserLine")}
                      </p>
                      <p className="relative z-[1] max-w-[15rem] text-xs leading-relaxed text-muted">
                        {t("landing.demoTeaserHint")}
                      </p>
                    </motion.div>
                  ) : (
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
                        {/* Same-size placeholder on step 1 avoids header jump when the button appears */}
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

                      {/* Tall enough for wrapped category chips so the card does not grow when moving to step 2 */}
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
                      <p className="text-sm text-fg-secondary">
                        {t("landing.wizardQ1Hint")}
                      </p>
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
                      <p className="text-sm text-fg-secondary">
                        {t("landing.wizardQ2Hint")}
                      </p>
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
                      <p className="text-sm text-fg-secondary">
                        {t("landing.wizardQ3Hint")}
                      </p>
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
                      <div className="rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/[0.06]">
                        <p className="slice-label">{t("landing.wizardSummaryIntro")}</p>
                        <ul className="mt-2 space-y-1.5 text-sm text-fg-secondary">
                          <li className="text-fg">
                            {t("landing.wizardSummaryLine1", {
                              range: summaryLines.countLabel,
                            })}
                          </li>
                          <li>{summaryLines.categoriesText}</li>
                          <li className="text-fg">
                            {t("landing.wizardSummaryLine3", {
                              band: summaryLines.bandLabel,
                            })}
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h2 className="font-sans text-base font-bold text-fg">
                          {isSignedIn
                            ? t("landing.wizardDoneSignedInTitle")
                            : t("landing.wizardDoneTitle")}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
                          {isSignedIn
                            ? t("landing.wizardDoneSignedInBody")
                            : t("landing.wizardDoneBody")}
                        </p>
                      </div>
                      {isSignedIn ? (
                        <Link href="/dashboard" className="slice-btn-primary w-full justify-center sm:w-auto">
                          {t("landing.ctaDashboard")}
                        </Link>
                      ) : (
                        <Link
                          href="/login?next=/dashboard"
                          className="slice-btn-primary w-full justify-center sm:w-auto"
                        >
                          {t("landing.wizardDoneCta")}
                        </Link>
                      )}
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
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-28 border-t border-white/[0.06] bg-[linear-gradient(180deg,rgb(var(--slice-canvas))_0%,rgb(var(--slice-surface)/0.35)_100%)] py-[4.5rem] sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="max-w-2xl"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
            >
              <span className="mb-3 block h-0.5 w-10 rounded-full bg-accent" aria-hidden />
              <h2 className="font-sans text-2xl font-bold tracking-[-0.02em] text-fg sm:text-3xl lg:text-[2rem]">
                {t("landing.featuresTitle")}
              </h2>
            </motion.div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {featureItems.map(({ icon: Icon, titleKey, bodyKey }, i) => (
                <motion.article
                  key={titleKey}
                  className="slice-card group relative cursor-default overflow-hidden p-6 sm:p-7 transition-[box-shadow,border-color,transform] duration-300 hover:border-white/[0.1] hover:shadow-[0_0_0_1px_rgb(255_255_255/0.08)_inset,0_24px_56px_-14px_rgb(0_0_0/0.48)]"
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={
                    reduceMotion ? undefined : { y: -3, transition: { duration: 0.2 } }
                  }
                  viewport={{ once: true, margin: "-8%" }}
                  transition={{
                    duration: 0.45,
                    delay: reduceMotion ? 0 : i * 0.06,
                    ease: [0.33, 1, 0.68, 1],
                  }}
                >
                  <div
                    className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden
                  />
                  <div className="relative flex gap-4 sm:gap-5">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-white/[0.09] to-white/[0.04] text-accent-bright shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] ring-1 ring-white/[0.08] transition-[transform] duration-300 group-hover:scale-[1.04]">
                      <Icon className="size-[1.35rem]" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-sans text-[1.0625rem] font-bold leading-snug tracking-[-0.01em] text-fg">
                        {t(titleKey)}
                      </h3>
                      <p className="mt-2.5 text-sm leading-[1.65] text-fg-secondary">
                        {t(bodyKey)}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="how"
          className="scroll-mt-28 border-t border-white/[0.06] py-[4.5rem] sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <span className="mb-3 block h-0.5 w-10 rounded-full bg-accent" aria-hidden />
            <h2 className="font-sans text-2xl font-bold tracking-[-0.02em] text-fg sm:text-3xl lg:text-[2rem]">
              {t("landing.howTitle")}
            </h2>
            <div className="relative mt-14">
              <div
                className="pointer-events-none absolute left-4 right-4 top-9 z-0 hidden h-px md:block"
                aria-hidden
                style={{
                  background:
                    "linear-gradient(90deg, rgb(var(--slice-accent) / 0.22), rgb(var(--slice-accent) / 0.06) 50%, rgb(var(--slice-accent) / 0.22))",
                }}
              />
              <ol className="relative z-[1] grid gap-6 md:grid-cols-3 md:gap-5">
              {(
                [
                  ["landing.howStep1Title", "landing.howStep1Body"],
                  ["landing.howStep2Title", "landing.howStep2Body"],
                  ["landing.howStep3Title", "landing.howStep3Body"],
                ] as const
              ).map(([titleKey, bodyKey], idx) => (
                <motion.li
                  key={titleKey}
                  className="slice-card relative z-[1] overflow-hidden p-6 sm:p-7"
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{
                    duration: 0.42,
                    delay: reduceMotion ? 0 : idx * 0.08,
                  }}
                >
                  <span className="flex items-center gap-2" aria-hidden>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/20 font-sans text-sm font-bold tabular-nums text-accent-bright ring-1 ring-accent/30">
                      {idx + 1}
                    </span>
                    <span className="h-px flex-1 bg-white/[0.08] md:hidden" />
                  </span>
                  <h3 className="mt-4 font-sans text-[1.0625rem] font-bold leading-snug tracking-[-0.01em] text-fg">
                    {t(titleKey)}
                  </h3>
                  <p className="mt-2.5 text-sm leading-[1.65] text-fg-secondary">
                    {t(bodyKey)}
                  </p>
                </motion.li>
              ))}
              </ol>
            </div>
          </div>
        </section>

        <section
          id="security"
          className="scroll-mt-28 border-t border-white/[0.06] bg-gradient-to-b from-canvas via-canvas to-accent/[0.09] py-[4.5rem] sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
              <div className="max-w-xl">
                <span className="mb-3 block h-0.5 w-10 rounded-full bg-accent" aria-hidden />
                <h2 className="font-sans text-2xl font-bold tracking-[-0.02em] text-fg sm:text-3xl lg:text-[2rem]">
                  {t("landing.securityTitle")}
                </h2>
              </div>
              <div className="flex shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 ring-1 ring-inset ring-white/[0.04]">
                <ShieldCheck
                  className="size-9 text-accent-bright sm:size-10"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </div>
            </div>
            <ul className="mt-12 grid gap-4 md:grid-cols-3">
              {(
                [
                  "landing.securityRls",
                  "landing.securityAuth",
                  "landing.securityData",
                ] as const
              ).map((key, i) => (
                <motion.li
                  key={key}
                  className="flex gap-3.5 rounded-2xl border border-white/[0.08] bg-surface/50 px-4 py-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] backdrop-blur-sm"
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: reduceMotion ? 0 : i * 0.07 }}
                >
                  <Lock
                    className="mt-0.5 size-4 shrink-0 text-accent-bright"
                    aria-hidden
                  />
                  <p className="text-sm leading-[1.65] text-fg-secondary">
                    {t(key)}
                  </p>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="border-t border-white/[0.06] py-16 sm:py-20">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-7 px-4 text-center sm:px-6 lg:px-8">
            <Image
              src="/logo.svg"
              alt=""
              width={180}
              height={48}
              className="h-8 w-auto opacity-90"
              unoptimized
            />
            <p className="max-w-md text-balance font-sans text-base font-medium leading-relaxed text-fg-secondary sm:text-lg">
              {t("landing.footerTagline")}
            </p>
            <p className="max-w-md text-balance text-xs leading-relaxed text-fg-secondary/65">
              {t("landing.footerCopyright", {
                year: new Date().getFullYear(),
              })}
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
