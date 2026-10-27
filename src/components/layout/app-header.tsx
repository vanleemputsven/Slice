"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { SliceMark } from "@/components/brand/slice-mark";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { HEADER_CONTROL_SHELL } from "@/components/layout/header-controls";
import {
  SegmentedNav,
  SLICE_EASE_OUT,
} from "@/components/ui/segmented-control";
import { useSubscriptions } from "@/components/providers/subscriptions-provider";
import { createClient } from "@/lib/supabase/client";
import { useSliceT } from "@/lib/i18n/use-slice-t";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useSliceT();
  const { preferences, syncError, clearSyncError } = useSubscriptions();
  const displayName = preferences.preferredName?.trim() ?? "";

  const navItems = [
    {
      href: "/dashboard",
      label: t("header.navOverview"),
      active:
        pathname === "/dashboard" || pathname.startsWith("/dashboard/"),
    },
    {
      href: "/subscriptions",
      label: t("header.navSubscriptions"),
      active:
        pathname === "/subscriptions" ||
        pathname.startsWith("/subscriptions/"),
    },
    {
      href: "/settings",
      label: t("header.navSettings"),
      active: pathname === "/settings" || pathname.startsWith("/settings/"),
    },
  ];

  return (
    <header className="slice-header-shell sticky top-0 z-20">
      <a
        href="#app-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-30 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:text-fg"
      >
        {t("header.skip")}
      </a>
      {syncError ? (
        <div
          role="alert"
          aria-live="polite"
          aria-label={t("header.syncErrorAria")}
          className="border-b border-accent/25 bg-accent/10 px-4 py-2 text-center text-sm text-fg sm:px-6"
        >
          <span className="inline-flex flex-wrap items-center justify-center gap-3">
            <span>{syncError}</span>
            <button
              type="button"
              onClick={() => clearSyncError()}
              className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-fg hover:bg-white/[0.14]"
            >
              {t("header.dismissError")}
            </button>
          </span>
        </div>
      ) : null}

      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-3 px-4 py-3 sm:gap-x-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="shrink-0 transition-opacity duration-150 hover:opacity-90"
          style={{ transitionTimingFunction: SLICE_EASE_OUT }}
          aria-label={t("header.homeAria")}
        >
          <SliceMark />
        </Link>

        <SegmentedNav
          items={navItems}
          ariaLabel={t("header.navMain")}
          className="order-last w-full basis-full sm:order-none sm:ml-1 sm:w-auto sm:basis-auto md:ml-2"
        />

        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5">
          {displayName ? (
            <p
              className="hidden min-w-0 max-w-[9rem] truncate font-display text-sm font-medium tracking-tight text-muted lg:block xl:max-w-[12rem]"
              title={displayName}
            >
              {t("header.greetingNamed", { name: displayName })}
            </p>
          ) : null}
          <LanguageToggle />
          <div className={`inline-flex ${HEADER_CONTROL_SHELL}`}>
            <button
              type="button"
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.refresh();
                router.push("/login");
              }}
              className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold text-fg-secondary transition-[background,color,transform] duration-150 hover:bg-white/[0.06] hover:text-fg active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
              style={{ transitionTimingFunction: SLICE_EASE_OUT }}
            >
              <LogOut className="size-4 shrink-0" aria-hidden />
              <span className="hidden sm:inline">{t("header.signOut")}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
