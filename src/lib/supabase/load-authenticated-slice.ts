import { insertDefaultUserPreferencesIfMissing } from "@/lib/supabase/bootstrap-user-preferences";
import { createClient } from "@/lib/supabase/server";
import {
  rowToPreferences,
  rowToSubscriptionRecord,
  type PreferencesRow,
  type SubscriptionRow,
} from "@/lib/supabase/maps";
import type { AuthenticatedSliceSnapshot } from "@/lib/subscriptions/authenticated-slice-snapshot";
import { defaultPreferences } from "@/lib/validation/preferences";

/**
 * Loads the authenticated user's subscriptions and preferences using the session
 * cookies on the server. Used to hydrate {@link SubscriptionsProvider} so currency
 * and lists match the database on first paint.
 */
export async function loadAuthenticatedSlice(): Promise<AuthenticatedSliceSnapshot | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const userId = user.id;
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

    if (subsRes.error || prefsRes.error) {
      return null;
    }

    const rows = (subsRes.data ?? []) as SubscriptionRow[];
    const subscriptions = rows.map((r) => rowToSubscriptionRecord(r));

    let preferences = defaultPreferences;
    if (prefsRes.data) {
      preferences = rowToPreferences(prefsRes.data as PreferencesRow);
    } else {
      try {
        await insertDefaultUserPreferencesIfMissing(supabase, userId);
      } catch {
        return null;
      }
      const { data: prefsAgain, error: prefsAgainErr } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (prefsAgainErr) return null;
      if (prefsAgain) {
        preferences = rowToPreferences(prefsAgain as PreferencesRow);
      }
    }

    return { userId, subscriptions, preferences };
  } catch {
    return null;
  }
}
