import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../ui/utils';

/* Light mode: soft fills + borders (no solid black). Dark: frosted / saturated. */
const statusPillVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide transition-colors border',
  {
    variants: {
      status: {
        draft:
          'bg-muted/80 text-muted-foreground border-border',
        active:
          'bg-primary/10 text-primary border-primary/20',
        completed:
          'bg-emerald-500/10 text-emerald-600 border-emerald-500/25',
        pending:
          'bg-amber-500/10 text-amber-600 border-amber-500/25',
        cancelled:
          'bg-muted/60 text-muted-foreground line-through border-border',
        overdue:
          'bg-destructive/10 text-destructive border-destructive/25 font-semibold',
        inProgress:
          'bg-primary/10 text-primary border-primary/20',
        archived:
          'bg-muted/60 text-muted-foreground border-border',
        inactive:
          'bg-muted/60 text-muted-foreground border-border',
      },
    },
    defaultVariants: {
      status: 'draft',
    },
  }
);

interface BonsaiStatusPillProps extends VariantProps<typeof statusPillVariants> {
  label: string;
  className?: string;
  dot?: boolean;
}

export function BonsaiStatusPill({ status, label, className, dot = true }: BonsaiStatusPillProps) {
  const dotColors: Record<string, string> = {
    draft: 'bg-muted-foreground/50',
    active: 'bg-primary',
    completed: 'bg-emerald-500',
    pending: 'bg-amber-500',
    cancelled: 'bg-muted-foreground/40',
    overdue: 'bg-destructive',
    inProgress: 'bg-primary',
    inactive: 'bg-muted-foreground/40',
    archived: 'bg-muted-foreground/40',
  };

  return (
    <span className={cn(statusPillVariants({ status }), className)}>
      {dot && (
        <span className={cn('h-1.5 w-1.5 flex-shrink-0 rounded-full', dotColors[status || 'draft'])} />
      )}
      {label}
    </span>
  );
}
