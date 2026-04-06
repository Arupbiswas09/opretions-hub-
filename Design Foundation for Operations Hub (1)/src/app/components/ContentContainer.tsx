import React from 'react';
import { cn } from '@/app/components/ui/utils';

/**
 * GLOBAL RESPONSIVE CONTENT CONTAINER
 * 
 * Provides consistent max-width, padding, and centering for all module content.
 * 
 * Rules:
 * - Max-width for desktop (prevents overly wide content)
 * - Flexible width below max-width
 * - Consistent horizontal padding
 * - No horizontal scrolling
 */

interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Use 'full' for full-width content like tables, 'narrow' for forms */
  width?: 'default' | 'full' | 'narrow';
}

export const ContentContainer: React.FC<ContentContainerProps> = ({
  children,
  className,
  width = 'default',
}) => {
  const widthClasses = {
    default: 'max-w-7xl', // 1280px
    full: 'max-w-full',
    narrow: 'max-w-4xl', // 896px
  };

  return (
    <div
      className={cn(
        'mx-auto w-full px-6 py-6',
        widthClasses[width],
        className
      )}
    >
      {children}
    </div>
  );
};
