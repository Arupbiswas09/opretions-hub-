/** Parse currency-like user input to a number. */
export function parseMoney(input: string | undefined | null): number | null {
  if (input == null || !String(input).trim()) return null;
  const n = parseFloat(String(input).replace(/[$,\s]/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** Normalize deal / task stage strings to DB-friendly slugs. */
export function slugStage(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

/** Split comma-separated tags into a trimmed array. */
export function parseTags(s: string | undefined | null): string[] {
  if (!s?.trim()) return [];
  return s
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}
