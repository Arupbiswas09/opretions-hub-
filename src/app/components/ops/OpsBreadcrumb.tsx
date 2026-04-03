'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '../ui/utils';

export interface OpsBreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface OpsBreadcrumbProps {
  items: OpsBreadcrumbItem[];
  className?: string;
}

/**
 * WHY: Consistent hub header crumbs without duplicating HubShell markup.
 * WHERE: Alternate shells, embedded admin views, print layouts.
 */
function OpsBreadcrumb({ items, className }: OpsBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-2 text-[13px]', className)}>
      <ol className="flex items-center gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0" aria-hidden />}
            {item.href && !item.current ? (
              <Link href={item.href} className="text-stone-400 hover:text-stone-700 font-medium transition-colors">
                {item.label}
              </Link>
            ) : (
              <span
                className={item.current ? 'text-stone-800 font-semibold tracking-[-0.01em]' : 'text-stone-400 font-medium'}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export { OpsBreadcrumb };
