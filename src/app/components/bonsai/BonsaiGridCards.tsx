import React from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '../ui/utils';

interface GridCard {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  status?: string;
  meta?: string[];
}

interface BonsaiGridCardsProps {
  cards: GridCard[];
  onCardClick?: (card: GridCard) => void;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function BonsaiGridCards({ cards, onCardClick, columns = 3, className }: BonsaiGridCardsProps) {
  const gridClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[columns];

  return (
    <div className={cn("grid gap-4", gridClass, className)}>
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => onCardClick?.(card)}
          className="bg-white rounded-lg border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all cursor-pointer overflow-hidden"
        >
          {card.image && (
            <div className="w-full h-40 bg-stone-100 overflow-hidden">
              <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-stone-800 text-sm mb-1">{card.title}</h3>
                {card.subtitle && (
                  <p className="text-xs text-stone-500">{card.subtitle}</p>
                )}
              </div>
              <button className="p-1 text-stone-400 hover:text-stone-600 rounded">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {card.status && (
              <div className="mb-3">
                <span className="inline-flex px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                  {card.status}
                </span>
              </div>
            )}

            {card.meta && card.meta.length > 0 && (
              <div className="flex items-center gap-3 text-xs text-stone-500 border-t border-stone-100 pt-3">
                {card.meta.map((item, index) => (
                  <span key={index}>{item}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
