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
      className={cn(
        'hub-stat-tile-mobile rounded-xl p-3 lg:p-4',
        className,
      )}
      style={{
        background: 'var(--hub-stat-tile-bg)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid var(--border)',
        boxShadow: 'inset 0 1px 0 var(--hub-stat-tile-highlight)',
      }}
      {...props}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em]"
        style={{ color: 'var(--foreground-muted)' }}>
        {label}
      </p>
      <p className="text-xl font-bold tracking-[-0.02em] mt-1 lg:text-[24px]"
        style={{ color: 'var(--foreground)' }}>
        {value}
      </p>
      {sub != null && sub !== '' && (
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--foreground-muted)' }}>{sub}</p>
      )}
    </motion.div>
  );
}
