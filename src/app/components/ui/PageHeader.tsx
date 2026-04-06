'use client';

import React from 'react';
import { motion } from 'motion/react';
import { EASE_OUT_EXPO } from '../../lib/motion';
import { cn } from './utils';

/**
 * Page body inside `hub-main-container`: full width of the shell column,
 * responsive vertical padding only (horizontal gutter comes from the shell).
 */
export function HubPageShell({
  children,
  className = '',
  narrow,
}: {
  children: React.ReactNode;
  className?: string;
  /** Use slightly narrower column for dense tools (timer, calendar). */
  narrow?: boolean;
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full min-w-0 py-4 sm:py-6 lg:py-8',
        narrow && 'max-w-[min(1000px,100%)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Editorial page title — matches Dashboard greeting tier (without competing at 40px).
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  animate = true,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  animate?: boolean;
}) {
  const inner = (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.025em] text-foreground sm:text-[28px]">
          {title}
        </h1>
        {description ? (
          <p className="text-[13px] mt-1.5 text-muted-foreground max-w-xl leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex-shrink-0">{action}</div> : null}
    </div>
  );

  if (!animate) return inner;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(2px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.34, ease: EASE_OUT_EXPO }}
    >
      {inner}
    </motion.div>
  );
}
