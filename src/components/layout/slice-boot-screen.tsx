"use client";

import { useSubscriptions } from "@/components/providers/subscriptions-provider";
import { useSliceT } from "@/lib/i18n/use-slice-t";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const STORAGE_KEY = "slice-boot-v1";
const MIN_VISIBLE_MS = 720;
const SAFETY_MAX_MS = 12_000;

function markSeen() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* private / disabled storage */
  }
}

/**
 * Drive bar toward a ceiling while waiting; accelerate to 100% when
 * the document is complete and app data is ready.
 */
function computeLoadTarget(
  elapsedMs: number,
  docComplete: boolean,
  appReady: boolean
): number {
  if (appReady && docComplete) return 100;

  const cap = docComplete ? 92 : 82;
  const tauMs = docComplete ? 1_000 : 2_200;
  const curved = cap * (1 - Math.exp(-elapsedMs / tauMs));
  const floor = docComplete ? Math.min(58 + elapsedMs / 120, cap - 2) : 0;
  return Math.min(cap, Math.max(curved, floor));
}

export function SliceBootScreen({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const { ready: appReady } = useSubscriptions();
  const { t } = useSliceT();
  const [active, setActive] = useState(true);
  const [progress, setProgress] = useState(0);
  const dismissStarted = useRef(false);

  /* Skip splash for same-tab revisits; must run before paint (session not available on SSR). */
  /* eslint-disable react-hooks/set-state-in-effect -- sync read from sessionStorage before first paint */
  useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") {
        setActive(false);
      }
    } catch {
      /* keep active for first-time splash */
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    const t0 = performance.now();
    let raf = 0;

    const loop = () => {
      if (cancelled) return;
      const elapsed = performance.now() - t0;
      const docComplete = document.readyState === "complete";
      const target = computeLoadTarget(elapsed, docComplete, appReady);

      setProgress((p) => {
        const alpha = reduceMotion
          ? target >= 99
            ? 1
            : 0.14
          : target >= 99
            ? 0.22
            : 0.085;
        const step = (target - p) * alpha;
        const minStep = target >= 99 && p < 99 ? 0.45 : 0;
        return Math.min(100, Math.max(p + step, p + minStep));
      });

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [active, appReady, reduceMotion]);

  const beginDismiss = useCallback(() => {
    if (dismissStarted.current || !active) return;
    dismissStarted.current = true;
    markSeen();
    setActive(false);
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const startedAt = Date.now();
    let cancelled = false;
    /* DOM setTimeout id is a number; avoid NodeJS.Timeout from merged typings */
    let dismissTimer: number | undefined;

    const maybeDismiss = () => {
      if (cancelled) return;
      if (document.readyState !== "complete" || !appReady) return;
      const elapsed = Date.now() - startedAt;
      const rest = Math.max(0, MIN_VISIBLE_MS - elapsed);
      if (dismissTimer !== undefined) window.clearTimeout(dismissTimer);
      dismissTimer = window.setTimeout(() => {
        if (!cancelled) beginDismiss();
      }, rest);
    };

    const onLoad = () => maybeDismiss();

    if (document.readyState !== "complete") {
      window.addEventListener("load", onLoad, { once: true });
    }
    maybeDismiss();

    const safety = window.setTimeout(() => {
      if (!cancelled) beginDismiss();
    }, SAFETY_MAX_MS);

    return () => {
      cancelled = true;
      if (dismissTimer !== undefined) window.clearTimeout(dismissTimer);
      window.removeEventListener("load", onLoad);
      window.clearTimeout(safety);
    };
  }, [active, appReady, beginDismiss]);

  const overlayTransition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };

  const rounded = Math.round(progress);

  return (
    <>
      {children}
      <AnimatePresence initial={false}>
        {active ? (
          <motion.div
            key="slice-boot"
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label={t("boot.ariaBusy")}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 bg-canvas px-6"
            style={{
              backgroundImage: [
                "radial-gradient(ellipse 130% 70% at 50% -35%, rgb(255 88 77 / 0.12), transparent 52%)",
                "radial-gradient(ellipse 85% 55% at 50% 115%, rgb(255 88 77 / 0.05), transparent 45%)",
              ].join(", "),
            }}
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: overlayTransition,
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.4]"
              aria-hidden
              style={{
                backgroundImage: `radial-gradient(circle at center, rgb(255 255 255 / 0.055) 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
                maskImage:
                  "radial-gradient(ellipse 72% 65% at 50% 42%, black, transparent)",
              }}
            />

            <motion.div
              className="relative flex flex-col items-center gap-6"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 8 }}
              animate={
                reduceMotion
                  ? {}
                  : {
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      transition: {
                        opacity: { duration: 0.38, ease: [0.26, 0.08, 0.25, 1] },
                        scale: {
                          type: "spring",
                          stiffness: 380,
                          damping: 28,
                          mass: 0.55,
                        },
                        y: {
                          type: "spring",
                          stiffness: 380,
                          damping: 28,
                          mass: 0.55,
                        },
                      },
                    }
              }
            >
              <Image
                src="/logo.svg"
                alt=""
                width={220}
                height={76}
                className="h-10 w-auto max-w-[min(100%,14rem)] object-contain sm:h-11"
                priority
                unoptimized
              />
              <p className="font-display text-center text-sm font-semibold tracking-wide text-fg-secondary">
                {t("boot.tagline")}
              </p>

              <div className="flex w-[min(14rem,72vw)] flex-col items-center gap-2">
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={rounded}
                  aria-valuetext={t("boot.progressPercent", { pct: rounded })}
                  className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]"
                >
                  <div
                    className="relative h-full overflow-hidden rounded-full will-change-[width]"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-deep via-accent to-accent-bright" />
                    {!reduceMotion ? (
                      <motion.div
                        aria-hidden
                        className="absolute -inset-y-px left-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-80"
                        style={{ width: "min(42%, 6rem)" }}
                        animate={{ x: ["-30%", "320%"] }}
                        transition={{
                          duration: 1.35,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    ) : null}
                  </div>
                </div>
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
                  {progress >= 96 ? t("boot.almostReady") : t("boot.loading")}
                </span>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
