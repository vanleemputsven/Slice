"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { SliceMark } from "@/components/brand/slice-mark";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { HEADER_CONTROL_SHELL } from "@/components/layout/header-controls";
import { useSliceT } from "@/lib/i18n/use-slice-t";

export function AppHeader() {
  const pathname = usePathname();
  const { t } = useSliceT();

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
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="shrink-0" aria-label={t("header.homeAria")}>
          <SliceMark />
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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
          </nav>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
