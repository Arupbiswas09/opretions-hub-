import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Building2,
  Users,
  UserCircle,
  Briefcase,
  Calendar,
  FileSignature,
  FileText,
  ClipboardList,
  Share2,
  FolderKanban,
  Clock,
  BarChart2,
  DollarSign,
  Zap,
  LifeBuoy,
  Inbox,
  MessageSquare,
  CheckSquare,
} from 'lucide-react';

export type HubSidebarItem = { label: string; icon: LucideIcon; href: string };

export const HUB_SIDEBAR_TOP: HubSidebarItem[] = [
  { label: 'Home', icon: Home, href: '/hub/dashboard' },
  { label: 'Communication', icon: MessageSquare, href: '/hub/communication' },
  { label: 'Work', icon: CheckSquare, href: '/hub/work' },
  { label: 'Clients', icon: Building2, href: '/hub/clients' },
  /** External CRM contacts — distinct from internal Team (people). */
  { label: 'CRM contacts', icon: Users, href: '/hub/contacts' },
  { label: 'Team', icon: UserCircle, href: '/hub/people' },
];

export const HUB_SIDEBAR_WORKSPACE: HubSidebarItem[] = [
  { label: 'Deals', icon: Briefcase, href: '/hub/sales' },
  { label: 'Meetings', icon: Calendar, href: '/hub/meetings' },
  { label: 'Proposals', icon: FileSignature, href: '/hub/proposals' },
  { label: 'Contracts', icon: FileText, href: '/hub/contracts' },
  { label: 'Forms', icon: ClipboardList, href: '/hub/forms' },
  { label: 'Client Portal', icon: Share2, href: '/hub/portals/client' },
];

export const HUB_SIDEBAR_PRODUCTIVITY: HubSidebarItem[] = [
  { label: 'Projects', icon: FolderKanban, href: '/hub/projects' },
  /** Tasks / issues / approvals live under Work in the top section — avoid duplicate nav. */
  { label: 'Time Tracking', icon: Clock, href: '/hub/timetracking' },
  { label: 'Timesheets', icon: FileText, href: '/hub/projects/timesheets' },
  { label: 'Timesheet approvals', icon: Inbox, href: '/hub/projects/approvals' },
  { label: 'Resourcing', icon: BarChart2, href: '/hub/talent' },
  { label: 'Invoices', icon: DollarSign, href: '/hub/finance' },
];

export const HUB_SIDEBAR_BOTTOM: HubSidebarItem[] = [
  { label: 'Reports', icon: BarChart2, href: '/hub/admin' },
  { label: 'Automations', icon: Zap, href: '/hub/admin' },
  { label: 'Support', icon: LifeBuoy, href: '/hub/support' },
];

export function isSidebarLinkActive(pathname: string, href: string): boolean {
  if (href.startsWith('/hub/portals')) {
    return pathname.startsWith(href);
  }
  if (href === '/hub/dashboard') {
    return pathname === '/hub/dashboard' || pathname === '/hub' || pathname === '/hub/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
