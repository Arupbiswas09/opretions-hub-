import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  Users, 
  Calendar, 
  Settings, 
  ChevronLeft,
  LayoutDashboard,
  FolderKanban,
  Receipt
} from 'lucide-react';
import { cn } from '../ui/utils';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: string;
}

interface BonsaiSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function BonsaiSidebar({ collapsed: controlledCollapsed, onToggleCollapse }: BonsaiSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(!collapsed);
    }
  };

  const menuItems: SidebarItem[] = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: FolderKanban, label: 'Projects', badge: '12' },
    { icon: Receipt, label: 'Invoices' },
    { icon: FileText, label: 'Documents' },
    { icon: Users, label: 'Clients' },
    { icon: Calendar, label: 'Calendar' },
  ];

  const bottomItems: SidebarItem[] = [
    { icon: Settings, label: 'Settings' },
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
              <span className="text-white font-semibold text-sm">B</span>
            </div>
            <span className="font-semibold text-stone-800">Bonsai</span>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-semibold text-sm">B</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-stone-600 hover:bg-stone-100"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-stone-200 text-stone-700">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div className="px-3 pb-4 space-y-1">
        {bottomItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-600 hover:bg-stone-100 transition-all"
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="flex-1 text-left text-sm">{item.label}</span>}
            </button>
          );
        })}
        
        {/* Collapse Toggle */}
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-stone-600 hover:bg-stone-100 transition-all border border-stone-200"
        >
          <ChevronLeft className={cn("w-5 h-5 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>
    </div>
  );
}
