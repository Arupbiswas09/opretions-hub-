import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiInput } from '../bonsai/BonsaiFormFields';

interface CO02ContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: any) => void;
  initialContact?: any;
}

export function CO02ContactDrawer({ isOpen, onClose, onSave, initialContact }: CO02ContactDrawerProps) {
  const [formData, setFormData] = useState(initialContact || {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    type: 'Lead',
    source: 'Website',
    linkedClient: '',
    consent: 'Pending',
    consentDate: '',
    tags: '',
    notes: '',
    // GDPR fields
    dataProcessingBasis: 'Consent',
    marketingOptIn: false,
    thirdPartySharing: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-stone-800">
              {initialContact ? 'Edit Contact' : 'Create New Contact'}
            </h2>
            <p className="text-sm text-stone-500">Fill in contact details</p>
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

              <BonsaiInput
                label="Email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.doe@example.com"
              />

              <BonsaiInput
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />

              <div className="grid grid-cols-2 gap-4">
                <BonsaiInput
                  label="Company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Acme Corp"
                />
                <BonsaiInput
                  label="Job Title"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="Marketing Director"
                />
              </div>
            </div>
          </div>

          {/* Contact Classification */}
          <div>
            <h3 className="font-semibold text-stone-800 mb-4">Classification</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Contact Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  >
                    <option value="Lead">Lead</option>
                    <option value="Client">Client</option>
                    <option value="Candidate">Candidate</option>
                    <option value="Partner">Partner</option>
                    <option value="Vendor">Vendor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Source *
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Event">Event</option>
                    <option value="Cold Outreach">Cold Outreach</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <BonsaiInput
                label="Linked Client (optional)"
                value={formData.linkedClient}
                onChange={(e) => setFormData({ ...formData, linkedClient: e.target.value })}
                placeholder="Select or type client name"
              />

              <BonsaiInput
                label="Tags (comma-separated)"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="VIP, Decision Maker, Qualified"
              />
            </div>
          </div>

          {/* GDPR & Consent */}
          <div>
            <h3 className="font-semibold text-stone-800 mb-4">GDPR & Consent</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Consent Status *
                  </label>
                  <select
                    value={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  >
                    <option value="Given">Given</option>
                    <option value="Pending">Pending</option>
                    <option value="Withdrawn">Withdrawn</option>
                  </select>
                </div>

                <BonsaiInput
                  label="Consent Date"
                  type="date"
                  value={formData.consentDate}
                  onChange={(e) => setFormData({ ...formData, consentDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Data Processing Basis *
                </label>
                <select
                  value={formData.dataProcessingBasis}
                  onChange={(e) => setFormData({ ...formData, dataProcessingBasis: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                >
                  <option value="Consent">Consent</option>
                  <option value="Contract">Contract</option>
                  <option value="Legal Obligation">Legal Obligation</option>
                  <option value="Legitimate Interest">Legitimate Interest</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.marketingOptIn}
                    onChange={(e) => setFormData({ ...formData, marketingOptIn: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-sm text-stone-700">Marketing opt-in</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.thirdPartySharing}
                    onChange={(e) => setFormData({ ...formData, thirdPartySharing: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-sm text-stone-700">Third-party data sharing consent</span>
                </label>
              </div>

              <div className="p-3 bg-stone-100 border border-stone-200 rounded-lg">
                <p className="text-xs text-stone-700">
                  <strong>GDPR Notice:</strong> Ensure you have a lawful basis for processing this contact's data. 
                  Document the consent and keep records of when and how consent was obtained.
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="Additional information about this contact..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <BonsaiButton variant="ghost" onClick={onClose} type="button">
              Cancel
            </BonsaiButton>
            <BonsaiButton variant="primary" type="submit">
              {initialContact ? 'Save Changes' : 'Create Contact'}
            </BonsaiButton>
          </div>
        </form>
      </div>
    </>
  );
}
