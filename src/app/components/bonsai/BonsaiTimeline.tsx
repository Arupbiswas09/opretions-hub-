import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../ui/utils';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  user?: { name: string; avatar?: string };
  icon?: React.ReactNode;
  color?: string;
}

interface BonsaiTimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function BonsaiTimeline({ items, className }: BonsaiTimelineProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          {/* Icon/Avatar Column */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                item.color || "bg-primary/10 text-primary"
              )}
            >
              {item.icon || <Clock className="w-4 h-4" />}
            </div>
            {index < items.length - 1 && (
              <div className="w-px flex-1 bg-stone-200 mt-2" />
            )}
          </div>

          {/* Content Column */}
          <div className="flex-1 pb-6">
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-medium text-stone-800 text-sm">{item.title}</h4>
              <span className="text-xs text-stone-500">{item.timestamp}</span>
            </div>
            
            {item.description && (
              <p className="text-sm text-stone-600 mb-2">{item.description}</p>
            )}
            
            {item.user && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs">
                    {item.user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <span className="text-xs text-stone-600">{item.user.name}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
