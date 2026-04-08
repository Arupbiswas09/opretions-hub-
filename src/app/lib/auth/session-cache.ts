import { redisDel, redisSet, HUB_KEYS } from '../redis';

const SESSION_TTL_SEC = 3600;

export type CachedSessionPayload = {
  userId: string;
  email: string | null;
  role: string;
  displayName: string | null;
  avatarUrl: string | null;
  orgId: string | null;
  orgName: string | null;
};

export function sessionCacheKey(userId: string) {
  return `${HUB_KEYS.session}:${userId}`;
}

export function sessionRoleCacheKey(userId: string) {
  return `${HUB_KEYS.session}:${userId}:role`;
}

export async function cacheUserSession(payload: CachedSessionPayload): Promise<void> {
  await redisSet(sessionCacheKey(payload.userId), payload, SESSION_TTL_SEC);
  await redisSet(sessionRoleCacheKey(payload.userId), { role: payload.role }, SESSION_TTL_SEC);
}

export async function clearUserSession(userId: string): Promise<void> {
  await redisDel(sessionCacheKey(userId), sessionRoleCacheKey(userId));
}
