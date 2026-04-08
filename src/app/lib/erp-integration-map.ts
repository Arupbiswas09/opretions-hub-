/**
 * Maps UI surface area → OPERATIONS_HUB_INTEGRATION_PROMPTS.md phases.
 * Use for AI / sprint planning: wire each component group to APIs + Supabase + Bonsai + Redis.
 *
 * ~160 TSX files under src/app/components; routes are fewer — most “screens” are tabs/drawers.
 */

export const ERP_PHASES = {
  0: 'Infrastructure: Supabase clients, Redis, Bonsai, middleware, SQL schema, setup-indexes',
  1: 'Auth: login/signup/callback, protected /hub, profile drawer, Redis session cache',
  2: 'Global search: POST /api/search, HubShell bar, /hub/search page, syncToIndex on writes',
  3: 'Contacts & Clients: CO*, CL*, /api/contacts, /api/clients, QuickCreate drawers',
  4: 'Sales: SA*, deals/pipeline/proposals, /api/deals, /api/proposals, drag-drop pipeline',
  5: 'Work: Work.tsx tabs tasks/issues/approvals/requests, /api/tasks, /api/issues, /api/approvals',
  6: 'Projects: PR*, /api/projects, timesheets, approvals, CreateProject/TimeEntry drawers',
  7: 'Finance: FI*, /api/invoices, /api/expenses, /api/finance/overview',
  8: 'People & Talent: PE*, TA*, /api/people, /api/jobs, /api/candidates, /api/referrals',
  9: 'Communication: Communication.tsx, Unipile, internal messages Supabase, AI summarize/reply + Redis',
  10: 'Dashboard: Dashboard.tsx, /api/dashboard/kpis, charts, activity_log, realtime',
  11: 'Contracts, Forms, Meetings, Support, Portals, Admin — bonsai components + API CRUD',
  12: 'Hardening: rate limits, error_logs, optimistic UI, pagination, upload rules, cache warm',
} as const;

/** Primary component entry → suggested phase */
export const MODULE_COMPONENT_ROOT: Record<string, keyof typeof ERP_PHASES> = {
  Dashboard: 10,
  Communication: 9,
  Work: 5,
  Sales: 4,
  Contacts: 3,
  Clients: 3,
  Projects: 6,
  Talent: 8,
  People: 8,
  Finance: 7,
  Support: 11,
  Admin: 11,
  Forms: 11,
  Portals: 11,
  HubShell: 2,
  QuickCreateDrawers: 3,
};

/** Subfolders (prefix) → phase */
export const FOLDER_PHASE: [string, keyof typeof ERP_PHASES][] = [
  ['contacts/', 3],
  ['clients/', 3],
  ['sales/', 4],
  ['projects/', 6],
  ['finance/', 7],
  ['people/', 8],
  ['talent/', 8],
  ['communication/', 9],
  ['bonsai/Meetings', 11],
  ['bonsai/Proposals', 4],
  ['bonsai/Contracts', 11],
  ['bonsai/TimeTracking', 6],
  ['operations/', 2],
];

export function phaseForComponentPath(relativePath: string): keyof typeof ERP_PHASES {
  const normalized = relativePath.replace(/\\/g, '/');
  for (const [prefix, phase] of FOLDER_PHASE) {
    if (normalized.includes(prefix)) return phase;
  }
  return 11;
}
