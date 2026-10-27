"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";
import { HEADER_CONTROL_SHELL } from "@/components/layout/header-controls";

/** Strong ease-out — shared by every sliding pill in the app */
export const SLICE_EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

export const SLICE_PILL =
  "pointer-events-none absolute inset-y-1 rounded-full bg-white/12 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] motion-reduce:!transition-none";

type PillBox = { left: number; width: number; ready: boolean };

function useSlidingPill(activeIndex: number, layoutKey: string) {
  const listRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const [pill, setPill] = useState<PillBox>({
    left: 0,
    width: 0,
    ready: false,
  });

  useLayoutEffect(() => {
    const update = () => {
      if (activeIndex < 0) {
        setPill((prev) => ({ ...prev, ready: false }));
        return;
      }
      const active = itemRefs.current[activeIndex];
      if (!active) return;
      setPill({
        left: active.offsetLeft,
        width: active.offsetWidth,
        ready: true,
      });
    };

    update();

    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(update);
    observer.observe(list);
    for (const el of itemRefs.current) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [activeIndex, layoutKey]);

  const setItemRef = (index: number) => (el: HTMLElement | null) => {
    itemRefs.current[index] = el;
  };

  const pillStyle: CSSProperties = {
    left: pill.left,
    width: pill.width,
    opacity: pill.ready ? 1 : 0,
    transition: `left 200ms ${SLICE_EASE_OUT}, width 200ms ${SLICE_EASE_OUT}, opacity 160ms ${SLICE_EASE_OUT}`,
  };

  return { listRef, setItemRef, pillStyle };
}

function segmentItemClass(active: boolean, size: "sm" | "md") {
  const height =
    size === "sm" ? "min-h-9 px-3 text-sm" : "min-h-11 px-3.5 text-sm";
  return `relative z-[1] flex ${height} shrink-0 items-center justify-center rounded-full text-center font-medium leading-tight transition-[color,transform] duration-150 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 ${
    active ? "font-semibold text-fg" : "text-fg-secondary hover:text-fg"
  }`;
}

export type SegmentOption<T extends string> = {
  value: T;
  label: ReactNode;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
  ariaLabel: string;
  className?: string;
  size?: "sm" | "md";
  /** Stretch options evenly (e.g. NL / EN) */
  equalWidth?: boolean;
  /** Use tablist semantics (auth mode switcher) */
  tabs?: boolean;
};

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className = "",
  size = "md",
  equalWidth = false,
  tabs = false,
}: SegmentedControlProps<T>) {
  const activeIndex = options.findIndex((option) => option.value === value);
  const layoutKey = options.map((option) => String(option.value)).join("|");
  const { listRef, setItemRef, pillStyle } = useSlidingPill(
    activeIndex,
    layoutKey
  );

  return (
    <div
      ref={(el) => {
        listRef.current = el;
      }}
      role={tabs ? "tablist" : "group"}
      aria-label={ariaLabel}
      className={`relative inline-flex max-w-full ${HEADER_CONTROL_SHELL} ${className}`}
    >
      <span aria-hidden className={SLICE_PILL} style={pillStyle} />
      {options.map((option, index) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            id={tabs ? `segment-tab-${option.value}` : undefined}
            role={tabs ? "tab" : undefined}
            ref={setItemRef(index)}
            aria-pressed={tabs ? undefined : active}
            aria-selected={tabs ? active : undefined}
            className={`${segmentItemClass(active, size)} ${
              equalWidth ? "min-w-0 flex-1 tabular-nums" : ""
            }`}
            style={{ transitionTimingFunction: SLICE_EASE_OUT }}
            onClick={() => {
              if (option.value !== value) onChange(option.value);
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export type SegmentedLinkOption = {
  href: string;
  label: ReactNode;
  active: boolean;
};

type SegmentedNavProps = {
  items: SegmentedLinkOption[];
  ariaLabel: string;
  className?: string;
};

/** Same sliding pill as SegmentedControl, for in-app route links */
export function SegmentedNav({
  items,
  ariaLabel,
  className = "",
}: SegmentedNavProps) {
  const activeIndex = items.findIndex((item) => item.active);
  const layoutKey = items.map((item) => item.href).join("|");
  const { listRef, setItemRef, pillStyle } = useSlidingPill(
    activeIndex,
    layoutKey
  );

  return (
    <nav
      ref={(el) => {
        listRef.current = el;
      }}
      aria-label={ariaLabel}
      className={`relative grid grid-cols-3 sm:inline-flex sm:grid-cols-none ${HEADER_CONTROL_SHELL} ${className}`}
    >
      <span aria-hidden className={SLICE_PILL} style={pillStyle} />
      {items.map((item, index) => (
        <Link
          key={item.href}
          href={item.href}
          ref={setItemRef(index)}
          aria-current={item.active ? "page" : undefined}
          className={`${segmentItemClass(item.active, "md")} px-3 text-xs sm:px-3.5 sm:text-sm`}
          style={{ transitionTimingFunction: SLICE_EASE_OUT }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

type ToggleChipProps = {
  pressed: boolean;
  onPressedChange: (next: boolean) => void;
  children: ReactNode;
  className?: string;
};

/** Standalone on/off chip with the same pill fade (for non-exclusive filters) */
export function ToggleChip({
  pressed,
  onPressedChange,
  children,
  className = "",
}: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={`relative inline-flex ${HEADER_CONTROL_SHELL} ${className}`}
      onClick={() => onPressedChange(!pressed)}
    >
      <span
        aria-hidden
        className={SLICE_PILL}
        style={{
          left: 4,
          right: 4,
          width: "auto",
          opacity: pressed ? 1 : 0,
          transform: pressed ? "scale(1)" : "scale(0.92)",
          transition: `opacity 160ms ${SLICE_EASE_OUT}, transform 200ms ${SLICE_EASE_OUT}`,
        }}
      />
      <span
        className={`relative z-[1] flex min-h-9 items-center justify-center rounded-full px-3 text-sm font-medium transition-[color,transform] duration-150 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 ${
          pressed ? "font-semibold text-fg" : "text-fg-secondary hover:text-fg"
        }`}
        style={{ transitionTimingFunction: SLICE_EASE_OUT }}
      >
        {children}
      </span>
    </button>
  );
}
