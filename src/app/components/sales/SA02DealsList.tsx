'use client';
import React, { useEffect, useState } from 'react';
import { Plus, List, LayoutGrid, Columns3 } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { EnhancedTable } from '../operations/EnhancedTable';
import { BonsaiGridCards } from '../bonsai/BonsaiGridCards';
import { BonsaiKanban } from '../bonsai/BonsaiKanban';

interface Deal {
  id: string;
  name: string;
  client: string;
  type: 'Project' | 'Talent';
  value: string;
  stage: string;
  owner: string;
  nextStep: string;
  closeDate: string;
}

interface SA02DealsListProps {
  onDealClick: (deal: Deal) => void;
  onCreateDeal: () => void;
  dataRefreshVersion?: number;
}

function formatMoney(n: unknown) {
  if (n == null || n === '') return '—';
  const num = Number(n);
  if (!Number.isFinite(num)) return '—';
  return `$${num.toLocaleString()}`;
}

function mapDealFromApi(r: Record<string, unknown>): Deal {
  const stage = String(r.stage ?? '').replace(/_/g, ' ');
  return {
    id: String(r.id),
    name: String(r.title ?? 'Deal'),
    client: String(r.client_name ?? '—'),
    type: 'Project',
    value: formatMoney(r.value),
    stage: stage || '—',
    owner: '—',
    nextStep: '—',
    closeDate: r.close_date ? String(r.close_date) : '—',
  };
}

export function SA02DealsList({ onDealClick, onCreateDeal, dataRefreshVersion = 0 }: SA02DealsListProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('list');
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/deals?page=1&limit=200', { credentials: 'include' });
        const json = await res.json();
        if (cancelled) return;
        if (res.ok && Array.isArray(json.data)) setDeals(json.data.map(mapDealFromApi));
        else setDeals([]);
      } catch {
        if (!cancelled) setDeals([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dataRefreshVersion]);

  return (
    <div className="px-3 py-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Deals</h1>
          <p className="text-sm text-muted-foreground">Manage all opportunities</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex items-center gap-1 hub-surface rounded-lg p-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded transition-colors ${viewMode === 'kanban' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
              title="Kanban View"
            >
              <Columns3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <BonsaiButton variant="primary" icon={<Plus />} onClick={onCreateDeal}>
            Create Deal
          </BonsaiButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total deals', value: deals.length },
          { label: 'Total value', value: '$208K' },
          { label: 'Project deals', value: 3 },
          { label: 'Talent deals', value: 2 },
        ].map((s) => (
          <div key={s.label} className="hub-surface hub-surface-elevated rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Content based on view mode */}
      {viewMode === 'list' && (
        <EnhancedTable
          columns={[
            { key: 'name', label: 'Deal Name', sortable: true },
            { key: 'client', label: 'Client', sortable: true },
            { key: 'type', label: 'Type', sortable: true },
            { key: 'value', label: 'Value', sortable: true },
            { key: 'stage', label: 'Stage', sortable: false },
            { key: 'owner', label: 'Owner', sortable: true },
            { key: 'closeDate', label: 'Close Date', sortable: true },
          ]}
          data={deals.map(deal => ({
            ...deal,
            type: (
              <span className="inline-flex px-2 py-1 text-xs rounded-full bg-muted/60 text-muted-foreground border border-border">
                {deal.type}
              </span>
            ),
            stage: <BonsaiStatusPill status="pending" label={deal.stage} />,
          }))}
          onRowClick={(row) => onDealClick(row as Deal)}
          searchable
          filterable
          selectable
        />
      )}

      {viewMode === 'grid' && (
        <BonsaiGridCards
          columns={3}
          cards={deals.map(deal => ({
            id: deal.id,
            title: deal.name,
            subtitle: deal.client,
            status: deal.stage,
            meta: [deal.value, deal.closeDate, `Type: ${deal.type}`],
          }))}
          onCardClick={(card) => {
            const deal = deals.find(d => d.id === card.id);
            if (deal) onDealClick(deal);
          }}
        />
      )}

      {viewMode === 'kanban' && (
        <div className="text-center py-12 hub-surface rounded-lg">
          <p className="text-muted-foreground mb-4">Kanban view is available in Pipeline.</p>
          <BonsaiButton type="button" onClick={() => {/* Navigate to pipeline */}}>
            Go to Pipeline View
          </BonsaiButton>
        </div>
      )}
    </div>
  );
}
