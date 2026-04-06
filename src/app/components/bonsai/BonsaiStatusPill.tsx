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
          'bg-muted/80 text-muted-foreground border-border dark:bg-white/[0.06] dark:border-white/[0.08]',
        active:
          'bg-primary/10 text-primary border-primary/20 dark:bg-white/[0.10] dark:text-foreground dark:border-white/[0.12]',
        completed:
          'bg-emerald-500/10 text-emerald-800 border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25',
        pending:
          'bg-amber-500/10 text-amber-800 border-amber-500/25 dark:bg-amber-500/12 dark:text-amber-200 dark:border-amber-500/20',
        cancelled:
          'bg-muted/60 text-muted-foreground line-through border-border dark:bg-white/[0.05]',
        overdue:
          'bg-red-500/10 text-red-700 border-red-500/25 font-semibold dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/25',
        inProgress:
          'bg-primary/10 text-primary border-primary/20 dark:bg-sky-500/15 dark:text-sky-200 dark:border-sky-500/25',
        archived:
          'bg-muted/60 text-muted-foreground border-border dark:bg-white/[0.05]',
        inactive:
          'bg-muted/60 text-muted-foreground border-border dark:bg-white/[0.05]',
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
    draft: 'bg-muted-foreground/50 dark:bg-stone-400',
    active: 'bg-primary dark:bg-emerald-400',
    completed: 'bg-emerald-600 dark:bg-emerald-400',
    pending: 'bg-amber-500 dark:bg-amber-400',
    cancelled: 'bg-muted-foreground/40',
    overdue: 'bg-red-500',
    inProgress: 'bg-primary dark:bg-sky-400',
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
