import React, { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/app/components/ui/button';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryActions?: ReactNode;
}

export const PageHeader = ({ 
  title, 
  breadcrumbs, 
  primaryAction, 
  secondaryActions 
}: PageHeaderProps) => {
  return (
    <div className="border-b bg-card">
      <div className="px-8 py-6">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
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
        )}

        {/* Title and Actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{title}</h1>
          
          {(primaryAction || secondaryActions) && (
            <div className="flex items-center gap-3">
              {secondaryActions}
              {primaryAction && (
                <Button onClick={primaryAction.onClick}>
                  {primaryAction.icon}
                  {primaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
