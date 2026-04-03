'use client';

import * as React from 'react';
import { cn } from '../ui/utils';

type OpsCardVariant = 'solid' | 'glass' | 'metric';

const variantClass: Record<OpsCardVariant, string> = {
  /** Dense lists / forms on canvas — no blur (tables pattern). */
  solid:
    'rounded-xl border border-stone-200/60 bg-white/80 shadow-sm',
  /** Interactive summary tiles — uses global .glass-card from theme.css */
  glass: 'glass-card rounded-xl',
  /** KPI stat — .glass-stat from theme.css */
  metric: 'glass-stat',
};

export interface OpsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: OpsCardVariant;
  /** Makes entire card keyboard-focusable when clickable */
  interactive?: boolean;
}

/**
 * WHY: Centralizes card treatments so product doesn’t mix random opacities.
 * WHERE: Dashboard metrics → metric; hub module summaries → glass; table shells → solid.
 */
const OpsCard = React.forwardRef<HTMLDivElement, OpsCardProps>(
  ({ className, variant = 'solid', interactive, children, role, tabIndex, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={interactive ? 'button' : role}
        tabIndex={interactive ? tabIndex ?? 0 : tabIndex}
        className={cn(variantClass[variant], interactive && 'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900/30', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
OpsCard.displayName = 'OpsCard';

export { OpsCard };
