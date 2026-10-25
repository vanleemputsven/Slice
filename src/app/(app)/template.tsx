import type { ReactNode } from "react";

/** Remounts on navigation. Motion stays off: this shell is opened often. */
export default function AppTemplate({ children }: { children: ReactNode }) {
  return children;
}
