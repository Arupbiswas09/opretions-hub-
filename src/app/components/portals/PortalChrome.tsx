'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../ui/utils';
import type { PortalType } from './portal-types';

/**
 * Top bar: switch Client / Employee / Freelancer / HRIS.
 * Single accent (primary) — same active treatment as the portal rail.
 */
export function PortalSwitcher({
  active,
  urlSync,
  onPortalChange,
}: {
  active: PortalType;
  urlSync: boolean;
  onPortalChange: (p: PortalType) => void;
}) {
  const ids = ['client', 'employee', 'freelancer', 'hris'] as const;
  const label = (id: (typeof ids)[number]) =>
    id === 'hris' ? 'HRIS admin' : id.charAt(0).toUpperCase() + id.slice(1);

  const btn = (isOn: boolean) =>
    cn(
      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 border',
      isOn
        ? 'border-primary/25 bg-primary/10 text-foreground shadow-sm'
        : 'border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground',
    );

  return (
    <div className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div className="flex flex-wrap items-center gap-1 px-4 py-2.5">
        {ids.map((id) => {
          const isOn = active === id;
          const content = (
            <>
              {isOn && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />}
              {label(id)}
            </>
          );
          if (urlSync) {
            return (
              <Link key={id} href={`/hub/portals/${id}`} className={btn(isOn)} scroll={false}>
                {content}
              </Link>
            );
          }
          return (
            <button key={id} type="button" onClick={() => onPortalChange(id)} className={btn(isOn)}>
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Left rail — neutral surfaces; primary for brand + active indicator only */
export function PortalRail({
  brandLetter,
  title,
  subtitle,
  layoutId,
  items,
  isItemActive,
  onSelect,
  user,
}: {
  brandLetter: string;
  title: string;
  subtitle: string;
  layoutId: string;
  items: { id: string; label: string; icon: LucideIcon }[];
  isItemActive: (id: string) => boolean;
  onSelect: (id: string) => void;
  user: { initials: string; name: string; email: string };
}) {
  return (
    <aside className="flex min-h-0 w-[240px] shrink-0 flex-col self-stretch border-r border-border bg-sidebar/95 backdrop-blur-xl dark:bg-[color:var(--sidebar)]">
      <div className="border-b border-border px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground shadow-sm">
            {brandLetter}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-tight tracking-[-0.01em] text-foreground">{title}</p>
            <p className="truncate text-[11px] leading-tight text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                'relative flex w-full items-center gap-2.5 rounded-[10px] px-3 py-[7px] text-left transition-colors',
                active
                  ? 'bg-primary/10 text-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              {active && (
                <motion.div
                  layoutId={layoutId}
                  className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.1 : 1.7} />
              <span className={cn('text-[13px]', active ? 'font-semibold' : '')}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-foreground">{user.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Main canvas behind portal content */
export function PortalMain({ children }: { children: ReactNode }) {
  return (
    <div className="portal-canvas min-h-0 flex-1 overflow-y-auto bg-background text-foreground">
      {children}
    </div>
  );
}
