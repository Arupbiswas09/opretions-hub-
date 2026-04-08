import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { bonsaiSearch, type BonsaiHit, isBonsaiConfigured } from '../../lib/bonsai';
import { redisGet, redisSet, redisIncr, HUB_KEYS } from '../../lib/redis';
import { getHubOrgOr401 } from '../../lib/hub/org';
import { HUB_SEARCH_INDEX } from '../../lib/search/syncToIndex';
import type { SearchHitDTO } from '../../lib/search/types';

export type { SearchHitDTO };

type Grouped = Record<string, SearchHitDTO[]>;

const DEFAULT_INDEXES = [
  HUB_SEARCH_INDEX.contacts,
  HUB_SEARCH_INDEX.deals,
  HUB_SEARCH_INDEX.tasks,
  HUB_SEARCH_INDEX.projects,
  HUB_SEARCH_INDEX.people,
] as const;

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function resultUrl(recordType: string, id: string): string {
  const q = encodeURIComponent(id);
  switch (recordType) {
    case 'client':
      return `/hub/clients?focus=${q}`;
    case 'contact':
      return `/hub/contacts?focus=${q}`;
    case 'deal':
      return `/hub/sales/deals?focus=${q}`;
    case 'task':
      return `/hub/work?focus=${q}`;
    case 'project':
      return `/hub/projects/list?focus=${q}`;
    case 'person':
      return `/hub/people/directory?focus=${q}`;
    default:
      return `/hub/search?q=${q}`;
  }
}

function mapContactsIndexHit(hit: BonsaiHit): SearchHitDTO | null {
  const src = hit._source as Record<string, unknown>;
  const id = String(src.id ?? '');
  if (!id) return null;
  const rt = String(src.record_type ?? 'contact');
  const title =
    rt === 'client'
      ? String(src.name ?? 'Client')
      : String(src.name ?? src.email ?? 'Contact');
  const subtitle =
    rt === 'client'
      ? 'Client'
      : [src.email, src.company].filter(Boolean).join(' · ') || 'Contact';
  return {
    id,
    type: rt === 'client' ? 'clients' : 'contacts',
    title,
    subtitle,
    url: resultUrl(rt, id),
    score: hit._score,
  };
}

function mapDealsHit(hit: BonsaiHit): SearchHitDTO | null {
  const src = hit._source as Record<string, unknown>;
  const id = String(src.id ?? '');
  if (!id) return null;
  const title = String(src.title ?? 'Deal');
  const subtitle = [src.stage, src.client_name].filter(Boolean).join(' · ') || 'Deal';
  return { id, type: 'deals', title, subtitle, url: resultUrl('deal', id), score: hit._score };
}

function mapTasksHit(hit: BonsaiHit): SearchHitDTO | null {
  const src = hit._source as Record<string, unknown>;
  const id = String(src.id ?? '');
  if (!id) return null;
  const title = String(src.title ?? 'Task');
  const subtitle = [src.status, src.priority].filter(Boolean).join(' · ') || 'Task';
  return { id, type: 'tasks', title, subtitle, url: resultUrl('task', id), score: hit._score };
}

function mapProjectsHit(hit: BonsaiHit): SearchHitDTO | null {
  const src = hit._source as Record<string, unknown>;
  const id = String(src.id ?? '');
  if (!id) return null;
  const title = String(src.name ?? 'Project');
  const subtitle = String(src.status ?? 'Project');
  return { id, type: 'projects', title, subtitle, url: resultUrl('project', id), score: hit._score };
}

function mapPeopleHit(hit: BonsaiHit): SearchHitDTO | null {
  const src = hit._source as Record<string, unknown>;
  const id = String(src.id ?? '');
  if (!id) return null;
  const title = String(src.full_name ?? 'Person');
  const subtitle = [src.email, src.department].filter(Boolean).join(' · ') || 'Team member';
  return { id, type: 'people', title, subtitle, url: resultUrl('person', id), score: hit._score };
}

function emptyGrouped(): Grouped {
  return {
    contacts: [],
    clients: [],
    deals: [],
    tasks: [],
    projects: [],
    people: [],
  };
}

function mergeGrouped(target: Grouped, hit: SearchHitDTO) {
  const key = hit.type as keyof Grouped;
  if (Array.isArray(target[key])) (target[key] as SearchHitDTO[]).push(hit);
}

export async function POST(req: NextRequest) {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const ip = clientIp(req);
  const rateKey = `${HUB_KEYS.rate}:search:${org.orgId}:${ip}`;
  const count = await redisIncr(rateKey, 60);
  if (count > 30) {
    return NextResponse.json({ error: 'Too many search requests' }, { status: 429 });
  }

  let body: {
    query?: string;
    indexes?: string[];
    filters?: Record<string, unknown>;
    page?: number;
    limitPerType?: number;
    /** When searching hub-contacts, restrict to `contact` or `client` rows. */
    recordType?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const query = String(body.query ?? '').trim();
  if (!query) {
    return NextResponse.json({ grouped: emptyGrouped(), query: '' });
  }

  const page = Math.max(1, Number(body.page) || 1);
  const limitPerType = Math.min(50, Math.max(1, Number(body.limitPerType) || 3));
  const from = (page - 1) * limitPerType;

  const requested = body.indexes?.length
    ? body.indexes.filter((i) => DEFAULT_INDEXES.includes(i as (typeof DEFAULT_INDEXES)[number]))
    : [...DEFAULT_INDEXES];
  if (requested.length === 0) {
    return NextResponse.json({ error: 'No valid indexes' }, { status: 400 });
  }

  const recordType = body.recordType?.trim();
  const baseFilters = { org_id: org.orgId, ...(body.filters ?? {}) };

  const cachePayload = JSON.stringify({
    q: query,
    idx: requested.sort(),
    f: baseFilters,
    page,
    limitPerType,
    org: org.orgId,
    rt: recordType ?? null,
  });
  const cacheKey = `${HUB_KEYS.search}:suggest:${createHash('sha256').update(cachePayload).digest('hex')}`;
  const cached = await redisGet<{ grouped: Grouped; query: string }>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }

  if (!isBonsaiConfigured()) {
    const grouped = emptyGrouped();
    return NextResponse.json({
      grouped,
      query,
      warning: 'BONSAI_URL not configured',
    });
  }

  const searches = requested.map(async (index) => {
    const filters: Record<string, unknown> = { org_id: org.orgId, ...(body.filters ?? {}) };
    if (index === HUB_SEARCH_INDEX.contacts && recordType) {
      filters.record_type = recordType;
    }
    const hits = await bonsaiSearch(index, query, filters, limitPerType, from);
    return { index, hits };
  });

  const results = await Promise.all(searches);
  const grouped = emptyGrouped();

  for (const { index, hits } of results) {
    for (const h of hits) {
      let dto: SearchHitDTO | null = null;
      if (index === HUB_SEARCH_INDEX.contacts) dto = mapContactsIndexHit(h);
      else if (index === HUB_SEARCH_INDEX.deals) dto = mapDealsHit(h);
      else if (index === HUB_SEARCH_INDEX.tasks) dto = mapTasksHit(h);
      else if (index === HUB_SEARCH_INDEX.projects) dto = mapProjectsHit(h);
      else if (index === HUB_SEARCH_INDEX.people) dto = mapPeopleHit(h);
      if (dto) mergeGrouped(grouped, dto);
    }
  }

  const payload = { grouped, query };
  await redisSet(cacheKey, payload, 10);

  return NextResponse.json(payload);
}
