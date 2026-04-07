import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';

interface PortalUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CL08EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, role: string, permissions: any) => void;
  user: PortalUser | null;
}

export function CL08EditRoleModal({ isOpen, onClose, onSave, user }: CL08EditRoleModalProps) {
  const [role, setRole] = useState(user?.role || 'User');
  const [permissions, setPermissions] = useState({
    viewProjects: true,
    viewInvoices: true,
    submitRequests: true,
    viewDocuments: true,
    manageUsers: role === 'Admin',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      onSave(user.id, role, permissions);
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 hub-modal-overlay"
        onClick={onClose}
      >
        <div 
          className="hub-modal-solid rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Edit User Role & Permissions</h2>
              <p className="text-sm text-muted-foreground">{user.name}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* User Info */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Portal Role *
              </label>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  if (e.target.value !== 'Admin') {
                    setPermissions({ ...permissions, manageUsers: false });
                  }
                }}
                className="hub-field px-3 py-2 text-sm bg-background text-foreground"
                required
              >
                <option value="Admin">Admin - Full access to all portal features</option>
                <option value="User">User - Standard access with limited permissions</option>
                <option value="Viewer">Viewer - Read-only access</option>
              </select>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Permissions
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.viewProjects}
                    onChange={(e) => setPermissions({ ...permissions, viewProjects: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30"
                  />
                  <span className="text-sm text-foreground">View projects and progress</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.viewInvoices}
                    onChange={(e) => setPermissions({ ...permissions, viewInvoices: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30"
                  />
                  <span className="text-sm text-foreground">View invoices and payments</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.submitRequests}
                    onChange={(e) => setPermissions({ ...permissions, submitRequests: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30"
                  />
                  <span className="text-sm text-foreground">Submit requests and support tickets</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.viewDocuments}
                    onChange={(e) => setPermissions({ ...permissions, viewDocuments: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30"
                  />
                  <span className="text-sm text-foreground">Access shared documents</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.manageUsers}
                    onChange={(e) => setPermissions({ ...permissions, manageUsers: e.target.checked })}
                    disabled={role !== 'Admin'}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className={`text-sm ${role !== 'Admin' ? 'text-muted-foreground' : 'text-foreground'}`}>
                    Manage other portal users (Admin only)
                  </span>
                </label>
              </div>
            </div>

            {/* Warning */}
            {role !== user.role && (
              <div className="p-4 rounded-lg bg-muted/60 border border-border">
                <p className="text-xs text-muted-foreground">
                  <strong>Role Change:</strong> Changing this user's role will immediately update their 
                  portal access and available features.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <BonsaiButton variant="ghost" onClick={onClose} type="button">
                Cancel
              </BonsaiButton>
              <BonsaiButton variant="primary" type="submit">
                Save Changes
              </BonsaiButton>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
