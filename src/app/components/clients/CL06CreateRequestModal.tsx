import React, { useState } from 'react';
import { X, FileText, Users, MessageSquare, Settings } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiInput } from '../bonsai/BonsaiFormFields';

interface CL06CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (request: any) => void;
}

export function CL06CreateRequestModal({ isOpen, onClose, onCreate }: CL06CreateRequestModalProps) {
  const [formData, setFormData] = useState({
    type: 'Project Request',
    title: '',
    priority: 'Medium',
    description: '',
    requirements: '',
    expectedCompletion: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    onClose();
  };

  if (!isOpen) return null;

  const requestTypes = [
    { value: 'Project Request', label: 'Project Request', icon: FileText, color: 'blue' },
    { value: 'Staffing Request', label: 'Staffing Request', icon: Users, color: 'purple' },
    { value: 'Support Request', label: 'Support Request', icon: MessageSquare, color: 'green' },
    { value: 'Change Request', label: 'Change Request', icon: Settings, color: 'amber' },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white">
            <div>
              <h2 className="text-xl font-semibold text-stone-800">Create New Request</h2>
              <p className="text-sm text-stone-500">Submit a request to the team</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Request Type Selection */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                Request Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {requestTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                        formData.type === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-stone-200 hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-${type.color}-100 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${type.color}-600`} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-stone-800 text-sm">{type.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <BonsaiInput
              label="Request Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief summary of your request"
            />

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder="Provide detailed information about your request..."
                required
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Requirements & Specifications
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder="List any specific requirements, technical specifications, or deliverables..."
              />
            </div>

            {/* Expected Completion */}
            <BonsaiInput
              label="Expected Completion Date"
              type="date"
              value={formData.expectedCompletion}
              onChange={(e) => setFormData({ ...formData, expectedCompletion: e.target.value })}
            />

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>What happens next?</strong> Your request will be reviewed by our team. 
                You'll receive an initial response within 1-2 business days. 
                Track progress in the Requests tab of your client portal.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
              <BonsaiButton variant="ghost" onClick={onClose} type="button">
                Cancel
              </BonsaiButton>
              <BonsaiButton variant="primary" type="submit">
                Submit Request
              </BonsaiButton>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
