import React, { ReactNode } from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { Link } from 'react-router';

interface Breadcrumb {
  label: string;
  href?: string;
}

export interface ModuleTab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface ModuleHeaderProps {
  // Required
  title: string;
  
  // Optional
  breadcrumbs?: Breadcrumb[];
  description?: string;
  
  // Tabs (module-level navigation)
  tabs?: ModuleTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  
  // Controls row (appears below tabs)
  filtersLeft?: ReactNode;
  actionsRight?: ReactNode;
}

export const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  title,
  breadcrumbs,
  description,
  tabs,
  activeTab,
  onTabChange,
  filtersLeft,
  actionsRight,
}) => {
  return (
    <div>
      {/* Breadcrumb Row */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="px-8 pt-6 pb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {crumb.href ? (
                  <Link to={crumb.href} className="hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Title & Description */}
      <div className={`px-8 ${breadcrumbs && breadcrumbs.length > 0 ? 'pt-2' : 'pt-8'} ${tabs ? 'pb-4' : 'pb-6'}`}>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {/* Module-Level Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="px-8">
          <div className="flex gap-2 border-b">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    isActive
                      ? 'border-primary text-foreground font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls Row (Filters + Actions) */}
      {(filtersLeft || actionsRight) && (
        <div className="px-8 pt-6 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {filtersLeft}
            </div>
            <div className="flex items-center gap-2">
              {actionsRight}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
