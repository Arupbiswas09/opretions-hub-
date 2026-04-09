/**
 * Elasticsearch / Bonsai index definitions for hub global search.
 * Used by POST /api/admin/setup-indexes and by bonsaiIndex() auto-create on first document.
 */

const keyword = { type: 'keyword' as const };
const text = { type: 'text' as const };
const date = { type: 'date' as const };
const long = { type: 'long' as const };
const double = { type: 'double' as const };

export type HubIndexMapping = { properties: Record<string, unknown> };

/** Maps index name → Elasticsearch mappings.properties */
export const HUB_INDEX_MAPPINGS: Record<string, HubIndexMapping> = {
  'hub-contacts': {
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
  },
  'hub-deals': {
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
  },
  'hub-tasks': {
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
  },
  'hub-projects': {
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
  },
  'hub-people': {
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
  },
};
