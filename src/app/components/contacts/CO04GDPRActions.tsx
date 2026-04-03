import React, { useState } from 'react';
import { Download, Trash2, AlertTriangle, Shield, FileText, Clock, CheckCircle2 } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';

interface Contact {
  id: string;
  name: string;
  email: string;
  consent: string;
  gdprStatus: string;
}

interface CO04GDPRActionsProps {
  contact: Contact;
  onExportData?: () => void;
  onRequestDeletion?: () => void;
  onPermanentDelete?: () => void;
}

export function CO04GDPRActions({ contact, onExportData, onRequestDeletion, onPermanentDelete }: CO04GDPRActionsProps) {
  return (
    <div className="space-y-6">
      {/* GDPR Status Overview */}
      <div className="bg-white rounded-lg border border-stone-200 p-6">
        <h3 className="font-semibold text-stone-800 mb-4">GDPR Compliance Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-stone-600">Consent Status</p>
              <p className="text-sm font-semibold text-stone-800">{contact.consent}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-stone-600">Data Processing</p>
              <p className="text-sm font-semibold text-stone-800">Consent</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-stone-600">Data Retention</p>
              <p className="text-sm font-semibold text-stone-800">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Subject Rights */}
      <div className="bg-white rounded-lg border border-stone-200 p-6">
        <h3 className="font-semibold text-stone-800 mb-4">Data Subject Rights</h3>
        <p className="text-sm text-stone-600 mb-6">
          Under GDPR, data subjects have the right to access, rectify, erase, restrict processing, 
          data portability, and object to processing of their personal data.
        </p>

        <div className="space-y-3">
          {/* Right to Access */}
          <div className="flex items-start gap-4 p-4 border border-stone-200 rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-stone-800 mb-1">Right to Access (Export Data)</h4>
              <p className="text-sm text-stone-600 mb-3">
                Export all personal data held for this contact in a machine-readable format.
                Includes contact information, activity history, consent records, and associated documents.
              </p>
              <BonsaiButton size="sm" variant="primary" icon={<Download />} onClick={onExportData}>
                Export Contact Data
              </BonsaiButton>
            </div>
          </div>

          {/* Right to Erasure (Soft Delete) */}
          <div className="flex items-start gap-4 p-4 border border-stone-200 rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-stone-800 mb-1">Right to Erasure (Request Deletion)</h4>
              <p className="text-sm text-stone-600 mb-3">
                Mark this contact for deletion. The contact will be anonymized but records preserved 
                for compliance. This action can be reversed within 30 days.
              </p>
              <BonsaiButton size="sm" variant="ghost" icon={<Trash2 />} onClick={onRequestDeletion}>
                Request Deletion
              </BonsaiButton>
            </div>
          </div>

          {/* Permanent Delete (Admin Only) */}
          <div className="flex items-start gap-4 p-4 border-2 border-red-200 bg-red-50 rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-stone-800">Permanent Delete</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-200 text-red-800">Admin Only</span>
              </div>
              <p className="text-sm text-stone-600 mb-3">
                <strong>⚠️ Warning:</strong> Permanently delete all data for this contact. 
                This action is irreversible and should only be used after legal retention periods have expired.
              </p>
              <BonsaiButton size="sm" variant="destructive" icon={<Trash2 />} onClick={onPermanentDelete}>
                Permanent Delete (Admin)
              </BonsaiButton>
            </div>
          </div>
        </div>
      </div>

      {/* Consent History */}
      <div className="bg-white rounded-lg border border-stone-200 p-6">
        <h3 className="font-semibold text-stone-800 mb-4">Consent History</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-stone-200 rounded-lg">
            <div>
              <p className="text-sm font-medium text-stone-800">Marketing consent given</p>
              <p className="text-xs text-stone-500">Via website form submission</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-stone-600">Jan 1, 2026</p>
              <BonsaiStatusPill status="active" label="Active" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border border-stone-200 rounded-lg">
            <div>
              <p className="text-sm font-medium text-stone-800">Data processing consent</p>
              <p className="text-xs text-stone-500">Accepted privacy policy v2.0</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-stone-600">Jan 1, 2026</p>
              <BonsaiStatusPill status="active" label="Active" />
            </div>
          </div>
        </div>
      </div>

      {/* Data Processing Log */}
      <div className="bg-white rounded-lg border border-stone-200 p-6">
        <h3 className="font-semibold text-stone-800 mb-4">Data Processing Log</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg text-sm">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-stone-400" />
              <span className="text-stone-800">Contact created</span>
            </div>
            <span className="text-stone-600">Jan 1, 2026</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg text-sm">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-stone-400" />
              <span className="text-stone-800">Sent marketing email</span>
            </div>
            <span className="text-stone-600">Jan 5, 2026</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg text-sm">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-stone-400" />
              <span className="text-stone-800">Data accessed for proposal</span>
            </div>
            <span className="text-stone-600">Jan 10, 2026</span>
          </div>
        </div>
      </div>

      {/* Legal Basis Documentation */}
      <div className="bg-white rounded-lg border border-stone-200 p-6">
        <h3 className="font-semibold text-stone-800 mb-4">Legal Basis Documentation</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-stone-600 mb-1">Processing Basis</p>
            <p className="text-sm font-medium text-stone-800">Consent (Article 6(1)(a) GDPR)</p>
          </div>
          <div>
            <p className="text-xs text-stone-600 mb-1">Purpose</p>
            <p className="text-sm text-stone-700">
              Marketing communications, customer relationship management, and service delivery
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-600 mb-1">Data Categories</p>
            <div className="flex gap-2 flex-wrap mt-1">
              <span className="px-2 py-1 text-xs rounded-full bg-stone-100 text-stone-700">Contact Info</span>
              <span className="px-2 py-1 text-xs rounded-full bg-stone-100 text-stone-700">Communication History</span>
              <span className="px-2 py-1 text-xs rounded-full bg-stone-100 text-stone-700">Consent Records</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-stone-600 mb-1">Retention Period</p>
            <p className="text-sm text-stone-700">
              Active: Until consent withdrawn + 3 years for legal compliance
            </p>
          </div>
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="bg-gradient-to-r from-primary/10 to-green-600/10 border border-primary/20 rounded-lg p-6">
        <h3 className="font-semibold text-stone-800 mb-4">GDPR Compliance Checklist</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm text-stone-700">Valid consent obtained and documented</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm text-stone-700">Legal basis for processing documented</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm text-stone-700">Data processing activities logged</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm text-stone-700">Retention policy applied</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-sm text-stone-700">Subject rights mechanism in place</span>
          </div>
        </div>
      </div>
    </div>
  );
}
