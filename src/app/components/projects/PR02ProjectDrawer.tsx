import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiInput } from '../bonsai/BonsaiFormFields';

interface PR02ProjectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: any) => void;
  initialProject?: any;
}

export function PR02ProjectDrawer({ isOpen, onClose, onSave, initialProject }: PR02ProjectDrawerProps) {
  const [formData, setFormData] = useState(initialProject || {
    name: '',
    client: '',
    status: 'Planning',
    projectManager: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    billingType: 'Fixed Price',
    hourlyRate: '',
    estimatedHours: '',
    tags: '',
    // Settings
    requireTimesheets: true,
    clientTimesheetApproval: false,
    clientApprover: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 hub-modal-overlay" onClick={onClose} aria-hidden />

      <div className="hub-modal-solid fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl overflow-y-auto shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border px-6 py-4 hub-modal-solid">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {initialProject ? 'Edit project' : 'New project'}
            </h2>
            <p className="text-sm text-muted-foreground">Details &amp; billing</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Basics</h3>
            <div className="space-y-4">
              <BonsaiInput
                label="Project Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Website Redesign"
              />

              <div className="grid grid-cols-2 gap-4">
                <BonsaiInput
                  label="Client"
                  required
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="Select client"
                />
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <BonsaiInput
                label="Project Manager"
                required
                value={formData.projectManager}
                onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
                placeholder="Select team member"
              />
            </div>
          </div>

          {/* Project Description - PROMINENT */}
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Scope, deliverables, milestones…"
              required
            />
          </div>

          {/* Timeline */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <BonsaiInput
                label="Start Date"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              <BonsaiInput
                label="End Date"
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Budget & Billing */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Budget &amp; billing</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Billing type *</label>
                <select
                  value={formData.billingType}
                  onChange={(e) => setFormData({ ...formData, billingType: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                >
                  <option value="Fixed Price">Fixed Price</option>
                  <option value="Time & Materials">Time & Materials</option>
                  <option value="Retainer">Retainer</option>
                </select>
              </div>

              {formData.billingType === 'Fixed Price' && (
                <BonsaiInput
                  label="Total Budget"
                  type="number"
                  required
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="45000"
                />
              )}

              {formData.billingType === 'Time & Materials' && (
                <div className="grid grid-cols-2 gap-4">
                  <BonsaiInput
                    label="Hourly Rate"
                    type="number"
                    required
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    placeholder="150"
                  />
                  <BonsaiInput
                    label="Estimated Hours"
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                    placeholder="300"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Project Settings */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Settings</h3>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.requireTimesheets}
                  onChange={(e) => setFormData({ ...formData, requireTimesheets: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
                />
                <div>
                  <span className="text-sm font-medium text-foreground">Require timesheets</span>
                  <p className="text-xs text-muted-foreground">Time required on this project</p>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.clientTimesheetApproval}
                  onChange={(e) => setFormData({ ...formData, clientTimesheetApproval: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
                />
                <div>
                  <span className="text-sm font-medium text-foreground">Client approves timesheets</span>
                  <p className="text-xs text-muted-foreground">Before invoicing</p>
                </div>
              </label>

              {formData.clientTimesheetApproval && (
                <div className="ml-6 mt-2">
                  <BonsaiInput
                    label="Client Approver"
                    required
                    value={formData.clientApprover}
                    onChange={(e) => setFormData({ ...formData, clientApprover: e.target.value })}
                    placeholder="Select client user"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <BonsaiInput
            label="Tags (comma-separated)"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Website, Design, Development"
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <BonsaiButton variant="ghost" onClick={onClose} type="button">
              Cancel
            </BonsaiButton>
            <BonsaiButton variant="primary" type="submit">
              {initialProject ? 'Save Changes' : 'Create Project'}
            </BonsaiButton>
          </div>
        </form>
      </div>
    </>
  );
}
