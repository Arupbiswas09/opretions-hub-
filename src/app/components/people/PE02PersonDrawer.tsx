import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiInput, BonsaiSelect } from '../bonsai/BonsaiFormFields';

interface PE02PersonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (person: any) => void;
  initialPerson?: any;
}

export function PE02PersonDrawer({ isOpen, onClose, onSave, initialPerson }: PE02PersonDrawerProps) {
  const [formData, setFormData] = useState(initialPerson || {
    type: 'Employee',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    status: 'Active',
    startDate: '',
    endDate: '',
    // Employee specific
    employeeId: '',
    manager: '',
    salary: '',
    // Freelancer specific
    hourlyRate: '',
    company: '',
    // Common
    skills: '',
    availability: 'Available',
    location: '',
    timezone: 'PST',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 hub-overlay-backdrop" onClick={onClose} />
      
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl shadow-2xl z-50 overflow-y-auto"
        style={{ background: 'var(--background-2)' }}>
        <div className="sticky top-0 px-6 py-4 flex items-center justify-between"
          style={{ background: 'var(--background-2)', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
              {initialPerson ? 'Edit Person' : 'Add New Person'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Employee or freelancer details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--muted)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Type *</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'Employee' })}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'Employee'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <p className="font-medium text-foreground">Employee</p>
                <p className="text-xs text-muted-foreground">Full-time or part-time team member</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'Freelancer' })}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'Freelancer'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <p className="font-medium text-foreground">Freelancer</p>
                <p className="text-xs text-muted-foreground">Contract or project-based</p>
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Basic information</h3>
            <div className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <BonsaiInput
                  label="Email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@company.com"
                />
                <BonsaiInput
                  label="Phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <BonsaiInput
                  label="Role"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Senior Project Manager"
                />
                <BonsaiSelect
                  label="Department *"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  options={[
                    { value: '', label: 'Select department' },
                    { value: 'Operations', label: 'Operations' },
                    { value: 'Design', label: 'Design' },
                    { value: 'Engineering', label: 'Engineering' },
                    { value: 'Sales', label: 'Sales' },
                    { value: 'Marketing', label: 'Marketing' },
                  ]}
                  required
                />
              </div>
            </div>
          </div>

          {/* Employment Details */}
          {formData.type === 'Employee' && (
            <div>
              <h3 className="font-semibold text-foreground mb-4">Employment details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <BonsaiInput
                    label="Employee ID"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="EMP-001"
                  />
                  <BonsaiInput
                    label="Manager"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    placeholder="Select manager"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <BonsaiInput
                    label="Start Date"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                  <BonsaiInput
                    label="Annual Salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="75000"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Freelancer Details */}
          {formData.type === 'Freelancer' && (
            <div>
              <h3 className="font-semibold text-foreground mb-4">Freelancer details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <BonsaiInput
                    label="Company (if applicable)"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Design Studio LLC"
                  />
                  <BonsaiInput
                    label="Hourly Rate"
                    type="number"
                    required
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    placeholder="150"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <BonsaiInput
                    label="Contract Start"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                  <BonsaiInput
                    label="Contract End"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Skills & Availability */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Skills & availability</h3>
            <div className="space-y-4">
              <BonsaiInput
                label="Skills (comma-separated)"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="Project Management, Agile, Leadership"
              />

              <BonsaiSelect
                label="Availability"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                options={[
                  { value: 'Available', label: 'Available' },
                  { value: 'Busy', label: 'Busy' },
                  { value: 'On Leave', label: 'On Leave' },
                ]}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <BonsaiInput
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="San Francisco, CA"
              />
              <BonsaiSelect
                label="Timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                options={[
                  { value: 'PST', label: 'PST - Pacific Time' },
                  { value: 'MST', label: 'MST - Mountain Time' },
                  { value: 'CST', label: 'CST - Central Time' },
                  { value: 'EST', label: 'EST - Eastern Time' },
                  { value: 'GMT', label: 'GMT - Greenwich Mean Time' },
                ]}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <BonsaiSelect
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
                { value: 'On Leave', label: 'On Leave' },
              ]}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <BonsaiButton variant="ghost" onClick={onClose} type="button">
              Cancel
            </BonsaiButton>
            <BonsaiButton variant="primary" type="submit">
              {initialPerson ? 'Save Changes' : 'Add Person'}
            </BonsaiButton>
          </div>
        </form>
      </div>
    </>
  );
}
