/**
 * Local/testing: skip Supabase Auth and use fixed org + user UUIDs from env.
 * Set HUB_BYPASS_AUTH=1 plus HUB_DEV_ORG_ID and HUB_DEV_USER_ID (must exist in DB / match service-role usage).
 * Remove or unset in production.
 */
export function hubDevBypassContext(): { userId: string; orgId: string } | null {
  if (process.env.HUB_BYPASS_AUTH !== '1') return null;
  const orgId = process.env.HUB_DEV_ORG_ID?.trim();
  const userId = process.env.HUB_DEV_USER_ID?.trim();
  if (!orgId || !userId) return null;
  return { orgId, userId };
}

export function isHubBypassAuth(): boolean {
  return process.env.HUB_BYPASS_AUTH === '1' && !!hubDevBypassContext();
}
