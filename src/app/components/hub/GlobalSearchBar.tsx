'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Building2, User, DollarSign, FolderKanban, CheckSquare, Users, Loader2 } from 'lucide-react';
import type { SearchHitDTO } from '../../lib/search/types';

type Grouped = {
  contacts: SearchHitDTO[];
  clients: SearchHitDTO[];
  deals: SearchHitDTO[];
  tasks: SearchHitDTO[];
  projects: SearchHitDTO[];
  people: SearchHitDTO[];
};

const GROUP_ORDER: { key: keyof Grouped; label: string }[] = [
  { key: 'contacts', label: 'Contacts' },
  { key: 'clients', label: 'Clients' },
  { key: 'deals', label: 'Deals' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'projects', label: 'Projects' },
  { key: 'people', label: 'People' },
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
  const [grouped, setGrouped] = useState<Grouped>(emptyGrouped);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
        body: JSON.stringify({ query: trimmed, limitPerType: 3, page: 1 }),
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
      // Allow pages (e.g. Communication) to clear their local search view.
      window.dispatchEvent(new CustomEvent('hub:global-search', { detail: { q: '' } }));
      return;
    }
    // Broadcast for pages that want in-page filtering (messages/threads) instead of entity search.
    window.dispatchEvent(new CustomEvent('hub:global-search', { detail: { q } }));
    debounceRef.current = setTimeout(() => void runSearch(q), 300);
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

  return (
    <div ref={wrapRef} className="relative mx-2 hidden min-w-0 max-w-md flex-1 md:block">
      <div
        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
        style={{
          background: 'var(--search-bg)',
          border: '1px solid var(--search-border)',
        }}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin" style={{ color: 'var(--muted-foreground)' }} />
        ) : (
          <Search className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
        )}
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search hub…"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-[12px] outline-none"
          style={{ color: 'var(--foreground)' }}
          aria-autocomplete="list"
          aria-expanded={open}
        />
        <kbd
          className="hidden shrink-0 rounded px-1 py-0.5 text-[9px] font-medium sm:inline"
          style={{
            background: 'var(--glass-bg)',
            color: 'var(--muted-foreground)',
            border: '1px solid var(--border)',
          }}
        >
          /
        </kbd>
      </div>

      {open && (q.trim() || loading) && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[min(70vh,420px)] overflow-y-auto rounded-xl py-2 shadow-lg"
          style={{
            background: 'var(--popover)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {loading && !totalHits && (
            <div className="space-y-2 px-3 py-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg" style={{ background: 'var(--glass-bg)' }} />
              ))}
            </div>
          )}
          {!loading && !totalHits && q.trim() && (
            <p className="px-3 py-4 text-center text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
              No results
            </p>
          )}
          {sections.map((section, si) => {
            const baseIdx = sections.slice(0, si).reduce((acc, s) => acc + s.hits.length, 0);
            return (
            <div key={section.key} className="mb-2 last:mb-0">
              <div
                className="mb-1 flex items-center justify-between px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <span>{section.label}</span>
                <Link
                  href={`/hub/search?q=${encodeURIComponent(q.trim())}&type=${section.key}`}
                  className="font-medium normal-case text-primary hover:underline"
                  onClick={() => setOpen(false)}
                >
                  View all
                </Link>
              </div>
              <ul className="space-y-0.5">
                {section.hits.map((hit, hi) => {
                  const idx = baseIdx + hi;
                  const Icon = iconFor(hit.type);
                  const active = idx === activeIdx;
                  return (
                    <li key={`${hit.type}-${hit.id}`}>
                      <Link
                        href={hit.url}
                        className="flex items-start gap-2.5 px-3 py-2 text-left transition-colors"
                        style={{
                          background: active ? 'rgba(37,99,235,0.12)' : 'transparent',
                          color: 'var(--foreground)',
                        }}
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => {
                          setOpen(false);
                          setQ('');
                        }}
                      >
                        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-70" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium">{hit.title}</p>
                          <p className="truncate text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                            {hit.subtitle}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
