import React, { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiInput } from '../bonsai/BonsaiFormFields';

interface CL07InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (user: any) => void;
}

export function CL07InviteUserModal({ isOpen, onClose, onInvite }: CL07InviteUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'User',
    permissions: {
      viewProjects: true,
      viewInvoices: true,
      submitRequests: true,
      viewDocuments: true,
      manageUsers: false,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInvite(formData);
    onClose();
  };

  if (!isOpen) return null;

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
              <h2 className="text-xl font-semibold text-stone-800">Invite Client Portal User</h2>
              <p className="text-sm text-stone-500">Grant portal access to a client team member</p>
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
            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <BonsaiInput
                label="First Name"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
              />
              <BonsaiInput
                label="Last Name"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
              />
            </div>

            {/* Email */}
            <BonsaiInput
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@acmecorp.com"
            />

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Portal Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                    checked={formData.permissions.viewProjects}
                    onChange={(e) => setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, viewProjects: e.target.checked }
                    })}
                    className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-sm text-stone-700">View projects and progress</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions.viewInvoices}
                    onChange={(e) => setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, viewInvoices: e.target.checked }
                    })}
                    className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-sm text-stone-700">View invoices and payments</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions.submitRequests}
                    onChange={(e) => setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, submitRequests: e.target.checked }
                    })}
                    className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-sm text-stone-700">Submit requests and support tickets</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions.viewDocuments}
                    onChange={(e) => setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, viewDocuments: e.target.checked }
                    })}
                    className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-sm text-stone-700">Access shared documents</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions.manageUsers}
                    onChange={(e) => setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, manageUsers: e.target.checked }
                    })}
                    className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-sm text-stone-700">Manage other portal users (Admin only)</span>
                </label>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Email Invitation:</strong> An invitation email will be sent to the user with instructions 
                to set up their password and access the client portal.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
              <BonsaiButton variant="ghost" onClick={onClose} type="button">
                Cancel
              </BonsaiButton>
              <BonsaiButton variant="primary" icon={<Mail />} type="submit">
                Send Invitation
              </BonsaiButton>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
