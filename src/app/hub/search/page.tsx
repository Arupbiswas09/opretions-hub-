'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import type { SearchHitDTO } from '../../lib/search/types';

/** Keep in sync with `setup-indexes` / `syncToIndex` (not imported here — avoids bundling ES client on client). */
const IDX = {
  contacts: 'hub-contacts',
  deals: 'hub-deals',
  tasks: 'hub-tasks',
  projects: 'hub-projects',
  people: 'hub-people',
} as const;

const ALL_INDEXES = [IDX.contacts, IDX.deals, IDX.tasks, IDX.projects, IDX.people];

const TABS: { id: string; label: string; indexes: string[]; recordType?: string }[] = [
  { id: 'all', label: 'All', indexes: ALL_INDEXES },
  { id: 'contacts', label: 'Contacts', indexes: [IDX.contacts], recordType: 'contact' },
  { id: 'clients', label: 'Clients', indexes: [IDX.contacts], recordType: 'client' },
  { id: 'deals', label: 'Deals', indexes: [IDX.deals] },
  { id: 'tasks', label: 'Tasks', indexes: [IDX.tasks] },
  { id: 'projects', label: 'Projects', indexes: [IDX.projects] },
  { id: 'people', label: 'People', indexes: [IDX.people] },
];

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function Highlight({ text, needle }: { text: string; needle: string }) {
  const n = needle.trim();
  if (!n) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeReg(n)})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === n.toLowerCase() ? (
          <mark key={i} className="rounded-sm bg-yellow-500/25 px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function SearchPageInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const qParam = sp.get('q') || '';
  const typeParam = sp.get('type') || 'all';
  const pageParam = Math.max(1, Number(sp.get('page')) || 1);

  const [qInput, setQInput] = useState(qParam);
  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState<SearchHitDTO[]>([]);
  const [warning, setWarning] = useState<string | null>(null);

  const tab = TABS.find((t) => t.id === typeParam) ?? TABS[0];

  const run = useCallback(async () => {
    const query = qParam.trim();
    if (!query) {
      setHits([]);
      return;
    }
    setLoading(true);
    setWarning(null);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          query,
          indexes: tab.indexes,
          recordType: tab.recordType,
          page: pageParam,
          limitPerType: 10,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Search failed');
      if (json.warning) setWarning(json.warning);
      const g = json.grouped ?? {};
      const merged: SearchHitDTO[] = [
        ...(g.contacts ?? []),
        ...(g.clients ?? []),
        ...(g.deals ?? []),
        ...(g.tasks ?? []),
        ...(g.projects ?? []),
        ...(g.people ?? []),
      ];
      setHits(merged);
    } catch {
      setHits([]);
    } finally {
      setLoading(false);
    }
  }, [qParam, tab.indexes, tab.recordType, pageParam]);

  useEffect(() => {
    void run();
  }, [run]);

  useEffect(() => {
    setQInput(qParam);
  }, [qParam]);

  const applyQuery = (nextQ: string, nextType: string, nextPage: number) => {
    const p = new URLSearchParams();
    if (nextQ.trim()) p.set('q', nextQ.trim());
    if (nextType && nextType !== 'all') p.set('type', nextType);
    if (nextPage > 1) p.set('page', String(nextPage));
    router.push(`/hub/search?${p.toString()}`);
  };

  return (
    <div className="hub-main-container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
        Search
      </h1>

      <form
        className="mb-6 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          applyQuery(qInput, typeParam, 1);
        }}
      >
        <input
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          placeholder="Search contacts, deals, tasks…"
          className="hub-field flex-1 rounded-lg px-3 py-2.5 text-[14px]"
        />
        <button
          type="submit"
          className="rounded-lg px-5 py-2.5 text-[13px] font-medium text-white"
          style={{ background: 'var(--primary, #2563EB)' }}
        >
          Search
        </button>
      </form>

      <div className="mb-4 flex flex-wrap gap-1 border-b pb-2" style={{ borderColor: 'var(--border)' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => applyQuery(qParam, t.id, 1)}
            className="rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors"
            style={{
              background: tab.id === t.id ? 'rgba(37,99,235,0.12)' : 'transparent',
              color: tab.id === t.id ? '#2563EB' : 'var(--muted-foreground)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {warning && (
        <p className="mb-4 text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
          {warning}
        </p>
      )}

      {loading && <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>Loading…</p>}

      {!loading && qParam.trim() && hits.length === 0 && (
        <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>No results.</p>
      )}

      <ul className="space-y-2">
        {hits.map((hit) => (
          <li key={`${hit.type}-${hit.id}`}>
            <Link
              href={hit.url}
              className="block rounded-lg border px-4 py-3 transition-colors hover:bg-white/[0.03]"
              style={{ borderColor: 'var(--border)' }}
            >
              <p className="text-[14px] font-medium" style={{ color: 'var(--foreground)' }}>
                <Highlight text={hit.title} needle={qParam} />
              </p>
              <p className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
                <Highlight text={hit.subtitle} needle={qParam} />
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                {hit.type}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {hits.length >= 10 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            disabled={pageParam <= 1}
            onClick={() => applyQuery(qParam, typeParam, pageParam - 1)}
            className="rounded-lg px-4 py-2 text-[12px] font-medium disabled:opacity-40"
            style={{ border: '1px solid var(--border)' }}
          >
            Previous
          </button>
          <span className="flex items-center px-2 text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
            Page {pageParam}
          </span>
          <button
            type="button"
            onClick={() => applyQuery(qParam, typeParam, pageParam + 1)}
            className="rounded-lg px-4 py-2 text-[12px] font-medium"
            style={{ border: '1px solid var(--border)' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default function HubSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="hub-main-container px-4 py-8 text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
          Loading search…
        </div>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
