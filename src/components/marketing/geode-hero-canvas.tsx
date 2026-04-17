"use client";

import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useMemo, useRef, type CSSProperties, type MutableRefObject } from "react";

const RAIL_COUNT = 10;
const BAR_COUNT = 12;

type Pointer = { x: number; y: number };

export type GeodeHeroCanvasProps = {
  pointerRef: MutableRefObject<Pointer>;
  paused: boolean;
  className?: string;
};

type RailConfig = {
  x: number;
  top: number;
  h: number;
  delay: number;
  width: number;
};

const rails: RailConfig[] = Array.from({ length: RAIL_COUNT }, (_, i) => {
  const t = i / (RAIL_COUNT - 1);
  const side = i % 2 === 0 ? -1 : 1;
  return {
    x: side * (27 + t * 29),
    top: 20 + (Math.sin(i * 1.14) * 0.5 + 0.5) * 40,
    h: 20 + (Math.cos(i * 1.33) * 0.5 + 0.5) * 42,
    delay: t * 0.09,
    width: 1 + ((i * 7) % 2),
  };
});

const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
  return {
    height: 14 + (Math.sin(i * 0.9) * 0.5 + 0.5) * 54,
    delay: 0.15 + i * 0.025,
  };
});

/**
 * Design-first hero layer: product-like rails, soft grid, and data bars.
 * Keeps motion subtle and purposeful so the background supports content.
 */
export function GeodeHeroCanvas({ pointerRef, paused, className }: GeodeHeroCanvasProps) {
  const reduceMotion = useReducedMotion();
  const disabled = reduceMotion || paused;
  const containerRef = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 50, damping: 28, mass: 0.7 });
  const sy = useSpring(py, { stiffness: 50, damping: 28, mass: 0.7 });
  const glowX = useTransform(sx, (v) => `${v * 100}%`);
  const glowY = useTransform(sy, (v) => `${v * 100}%`);
  const glowGradient = useMotionTemplate`radial-gradient(500px circle at ${glowX} ${glowY}, rgb(var(--slice-accent) / 0.08), transparent 62%)`;

  useAnimationFrame(() => {
    if (!containerRef.current) return;
    const { x, y } = pointerRef.current;
    px.set(x);
    py.set(y);
  });

  const baseStyle = useMemo<CSSProperties>(
    () => ({
      background:
        "linear-gradient(180deg, rgb(11 12 15 / 0.82) 0%, rgb(11 12 15 / 0.5) 44%, rgb(11 12 15 / 0.08) 100%)",
    }),
    []
  );

  return (
    <div ref={containerRef} className={className} style={baseStyle}>
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: glowGradient,
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-18 [background-image:linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.04)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="pointer-events-none absolute inset-x-[12%] top-[14%] h-[54%] rounded-2xl border border-white/[0.06] bg-[linear-gradient(165deg,rgb(var(--slice-surface)/0.24)_0%,rgb(var(--slice-canvas)/0.08)_100%)]" />

      <div className="pointer-events-none absolute inset-0">
        {rails.map((rail, i) => (
          <motion.span
            key={`rail-${i}`}
            className="absolute rounded-full bg-white/[0.08]"
            style={{
              left: `calc(50% + ${rail.x}%)`,
              top: `${rail.top}%`,
              width: `${rail.width}px`,
              height: `${rail.h}%`,
              filter: "blur(0.2px)",
            }}
            initial={{ opacity: 0, y: 4 }}
            animate={disabled ? { opacity: 0.14, y: 0 } : { opacity: [0.1, 0.2, 0.1], y: 0 }}
            transition={{
              duration: disabled ? 0.2 : 7.2 + (i % 5) * 0.7,
              delay: rail.delay,
              repeat: disabled ? 0 : Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-[26%] bottom-[19%] h-[22%] rounded-xl border border-white/[0.06] bg-[linear-gradient(180deg,rgb(var(--slice-surface)/0.24)_0%,rgb(var(--slice-canvas)/0.14)_100%)]">
        <div className="absolute inset-x-3 bottom-3 top-3 flex items-end gap-2">
          {bars.map((bar, i) => (
            <motion.span
              key={`bar-${i}`}
              className="block flex-1 rounded-t-sm bg-[linear-gradient(180deg,rgb(var(--slice-accent-bright)/0.45)_0%,rgb(var(--slice-accent)/0.22)_100%)]"
              style={{ height: `${bar.height}%` }}
              initial={{ opacity: 0, scaleY: 0.45 }}
              animate={disabled ? { opacity: 0.32, scaleY: 1 } : { opacity: [0.24, 0.4, 0.24], scaleY: [0.96, 1.02, 0.96] }}
              transition={{
                duration: disabled ? 0.2 : 6.8 + (i % 4) * 0.45,
                delay: bar.delay,
                repeat: disabled ? 0 : Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute right-[2%] top-[12%] h-[40%] w-[26%] rounded-[1.6rem] border border-white/[0.05] bg-[linear-gradient(180deg,rgb(var(--slice-surface-alt)/0.2)_0%,rgb(var(--slice-canvas)/0.08)_100%)] opacity-70" />
    </div>
  );
}
