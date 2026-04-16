"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  createServiceRoleClient,
  isServiceRoleConfigured,
} from "@/lib/supabase/admin";
import { logSupabaseClientError } from "@/lib/supabase/log-error";

const deleteAccountInputSchema = z.object({}).strict();

export type DeleteAccountResult =
  | { ok: true }
  | {
      ok: false;
      code: "unauthorized" | "invalid" | "not_configured" | "failed";
    };

/**
 * Permanently deletes the authenticated user from Supabase Auth. Related rows in
 * `user_preferences` and `subscriptions` are removed via `ON DELETE CASCADE`.
 */
export async function deleteUserAccount(
  raw: unknown
): Promise<DeleteAccountResult> {
  const parsed = deleteAccountInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: "invalid" };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return { ok: false, code: "unauthorized" };
  }

  if (!isServiceRoleConfigured()) {
    logSupabaseClientError(
      "deleteUserAccount",
      new Error("SUPABASE_SERVICE_ROLE_KEY missing")
    );
    return { ok: false, code: "not_configured" };
  }

  try {
    const admin = createServiceRoleClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      logSupabaseClientError("deleteUserAccount admin.deleteUser", error);
      return { ok: false, code: "failed" };
    }
    return { ok: true };
  } catch (e) {
    logSupabaseClientError("deleteUserAccount", e);
    return { ok: false, code: "failed" };
  }
}
