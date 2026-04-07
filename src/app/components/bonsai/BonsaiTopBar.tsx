import React from 'react';
import { Search, Plus, Bell, HelpCircle, ChevronDown } from 'lucide-react';
import { cn } from '../ui/utils';

interface BonsaiTopBarProps {
  className?: string;
}

export function BonsaiTopBar({ className }: BonsaiTopBarProps) {
  return (
    <div className={cn("h-16 bg-[var(--background-2)] border-b border-border flex items-center justify-between px-6", className)}>
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="hub-field pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Create Button */}
        <button type="button" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Create</span>
        </button>

        {/* Icon Buttons */}
        <button type="button" className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>

        <button type="button" className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-border"></div>

        {/* Profile Menu */}
        <button type="button" className="flex items-center gap-2 p-1.5 hover:bg-muted rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
            <span className="text-white text-sm font-medium">JD</span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
