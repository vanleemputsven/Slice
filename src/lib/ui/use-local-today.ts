"use client";

import { useEffect, useState } from "react";

/**
 * The person's local calendar day.
 * Stays null through SSR and hydration so a UTC server does not disagree
 * with a browser in another timezone about "today".
 */
export function useLocalToday(): Date | null {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    setToday(new Date());
  }, []);
  return today;
}
