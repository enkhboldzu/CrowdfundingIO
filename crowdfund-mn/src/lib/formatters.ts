/**
 * Shared number formatters used by both the public Hero stats
 * and the Admin Dashboard stat cards. Keeping them here ensures
 * the two UIs always display identical strings.
 */

export function formatMNT(tugrug: number): string {
  if (tugrug === 0) return "0₮";
  const s = (n: number) => n.toFixed(1).replace(/\.0$/, "");
  if (tugrug >= 1_000_000_000) return `₮${s(tugrug / 1_000_000_000)}Т`;
  if (tugrug >= 1_000_000)     return `₮${s(tugrug / 1_000_000)}М`;
  if (tugrug >= 1_000)         return `₮${s(tugrug / 1_000)}К`;
  return `${tugrug.toLocaleString()}₮`;
}

export function formatCount(n: number): string {
  if (n === 0) return "0";
  return n.toLocaleString() + "+";
}

export function formatPercent(n: number): string {
  return `${Math.round(n)}%`;
}
