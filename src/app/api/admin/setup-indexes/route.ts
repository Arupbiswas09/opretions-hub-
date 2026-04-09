import { NextRequest, NextResponse } from 'next/server';
import { bonsaiCreateIndex, isBonsaiConfigured } from '../../../lib/bonsai';
import { HUB_INDEX_MAPPINGS } from '../../../lib/search/hub-index-mappings';

/**
 * One-time / ops: create Bonsai (Elasticsearch) indexes for global search.
 * Protected by HUB_ADMIN_SETUP_SECRET header: x-hub-admin-secret
 *
 * Indices are also auto-created on first `bonsaiIndex()` if missing (see `src/app/lib/bonsai.ts`).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.HUB_ADMIN_SETUP_SECRET;
  if (!secret || req.headers.get('x-hub-admin-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isBonsaiConfigured()) {
    return NextResponse.json({ error: 'BONSAI_URL not configured' }, { status: 503 });
  }

  const results: Record<string, boolean> = {};
  for (const [name, mapping] of Object.entries(HUB_INDEX_MAPPINGS)) {
    results[name] = await bonsaiCreateIndex(name, mapping);
  }

  const ok = Object.values(results).every(Boolean);
  return NextResponse.json({ ok, results }, { status: ok ? 200 : 207 });
}
