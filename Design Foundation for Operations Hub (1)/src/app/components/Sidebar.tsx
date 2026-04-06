import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { cn } from '@/app/components/ui/utils';
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Users,
  FolderKanban,
  UserCircle,
  TrendingUp,
  DollarSign,
  BookOpen,
  FileText,
  BarChart3,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  CheckSquare,
  File,
  Clock,
  CreditCard,
  Database,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { useUser, isInternalUser } from '@/app/contexts/UserContext';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  internalOnly?: boolean;
  portalOnly?: boolean;
}

const internalNavItems: NavItem[] = [
  { title: 'Cockpit', href: '/cockpit', icon: <LayoutDashboard className="w-5 h-5" />, internalOnly: true },
  { title: 'Work', href: '/work', icon: <Briefcase className="w-5 h-5" />, internalOnly: true },
  { title: 'Communication', href: '/communication', icon: <MessageSquare className="w-5 h-5" />, internalOnly: true },
  { title: 'Recruitment', href: '/recruitment', icon: <Users className="w-5 h-5" />, internalOnly: true },
  { title: 'Projects', href: '/projects', icon: <FolderKanban className="w-5 h-5" />, internalOnly: true },
  { title: 'People', href: '/people', icon: <UserCircle className="w-5 h-5" />, internalOnly: true },
  { title: 'Sales', href: '/sales', icon: <TrendingUp className="w-5 h-5" />, internalOnly: true },
  { title: 'Finance', href: '/finance', icon: <DollarSign className="w-5 h-5" />, internalOnly: true },
  { title: 'Knowledge', href: '/knowledge', icon: <BookOpen className="w-5 h-5" />, internalOnly: true },
  { title: 'Forms', href: '/forms', icon: <FileText className="w-5 h-5" />, internalOnly: true },
  { title: 'Analytics', href: '/analytics', icon: <BarChart3 className="w-5 h-5" />, internalOnly: true },
  { title: 'Portals', href: '/portals', icon: <Globe className="w-5 h-5" />, internalOnly: true },
  { title: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" />, internalOnly: true },
];

const portalNavItems: NavItem[] = [
  { title: 'Home', href: '/portal', icon: <Home className="w-5 h-5" />, portalOnly: true },
  { title: 'Projects', href: '/portal/projects', icon: <FolderKanban className="w-5 h-5" />, portalOnly: true },
  { title: 'Tasks', href: '/portal/tasks', icon: <CheckSquare className="w-5 h-5" />, portalOnly: true },
  { title: 'Documents', href: '/portal/documents', icon: <File className="w-5 h-5" />, portalOnly: true },
  { title: 'Approvals', href: '/portal/approvals', icon: <CheckSquare className="w-5 h-5" />, portalOnly: true },
  { title: 'Timesheets', href: '/portal/timesheets', icon: <Clock className="w-5 h-5" />, portalOnly: true },
  { title: 'Payments', href: '/portal/payments', icon: <CreditCard className="w-5 h-5" />, portalOnly: true },
  { title: 'Profile & Data', href: '/portal/profile', icon: <Database className="w-5 h-5" />, portalOnly: true },
];

interface SidebarProps {
  isPortal?: boolean;
}

export const Sidebar = ({ isPortal = false }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { currentUser } = useUser();

  const navItems = isPortal ? portalNavItems : internalNavItems;

  return (
    <aside
      className={cn(
        'h-screen border-r bg-card flex flex-col transition-all duration-300 sticky top-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 border-b flex items-center justify-between px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">OPS</span>
            </div>
            <span className="font-semibold text-lg">Operations Hub</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-sm">OH</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
                            (item.href !== '/' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground font-medium',
                  collapsed && 'justify-center'
                )}
              >
                <span className={cn(
                  'flex-shrink-0',
                  isActive && 'text-primary'
                )}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Collapse Toggle */}
      <div className="p-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="ml-2">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
};
