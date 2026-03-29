"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      opacity: { duration: 0.18, ease: [0.26, 0.08, 0.25, 1] as const },
      y: {
        type: "spring" as const,
        stiffness: 520,
        damping: 36,
        mass: 0.62,
      },
    },
  },
  exit: {
    opacity: 0,
    y: -5,
    transition: {
      duration: 0.12,
      ease: [0.4, 0, 1, 1] as const,
    },
  },
};

const reducedVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.12, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.1, ease: "easeIn" as const },
  },
};

export default function AppTemplate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const variants = reduceMotion ? reducedVariants : pageVariants;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className="min-h-0 will-change-[opacity,transform]"
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
