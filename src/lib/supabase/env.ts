import { z } from "zod";

const rawEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  key: z.string().min(1),
});

function readSupabaseKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Validates env when creating clients; fails fast in development. */
export function getSupabasePublicConfig(): { url: string; anonKey: string } {
  const key = readSupabaseKey();
  const parsed = rawEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key,
  });
  if (!parsed.success) {
    throw new Error(
      "Supabase: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    );
  }
  return { url: parsed.data.NEXT_PUBLIC_SUPABASE_URL, anonKey: parsed.data.key };
}
