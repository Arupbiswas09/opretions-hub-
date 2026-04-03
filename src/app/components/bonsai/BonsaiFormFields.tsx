'use client';
import React from 'react';
import { cn } from '../ui/utils';

interface BonsaiInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function BonsaiInput({ label, error, helperText, className, ...props }: BonsaiInputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[13px] font-medium text-stone-600">{label}</label>
      )}
      <input
        className={cn(
          "w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border rounded-xl text-[13px] text-stone-800 transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-300 focus:bg-white/80",
          "placeholder:text-stone-400",
          error ? "border-red-200 focus:ring-red-100" : "border-stone-200/60",
          className
        )}
        {...props}
      />
      {error && <p className="text-[11px] text-red-500">{error}</p>}
      {helperText && !error && <p className="text-[11px] text-stone-400">{helperText}</p>}
    </div>
  );
}

interface BonsaiTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function BonsaiTextarea({ label, error, helperText, className, ...props }: BonsaiTextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[13px] font-medium text-stone-600">{label}</label>
      )}
      <textarea
        className={cn(
          "w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border rounded-xl text-[13px] text-stone-800 transition-all duration-200 resize-none",
          "focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-300 focus:bg-white/80",
          "placeholder:text-stone-400",
          error ? "border-red-200 focus:ring-red-100" : "border-stone-200/60",
          className
        )}
        rows={4}
        {...props}
      />
      {error && <p className="text-[11px] text-red-500">{error}</p>}
      {helperText && !error && <p className="text-[11px] text-stone-400">{helperText}</p>}
    </div>
  );
}

interface BonsaiSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function BonsaiSelect({ label, error, options, className, ...props }: BonsaiSelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[13px] font-medium text-stone-600">{label}</label>
      )}
      <select
        className={cn(
          "w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border rounded-xl text-[13px] text-stone-800 transition-all duration-200 appearance-none",
          "focus:outline-none focus:ring-2 focus:ring-stone-200 focus:border-stone-300 focus:bg-white/80",
          error ? "border-red-200 focus:ring-red-100" : "border-stone-200/60",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

interface BonsaiCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function BonsaiCheckbox({ label, className, ...props }: BonsaiCheckboxProps) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        className={cn(
          "w-4 h-4 rounded border-stone-300 text-stone-800 transition-colors",
          "focus:ring-2 focus:ring-stone-200 focus:ring-offset-0",
          className
        )}
        {...props}
      />
      <span className="text-[13px] text-stone-600 group-hover:text-stone-800 transition-colors">{label}</span>
    </label>
  );
}
