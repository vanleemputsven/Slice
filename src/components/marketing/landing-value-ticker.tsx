"use client";

import Link from "next/link";
import { Fragment, useMemo } from "react";
import type { SliceMessageKey } from "@/lib/i18n/messages";

type Translate = (
  key: SliceMessageKey,
  vars?: Record<string, string | number>
) => string;

export type LandingValueTickerProps = {
  t: Translate;
  isSignedIn: boolean;
  reduceMotion: boolean;
  onHashClick: (
    sectionId: string
  ) => (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

type TickerDef = {
  id: string;
  href: string;
  labelKey: SliceMessageKey;
  isHash: boolean;
};

/** Short labels (nav keys) — calmer loop at the bottom of the page. */
const FOOTER_TICKER_DEFS: readonly TickerDef[] = [
  {
    id: "scan",
    href: "/demo",
    labelKey: "landing.navDemo",
    isHash: false,
  },
  {
    id: "features",
    href: "#features",
    labelKey: "landing.navFeatures",
    isHash: true,
  },
  {
    id: "how",
    href: "#how",
    labelKey: "landing.navHow",
    isHash: true,
  },
  {
    id: "security",
    href: "#security",
    labelKey: "landing.navSecurity",
    isHash: true,
  },
] as const;

/** One pass of links is shorter than most viewports — repeat for an even fill while scrolling. */
const FOOTER_TICKER_VISUAL_REPEATS = 6;

const footerLinkClass =
  "inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[0.6875rem] font-medium tracking-[0.01em] text-muted/95 transition-[color,background-color] hover:bg-white/[0.04] hover:text-fg-secondary sm:text-xs";

function sectionIdFromHash(href: string): string | null {
  if (!href.startsWith("#")) return null;
  const id = href.slice(1);
  return id.length > 0 ? id : null;
}

function TickerSegment({
  defs,
  t,
  onHashClick,
  linkTabIndex,
  isSignedIn,
  visualRepeats,
}: {
  defs: readonly TickerDef[];
  t: Translate;
  onHashClick: LandingValueTickerProps["onHashClick"];
  linkTabIndex: 0 | -1;
  isSignedIn: boolean;
  visualRepeats: number;
}) {
  const items = useMemo(() => {
    const cta: TickerDef = {
      id: "cta",
      href: isSignedIn ? "/dashboard" : "/login",
      labelKey: isSignedIn
        ? "landing.tickerItemCtaDash"
        : "landing.tickerItemCta",
      isHash: false,
    };
    return [...defs, cta] as const;
  }, [defs, isSignedIn]);

  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
      {Array.from({ length: visualRepeats }, (_, rep) => (
        <Fragment key={rep}>
          {rep > 0 ? (
            <span className="select-none px-0.5 text-muted/35" aria-hidden>
              ·
            </span>
          ) : null}
          <span
            className="flex items-center gap-1.5 sm:gap-2"
            {...(rep > 0 ? { "aria-hidden": true as const } : {})}
          >
            {items.map((item, index) => {
              const section = item.isHash ? sectionIdFromHash(item.href) : null;
              const hashHandler = section ? onHashClick(section) : undefined;
              const label = t(item.labelKey);
              const tabFocus = rep > 0 ? (-1 as const) : linkTabIndex;

              return (
                <Fragment key={`${rep}-${item.id}`}>
                  {index > 0 ? (
                    <span className="select-none text-muted/45" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  <Link
                    href={item.href}
                    className={footerLinkClass}
                    onClick={hashHandler}
                    tabIndex={tabFocus}
                  >
                    {label}
                  </Link>
                </Fragment>
              );
            })}
          </span>
        </Fragment>
      ))}
    </div>
  );
}

export function LandingValueTicker({
  t,
  isSignedIn,
  reduceMotion,
  onHashClick,
}: LandingValueTickerProps) {
  if (reduceMotion) {
    return (
      <div
        className="border-b border-white/[0.05] bg-white/[0.015]"
        role="navigation"
        aria-label={t("landing.tickerAria")}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2 gap-y-1.5 px-4 py-5 sm:px-6 lg:px-8">
          <TickerSegment
            defs={FOOTER_TICKER_DEFS}
            t={t}
            onHashClick={onHashClick}
            linkTabIndex={0}
            isSignedIn={isSignedIn}
            visualRepeats={1}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="slice-ticker-shell-footer w-full max-w-full overflow-x-hidden border-b border-white/[0.05] bg-white/[0.015] py-5"
      role="navigation"
      aria-label={t("landing.tickerAria")}
    >
      <div className="slice-ticker-track-footer">
        <div className="flex shrink-0 items-center pr-8 sm:pr-12">
          <TickerSegment
            defs={FOOTER_TICKER_DEFS}
            t={t}
            onHashClick={onHashClick}
            linkTabIndex={0}
            isSignedIn={isSignedIn}
            visualRepeats={FOOTER_TICKER_VISUAL_REPEATS}
          />
        </div>
        <div className="flex shrink-0 items-center pr-8 sm:pr-12" aria-hidden>
          <TickerSegment
            defs={FOOTER_TICKER_DEFS}
            t={t}
            onHashClick={onHashClick}
            linkTabIndex={-1}
            isSignedIn={isSignedIn}
            visualRepeats={FOOTER_TICKER_VISUAL_REPEATS}
          />
        </div>
      </div>
    </div>
  );
}
