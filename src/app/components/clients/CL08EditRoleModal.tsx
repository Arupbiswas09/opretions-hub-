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
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-lg shadow-2xl w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-stone-800">Edit User Role & Permissions</h2>
              <p className="text-sm text-stone-500">{user.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* User Info */}
            <div className="p-4 bg-stone-50 rounded-lg">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-stone-600">Name</p>
                  <p className="text-sm font-medium text-stone-800">{user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-600">Email</p>
                  <p className="text-sm font-medium text-stone-800">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
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
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              >
                <option value="Admin">Admin - Full access to all portal features</option>
                <option value="User">User - Standard access with limited permissions</option>
                <option value="Viewer">Viewer - Read-only access</option>
              </select>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                Permissions
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.viewProjects}
                    onChange={(e) => setPermissions({ ...permissions, viewProjects: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-sm text-stone-700">View projects and progress</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.viewInvoices}
                    onChange={(e) => setPermissions({ ...permissions, viewInvoices: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-sm text-stone-700">View invoices and payments</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.submitRequests}
                    onChange={(e) => setPermissions({ ...permissions, submitRequests: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-sm text-stone-700">Submit requests and support tickets</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.viewDocuments}
                    onChange={(e) => setPermissions({ ...permissions, viewDocuments: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-sm text-stone-700">Access shared documents</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.manageUsers}
                    onChange={(e) => setPermissions({ ...permissions, manageUsers: e.target.checked })}
                    disabled={role !== 'Admin'}
                    className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className={`text-sm ${role !== 'Admin' ? 'text-stone-400' : 'text-stone-700'}`}>
                    Manage other portal users (Admin only)
                  </span>
                </label>
              </div>
            </div>

            {/* Warning */}
            {role !== user.role && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <strong>Role Change:</strong> Changing this user's role will immediately update their 
                  portal access and available features.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
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
