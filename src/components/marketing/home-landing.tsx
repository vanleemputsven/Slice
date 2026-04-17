"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  BarChart3,
  ChevronRight,
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
import { HeroScreenshotSlideshow } from "@/components/marketing/hero-screenshot-slideshow";
import { LandingValueTicker } from "@/components/marketing/landing-value-ticker";

const GeodeHeroCanvas = dynamic(
  () =>
    import("@/components/marketing/geode-hero-canvas").then((m) => m.GeodeHeroCanvas),
  { ssr: false }
);

const LOGIN_LOCALE_KEY = "slice-login-locale";

const SECTION_IDS = ["features", "how", "security"] as const;
type SectionId = (typeof SECTION_IDS)[number];

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

  const heroPointerRef = useRef({ x: 0.5, y: 0.32 });
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.32);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 28 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 28 });
  const spotX = useTransform(springX, (v) => `${v * 100}%`);
  const spotY = useTransform(springY, (v) => `${v * 100}%`);
  const spotlight = useMotionTemplate`radial-gradient(620px circle at ${spotX} ${spotY}, rgb(var(--slice-accent) / 0.12), transparent 55%)`;

  const { scrollY } = useScroll();
  const heroBlobY = useTransform(scrollY, [0, 420], [0, 90]);

  const t = useCallback(
    (key: SliceMessageKey, vars?: Record<string, string | number>) =>
      sliceT(locale, key, vars),
    [locale]
  );

  useLayoutEffect(() => {
    setLocale(readLoginLocale());
    setMounted(true);
  }, []);

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
      if (reduceMotion) return;
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    },
    [reduceMotion]
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

  const onHeroPointer = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      heroPointerRef.current = { x, y };
      if (reduceMotion) return;
      mouseX.set(x);
      mouseY.set(y);
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
            heroPointerRef.current = { x: 0.5, y: 0.32 };
            mouseX.set(0.5);
            mouseY.set(0.32);
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 z-[1] overflow-hidden [mask-image:linear-gradient(180deg,black_0%,black_50%,transparent_92%)]"
            aria-hidden
          >
            <GeodeHeroCanvas
              className="absolute inset-0 size-full min-h-[26rem] sm:min-h-[30rem]"
              pointerRef={heroPointerRef}
              paused={Boolean(reduceMotion)}
            />
          </div>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-0 z-[2] h-72 w-72 rounded-full bg-accent/20 blur-3xl"
            style={reduceMotion ? undefined : { y: heroBlobY }}
          />
          <motion.div
            className="pointer-events-none absolute inset-0 z-[2] opacity-90"
            aria-hidden
            style={{ backgroundImage: spotlight }}
          />

          <div className="relative z-[3] flex flex-col items-stretch gap-9 md:flex-row md:items-center md:justify-between md:gap-10 lg:gap-12 xl:gap-14">
            <div className="flex min-w-0 max-w-2xl flex-col justify-center md:py-1 lg:py-4">
              <motion.p
                className="w-fit font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-bright"
                initial={false}
                animate={{ opacity: 1, y: 0 }}
              >
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
                <Link href="/demo" className="slice-btn-secondary gap-1.5">
                  {t("landing.ctaScroll")}
                  <ChevronRight className="size-4 opacity-80" aria-hidden />
                </Link>
              </motion.div>
            </div>

            <div className="mx-auto w-full max-w-[27rem] shrink-0 sm:max-w-[29rem] md:mx-0 md:w-[min(100%,31rem)] md:max-w-none md:translate-y-2 lg:w-[min(100%,33rem)] lg:translate-y-3 xl:w-[min(100%,36rem)]">
              <HeroScreenshotSlideshow t={t} className="w-full" />
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

        <footer className="border-t border-white/[0.06]">
          <LandingValueTicker
            t={t}
            isSignedIn={isSignedIn}
            reduceMotion={Boolean(reduceMotion)}
            onHashClick={smoothScrollId}
          />
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-7 px-4 py-14 text-center sm:px-6 sm:py-16 lg:px-8 lg:py-20">
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
