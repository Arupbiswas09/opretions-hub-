import { NextRequest, NextResponse } from 'next/server';
import { bonsaiCreateIndex, isBonsaiConfigured } from '../../../lib/bonsai';

/**
 * One-time / ops: create Bonsai (Elasticsearch) indexes for global search.
 * Protected by HUB_ADMIN_SETUP_SECRET header: x-hub-admin-secret
 */
export async function GET(req: NextRequest) {
  const secret = process.env.HUB_ADMIN_SETUP_SECRET;
  if (!secret || req.headers.get('x-hub-admin-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isBonsaiConfigured()) {
    return NextResponse.json({ error: 'BONSAI_URL not configured' }, { status: 503 });
  }

  const keyword = { type: 'keyword' as const };
  const text = { type: 'text' as const };
  const date = { type: 'date' as const };
  const long = { type: 'long' as const };
  const double = { type: 'double' as const };

  const results: Record<string, boolean> = {};

  results['hub-contacts'] = await bonsaiCreateIndex('hub-contacts', {
    properties: {
      id: keyword,
      org_id: keyword,
      record_type: keyword,
      name: text,
      email: text,
      phone: keyword,
      company: text,
      tags: text,
      created_at: date,
      updated_at: date,
    },
  });

  results['hub-deals'] = await bonsaiCreateIndex('hub-deals', {
    properties: {
      id: keyword,
      org_id: keyword,
      record_type: keyword,
      title: text,
      value: double,
      stage: keyword,
      client_name: text,
      owner: keyword,
      created_at: date,
      updated_at: date,
    },
  });

  results['hub-tasks'] = await bonsaiCreateIndex('hub-tasks', {
    properties: {
      id: keyword,
      org_id: keyword,
      record_type: keyword,
      title: text,
      description: text,
      status: keyword,
      priority: keyword,
      assignee: keyword,
      project_id: keyword,
      due_date: date,
      created_at: date,
      updated_at: date,
    },
  });

  results['hub-projects'] = await bonsaiCreateIndex('hub-projects', {
    properties: {
      id: keyword,
      org_id: keyword,
      record_type: keyword,
      name: text,
      description: text,
      status: keyword,
      client_name: text,
      created_at: date,
      updated_at: date,
    },
  });

  results['hub-people'] = await bonsaiCreateIndex('hub-people', {
    properties: {
      id: keyword,
      org_id: keyword,
      record_type: keyword,
      full_name: text,
      email: text,
      department: keyword,
      role: text,
      status: keyword,
      created_at: date,
      updated_at: date,
    },
  });

  const ok = Object.values(results).every(Boolean);
  return NextResponse.json({ ok, results }, { status: ok ? 200 : 207 });
}
