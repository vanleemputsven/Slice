"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, List, LogOut, Settings } from "lucide-react";
import { SliceMark } from "@/components/brand/slice-mark";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { HEADER_CONTROL_SHELL } from "@/components/layout/header-controls";
import { useSubscriptions } from "@/components/providers/subscriptions-provider";
import { createClient } from "@/lib/supabase/client";
import { useSliceT } from "@/lib/i18n/use-slice-t";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useSliceT();
  const { preferences, syncError, clearSyncError } = useSubscriptions();
  const displayName = preferences.preferredName?.trim() ?? "";

  const item = (href: string, label: string, icon: ReactNode) => {
    const active =
      pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        href={href}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-[background,color] ${
          active
            ? "bg-white/12 text-fg shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]"
            : "text-fg-secondary hover:bg-white/[0.06] hover:text-fg"
        }`}
      >
        <span className={active ? "text-accent-bright" : "text-muted"}>{icon}</span>
        {label}
      </Link>
    );
  };

  return (
    <header className="slice-header-shell sticky top-0 z-20">
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
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 max-w-full flex-1 items-center gap-3 sm:gap-4 md:flex-initial">
          <Link href="/dashboard" className="shrink-0" aria-label={t("header.homeAria")}>
            <SliceMark />
          </Link>
          {displayName ? (
            <p
              className="min-w-0 truncate font-display text-sm font-semibold tracking-tight text-fg-secondary"
              title={displayName}
            >
              {t("header.greetingNamed", { name: displayName })}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <nav
            className={`flex items-center gap-1 ${HEADER_CONTROL_SHELL}`}
            aria-label={t("header.navMain")}
          >
            {item(
              "/dashboard",
              t("header.navOverview"),
              <LayoutGrid className="size-4" aria-hidden />
            )}
            {item(
              "/subscriptions",
              t("header.navSubscriptions"),
              <List className="size-4" aria-hidden />
            )}
            {item(
              "/settings",
              t("header.navSettings"),
              <Settings className="size-4" aria-hidden />
            )}
          </nav>
          <LanguageToggle />
          <div className={`inline-flex min-h-0 ${HEADER_CONTROL_SHELL}`}>
            <button
              type="button"
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.refresh();
                router.push("/login");
              }}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-fg-secondary transition-[background,color] hover:bg-white/[0.06] hover:text-fg"
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
