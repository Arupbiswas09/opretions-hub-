import React from 'react';
import { X, Trash2, Mail, Tag, Download, MoreHorizontal } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete?: () => void;
  onEmail?: () => void;
  onTag?: () => void;
  onExport?: () => void;
  className?: string;
}

export function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  onDelete,
  onEmail,
  onTag,
  onExport,
  className,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className={`bg-primary/95 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onClearSelection}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <span className="font-medium text-sm">
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        {onEmail && (
          <button
            onClick={onEmail}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </button>
        )}
        {onTag && (
          <button
            onClick={onTag}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
          >
            <Tag className="w-4 h-4" />
            <span>Tag</span>
          </button>
        )}
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-3 py-1.5 bg-destructive hover:bg-destructive/90 rounded-lg text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        )}
        <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
