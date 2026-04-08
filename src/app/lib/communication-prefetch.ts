export type CommBackoffState = {
  failures: number;
  nextAllowedAt: number;
  lastStatus?: number;
  lastError?: string;
};

export type CommNavCache = {
  accounts?: { items: any[]; at: number };
  chats?: Record<string, { items: any[]; at: number }>;
  backoff?: Record<string, CommBackoffState>;
  inFlight?: Record<string, Promise<any> | null>;
};

function cache(): CommNavCache {
  const g = globalThis as any;
  if (!g.__hubCommNavCache) g.__hubCommNavCache = {};
  const c = g.__hubCommNavCache as CommNavCache;
  c.backoff = c.backoff || {};
  c.inFlight = c.inFlight || {};
  c.chats = c.chats || {};
  return c;
}

function computeBackoffMs(failures: number) {
  // Exponential with jitter: 2s, 4s, 8s, ... up to 60s
  const base = Math.min(60_000, 2_000 * Math.pow(2, Math.max(0, failures - 1)));
  const jitter = Math.floor(base * (0.15 + Math.random() * 0.2)); // 15–35%
  return base + jitter;
}

export function getCommBackoff(key: string): CommBackoffState | null {
  return cache().backoff?.[key] || null;
}

export function canAttemptCommFetch(key: string) {
  const b = getCommBackoff(key);
  return !b || Date.now() >= b.nextAllowedAt;
}

export function recordCommFailure(key: string, status?: number, err?: string) {
  const c = cache();
  const prev = c.backoff?.[key];
  const failures = Math.min(12, (prev?.failures || 0) + 1);
  const waitMs = computeBackoffMs(failures);
  c.backoff![key] = {
    failures,
    nextAllowedAt: Date.now() + waitMs,
    lastStatus: status,
    lastError: err,
  };
}

export function recordCommSuccess(key: string) {
  const c = cache();
  if (c.backoff?.[key]) delete c.backoff[key];
}

export async function commFetchJsonWithPolicy<T>(args: {
  key: string;
  url: string;
  init?: RequestInit;
  /** If true, reuse a single in-flight request for the same key */
  dedupe?: boolean;
}) {
  const c = cache();
  if (!canAttemptCommFetch(args.key)) {
    const b = getCommBackoff(args.key);
    const wait = b ? Math.max(0, b.nextAllowedAt - Date.now()) : 0;
    throw new Error(`Temporarily unavailable. Retrying in ~${Math.ceil(wait / 1000)}s.`);
  }

  if (args.dedupe && c.inFlight?.[args.key]) {
    return (await c.inFlight[args.key]) as T;
  }

  const p = (async () => {
    const res = await fetch(args.url, args.init);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // Only backoff on 5xx (and "fetch failed" network-like).
      if (res.status >= 500) recordCommFailure(args.key, res.status, JSON.stringify(data));
      throw new Error((data as any)?.error || `Request failed (${res.status})`);
    }
    recordCommSuccess(args.key);
    return data as T;
  })();

  if (args.dedupe) c.inFlight![args.key] = p;
  try {
    return await p;
  } finally {
    if (args.dedupe) c.inFlight![args.key] = null;
  }
}

export function getCommNavCache() {
  return cache();
}

/** Call after disconnect or when accounts must reflect server immediately (bypasses TTL short-circuit). */
export function invalidateCommAccountsCache() {
  delete cache().accounts;
}

export async function prefetchCommunicationData() {
  const c = cache();
  // Dedupe / backoff built-in.
  try {
    const accounts = await commFetchJsonWithPolicy<any>({
      key: 'unipile:accounts',
      url: '/api/unipile/accounts',
      dedupe: true,
    });
    const items = Array.isArray(accounts) ? accounts : (accounts.items || accounts.accounts || []);
    c.accounts = { items, at: Date.now() };
  } catch {
    // ignore — cache/backoff already recorded
  }

  try {
    const chats = await commFetchJsonWithPolicy<any>({
      key: 'unipile:chats:all',
      url: '/api/unipile/chats?fetch_all=1',
      dedupe: true,
    });
    const items = Array.isArray(chats) ? chats : (chats.items || chats.chats || []);
    c.chats = c.chats || {};
    c.chats.all = { items, at: Date.now() };
  } catch {
    // ignore
  }
}

