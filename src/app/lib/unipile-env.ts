/** Non-empty Unipile API base URL + access token (from env). */
export function getUnipileCreds(): { api: string; token: string } | null {
  const api = process.env.UNIPILE_API_URL?.trim();
  const token = process.env.UNIPILE_ACCESS_TOKEN?.trim();
  if (!api || !token) return null;
  return { api, token };
}

export const UNIPILE_NOT_CONFIGURED =
  'Unipile is not configured. Add UNIPILE_API_URL and UNIPILE_ACCESS_TOKEN to .env.local.';

/**
 * Hosted OAuth `api_url` wants `https://{host}:{port}` with no path.
 * Same value as UNIPILE_DSN when set; otherwise derived from UNIPILE_API_URL
 * (e.g. https://api36.unipile.com:16649/api/v1 → api36.unipile.com:16649).
 */
export function deriveUnipileDsnFromApiUrl(apiBase: string): string | null {
  try {
    const u = new URL(apiBase);
    if (!u.hostname) return null;
    return u.host;
  } catch {
    return null;
  }
}

/** Hosted OAuth: needs creds + DSN (explicit env or parsable API URL host). */
export function getUnipileConnectEnv(): { api: string; token: string; dsn: string } | null {
  const c = getUnipileCreds();
  if (!c) return null;
  const explicit = process.env.UNIPILE_DSN?.trim();
  const dsn = explicit || deriveUnipileDsnFromApiUrl(c.api);
  if (!dsn) return null;
  return { ...c, dsn };
}

export const UNIPILE_CONNECT_NOT_CONFIGURED =
  'Unipile connect needs UNIPILE_API_URL (real host, e.g. https://api36.unipile.com:16649/api/v1) and UNIPILE_ACCESS_TOKEN. Optionally set UNIPILE_DSN if your API URL cannot be parsed.';
