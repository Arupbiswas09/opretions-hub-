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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 hub-modal-overlay"
        onClick={onClose}
      >
        {/* Dialog */}
        <div 
          className="hub-modal-solid rounded-lg shadow-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Deactivate portal user</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to deactivate portal access for <strong>{user.name}</strong>?
            </p>

            <div className="p-4 bg-muted/40 border border-border rounded-lg">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">User</p>
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-xs text-foreground">
                <strong>This action will:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
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

            <p className="text-xs text-muted-foreground">
              You can reactivate this user at any time by editing their account settings.
            </p>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
            <BonsaiButton variant="ghost" onClick={onClose} type="button">
              Cancel
            </BonsaiButton>
            <BonsaiButton 
              variant="destructive" 
              onClick={() => {
                onConfirm(user.id);
                onClose();
              }}
              type="button"
            >
              Deactivate User
            </BonsaiButton>
          </div>
        </div>
      </div>
    </>
  );
}
