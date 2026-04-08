import { bonsaiDelete, bonsaiIndex } from '../bonsai';

/** Bonsai index names (Phase 0 setup-indexes). */
export const HUB_SEARCH_INDEX = {
  contacts: 'hub-contacts',
  deals: 'hub-deals',
  tasks: 'hub-tasks',
  projects: 'hub-projects',
  people: 'hub-people',
} as const;

const TABLE_TO_INDEX: Record<string, string> = {
  contacts: HUB_SEARCH_INDEX.contacts,
  clients: HUB_SEARCH_INDEX.contacts,
  deals: HUB_SEARCH_INDEX.deals,
  tasks: HUB_SEARCH_INDEX.tasks,
  projects: HUB_SEARCH_INDEX.projects,
  people: HUB_SEARCH_INDEX.people,
};

/** Stable Elasticsearch document id (avoids cross-table UUID collisions). */
export function bonsaiDocId(table: string, rowId: string): string {
  return `${table}_${rowId}`;
}

/**
 * Map a Supabase row to a Bonsai document (minimal fields for search snippets).
 */
export function rowToSearchDoc(table: string, row: Record<string, unknown>): Record<string, unknown> | null {
  const id = row.id;
  if (!id) return null;
  const orgId = row.org_id;
  const base = {
    id,
    org_id: orgId,
    updated_at: row.updated_at ?? row.created_at,
  };

  switch (table) {
    case 'contacts':
      return {
        ...base,
        record_type: 'contact',
        name: [row.first_name, row.last_name].filter(Boolean).join(' ').trim() || row.email,
        email: row.email,
        phone: row.phone,
        company: row.company,
        tags: row.tags,
        created_at: row.created_at,
      };
    case 'clients':
      return {
        ...base,
        record_type: 'client',
        name: row.name,
        created_at: row.created_at,
      };
    case 'deals':
      return {
        ...base,
        record_type: 'deal',
        title: row.title,
        value: row.value,
        stage: row.stage,
        client_name: row.client_name,
        owner: row.owner_id,
        created_at: row.created_at,
      };
    case 'tasks':
      return {
        ...base,
        record_type: 'task',
        title: row.title,
        description: row.description,
        status: row.status,
        priority: row.priority,
        assignee: row.assignee_id,
        project_id: row.project_id,
        due_date: row.due_date,
      };
    case 'projects':
      return {
        ...base,
        record_type: 'project',
        name: row.name,
        description: row.description,
        status: row.status,
        client_name: row.client_name,
        created_at: row.created_at,
      };
    case 'people':
      return {
        ...base,
        record_type: 'person',
        full_name: row.full_name,
        email: row.email,
        department: row.department,
        role: row.role,
        status: row.status,
      };
    default:
      return { ...base, record_type: table, ...row };
  }
}

/** Upsert search document after DB write (call fire-and-forget from API routes). */
export async function syncRecord(table: string, row: Record<string, unknown>): Promise<void> {
  const index = TABLE_TO_INDEX[table];
  if (!index) return;
  const doc = rowToSearchDoc(table, row);
  if (!doc?.id) return;
  await bonsaiIndex(index, bonsaiDocId(table, String(doc.id)), doc);
}

export async function deleteRecord(table: string, id: string): Promise<void> {
  const index = TABLE_TO_INDEX[table];
  if (!index) return;
  await bonsaiDelete(index, bonsaiDocId(table, id));
}
