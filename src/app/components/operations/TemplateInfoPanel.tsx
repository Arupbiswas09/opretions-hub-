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
        type="button"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-40 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:opacity-95 transition-[opacity]"
        title="Show template info"
      >
        <Info className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-72 hub-modal-solid rounded-lg shadow-xl">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Template info</h3>
            <p className="text-xs text-muted-foreground">{templateName}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">Active features</p>
        <div className="space-y-1.5">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-xs text-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
