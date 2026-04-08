import { Client } from '@elastic/elasticsearch';
import { kMiddlewareEngine } from '@elastic/transport/lib/symbols';

let client: Client | null | undefined;

/** Bonsai / hosted clusters may not send `x-elastic-product: Elasticsearch`; disable the strict product check. */
function disableElasticsearchProductCheck(c: Client): void {
  const engine = (c.transport as unknown as { [sym: symbol]: { middleware: Array<{ name: string; options?: { productCheck: string | null } }> } })[
    kMiddlewareEngine
  ];
  for (const m of engine?.middleware ?? []) {
    if (m.name === 'product-check' && m.options) {
      m.options.productCheck = null;
      break;
    }
  }
}

function getClient(): Client | null {
  if (client !== undefined) return client;
  const node = process.env.BONSAI_URL?.trim();
  if (!node) {
    client = null;
    return null;
  }
  const c = new Client({
    node,
    tls: { rejectUnauthorized: true },
    requestTimeout: 30_000,
  });
  disableElasticsearchProductCheck(c);
  client = c;
  return client;
}

export type BonsaiHit<T = Record<string, unknown>> = {
  _id: string;
  _score?: number;
  _source: T;
};

/**
 * Full-text / fuzzy search on a single index.
 */
export async function bonsaiSearch<T = Record<string, unknown>>(
  index: string,
  query: string,
  filters: Record<string, unknown> | undefined,
  size: number,
  from = 0,
): Promise<BonsaiHit<T>[]> {
  const c = getClient();
  if (!c || !query.trim()) return [];

  const filterClauses =
    filters &&
    Object.entries(filters).map(([k, v]) => ({
      term: { [k]: v } as Record<string, string | number | boolean>,
    }));

  try {
    const res = await c.search({
      index,
      size,
      from,
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: query.trim(),
                type: 'best_fields',
                fuzziness: 'AUTO',
                fields: ['*'],
              },
            },
          ],
          ...(filterClauses?.length ? { filter: filterClauses } : {}),
        },
      },
    });

    const hits = res.hits.hits ?? [];
    return hits.map((h) => ({
      _id: String(h._id),
      _score: h._score,
      _source: (h._source || {}) as T,
    }));
  } catch (e) {
    console.error('[bonsaiSearch]', index, e);
    return [];
  }
}

export async function bonsaiIndex(index: string, id: string, doc: Record<string, unknown>): Promise<boolean> {
  const c = getClient();
  if (!c) return false;
  try {
    await c.index({ index, id, document: doc, refresh: false });
    return true;
  } catch (e) {
    console.error('[bonsaiIndex]', index, id, e);
    return false;
  }
}

export async function bonsaiDelete(index: string, id: string): Promise<boolean> {
  const c = getClient();
  if (!c) return false;
  try {
    await c.delete({ index, id, refresh: false });
    return true;
  } catch {
    return false;
  }
}

export async function bonsaiCreateIndex(
  index: string,
  mappings: { properties: Record<string, unknown> },
): Promise<boolean> {
  const c = getClient();
  if (!c) return false;
  try {
    const exists = await c.indices.exists({ index });
    if (exists) return true;
    await c.indices.create({ index, mappings: mappings as any });
    return true;
  } catch (e) {
    console.error('[bonsaiCreateIndex]', index, e);
    return false;
  }
}

export function isBonsaiConfigured(): boolean {
  return Boolean(process.env.BONSAI_URL?.trim());
}
