import React, { useState } from 'react';
import { X, Download, FileJson, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';

interface CO07ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: string, options: any) => void;
  contactName: string;
}

export function CO07ExportModal({ isOpen, onClose, onExport, contactName }: CO07ExportModalProps) {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [includeOptions, setIncludeOptions] = useState({
    contactInfo: true,
    activityHistory: true,
    documents: true,
    consentRecords: true,
    gdprData: true,
    relatedRecords: false,
  });

  const handleExport = () => {
    onExport(format, includeOptions);
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
              <h2 className="text-xl font-semibold text-foreground">Export contact data</h2>
              <p className="text-sm text-muted-foreground">{contactName}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* GDPR Notice */}
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    GDPR Data Export Request
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This export fulfills the data subject's right to data portability under Article 20 GDPR. 
                    The exported data will be in a structured, commonly used, and machine-readable format.
                  </p>
                </div>
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormat('json')}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    format === 'json'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <FileJson className="w-6 h-6 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">JSON</p>
                    <p className="text-xs text-muted-foreground">Machine-readable</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('csv')}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    format === 'csv'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <FileSpreadsheet className="w-6 h-6 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">CSV</p>
                    <p className="text-xs text-muted-foreground">Spreadsheet format</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Include Options */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Data to Include
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-muted transition-colors">
                  <input
                    type="checkbox"
                    checked={includeOptions.contactInfo}
                    onChange={(e) => setIncludeOptions({ ...includeOptions, contactInfo: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">Contact information</span>
                    <p className="text-xs text-muted-foreground">Name, email, phone, address</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-muted transition-colors">
                  <input
                    type="checkbox"
                    checked={includeOptions.activityHistory}
                    onChange={(e) => setIncludeOptions({ ...includeOptions, activityHistory: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">Activity history</span>
                    <p className="text-xs text-muted-foreground">Notes, emails, calls, meetings</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-muted transition-colors">
                  <input
                    type="checkbox"
                    checked={includeOptions.documents}
                    onChange={(e) => setIncludeOptions({ ...includeOptions, documents: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">Documents</span>
                    <p className="text-xs text-muted-foreground">Uploaded files and attachments</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-muted transition-colors">
                  <input
                    type="checkbox"
                    checked={includeOptions.consentRecords}
                    onChange={(e) => setIncludeOptions({ ...includeOptions, consentRecords: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">Consent records</span>
                    <p className="text-xs text-muted-foreground">Consent history and preferences</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-muted transition-colors">
                  <input
                    type="checkbox"
                    checked={includeOptions.gdprData}
                    onChange={(e) => setIncludeOptions({ ...includeOptions, gdprData: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">GDPR metadata</span>
                    <p className="text-xs text-muted-foreground">Processing basis, retention info</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-muted transition-colors">
                  <input
                    type="checkbox"
                    checked={includeOptions.relatedRecords}
                    onChange={(e) => setIncludeOptions({ ...includeOptions, relatedRecords: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/30"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">Related records</span>
                    <p className="text-xs text-muted-foreground">Deals, projects, invoices</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-muted/25 border border-border rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Export summary</p>
                  <p className="text-xs text-muted-foreground">
                    Format: <strong>{format.toUpperCase()}</strong> • 
                    Sections: <strong>{Object.values(includeOptions).filter(Boolean).length}</strong> • 
                    Compliance: <strong>GDPR Article 20</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
            <BonsaiButton variant="ghost" onClick={onClose} type="button">
              Cancel
            </BonsaiButton>
            <BonsaiButton variant="primary" icon={<Download />} onClick={handleExport} type="button">
              Export Data
            </BonsaiButton>
          </div>
        </div>
      </div>
    </>
  );
}
