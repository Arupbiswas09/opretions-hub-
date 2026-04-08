import Redis from 'ioredis';

/**
 * Key prefixes for cache, rate limits, locks.
 * Core namespace (Phase 0 spec): kpi, list, session, summary, suggest, lock, rate.
 * Extended keys are used by search, notifications, and Unipile helpers.
 */
export const HUB_KEYS = {
  kpi: 'hub:kpi',
  list: 'hub:list',
  session: 'hub:session',
  summary: 'hub:summary',
  suggest: 'hub:suggest',
  lock: 'hub:lock',
  rate: 'hub:rate',
  search: 'hub:search',
  notif: 'hub:notif',
  unipile: 'hub:unipile',
} as const;

let _singleton: Redis | null | undefined;

function getClient(): Redis | null {
  if (_singleton !== undefined) return _singleton;
  const url = process.env.REDIS_URL?.trim();
  if (!url) {
    _singleton = null;
    return null;
  }
  _singleton = new Redis(url, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
    lazyConnect: true,
  });
  return _singleton;
}

async function ensureConnected(r: Redis) {
  if (r.status === 'wait' || r.status === 'end') await r.connect();
}

export function getRedis(): Redis | null {
  return getClient();
}

export async function redisGet<T>(key: string): Promise<T | null> {
  const r = getRedis();
  if (!r) return null;
  try {
    await ensureConnected(r);
    const raw = await r.get(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function redisSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try {
    await ensureConnected(r);
    await r.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    /* non-fatal */
  }
}

export async function redisDel(...keys: string[]): Promise<void> {
  const r = getRedis();
  if (!r || keys.length === 0) return;
  try {
    await ensureConnected(r);
    await r.del(...keys);
  } catch {
    /* non-fatal */
  }
}

/** SCAN + DEL — avoid KEYS in production. */
export async function redisDelPattern(pattern: string): Promise<number> {
  const r = getRedis();
  if (!r) return 0;
  try {
    await ensureConnected(r);
    let cursor = '0';
    let total = 0;
    do {
      const [next, keys] = await r.scan(cursor, 'MATCH', pattern, 'COUNT', 200);
      cursor = next;
      if (keys.length) {
        await r.del(...keys);
        total += keys.length;
      }
    } while (cursor !== '0');
    return total;
  } catch {
    return 0;
  }
}

/** Rate limiting: INCR + EXPIRE on first key creation. */
export async function redisIncr(key: string, ttlSeconds: number): Promise<number> {
  const r = getRedis();
  if (!r) return 1;
  try {
    await ensureConnected(r);
    const v = await r.incr(key);
    if (v === 1) await r.expire(key, ttlSeconds);
    return v;
  } catch {
    return 1;
  }
}

/** SET key NX EX — distributed lock (Phase 5 approvals). Returns true if lock acquired. */
export async function redisTryLock(key: string, ttlSeconds: number): Promise<boolean> {
  const r = getRedis();
  if (!r) return true;
  try {
    await ensureConnected(r);
    const ok = await r.set(key, '1', 'EX', ttlSeconds, 'NX');
    return ok === 'OK';
  } catch {
    return false;
  }
}
