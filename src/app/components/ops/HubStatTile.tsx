'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { cn } from '../ui/utils';

export interface HubStatTileProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  label: string;
  value: React.ReactNode;
  sub?: string;
  delay?: number;
}

/**
 * Summary metric tiles for Contacts / People / Projects — matches Dashboard KPI glass hierarchy.
 */
export function HubStatTile({ label, value, sub, delay = 0, className, ...props }: HubStatTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn('rounded-xl p-4', className)}
      style={{
        background: 'var(--hub-stat-tile-bg)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid var(--border)',
        boxShadow: 'inset 0 1px 0 var(--hub-stat-tile-highlight)',
      }}
      {...props}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-stone-400 dark:text-stone-500">
        {label}
      </p>
      <p className="text-[24px] font-bold tracking-[-0.02em] mt-1 text-stone-800 dark:text-stone-50">
        {value}
      </p>
      {sub != null && sub !== '' && (
        <p className="text-[10px] mt-0.5 text-stone-400 dark:text-stone-500">{sub}</p>
      )}
    </motion.div>
  );
}
