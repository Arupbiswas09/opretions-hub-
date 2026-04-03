import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiInput } from '../bonsai/BonsaiFormFields';

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
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-stone-800">
              {initialPerson ? 'Edit Person' : 'Add New Person'}
            </h2>
            <p className="text-sm text-stone-500">Employee or freelancer details</p>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Type *</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'Employee' })}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'Employee'
                    ? 'border-primary bg-primary/5'
                    : 'border-stone-200 hover:border-primary/50'
                }`}
              >
                <p className="font-medium text-stone-800">Employee</p>
                <p className="text-xs text-stone-600">Full-time or part-time team member</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'Freelancer' })}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'Freelancer'
                    ? 'border-primary bg-primary/5'
                    : 'border-stone-200 hover:border-primary/50'
                }`}
              >
                <p className="font-medium text-stone-800">Freelancer</p>
                <p className="text-xs text-stone-600">Contract or project-based</p>
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="font-semibold text-stone-800 mb-4">Basic Information</h3>
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
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  >
                    <option value="">Select department</option>
                    <option value="Operations">Operations</option>
                    <option value="Design">Design</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          {formData.type === 'Employee' && (
            <div>
              <h3 className="font-semibold text-stone-800 mb-4">Employment Details</h3>
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
              <h3 className="font-semibold text-stone-800 mb-4">Freelancer Details</h3>
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
            <h3 className="font-semibold text-stone-800 mb-4">Skills & Availability</h3>
            <div className="space-y-4">
              <BonsaiInput
                label="Skills (comma-separated)"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="Project Management, Agile, Leadership"
              />

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Availability</label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-semibold text-stone-800 mb-4">Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <BonsaiInput
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="San Francisco, CA"
              />
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="PST">PST - Pacific Time</option>
                  <option value="MST">MST - Mountain Time</option>
                  <option value="CST">CST - Central Time</option>
                  <option value="EST">EST - Eastern Time</option>
                  <option value="GMT">GMT - Greenwich Mean Time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
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
