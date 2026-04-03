import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';

interface PortalUser {
  id: string;
  name: string;
  email: string;
}

interface CL09DeactivateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string) => void;
  user: PortalUser | null;
}

export function CL09DeactivateUserDialog({ isOpen, onClose, onConfirm, user }: CL09DeactivateUserDialogProps) {
  if (!isOpen || !user) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Dialog */}
        <div 
          className="bg-white rounded-lg shadow-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-stone-700" />
              </div>
              <h2 className="text-xl font-semibold text-stone-800">Deactivate Portal User</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <p className="text-sm text-stone-700">
              Are you sure you want to deactivate portal access for <strong>{user.name}</strong>?
            </p>

            <div className="p-4 bg-stone-50 rounded-lg">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-stone-600">User</p>
                  <p className="text-sm font-medium text-stone-800">{user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600">Email</p>
                  <p className="text-sm font-medium text-stone-800">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-100 border border-stone-200 rounded-lg">
              <p className="text-xs text-stone-700">
                <strong>⚠️ This action will:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-xs text-stone-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Immediately revoke their portal access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Log them out of all active sessions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Preserve their account data (can be reactivated later)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Send them a notification email about the deactivation</span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-stone-600">
              You can reactivate this user at any time by editing their account settings.
            </p>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <BonsaiButton variant="ghost" onClick={onClose}>
              Cancel
            </BonsaiButton>
            <BonsaiButton 
              variant="destructive" 
              onClick={() => {
                onConfirm(user.id);
                onClose();
              }}
            >
              Deactivate User
            </BonsaiButton>
          </div>
        </div>
      </div>
    </>
  );
}
