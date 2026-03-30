import type { SupabaseClient } from "@supabase/supabase-js";
import { preferencesToUpsert } from "@/lib/supabase/maps";
import { defaultPreferences } from "@/lib/validation/preferences";

/** Postgres `unique_violation` — row already exists (trigger or concurrent insert). */
export const PG_UNIQUE_VIOLATION = "23505";

/**
 * Ensures a `user_preferences` row exists for `userId` by inserting defaults.
 * Does not use upsert: avoids edge cases; treats duplicate key as success.
 */
export async function insertDefaultUserPreferencesIfMissing(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("user_preferences")
    .insert(preferencesToUpsert(userId, defaultPreferences));

  if (!error) return;
  if (error.code === PG_UNIQUE_VIOLATION) return;
  throw error;
}
