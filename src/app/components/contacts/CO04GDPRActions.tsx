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
      <div className="hub-surface rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4">GDPR compliance status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-muted/40 border border-border rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Consent status</p>
              <p className="text-sm font-semibold text-foreground">{contact.consent}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-muted/40 border border-border rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Processing basis</p>
              <p className="text-sm font-semibold text-foreground">Consent</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-muted/40 border border-border rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Retention</p>
              <p className="text-sm font-semibold text-foreground">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Subject Rights */}
      <div className="hub-surface rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-2">Data subject rights</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Under GDPR, data subjects have the right to access, rectify, erase, restrict processing, 
          data portability, and object to processing of their personal data.
        </p>

        <div className="space-y-3">
          {/* Right to Access */}
          <div className="flex items-start gap-4 p-4 border border-border rounded-lg bg-muted/25">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">Right to access (export)</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Export all personal data held for this contact in a machine-readable format.
                Includes contact information, activity history, consent records, and associated documents.
              </p>
              <BonsaiButton size="sm" variant="primary" icon={<Download />} onClick={onExportData}>
                Export Contact Data
              </BonsaiButton>
            </div>
          </div>

          {/* Right to Erasure (Soft Delete) */}
          <div className="flex items-start gap-4 p-4 border border-border rounded-lg bg-muted/25">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">Right to erasure (request deletion)</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Mark this contact for deletion. The contact will be anonymized but records preserved 
                for compliance. This action can be reversed within 30 days.
              </p>
              <BonsaiButton size="sm" variant="ghost" icon={<Trash2 />} onClick={onRequestDeletion}>
                Request Deletion
              </BonsaiButton>
            </div>
          </div>

          {/* Permanent Delete (Admin Only) */}
          <div className="flex items-start gap-4 p-4 border border-destructive/25 bg-destructive/10 rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0 border border-destructive/20">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-foreground">Permanent delete</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/25">Admin only</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                <strong className="text-destructive">Warning:</strong> Permanently delete all data for this contact. 
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
      <div className="hub-surface rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4">Consent history</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/25">
            <div>
              <p className="text-sm font-medium text-foreground">Marketing consent given</p>
              <p className="text-xs text-muted-foreground">Via website form submission</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Jan 1, 2026</p>
              <BonsaiStatusPill status="active" label="Active" />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/25">
            <div>
              <p className="text-sm font-medium text-foreground">Data processing consent</p>
              <p className="text-xs text-muted-foreground">Accepted privacy policy v2.0</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Jan 1, 2026</p>
              <BonsaiStatusPill status="active" label="Active" />
            </div>
          </div>
        </div>
      </div>

      {/* Data Processing Log */}
      <div className="hub-surface rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4">Data processing log</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-muted/25 border border-border rounded-lg text-sm">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">Contact created</span>
            </div>
            <span className="text-muted-foreground">Jan 1, 2026</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/25 border border-border rounded-lg text-sm">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">Sent marketing email</span>
            </div>
            <span className="text-muted-foreground">Jan 5, 2026</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/25 border border-border rounded-lg text-sm">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">Data accessed for proposal</span>
            </div>
            <span className="text-muted-foreground">Jan 10, 2026</span>
          </div>
        </div>
      </div>

      {/* Legal Basis Documentation */}
      <div className="hub-surface rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4">Legal basis</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Processing basis</p>
            <p className="text-sm font-medium text-foreground">Consent (Article 6(1)(a) GDPR)</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Purpose</p>
            <p className="text-sm text-muted-foreground">
              Marketing communications, customer relationship management, and service delivery
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Data categories</p>
            <div className="flex gap-2 flex-wrap mt-1">
              <span className="px-2 py-1 text-xs rounded-full bg-muted/60 text-foreground border border-border">Contact info</span>
              <span className="px-2 py-1 text-xs rounded-full bg-muted/60 text-foreground border border-border">Communication history</span>
              <span className="px-2 py-1 text-xs rounded-full bg-muted/60 text-foreground border border-border">Consent records</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Retention</p>
            <p className="text-sm text-muted-foreground">
              Active: Until consent withdrawn + 3 years for legal compliance
            </p>
          </div>
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="bg-gradient-to-r from-primary/10 to-green-600/10 border border-primary/20 rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4">Compliance checklist</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Valid consent obtained and documented</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Legal basis for processing documented</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Data processing activities logged</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Retention policy applied</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Subject rights mechanism in place</span>
          </div>
        </div>
      </div>
    </div>
  );
}
