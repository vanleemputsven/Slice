const STORAGE_VERSION = 1;
const KEY_SUBS = `slice:v${STORAGE_VERSION}:subscriptions`;
const KEY_PREFS = `slice:v${STORAGE_VERSION}:preferences`;

import type { Preferences } from "@/lib/validation/preferences";
import type { SubscriptionRecord } from "@/lib/validation/subscription";

/** `null` = key absent (first visit). Empty array = user cleared everything. */
export function loadSubscriptionsJson(): unknown | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY_SUBS);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function saveSubscriptions(subs: SubscriptionRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_SUBS, JSON.stringify(subs));
}

export function loadPreferencesJson(): unknown | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY_PREFS);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function savePreferences(prefs: Preferences): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_PREFS, JSON.stringify(prefs));
}

/** Wipes preferences and subscriptions. Keeps an empty list so first-load seed does not re-run. */
export function clearSliceStorage(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_SUBS, JSON.stringify([]));
  window.localStorage.removeItem(KEY_PREFS);
}
