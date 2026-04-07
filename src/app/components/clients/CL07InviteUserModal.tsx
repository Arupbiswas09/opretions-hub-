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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 hub-modal-overlay"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="hub-modal-solid rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Invite portal user</h2>
              <p className="text-sm text-muted-foreground">Grant access to a client team member</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
              <label className="block text-sm font-medium text-foreground mb-2">
                Portal Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                    checked={formData.permissions.viewProjects}
                    onChange={(e) => setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, viewProjects: e.target.checked }
                    })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30"
                  />
                  <span className="text-sm text-foreground">View projects and progress</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions.viewInvoices}
                    onChange={(e) => setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, viewInvoices: e.target.checked }
                    })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30"
                  />
                  <span className="text-sm text-foreground">View invoices and payments</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions.submitRequests}
                    onChange={(e) => setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, submitRequests: e.target.checked }
                    })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30"
                  />
                  <span className="text-sm text-foreground">Submit requests and support tickets</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions.viewDocuments}
                    onChange={(e) => setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, viewDocuments: e.target.checked }
                    })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30"
                  />
                  <span className="text-sm text-foreground">Access shared documents</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions.manageUsers}
                    onChange={(e) => setFormData({
                      ...formData,
                      permissions: { ...formData.permissions, manageUsers: e.target.checked }
                    })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30"
                  />
                  <span className="text-sm text-foreground">Manage other portal users (Admin only)</span>
                </label>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-xs text-foreground">
                <strong>Email Invitation:</strong> An invitation email will be sent to the user with instructions 
                to set up their password and access the client portal.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
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
