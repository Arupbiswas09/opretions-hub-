import React from 'react';
import { ModuleHeader } from '@/app/components/ModuleHeader';
import { EmptyState } from '@/app/components/EmptyState';

interface PlaceholderPageProps {
  title: string;
  breadcrumbLabel?: string;
  icon?: React.ReactNode;
  description?: string;
}

export const PlaceholderPage = ({ 
  title, 
  breadcrumbLabel, 
  icon, 
  description 
}: PlaceholderPageProps) => {
  return (
    <div>
      <ModuleHeader
        title={title}
        breadcrumbs={breadcrumbLabel ? [
          { label: 'Home', href: '/' },
          { label: breadcrumbLabel }
        ] : undefined}
        description={description}
      />
      <div className="px-8 py-6">
        <EmptyState
          title={`${title} Module Coming Soon`}
          description={description || 'Module screen implementation will be added next.'}
          icon={icon}
        />
      </div>
    </div>
  );
};