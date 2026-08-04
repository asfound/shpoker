/** Parses user input into a non-negative integer, or 0 if invalid. */
export function toNonNegativeInt(value: string): number {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
}
