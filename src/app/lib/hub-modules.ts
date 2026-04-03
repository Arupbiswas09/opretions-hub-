export const HUB_MODULES = [
  'dashboard',
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
] as const;

export type HubModule = (typeof HUB_MODULES)[number];
