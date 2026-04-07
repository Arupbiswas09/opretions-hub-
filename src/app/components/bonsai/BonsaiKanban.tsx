'use client';
import React from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { cn } from '../ui/utils';

interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  assignee?: { name: string; avatar: string };
  dueDate?: string;
  metadata?: any;
}

interface KanbanColumn {
  id: string;
  title: string;
  count: number;
  cards: KanbanCard[];
  color?: string;
}

interface BonsaiKanbanProps {
  columns: KanbanColumn[];
  onCardClick?: (card: KanbanCard) => void;
  onAddCard?: (columnId: string) => void;
  className?: string;
}

export function BonsaiKanban({ columns, onCardClick, onAddCard, className }: BonsaiKanbanProps) {
  return (
    <div className={cn("flex gap-5 overflow-x-auto pb-4 px-1", className)}>
      {columns.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-72">
          {/* Column Header */}
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              {column.color && (
                <div className={cn("w-2 h-2 rounded-full", column.color)} />
              )}
              <h3 className="text-[13px] font-medium text-foreground">{column.title}</h3>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {column.count}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onAddCard?.(column.id)}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cards */}
          <div className="space-y-2.5">
            {column.cards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => onCardClick?.(card)}
                className="w-full text-left p-4 rounded-xl border border-border bg-[var(--glass-bg)] backdrop-blur-sm hover:shadow-sm hover:bg-[var(--glass-bg)] transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-[13px] font-medium text-foreground leading-snug transition-colors">
                    {card.title}
                  </h4>
                  <span className="p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </span>
                </div>

                {card.description && (
                  <p className="text-[12px] text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                    {card.description}
                  </p>
                )}

                {card.tags && card.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {card.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-muted/60 text-muted-foreground border border-border">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  {card.assignee && (
                    <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center">
                      <span className="text-[9px] font-medium text-muted-foreground">
                        {card.assignee.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                  {card.dueDate && (
                    <span className="text-[11px] text-muted-foreground">{card.dueDate}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
