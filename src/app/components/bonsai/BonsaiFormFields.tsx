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
        <label className="block text-[13px] font-medium text-foreground">{label}</label>
      )}
      <input
        className={cn(
          'hub-field px-3.5 py-2.5 text-[13px] transition-all duration-200 rounded-xl',
          error && '!border-destructive focus:!shadow-[0_0_0_3px_rgba(220,38,38,0.2)]',
          className
        )}
        {...props}
      />
      {error && <p className="text-[11px] text-destructive">{error}</p>}
      {helperText && !error && <p className="text-[11px] text-muted-foreground">{helperText}</p>}
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
        <label className="block text-[13px] font-medium text-foreground">{label}</label>
      )}
      <textarea
        className={cn(
          'hub-field resize-none px-3.5 py-2.5 text-[13px] transition-all duration-200 rounded-xl',
          error && '!border-destructive focus:!shadow-[0_0_0_3px_rgba(220,38,38,0.2)]',
          className
        )}
        rows={4}
        {...props}
      />
      {error && <p className="text-[11px] text-destructive">{error}</p>}
      {helperText && !error && <p className="text-[11px] text-muted-foreground">{helperText}</p>}
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
        <label className="block text-[13px] font-medium text-foreground">{label}</label>
      )}
      <select
        className={cn(
          'hub-field appearance-none px-3.5 py-2.5 text-[13px] transition-all duration-200 rounded-xl',
          error && '!border-destructive focus:!shadow-[0_0_0_3px_rgba(220,38,38,0.2)]',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

interface BonsaiCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function BonsaiCheckbox({ label, className, ...props }: BonsaiCheckboxProps) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5">
      <input
        type="checkbox"
        className={cn(
          'h-4 w-4 rounded border-border text-primary transition-colors',
          'focus:ring-2 focus:ring-ring/30 focus:ring-offset-0',
          className
        )}
        {...props}
      />
      <span className="text-[13px] text-muted-foreground transition-colors group-hover:text-foreground">{label}</span>
    </label>
  );
}
