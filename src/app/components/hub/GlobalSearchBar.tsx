'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Building2,
  User,
  DollarSign,
  FolderKanban,
  CheckSquare,
  Users,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { SearchHitDTO } from '../../lib/search/types';
import { cn } from '../ui/utils';

const DEBOUNCE_MS = 380;

type Grouped = {
  contacts: SearchHitDTO[];
  clients: SearchHitDTO[];
  deals: SearchHitDTO[];
  tasks: SearchHitDTO[];
  projects: SearchHitDTO[];
  people: SearchHitDTO[];
};

const GROUP_ORDER: { key: keyof Grouped; label: string }[] = [
  { key: 'contacts', label: 'CRM contacts' },
  { key: 'clients', label: 'Clients' },
  { key: 'deals', label: 'Deals' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'projects', label: 'Projects' },
  { key: 'people', label: 'Team' },
];

function iconFor(t: string) {
  if (t === 'clients') return Building2;
  if (t === 'contacts') return User;
  if (t === 'deals') return DollarSign;
  if (t === 'tasks') return CheckSquare;
  if (t === 'projects') return FolderKanban;
  if (t === 'people') return Users;
  return Search;
}

function emptyGrouped(): Grouped {
  return {
    contacts: [],
    clients: [],
    deals: [],
    tasks: [],
    projects: [],
    people: [],
  };
}

export function GlobalSearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [grouped, setGrouped] = useState<Grouped>(emptyGrouped());
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useRef(`hub-search-${Math.random().toString(36).slice(2, 9)}`);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sections = GROUP_ORDER.map(({ key, label }) => ({
    key,
    label,
    hits: grouped[key],
  })).filter((s) => s.hits.length > 0);

  const flatResults: SearchHitDTO[] = sections.flatMap((s) => s.hits);
  const totalHits = flatResults.length;

  const runSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setGrouped(emptyGrouped());
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query: trimmed, limitPerType: 5, page: 1 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Search failed');
      setGrouped(json.grouped ?? emptyGrouped());
    } catch {
      setGrouped(emptyGrouped());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setGrouped(emptyGrouped());
      setLoading(false);
      window.dispatchEvent(new CustomEvent('hub:global-search', { detail: { q: '' } }));
      return;
    }
    window.dispatchEvent(new CustomEvent('hub:global-search', { detail: { q } }));
    debounceRef.current = setTimeout(() => void runSearch(q), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, runSearch]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
      setOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setActiveIdx(0);
  }, [q, grouped]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter') && q.trim()) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!totalHits) return;
      setActiveIdx((i) => (i + 1) % totalHits);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!totalHits) return;
      setActiveIdx((i) => (i - 1 + totalHits) % totalHits);
    }
    if (e.key === 'Enter' && totalHits) {
      e.preventDefault();
      const hit = flatResults[activeIdx];
      if (hit) {
        router.push(hit.url);
        setOpen(false);
        setQ('');
      }
    }
  };

  const showPanel = open && (q.trim().length > 0 || loading);

  return (
    <div
      ref={wrapRef}
      className={cn(
        'relative w-full min-w-0 max-w-2xl',
        'mx-auto',
      )}
    >
      <div
        className={cn(
          'hub-global-search-field group flex h-9 w-full items-center gap-2 rounded-full border px-2.5 transition-[box-shadow,border-color] duration-200 lg:h-10 sm:px-4',
          'bg-background/80 shadow-sm',
          'border-border/80',
          'focus-within:border-primary/35 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]',
          open && 'border-primary/30',
        )}
        style={{
          backdropFilter: 'blur(12px)',
        }}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
        ) : (
          <Search className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary/80" aria-hidden />
        )}
        <input
          ref={inputRef}
          id="hub-global-search"
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId.current}
          aria-autocomplete="list"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search contacts, deals, projects…"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-muted-foreground/75 lg:text-[13px]"
        />
        <kbd
          className="pointer-events-none hidden shrink-0 select-none rounded border border-border/80 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-block"
          aria-hidden
        >
          /
        </kbd>
      </div>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            id={listId.current}
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'absolute left-0 right-0 top-[calc(100%+6px)] z-[60] overflow-hidden rounded-2xl border',
              'max-h-[min(72vh,440px)] overflow-y-auto',
              'bg-popover/95 text-popover-foreground shadow-2xl',
              'border-border/60',
            )}
            style={{
              boxShadow:
                '0 24px 48px -12px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset',
              backdropFilter: 'blur(20px) saturate(160%)',
            }}
          >
            <div className="flex items-center gap-1.5 border-b border-border/50 px-3 py-2 text-[11px] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />
              <span className="font-medium text-foreground/90">Suggestions</span>
              <span className="ml-auto text-[10px] text-muted-foreground/75">Indexed search</span>
            </div>

            {loading && !totalHits && (
              <div className="space-y-2 p-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-11 animate-pulse rounded-xl bg-muted/40"
                  />
                ))}
              </div>
            )}

            {!loading && !totalHits && q.trim() && (
              <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">
                No matches. Try another term or open{' '}
                <Link
                  href={`/hub/search?q=${encodeURIComponent(q.trim())}`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() => setOpen(false)}
                >
                  full search
                </Link>
                .
              </p>
            )}

            {sections.map((section, si) => {
              const baseIdx = sections.slice(0, si).reduce((acc, s) => acc + s.hits.length, 0);
              return (
                <div key={section.key} className="py-2">
                  <div className="mb-1 flex items-center justify-between px-3 py-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {section.label}
                    </span>
                    <Link
                      href={`/hub/search?q=${encodeURIComponent(q.trim())}&type=${section.key}`}
                      className="text-[11px] font-medium text-primary hover:underline"
                      onClick={() => setOpen(false)}
                    >
                      See all
                    </Link>
                  </div>
                  <ul className="space-y-0.5 px-1.5">
                    {section.hits.map((hit, hi) => {
                      const idx = baseIdx + hi;
                      const Icon = iconFor(hit.type);
                      const active = idx === activeIdx;
                      return (
                        <li key={`${hit.type}-${hit.id}`} role="option" aria-selected={active}>
                          <Link
                            href={hit.url}
                            className={cn(
                              'flex items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors',
                              active
                                ? 'bg-primary/12 text-foreground'
                                : 'hover:bg-muted/60',
                            )}
                            onMouseEnter={() => setActiveIdx(idx)}
                            onClick={() => {
                              setOpen(false);
                              setQ('');
                            }}
                          >
                            <div
                              className={cn(
                                'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                                active ? 'bg-primary/15 text-primary' : 'bg-muted/50 text-muted-foreground',
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-medium leading-tight">{hit.title}</p>
                              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{hit.subtitle}</p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
