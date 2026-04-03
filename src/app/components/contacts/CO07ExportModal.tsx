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
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-lg shadow-2xl w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-stone-800">Export Contact Data</h2>
              <p className="text-sm text-stone-500">{contactName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* GDPR Notice */}
            <div className="p-4 bg-stone-100 border border-stone-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-stone-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-stone-800 mb-1">
                    GDPR Data Export Request
                  </p>
                  <p className="text-xs text-stone-600">
                    This export fulfills the data subject's right to data portability under Article 20 GDPR. 
                    The exported data will be in a structured, commonly used, and machine-readable format.
                  </p>
                </div>
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormat('json')}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    format === 'json'
                      ? 'border-primary bg-primary/5'
                      : 'border-stone-200 hover:border-primary/50'
                  }`}
                >
                  <FileJson className="w-6 h-6 text-stone-600" />
                  <div className="text-left">
                    <p className="font-medium text-stone-800">JSON</p>
                    <p className="text-xs text-stone-500">Machine-readable</p>
                  </div>
                </button>

                <button
                  onClick={() => setFormat('csv')}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    format === 'csv'
                      ? 'border-primary bg-primary/5'
                      : 'border-stone-200 hover:border-primary/50'
                  }`}
                >
                  <FileSpreadsheet className="w-6 h-6 text-stone-600" />
                  <div className="text-left">
                    <p className="font-medium text-stone-800">CSV</p>
                    <p className="text-xs text-stone-500">Spreadsheet format</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Include Options */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                Data to Include
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-stone-50">
                  <input
                    type="checkbox"
                    checked={includeOptions.contactInfo}
                    onChange={(e) => setIncludeOptions({ ...includeOptions, contactInfo: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-stone-700">Contact Information</span>
                    <p className="text-xs text-stone-500">Name, email, phone, address</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-stone-50">
                  <input
                    type="checkbox"
                    checked={includeOptions.activityHistory}
                    onChange={(e) => setIncludeOptions({ ...includeOptions, activityHistory: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-stone-700">Activity History</span>
                    <p className="text-xs text-stone-500">Notes, emails, calls, meetings</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-stone-50">
                  <input
                    type="checkbox"
                    checked={includeOptions.documents}
                    onChange={(e) => setIncludeOptions({ ...includeOptions, documents: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-stone-700">Documents</span>
                    <p className="text-xs text-stone-500">Uploaded files and attachments</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-stone-50">
                  <input
                    type="checkbox"
                    checked={includeOptions.consentRecords}
                    onChange={(e) => setIncludeOptions({ ...includeOptions, consentRecords: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-stone-700">Consent Records</span>
                    <p className="text-xs text-stone-500">Consent history and preferences</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-stone-50">
                  <input
                    type="checkbox"
                    checked={includeOptions.gdprData}
                    onChange={(e) => setIncludeOptions({ ...includeOptions, gdprData: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-stone-700">GDPR Metadata</span>
                    <p className="text-xs text-stone-500">Processing basis, retention info</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg hover:bg-stone-50">
                  <input
                    type="checkbox"
                    checked={includeOptions.relatedRecords}
                    onChange={(e) => setIncludeOptions({ ...includeOptions, relatedRecords: e.target.checked })}
                    className="w-4 h-4 rounded border-stone-300 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-stone-700">Related Records</span>
                    <p className="text-xs text-stone-500">Deals, projects, invoices</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-stone-50 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-stone-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-stone-800 mb-1">Export Summary</p>
                  <p className="text-xs text-stone-600">
                    Format: <strong>{format.toUpperCase()}</strong> • 
                    Sections: <strong>{Object.values(includeOptions).filter(Boolean).length}</strong> • 
                    Compliance: <strong>GDPR Article 20</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <BonsaiButton variant="ghost" onClick={onClose}>
              Cancel
            </BonsaiButton>
            <BonsaiButton variant="primary" icon={<Download />} onClick={handleExport}>
              Export Data
            </BonsaiButton>
          </div>
        </div>
      </div>
    </>
  );
}
