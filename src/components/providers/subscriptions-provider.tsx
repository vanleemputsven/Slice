"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { preferencesSchema, type Preferences } from "@/lib/validation/preferences";
import {
  subscriptionFormSchema,
  subscriptionRecordSchema,
  type SubscriptionFormInput,
  type SubscriptionRecord,
} from "@/lib/validation/subscription";
import { parseSubscriptionRecords } from "@/lib/subscriptions/parse";
import { createSeedSubscriptions } from "@/lib/subscriptions/seed";
import {
  clearSliceStorage,
  loadPreferencesJson,
  loadSubscriptionsJson,
  savePreferences,
  saveSubscriptions,
} from "@/lib/storage/slice-storage";
import { appLocaleSchema, type AppLocale } from "@/lib/i18n/locale";

type SubscriptionsContextValue = {
  ready: boolean;
  subscriptions: SubscriptionRecord[];
  preferences: Preferences;
  setHourlyWage: (value: number | null) => void;
  setHoursPerWorkday: (value: number) => void;
  setCurrency: (code: string) => void;
  setLocale: (locale: AppLocale) => void;
  addSubscription: (input: SubscriptionFormInput) => void;
  updateSubscription: (id: string, input: SubscriptionFormInput) => void;
  deleteSubscription: (id: string) => void;
  replaceSubscriptions: (next: SubscriptionRecord[]) => void;
  resetToDemo: () => void;
  clearAll: () => void;
};

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(
  null
);

function normalizePrefs(input: unknown): Preferences {
  const parsed = preferencesSchema.safeParse(input ?? {});
  if (parsed.success) return parsed.data;
  return {
    hourlyWage: null,
    hoursPerWorkday: 8,
    currency: "USD",
    locale: "en",
  };
}

function toRecord(
  input: SubscriptionFormInput,
  id: string,
  createdAt: string
): SubscriptionRecord {
  const body = subscriptionFormSchema.parse(input);
  const updatedAt = new Date().toISOString();
  return subscriptionRecordSchema.parse({
    ...body,
    id,
    createdAt,
    updatedAt,
  });
}

export function SubscriptionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [preferences, setPreferencesState] = useState<Preferences>({
    hourlyWage: null,
    hoursPerWorkday: 8,
    currency: "USD",
    locale: "en",
  });

  /* One-shot client hydration from localStorage (no window on server). */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const prefsJson = loadPreferencesJson();
    setPreferencesState(normalizePrefs(prefsJson));

    const rawSubs = loadSubscriptionsJson();
    if (rawSubs === null) {
      const seed = createSeedSubscriptions();
      setSubscriptions(seed);
      saveSubscriptions(seed);
    } else {
      setSubscriptions(parseSubscriptionRecords(rawSubs));
    }
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = preferences.locale === "nl" ? "nl" : "en";
  }, [preferences.locale]);

  useEffect(() => {
    if (!ready) return;
    saveSubscriptions(subscriptions);
  }, [subscriptions, ready]);

  useEffect(() => {
    if (!ready) return;
    savePreferences(preferences);
  }, [preferences, ready]);

  const setHourlyWage = useCallback((value: number | null) => {
    setPreferencesState((p) => ({ ...p, hourlyWage: value }));
  }, []);

  const setHoursPerWorkday = useCallback((value: number) => {
    setPreferencesState((p) => ({ ...p, hoursPerWorkday: value }));
  }, []);

  const setCurrency = useCallback((code: string) => {
    setPreferencesState((p) => ({ ...p, currency: code.slice(0, 3).toUpperCase() }));
  }, []);

  const setLocale = useCallback((locale: AppLocale) => {
    const next = appLocaleSchema.safeParse(locale);
    if (!next.success) return;
    setPreferencesState((p) => ({ ...p, locale: next.data }));
  }, []);

  const addSubscription = useCallback((input: SubscriptionFormInput) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const rec = toRecord(input, id, now);
    setSubscriptions((prev) => [...prev, rec]);
  }, []);

  const updateSubscription = useCallback(
    (id: string, input: SubscriptionFormInput) => {
      setSubscriptions((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          const next = toRecord(input, id, s.createdAt);
          return next;
        })
      );
    },
    []
  );

  const deleteSubscription = useCallback((id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const replaceSubscriptions = useCallback((next: SubscriptionRecord[]) => {
    setSubscriptions(next);
  }, []);

  const resetToDemo = useCallback(() => {
    setSubscriptions(createSeedSubscriptions());
  }, []);

  const clearAll = useCallback(() => {
    clearSliceStorage();
    setSubscriptions([]);
    setPreferencesState({
      hourlyWage: null,
      hoursPerWorkday: 8,
      currency: "USD",
      locale: "en",
    });
  }, []);

  const value = useMemo(
    () => ({
      ready,
      subscriptions,
      preferences,
      setHourlyWage,
      setHoursPerWorkday,
      setCurrency,
      setLocale,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      replaceSubscriptions,
      resetToDemo,
      clearAll,
    }),
    [
      ready,
      subscriptions,
      preferences,
      setHourlyWage,
      setHoursPerWorkday,
      setCurrency,
      setLocale,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      replaceSubscriptions,
      resetToDemo,
      clearAll,
    ]
  );

  return (
    <SubscriptionsContext.Provider value={value}>
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const ctx = useContext(SubscriptionsContext);
  if (!ctx) {
    throw new Error("useSubscriptions must be used within SubscriptionsProvider");
  }
  return ctx;
}
