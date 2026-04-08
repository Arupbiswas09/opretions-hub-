/**
 * Cross-shell events (CommandPalette ↔ HubShell quick-create drawers).
 * Keeps palette decoupled from HubShell while staying type-safe at dispatch sites.
 */
export const HUB_EVENTS = {
  OPEN_COMMAND_PALETTE: 'hub:open-command-palette',
  /** detail: QuickCreateDrawer id — 'client' | 'deal' | 'project' | ... */
  QUICK_CREATE: 'hub:quick-create',
  /** List pages can listen to refetch after quick-create (detail: optional scope string, e.g. deals | pipeline | sales | all). */
  DATA_INVALIDATION: 'hub:data-invalidation',
} as const;

export type QuickCreateKind =
  | 'client'
  | 'contact'
  | 'deal'
  | 'project'
  | 'task'
  | 'time'
  | 'invoice'
  | 'proposal'
  | 'contract'
  | 'form'
  | 'expense';

export function dispatchOpenCommandPalette() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(HUB_EVENTS.OPEN_COMMAND_PALETTE));
}

export function dispatchQuickCreate(kind: QuickCreateKind) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(HUB_EVENTS.QUICK_CREATE, { detail: kind }));
}

export function dispatchDataInvalidation(scope?: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(HUB_EVENTS.DATA_INVALIDATION, { detail: scope ?? 'all' }));
}
