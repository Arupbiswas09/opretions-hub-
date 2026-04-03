import React, { useState } from 'react';
import { Sparkles, X, Send, ChevronRight, Lightbulb, BarChart3, Mail } from 'lucide-react';
import { cn } from '../ui/utils';

interface AIAssistantPanelProps {
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function AIAssistantPanel({ collapsed = false, onToggle, className }: AIAssistantPanelProps) {
  const [message, setMessage] = useState('');

  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 top-24 z-10 p-3 bg-primary text-white rounded-lg shadow-lg hover:bg-primary/90 transition-all"
        title="Open AI Assistant"
      >
        <Sparkles className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className={cn("w-80 bg-white border-l border-stone-200 flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-800 text-sm">AI Assistant</h3>
            <p className="text-xs text-stone-500">Always here to help</p>
          </div>
        </div>
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Suggestions */}
      <div className="p-4 border-b border-stone-200">
        <p className="text-xs font-medium text-stone-600 mb-2">Quick Actions</p>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm bg-stone-50 hover:bg-stone-100 rounded-lg text-stone-700 transition-colors flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-stone-600 flex-shrink-0" /> Summarize this record
          </button>
          <button className="w-full text-left px-3 py-2 text-sm bg-stone-50 hover:bg-stone-100 rounded-lg text-stone-700 transition-colors flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-stone-600 flex-shrink-0" /> Generate insights
          </button>
          <button className="w-full text-left px-3 py-2 text-sm bg-stone-50 hover:bg-stone-100 rounded-lg text-stone-700 transition-colors flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-stone-600 flex-shrink-0" /> Draft follow-up email
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="flex gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-stone-700 bg-stone-50 rounded-lg p-3">
              Hi! I'm your AI assistant. I can help you with tasks, provide insights, and answer questions about this record.
            </p>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-stone-200">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask me anything..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
