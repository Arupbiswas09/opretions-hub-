import React from 'react';
import { X, Mail, Tag, UserCheck, Download, Trash2 } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';

interface CO06BulkToolbarProps {
  selectedCount: number;
  onClose: () => void;
}

export function CO06BulkToolbar({ selectedCount, onClose }: CO06BulkToolbarProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-gradient-to-r from-primary to-green-600 text-white rounded-lg shadow-2xl px-6 py-4 flex items-center gap-6">
        {/* Selection Count */}
        <div className="flex items-center gap-3 pr-6 border-r border-white/20">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="font-semibold">{selectedCount}</span>
          </div>
          <div>
            <p className="text-sm font-semibold">
              {selectedCount} contact{selectedCount > 1 ? 's' : ''} selected
            </p>
            <p className="text-xs text-white/80">Choose an action below</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
            <Mail className="w-4 h-4" />
            <span className="text-sm font-medium">Send Email</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
            <Tag className="w-4 h-4" />
            <span className="text-sm font-medium">Add Tag</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
            <UserCheck className="w-4 h-4" />
            <span className="text-sm font-medium">Update Consent</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-stone-1000 hover:bg-stone-800 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">Delete</span>
          </button>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="ml-4 pl-4 border-l border-white/20 p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
