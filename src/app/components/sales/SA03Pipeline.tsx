'use client';
import React, { useState } from 'react';
import { Plus, Filter, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

/* ─── Types ─── */
interface DealCard {
  id: string;
  title: string;
  client: string;
  value: number;   // numeric for column totals
  tags: string[];
  owner: string;
}

interface Column {
  id: string;
  title: string;
  color: string;   // left border color
  cards: DealCard[];
}

/* ─── Avatar initials ─── */
function AvatarChip({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#2563EB', '#059669', '#D97706', '#7C3AED'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
      style={{ background: color }}>
      {initials}
    </span>
  );
}

/* ─── Tag chip ─── */
function TagChip({ label }: { label: string }) {
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
      style={{
        background: 'rgba(37,99,235,0.10)',
        color: 'var(--primary)',
        border: '1px solid rgba(37,99,235,0.15)',
      }}>
      {label}
    </span>
  );
}

/* ─── Deal card ─── */
function DealCardView({ card, onClick }: { card: DealCard; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      onClick={onClick}
      className="w-full text-left rounded-lg p-3 transition-all group"
      style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--border)',
      }}>
      <p className="text-[13px] font-medium mb-1 group-hover:text-[color:var(--primary)] transition-colors"
        style={{ color: 'var(--foreground)' }}>
        {card.title}
      </p>
      <p className="text-[11px] mb-2" style={{ color: 'var(--muted-foreground)' }}>
        {card.client}
      </p>
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.tags.map(tag => <TagChip key={tag} label={tag} />)}
        </div>
      )}
      <div className="flex items-center justify-between">
        <AvatarChip name={card.owner} />
        <span className="text-[12px] font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>
          ${(card.value / 1000).toFixed(0)}K
        </span>
      </div>
    </motion.button>
  );
}

/* ─── Column ─── */
function PipelineColumn({
  column,
  onCardClick,
  onAddCard,
}: {
  column: Column;
  onCardClick: (card: DealCard) => void;
  onAddCard: () => void;
}) {
  const total = column.cards.reduce((s, c) => s + c.value, 0);
  const totalStr = total === 0 ? '$0' : total >= 1000 ? `$${(total / 1000).toFixed(0)}K` : `$${total}`;

  return (
    <div className="flex-1 min-w-[200px] max-w-[260px]">
      {/* Column header — exactly like Bonsai: title + count / $total */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-[3px] h-4 rounded-full flex-shrink-0" style={{ background: column.color }} />
        <span className="text-[12px] font-semibold" style={{ color: 'var(--foreground)' }}>
          {column.title}
        </span>
        <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
          {column.cards.length}
        </span>
        <span className="text-[11px] ml-auto" style={{ color: 'var(--muted-foreground)' }}>
          {totalStr}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-2 min-h-[60px]">
        {column.cards.map(card => (
          <DealCardView key={card.id} card={card} onClick={() => onCardClick(card)} />
        ))}

        {/* Add button */}
        <button
          onClick={onAddCard}
          className="w-full flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] transition-colors"
          style={{ color: 'var(--muted-foreground)' }}>
          <Plus className="w-3.5 h-3.5" />
          New Deal
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SA03 PIPELINE — Bonsai-style: columns with count + $value
══════════════════════════════════════════════════════════ */
interface SA03PipelineProps {
  onDealClick: (deal: any) => void;
  onCreateDeal: () => void;
}

export function SA03Pipeline({ onDealClick, onCreateDeal }: SA03PipelineProps) {
  const [pipelineType, setPipelineType] = useState<'project' | 'talent'>('project');
  const [activeSort, setActiveSort] = useState<number>(0); // for "Sort 1" badge demo

  const projectColumns: Column[] = [
    {
      id: 'new',
      title: 'New',
      color: '#6B7280',
      cards: [
        { id: '1', title: 'E-commerce Platform', client: 'Fashion Co', value: 75000, tags: ['Web Dev'], owner: 'John Doe' },
        { id: '2', title: 'Marketing Website', client: 'Local Business', value: 12000, tags: ['Design'], owner: 'Jane Smith' },
      ],
    },
    {
      id: 'qualified',
      title: 'Qualified',
      color: '#2563EB',
      cards: [
        { id: '3', title: 'SaaS Dashboard', client: 'Tech Startup', value: 38000, tags: ['UI/UX', 'React'], owner: 'Mike Johnson' },
      ],
    },
    {
      id: 'scoping',
      title: 'Scoping',
      color: '#0D9488',
      cards: [
        { id: '4', title: 'Brand Identity Package', client: 'Local Retail', value: 15000, tags: ['Branding'], owner: 'Sarah Lee' },
      ],
    },
    {
      id: 'proposal',
      title: 'Proposal',
      color: '#7C3AED',
      cards: [
        { id: '5', title: 'Website Redesign', client: 'Acme Corp', value: 45000, tags: ['Design', 'Dev'], owner: 'John Doe' },
      ],
    },
    {
      id: 'negotiation',
      title: 'Negotiation',
      color: '#D97706',
      cards: [
        { id: '6', title: 'Mobile App', client: 'FinTech Startup', value: 85000, tags: ['Mobile'], owner: 'Mike Johnson' },
      ],
    },
    {
      id: 'won',
      title: 'Won',
      color: '#059669',
      cards: [],
    },
  ];

  const talentColumns: Column[] = [
    {
      id: 'new-request',
      title: 'New Request',
      color: '#6B7280',
      cards: [
        { id: 't1', title: 'Full-Stack Engineer', client: 'SaaS Startup', value: 45000, tags: ['Dev', 'Remote'], owner: 'Sarah Lee' },
      ],
    },
    {
      id: 'qualified',
      title: 'Qualified',
      color: '#2563EB',
      cards: [
        { id: 't2', title: 'UX/UI Designer', client: 'E-commerce Co', value: 25000, tags: ['Design'], owner: 'Jane Smith' },
      ],
    },
    {
      id: 'profiles',
      title: 'Profiles Shared',
      color: '#0D9488',
      cards: [
        { id: 't3', title: 'React Developer', client: 'Tech Company', value: 35000, tags: ['React'], owner: 'Mike Johnson' },
      ],
    },
    {
      id: 'interviewing',
      title: 'Interviewing',
      color: '#7C3AED',
      cards: [
        { id: 't4', title: 'Senior Designer', client: 'Agency', value: 28000, tags: ['Design', 'FT'], owner: 'John Doe' },
      ],
    },
    {
      id: 'placement',
      title: 'Placement',
      color: '#D97706',
      cards: [],
    },
    {
      id: 'won',
      title: 'Won',
      color: '#059669',
      cards: [],
    },
  ];

  const columns = pipelineType === 'project' ? projectColumns : talentColumns;
  const totalValue = columns.reduce((s, col) => s + col.cards.reduce((cs, c) => cs + c.value, 0), 0);
  const totalDeals = columns.reduce((s, col) => s + col.cards.length, 0);

  return (
    <div className="p-6">
      {/* ── Bonsai-style page header: "NEW / All Deals ▾ +" */}
      <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-[11px] font-semibold uppercase tracking-[0.07em] px-2 py-0.5 rounded-md"
          style={{ background: 'var(--primary)', color: '#FFFFFF' }}>
          NEW
        </span>
        <div className="flex items-center gap-1">
          {/* Pipeline type switcher — like Bonsai's "All Deals ▾" */}
          <button
            onClick={() => setPipelineType('project')}
            className="flex items-center gap-1 text-[14px] font-semibold transition-colors"
            style={{ color: pipelineType === 'project' ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
            {pipelineType === 'project' ? 'Project Pipeline' : 'All Deals'}
          </button>
          <div className="relative">
            <select
              value={pipelineType}
              onChange={e => setPipelineType(e.target.value as any)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <span className="text-[14px] px-1 cursor-pointer" style={{ color: 'var(--muted-foreground)' }}>▾</span>
          </div>
        </div>
        <button className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
          onClick={onCreateDeal}>
          <Plus className="w-3.5 h-3.5" />
        </button>

        <div className="ml-auto flex items-center gap-2">
          {/* Filter + Sort like Bonsai */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}>
            <Filter className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
            Filter
          </button>

          {/* Sort badge — "Sort 1" when active */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
            style={{
              background: activeSort > 0 ? 'rgba(37,99,235,0.10)' : 'var(--glass-bg)',
              border: `1px solid ${activeSort > 0 ? 'rgba(37,99,235,0.25)' : 'var(--border)'}`,
              color: activeSort > 0 ? 'var(--primary)' : 'var(--foreground)',
            }}
            onClick={() => setActiveSort(activeSort > 0 ? 0 : 1)}>
            Sort {activeSort > 0 ? activeSort : ''}
          </button>

          <button className="p-1.5 rounded-lg" style={{ color: 'var(--muted-foreground)' }}>
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Board toggle */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px]"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
            <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>⊞ Board</span>
          </div>

          {/* New Deal */}
          <button
            onClick={onCreateDeal}
            className="px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
            style={{ background: 'var(--primary)', color: '#FFFFFF' }}>
            New Deal
          </button>
        </div>
      </div>

      {/* ── Summary row ── */}
      <div className="flex items-center gap-6 mb-5">
        <div>
          <span className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>Total value </span>
          <span className="text-[13px] font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>
            ${(totalValue / 1000).toFixed(0)}K
          </span>
        </div>
        <div>
          <span className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>Active deals </span>
          <span className="text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>
            {totalDeals}
          </span>
        </div>
        {/* Pipeline type tabs */}
        <div className="ml-auto flex items-center gap-1">
          {(['project', 'talent'] as const).map(type => (
            <button key={type}
              onClick={() => setPipelineType(type)}
              className="px-3 py-1 rounded-md text-[12px] font-medium transition-colors"
              style={{
                background: pipelineType === type ? 'var(--glass-bg)' : 'transparent',
                border: pipelineType === type ? '1px solid var(--border)' : '1px solid transparent',
                color: pipelineType === type ? 'var(--foreground)' : 'var(--muted-foreground)',
              }}>
              {type === 'project' ? 'Project Pipeline' : 'Talent Pipeline'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Kanban board ── */}
      <div className="flex gap-4 overflow-x-auto pb-6">
        {columns.map(col => (
          <PipelineColumn
            key={col.id}
            column={col}
            onCardClick={(card) => onDealClick({
              id: card.id, name: card.title, client: card.client,
              type: pipelineType === 'project' ? 'Project' : 'Talent',
              value: `$${(card.value / 1000).toFixed(0)}K`,
              stage: col.title, owner: card.owner,
            })}
            onAddCard={onCreateDeal}
          />
        ))}
      </div>
    </div>
  );
}
