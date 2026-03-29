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

export function SliceBootScreen({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const { ready: appReady } = useSubscriptions();
  const { t } = useSliceT();
  const [active, setActive] = useState(true);
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

              <div
                className="flex w-[min(14rem,72vw)] flex-col items-center gap-2"
                aria-hidden
              >
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-accent-deep via-accent to-accent-bright"
                    style={{ transformOrigin: "0% 50%" }}
                    initial={reduceMotion ? false : { scaleX: 0.08, opacity: 0.6 }}
                    animate={
                      reduceMotion
                        ? { scaleX: 0.35 }
                        : {
                            scaleX: [0.12, 0.55, 0.22, 0.78, 0.35, 0.92],
                            opacity: [0.65, 1, 0.8, 1, 0.75, 1],
                            transition: {
                              duration: 2.1,
                              repeat: Infinity,
                              ease: "easeInOut",
                            },
                          }
                    }
                  />
                </div>
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
                  {t("boot.loading")}
                </span>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
