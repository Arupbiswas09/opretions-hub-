import React from 'react';
import { 
  LayoutDashboard,
  TrendingUp,
  Users,
  Briefcase,
  FolderKanban,
  UserCog,
  UsersRound,
  DollarSign,
  HeadphonesIcon,
  Settings,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../ui/utils';

interface SidebarItem {
  id: string;
  icon: React.ElementType;
  label: string;
}

interface OperationsHubSidebarProps {
  activeItem: string;
  onItemChange: (id: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function OperationsHubSidebar({ 
  activeItem, 
  onItemChange, 
  collapsed = false,
  onToggleCollapse 
}: OperationsHubSidebarProps) {
  const menuItems: SidebarItem[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'sales', icon: TrendingUp, label: 'Sales' },
    { id: 'contacts', icon: Users, label: 'Contacts' },
    { id: 'clients', icon: Briefcase, label: 'Clients' },
    { id: 'projects', icon: FolderKanban, label: 'Projects' },
    { id: 'talent', icon: UserCog, label: 'Talent' },
    { id: 'people', icon: UsersRound, label: 'People' },
    { id: 'finance', icon: DollarSign, label: 'Finance' },
    { id: 'support', icon: HeadphonesIcon, label: 'Support' },
  ];

  const bottomItems: SidebarItem[] = [
    { id: 'admin', icon: Settings, label: 'Admin' },
  ];

  return (
    <div
      className={cn(
        "h-screen bg-white border-r border-stone-200 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-stone-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-semibold text-sm">OH</span>
            </div>
            <span className="font-semibold text-stone-800">Operations Hub</span>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-semibold text-sm">OH</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onItemChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                activeItem === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-stone-600 hover:bg-stone-100"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="flex-1 text-left text-sm">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div className="px-3 pb-4 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onItemChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                activeItem === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-stone-600 hover:bg-stone-100"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="flex-1 text-left text-sm">{item.label}</span>}
            </button>
          );
        })}
        
        {/* Collapse Toggle */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-stone-600 hover:bg-stone-100 transition-all border border-stone-200"
          >
            <ChevronLeft className={cn("w-5 h-5 transition-transform", collapsed && "rotate-180")} />
          </button>
        )}
      </div>
    </div>
  );
}
