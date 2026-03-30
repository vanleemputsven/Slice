"use server";

import { createClient } from "@/lib/supabase/server";
import { welcomeProfileFormSchema } from "@/lib/validation/welcome-profile";

export type WelcomeActionResult =
  | { ok: true }
  | { ok: false; code: "unauthorized" | "invalid" | "save_failed" };

export async function completeWelcomeProfile(
  raw: unknown
): Promise<WelcomeActionResult> {
  const parsed = welcomeProfileFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: "invalid" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, code: "unauthorized" };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("user_preferences")
    .update({
      preferred_name: parsed.data.preferredName,
      locale: parsed.data.locale,
      currency: parsed.data.currency,
      welcome_completed_at: now,
      updated_at: now,
    })
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, code: "save_failed" };
  }
  return { ok: true };
}

export async function skipWelcomeProfile(): Promise<WelcomeActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, code: "unauthorized" };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("user_preferences")
    .update({
      welcome_completed_at: now,
      updated_at: now,
    })
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, code: "save_failed" };
  }
  return { ok: true };
}
