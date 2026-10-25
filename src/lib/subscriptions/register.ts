/** Name or provider contains the query. A blank query keeps every row. */
export function matchesRegisterQuery(
  sub: { name: string; provider: string },
  query: string
): boolean {
  const needle = query.trim().toLocaleLowerCase();
  if (needle.length === 0) return true;
  const name = sub.name.toLocaleLowerCase();
  const provider = sub.provider.toLocaleLowerCase();
  return name.includes(needle) || provider.includes(needle);
}
