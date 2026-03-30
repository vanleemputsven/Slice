const MAX_LEN = 512;

/**
 * Returns a relative path safe to use after auth redirects (no open-redirect to external origins).
 */
export function safeNextPath(
  raw: string | null | undefined,
  fallback = "/dashboard"
): string {
  if (raw == null) return fallback;
  const trimmed = raw.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://") ||
    trimmed.includes("\\") ||
    trimmed.length > MAX_LEN
  ) {
    return fallback;
  }
  return trimmed;
}
