import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Bell,
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
  LayoutGrid,
  Clock,
  BarChart2,
  DollarSign,
  Zap,
  LifeBuoy,
  Inbox,
  MessageSquare,
  CheckSquare,
} from 'lucide-react';

/** Sidebar row: real link or in-app notifications (opens panel from shell). */
export type HubSidebarItem =
  | { kind: 'link'; label: string; icon: LucideIcon; href: string }
  | { kind: 'notifications'; label: string; icon: LucideIcon };

export const HUB_SIDEBAR_TOP: HubSidebarItem[] = [
  { kind: 'link', label: 'Home', icon: Home, href: '/hub/dashboard' },
  { kind: 'notifications', label: 'Notifications', icon: Bell },
  { kind: 'link', label: 'Communication', icon: MessageSquare, href: '/hub/communication' },
  { kind: 'link', label: 'Work', icon: CheckSquare, href: '/hub/work' },
  { kind: 'link', label: 'Clients', icon: Building2, href: '/hub/clients' },
  { kind: 'link', label: 'Contacts', icon: Users, href: '/hub/contacts' },
  { kind: 'link', label: 'People', icon: UserCircle, href: '/hub/people' },
];

export const HUB_SIDEBAR_WORKSPACE: HubSidebarItem[] = [
  { kind: 'link', label: 'Deals', icon: Briefcase, href: '/hub/sales' },
  { kind: 'link', label: 'Meetings', icon: Calendar, href: '/hub/meetings' },
  { kind: 'link', label: 'Proposals', icon: FileSignature, href: '/hub/proposals' },
  { kind: 'link', label: 'Contracts', icon: FileText, href: '/hub/contracts' },
  { kind: 'link', label: 'Forms', icon: ClipboardList, href: '/hub/forms' },
  { kind: 'link', label: 'Client Portal', icon: Share2, href: '/hub/portals/client' },
];

export const HUB_SIDEBAR_PRODUCTIVITY: HubSidebarItem[] = [
  { kind: 'link', label: 'Projects', icon: FolderKanban, href: '/hub/projects' },
  { kind: 'link', label: 'Tasks', icon: LayoutGrid, href: '/hub/work' },
  { kind: 'link', label: 'Time Tracking', icon: Clock, href: '/hub/timetracking' },
  { kind: 'link', label: 'Timesheets', icon: FileText, href: '/hub/projects/timesheets' },
  { kind: 'link', label: 'Approvals', icon: Inbox, href: '/hub/projects/approvals' },
  { kind: 'link', label: 'Resourcing', icon: BarChart2, href: '/hub/talent' },
  { kind: 'link', label: 'Invoices', icon: DollarSign, href: '/hub/finance' },
];

export const HUB_SIDEBAR_BOTTOM: HubSidebarItem[] = [
  { kind: 'link', label: 'Reports', icon: BarChart2, href: '/hub/admin' },
  { kind: 'link', label: 'Automations', icon: Zap, href: '/hub/admin' },
  { kind: 'link', label: 'Support', icon: LifeBuoy, href: '/hub/support' },
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
