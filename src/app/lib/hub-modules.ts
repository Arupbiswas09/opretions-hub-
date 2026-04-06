export const HUB_MODULES = [
  'dashboard',
  'communication',
  'work',
  'sales',
  'contacts',
  'clients',
  'projects',
  'talent',
  'people',
  'finance',
  'support',
  'forms',
  'admin',
  'meetings',
  'proposals',
  'contracts',
  'timetracking',
] as const;

export type HubModule = (typeof HUB_MODULES)[number];
