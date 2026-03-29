"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { logSupabaseClientError } from "@/lib/supabase/log-error";
import {
  preferencesToUpsert,
  rowToPreferences,
  rowToSubscriptionRecord,
  subscriptionInsertFromRecord,
  subscriptionUpdateFromRecord,
  type PreferencesRow,
  type SubscriptionRow,
} from "@/lib/supabase/maps";
import { createSeedSubscriptions } from "@/lib/subscriptions/seed";
import type { Preferences } from "@/lib/validation/preferences";
import {
  subscriptionFormSchema,
  subscriptionRecordSchema,
  type SubscriptionFormInput,
  type SubscriptionRecord,
} from "@/lib/validation/subscription";
import { appLocaleSchema, type AppLocale } from "@/lib/i18n/locale";
import { sliceT } from "@/lib/i18n/messages";

type SubscriptionsContextValue = {
  ready: boolean;
  subscriptions: SubscriptionRecord[];
  preferences: Preferences;
  syncError: string | null;
  clearSyncError: () => void;
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

const defaultPrefs: Preferences = {
  hourlyWage: null,
  hoursPerWorkday: 8,
  currency: "USD",
  locale: "en",
};

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

async function fetchUserSlice(userId: string): Promise<{
  subscriptions: SubscriptionRecord[];
  preferences: Preferences;
}> {
  const supabase = createClient();
  const [subsRes, prefsRes] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: true }),
    supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (subsRes.error) throw subsRes.error;
  if (prefsRes.error) throw prefsRes.error;

  const rows = (subsRes.data ?? []) as SubscriptionRow[];
  const subscriptions = rows.map((r) => rowToSubscriptionRecord(r));

  let preferences = defaultPrefs;
  if (prefsRes.data) {
    preferences = rowToPreferences(prefsRes.data as PreferencesRow);
  } else {
    const { error: upsertErr } = await supabase
      .from("user_preferences")
      .upsert(preferencesToUpsert(userId, defaultPrefs), {
        onConflict: "user_id",
      });
    if (upsertErr) throw upsertErr;
  }

  return { subscriptions, preferences };
}

export function SubscriptionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [preferences, setPreferencesState] = useState<Preferences>(defaultPrefs);
  const [syncError, setSyncError] = useState<string | null>(null);

  const userIdRef = useRef<string | null>(null);
  const initialHydrationRef = useRef(false);
  const prefFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const localeRef = useRef<AppLocale>("en");
  localeRef.current = preferences.locale;

  const subscriptionsRef = useRef(subscriptions);
  subscriptionsRef.current = subscriptions;

  const clearSyncError = useCallback(() => setSyncError(null), []);

  const setLoadError = useCallback((locale: AppLocale) => {
    setSyncError(sliceT(locale, "data.loadFailed"));
  }, []);

  const setSaveError = useCallback((locale: AppLocale) => {
    setSyncError(sliceT(locale, "data.saveFailed"));
  }, []);

  const flushPreferences = useCallback(
    async (userId: string, prefs: Preferences) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("user_preferences")
        .upsert(preferencesToUpsert(userId, prefs), { onConflict: "user_id" });
      if (error) {
        logSupabaseClientError("preferences save failed", error);
        setSaveError(prefs.locale);
      }
    },
    [setSaveError]
  );

  const queuePreferencePersist = useCallback(
    (next: Preferences) => {
      const uid = userIdRef.current;
      if (!uid || !initialHydrationRef.current) return;
      if (prefFlushTimerRef.current) {
        clearTimeout(prefFlushTimerRef.current);
      }
      prefFlushTimerRef.current = setTimeout(() => {
        prefFlushTimerRef.current = null;
        void flushPreferences(uid, next);
      }, 400);
    },
    [flushPreferences]
  );

  useEffect(() => {
    return () => {
      if (prefFlushTimerRef.current) {
        clearTimeout(prefFlushTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    const authHydrationGenRef = { current: 0 };

    async function handleAuth(userId: string | null) {
      const myGen = ++authHydrationGenRef.current;

      if (!userId) {
        userIdRef.current = null;
        initialHydrationRef.current = false;
        setSubscriptions([]);
        setPreferencesState(defaultPrefs);
        setReady(true);
        return;
      }

      userIdRef.current = userId;
      try {
        const slice = await fetchUserSlice(userId);
        if (cancelled || myGen !== authHydrationGenRef.current) return;
        setSubscriptions(slice.subscriptions);
        setPreferencesState(slice.preferences);
        initialHydrationRef.current = true;
        setSyncError(null);
      } catch (e) {
        logSupabaseClientError("data load failed", e);
        if (cancelled || myGen !== authHydrationGenRef.current) return;
        initialHydrationRef.current = false;
        setLoadError(localeRef.current);
      } finally {
        if (!cancelled && myGen === authHydrationGenRef.current) {
          setReady(true);
        }
      }
    }

    /**
     * Never `await` other Supabase calls inside `onAuthStateChange`: the callback
     * runs under an auth mutex; awaiting `.from()` can deadlock and trigger
     * NavigatorLockAcquireTimeoutError ("another request stole it").
     * @see https://github.com/supabase/auth-js/blob/master/src/GoTrueClient.ts
     */
    const { data: authSub } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (cancelled) return;
        if (event === "TOKEN_REFRESHED") return;
        const userId = session?.user?.id ?? null;
        globalThis.setTimeout(() => {
          if (cancelled) return;
          void handleAuth(userId);
        }, 0);
      }
    );

    return () => {
      cancelled = true;
      authSub.subscription.unsubscribe();
    };
  }, [setLoadError]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = preferences.locale === "nl" ? "nl" : "en";
  }, [preferences.locale]);

  const setHourlyWage = useCallback(
    (value: number | null) => {
      setPreferencesState((p) => {
        const next = { ...p, hourlyWage: value };
        queuePreferencePersist(next);
        return next;
      });
    },
    [queuePreferencePersist]
  );

  const setHoursPerWorkday = useCallback(
    (value: number) => {
      setPreferencesState((p) => {
        const next = { ...p, hoursPerWorkday: value };
        queuePreferencePersist(next);
        return next;
      });
    },
    [queuePreferencePersist]
  );

  const setCurrency = useCallback(
    (code: string) => {
      setPreferencesState((p) => {
        const next = { ...p, currency: code.slice(0, 3).toUpperCase() };
        queuePreferencePersist(next);
        return next;
      });
    },
    [queuePreferencePersist]
  );

  const setLocale = useCallback(
    (locale: AppLocale) => {
      const nextLocale = appLocaleSchema.safeParse(locale);
      if (!nextLocale.success) return;
      setPreferencesState((p) => {
        const next = { ...p, locale: nextLocale.data };
        queuePreferencePersist(next);
        return next;
      });
    },
    [queuePreferencePersist]
  );

  const addSubscription = useCallback(
    (input: SubscriptionFormInput) => {
      const uid = userIdRef.current;
      if (!uid) return;
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const rec = toRecord(input, id, now);
      void (async () => {
        const supabase = createClient();
        const { error } = await supabase
          .from("subscriptions")
          .insert(subscriptionInsertFromRecord(uid, rec));
        if (error) {
          logSupabaseClientError("subscription insert failed", error);
          setSaveError(localeRef.current);
          return;
        }
        setSubscriptions((prev) => [...prev, rec]);
      })();
    },
    [setSaveError]
  );

  const updateSubscription = useCallback(
    (id: string, input: SubscriptionFormInput) => {
      const existing = subscriptionsRef.current.find((s) => s.id === id);
      if (!existing) return;
      const next = toRecord(input, id, existing.createdAt);
      void (async () => {
        const supabase = createClient();
        const { error } = await supabase
          .from("subscriptions")
          .update(subscriptionUpdateFromRecord(next))
          .eq("id", id);
        if (error) {
          logSupabaseClientError("subscription update failed", error);
          setSaveError(localeRef.current);
          return;
        }
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === id ? next : s))
        );
      })();
    },
    [setSaveError]
  );

  const deleteSubscription = useCallback(
    (id: string) => {
      void (async () => {
        const supabase = createClient();
        const { error } = await supabase
          .from("subscriptions")
          .delete()
          .eq("id", id);
        if (error) {
          logSupabaseClientError("subscription delete failed", error);
          setSaveError(localeRef.current);
          return;
        }
        setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      })();
    },
    [setSaveError]
  );

  const replaceSubscriptions = useCallback(
    (next: SubscriptionRecord[]) => {
      const uid = userIdRef.current;
      if (!uid) return;
      void (async () => {
        const supabase = createClient();
        const { error: delErr } = await supabase
          .from("subscriptions")
          .delete()
          .eq("user_id", uid);
        if (delErr) {
          logSupabaseClientError("subscriptions bulk delete failed", delErr);
          setSaveError(localeRef.current);
          return;
        }
        if (next.length === 0) {
          setSubscriptions([]);
          return;
        }
        const rows = next.map((r) => subscriptionInsertFromRecord(uid, r));
        const { error: insErr } = await supabase
          .from("subscriptions")
          .insert(rows);
        if (insErr) {
          logSupabaseClientError("subscriptions bulk insert failed", insErr);
          setSaveError(localeRef.current);
          return;
        }
        setSubscriptions(next);
      })();
    },
    [setSaveError]
  );

  const resetToDemo = useCallback(() => {
    const uid = userIdRef.current;
    if (!uid) return;
    void (async () => {
      const supabase = createClient();
      const templates = createSeedSubscriptions();
      const now = new Date().toISOString();
      const seeded: SubscriptionRecord[] = templates.map((t) => {
        const { id: _i, createdAt: _c, updatedAt: _u, ...rest } = t;
        void _i;
        void _c;
        void _u;
        return subscriptionRecordSchema.parse({
          ...rest,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        });
      });

      const { error: delErr } = await supabase
        .from("subscriptions")
        .delete()
        .eq("user_id", uid);
      if (delErr) {
        logSupabaseClientError("resetToDemo delete failed", delErr);
        setSaveError(localeRef.current);
        return;
      }
      const rows = seeded.map((r) => subscriptionInsertFromRecord(uid, r));
      const { error: insErr } = await supabase
        .from("subscriptions")
        .insert(rows);
      if (insErr) {
        logSupabaseClientError("resetToDemo insert failed", insErr);
        setSaveError(localeRef.current);
        return;
      }
      setSubscriptions(seeded);
    })();
  }, [setSaveError]);

  const clearAll = useCallback(() => {
    const uid = userIdRef.current;
    if (!uid) return;
    void (async () => {
      const supabase = createClient();
      const { error: delErr } = await supabase
        .from("subscriptions")
        .delete()
        .eq("user_id", uid);
      if (delErr) {
        logSupabaseClientError("clearAll delete failed", delErr);
        setSaveError(localeRef.current);
        return;
      }
      const resetPrefs = defaultPrefs;
      const { error: prefErr } = await supabase
        .from("user_preferences")
        .upsert(preferencesToUpsert(uid, resetPrefs), { onConflict: "user_id" });
      if (prefErr) {
        logSupabaseClientError("clearAll preferences reset failed", prefErr);
        setSaveError(localeRef.current);
        return;
      }
      setSubscriptions([]);
      setPreferencesState(resetPrefs);
    })();
  }, [setSaveError]);

  const value = useMemo(
    () => ({
      ready,
      subscriptions,
      preferences,
      syncError,
      clearSyncError,
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
      syncError,
      clearSyncError,
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
