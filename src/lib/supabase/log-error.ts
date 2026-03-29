/**
 * PostgREST / GoTrue errors often don't enumerate in console as plain objects.
 */
export function logSupabaseClientError(context: string, err: unknown): void {
  if (err && typeof err === "object") {
    const o = err as {
      message?: string;
      code?: string;
      details?: string;
      hint?: string;
    };
    const message = o.message;
    const code = o.code;
    const details = o.details;
    const hint = o.hint;
    if (message ?? code ?? details ?? hint) {
      console.error(`[Slice] ${context}:`, message ?? code, {
        code,
        details,
        hint,
      });
      return;
    }
  }
  if (err instanceof Error) {
    console.error(`[Slice] ${context}:`, err.message, err);
    return;
  }
  console.error(`[Slice] ${context}:`, err);
}
