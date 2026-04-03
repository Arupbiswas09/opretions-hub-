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
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-stone-800">
              {initialProject ? 'Edit Project' : 'Create New Project'}
            </h2>
            <p className="text-sm text-stone-500">Set up project details and team</p>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="font-semibold text-stone-800 mb-4">Basic Information</h3>
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
                  <label className="block text-sm font-medium text-stone-700 mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
          <div className="p-4 bg-stone-100 border-2 border-stone-200 rounded-lg">
            <label className="block text-sm font-semibold text-stone-800 mb-2">
              Project Description *
            </label>
            <p className="text-xs text-stone-600 mb-3">
              Provide a clear overview of project goals, deliverables, and success criteria
            </p>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              placeholder="Describe the project objectives, scope, deliverables, and key milestones..."
              required
            />
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-stone-800 mb-4">Timeline</h3>
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
            <h3 className="font-semibold text-stone-800 mb-4">Budget & Billing</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Billing Type *</label>
                <select
                  value={formData.billingType}
                  onChange={(e) => setFormData({ ...formData, billingType: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
            <h3 className="font-semibold text-stone-800 mb-4">Project Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requireTimesheets}
                  onChange={(e) => setFormData({ ...formData, requireTimesheets: e.target.checked })}
                  className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                />
                <div>
                  <span className="text-sm font-medium text-stone-700">Require Timesheets</span>
                  <p className="text-xs text-stone-500">Team members must track time for this project</p>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.clientTimesheetApproval}
                  onChange={(e) => setFormData({ ...formData, clientTimesheetApproval: e.target.checked })}
                  className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                />
                <div>
                  <span className="text-sm font-medium text-stone-700">Client Timesheet Approval</span>
                  <p className="text-xs text-stone-500">Client must approve timesheets before billing</p>
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
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
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
