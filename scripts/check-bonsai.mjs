/**
 * Verifies Bonsai (Elasticsearch) connectivity — same client shape as src/app/lib/bonsai.ts.
 *
 * Usage:
 *   node --env-file=.env.local scripts/check-bonsai.mjs
 *   BONSAI_URL="https://user:pass@host" node scripts/check-bonsai.mjs
 */
import { Client } from '@elastic/elasticsearch';
import { kMiddlewareEngine } from '@elastic/transport/lib/symbols.js';

function disableElasticsearchProductCheck(c) {
  const engine = c.transport[kMiddlewareEngine];
  for (const m of engine?.middleware ?? []) {
    if (m.name === 'product-check' && m.options) {
      m.options.productCheck = null;
      break;
    }
  }
}

const node = process.env.BONSAI_URL?.trim();

if (!node) {
  console.error('FAIL: BONSAI_URL is not set. Global search will return { warning: "BONSAI_URL not configured" }.');
  console.error('Set BONSAI_URL in .env.local (full URL with embedded basic auth for Bonsai).');
  process.exit(1);
}

const client = new Client({
  node,
  tls: { rejectUnauthorized: true },
  requestTimeout: 30_000,
});
disableElasticsearchProductCheck(client);

try {
  const health = await client.cluster.health({ timeout: '15s' });
  console.log('OK: Bonsai / Elasticsearch reachable.');
  console.log(`    cluster: ${health.cluster_name ?? 'n/a'}  status: ${health.status ?? 'n/a'}`);
  process.exit(0);
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  console.error('FAIL: Could not reach cluster with BONSAI_URL.');
  console.error(`    ${msg}`);
  process.exit(1);
}
