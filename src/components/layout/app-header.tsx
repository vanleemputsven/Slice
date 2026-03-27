"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { SliceMark } from "@/components/brand/slice-mark";

export function AppHeader() {
  const pathname = usePathname();

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
        <Link href="/dashboard" className="shrink-0" aria-label="Slice home">
          <SliceMark />
        </Link>
        <p className="order-3 hidden max-w-xs text-[13px] leading-snug text-muted sm:order-none sm:block">
          Less overlap, honest splits, real hours.
        </p>
        <nav
          className="flex items-center gap-1 rounded-full bg-white/[0.03] p-1 ring-1 ring-white/[0.06]"
          aria-label="Main"
        >
          {item(
            "/dashboard",
            "Overview",
            <LayoutGrid className="size-4" aria-hidden />
          )}
          {item(
            "/subscriptions",
            "Subscriptions",
            <List className="size-4" aria-hidden />
          )}
        </nav>
      </div>
    </header>
  );
}
