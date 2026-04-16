"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import type { SliceMessageKey } from "@/lib/i18n/messages";

const HERO_SLIDES = ["/hero-1.png", "/hero-2.png", "/hero-3.png"] as const;

const AUTOPLAY_INTERVAL_MS = 5600;

type HeroScreenshotSlideshowProps = {
  t: (key: SliceMessageKey, vars?: Record<string, string | number>) => string;
  className?: string;
};

export function HeroScreenshotSlideshow({
  t,
  className = "",
}: HeroScreenshotSlideshowProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);

  const goTo = useCallback((i: number) => {
    const len = HERO_SLIDES.length;
    setIndex(((i % len) + len) % len);
  }, []);

  useEffect(() => {
    if (reduceMotion || hoverPaused) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, hoverPaused]);

  const transition = reduceMotion
    ? { duration: 0.12 }
    : { duration: 0.52, ease: [0.33, 1, 0.68, 1] as const };

  const src = HERO_SLIDES[index];
  const slideNumber = (s: (typeof HERO_SLIDES)[number]) =>
    HERO_SLIDES.indexOf(s) + 1;

  return (
    <div
      className={className}
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
    >
      <div
        className="relative w-full"
        role="region"
        aria-roledescription="carousel"
        aria-label={t("landing.heroSlideshowAria")}
      >
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {t("landing.heroSlideshowSlideStatus", {
            current: index + 1,
            total: HERO_SLIDES.length,
          })}
        </p>

        <div className="relative aspect-[16/11] w-full overflow-hidden rounded-xl border border-white/[0.09] bg-[linear-gradient(165deg,rgb(var(--slice-surface)/0.45)_0%,rgb(var(--slice-canvas)/0.82)_100%)] shadow-[0_20px_44px_-18px_rgb(0_0_0/0.55),inset_0_0_0_1px_rgb(255_255_255/0.05)] ring-1 ring-inset ring-white/[0.06] sm:aspect-[16/10] lg:aspect-[16/10]">
          <div
            className="pointer-events-none absolute inset-0 z-[1] rounded-xl bg-[radial-gradient(ellipse_72%_58%_at_50%_38%,transparent_32%,rgb(0_0_0/0.16)_100%)]"
            aria-hidden
          />

          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={src}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 1.04, filter: "blur(10px)" }
              }
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.96, filter: "blur(8px)" }
              }
              transition={transition}
              className="absolute inset-0 z-0"
            >
              <Image
                src={src}
                alt={t("landing.heroScreenshotAlt", { n: slideNumber(src) })}
                fill
                className="object-contain object-center p-1 sm:p-1.5"
                sizes="(max-width: 640px) min(432px, 100vw), (max-width: 1024px) min(496px, 90vw), min(576px, 45vw)"
                priority={slideNumber(src) === 1}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          className="mt-3 flex items-center justify-center gap-1.5 sm:mt-3.5 sm:gap-2"
          role="group"
          aria-label={t("landing.heroSlideshowDots")}
        >
          {HERO_SLIDES.map((_, i) => {
            const on = i === index;
            return (
              <button
                key={HERO_SLIDES[i]}
                type="button"
                aria-current={on ? "true" : undefined}
                aria-label={t("landing.heroSlideshowGoTo", { n: i + 1 })}
                onClick={() => goTo(i)}
                className={[
                  "h-1.5 rounded-full transition-[width,background,box-shadow] duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright",
                  on
                    ? "w-6 bg-accent-bright shadow-[0_0_10px_rgb(var(--slice-accent)/0.35)] sm:w-7"
                    : "w-1.5 bg-white/[0.22] hover:bg-white/[0.36] sm:w-2",
                ].join(" ")}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
