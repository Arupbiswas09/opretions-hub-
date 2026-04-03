'use client';

import * as React from 'react';
import { cn } from '../ui/utils';

const sizeClass = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-8 h-8 text-[11px]',
  lg: 'w-10 h-10 text-[12px]',
} as const;

/** Muted discs — deterministic from name (Linear / Vercel–style monograms). */
const AVATAR_DISCS: readonly { bg: string; fg: string }[] = [
  { bg: '#44403c', fg: '#fafaf9' },
  { bg: '#57534e', fg: '#fafaf9' },
  { bg: '#0f766e', fg: '#ecfdf5' },
  { bg: '#6d28d9', fg: '#f5f3ff' },
  { bg: '#b45309', fg: '#fffbeb' },
  { bg: '#1e3a5f', fg: '#e0f2fe' },
  { bg: '#9f1239', fg: '#fff1f2' },
  { bg: '#166534', fg: '#f0fdf4' },
  { bg: '#5b21b6', fg: '#ede9fe' },
  { bg: '#115e59', fg: '#ccfbf1' },
  { bg: '#7c2d12', fg: '#ffedd5' },
  { bg: '#3730a3', fg: '#eef2ff' },
] as const;

export function hashNameToDiscIndex(name: string): number {
  let h = 5381;
  const s = name.trim().toLowerCase();
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
  }
  return Math.abs(h) % AVATAR_DISCS.length;
}

export function monogramFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const a = parts[0][0] ?? '';
  const b = parts[parts.length - 1][0] ?? '';
  return (a + b).toUpperCase();
}

const presenceColor = {
  online: 'bg-emerald-500',
  away: 'bg-amber-400',
  offline: 'bg-stone-400',
} as const;

export interface OpsAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** When set, initials + colour are derived deterministically from this string. */
  name?: string;
  /** Explicit initials (used when `name` is omitted). */
  initials?: string;
  size?: keyof typeof sizeClass;
  /** online | away | offline — only renders dot when set */
  presence?: 'online' | 'away' | 'offline';
}

export function OpsAvatar({
  className,
  name,
  initials,
  size = 'md',
  presence,
  style,
  ...props
}: OpsAvatarProps) {
  const resolvedInitials = name ? monogramFromName(name) : (initials ?? '?').slice(0, 2).toUpperCase();
  const keyForColor = name ?? initials ?? resolvedInitials;
  const disc = AVATAR_DISCS[hashNameToDiscIndex(keyForColor)];

  const dot = presence ? presenceColor[presence] : null;

  return (
    <div
      className={cn(
        'relative inline-flex rounded-full items-center justify-center font-semibold shrink-0',
        sizeClass[size],
        className,
      )}
      style={{
        background: disc.bg,
        color: disc.fg,
        boxShadow: '0 1px 3px rgba(0,0,0,0.22)',
        ...style,
      }}
      {...props}
    >
      <span className="select-none leading-none">{resolvedInitials}</span>
      {dot && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-[6px] h-[6px] rounded-full ring-2 ring-[color:var(--background)]',
            dot,
          )}
          title={presence}
          aria-label={presence}
        />
      )}
    </div>
  );
}
