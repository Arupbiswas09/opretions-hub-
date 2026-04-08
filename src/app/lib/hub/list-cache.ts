import { redisDelPattern, HUB_KEYS } from '../redis';

/** Invalidate list pagination cache for an org + resource (SCAN + DEL). */
export async function invalidateListCache(orgId: string, resource: string): Promise<void> {
  await redisDelPattern(`${HUB_KEYS.list}:${resource}:${orgId}:*`);
}
