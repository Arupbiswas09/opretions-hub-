import { createHash } from 'crypto';

/** Stable short hash for Redis list cache keys (Phase 3). */
export function listFiltersHash(parts: Record<string, unknown>): string {
  return createHash('sha256').update(JSON.stringify(parts)).digest('hex').slice(0, 20);
}
