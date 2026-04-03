import React, { useState } from 'react';
import { Info, X, CheckCircle2 } from 'lucide-react';

interface TemplateInfoPanelProps {
  templateName: string;
  features: string[];
}

export function TemplateInfoPanel({ templateName, features }: TemplateInfoPanelProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-40 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        title="Show template info"
      >
        <Info className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-72 bg-white rounded-lg border border-stone-200 shadow-xl">
      <div className="p-4 border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Info className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-800 text-sm">Template Info</h3>
            <p className="text-xs text-stone-500">{templateName}</p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4">
        <p className="text-xs font-medium text-stone-600 mb-2">Active Features:</p>
        <div className="space-y-1.5">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-xs text-stone-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
