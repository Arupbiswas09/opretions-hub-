'use client';
import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number | React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  sublabel?: string;
  icon?: React.ReactNode;
  variant?: 'glass' | 'solid' | 'elevated';
  className?: string;
}

export function StatCard({
  label,
  value,
  trend,
  trendUp,
  sublabel,
  icon,
  variant = 'glass',
  className = ''
}: StatCardProps) {
  const baseStyles = {
    glass: {
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
      border: '1px solid var(--border)',
    },
    solid: {
      background: 'var(--background-2)',
      border: '1px solid var(--border)',
    },
    elevated: {
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
    },
  };

  return (
    <motion.div
      className={`flex flex-col gap-1 px-4 py-5 sm:px-6 sm:py-6 rounded-xl ${className}`}
      style={baseStyles[variant]}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon && <div className="flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>{icon}</div>}
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] leading-none"
          style={{ color: 'var(--muted-foreground)' }}>
          {label}
        </p>
      </div>
      <p className="text-[32px] font-bold tracking-[-0.03em] leading-none mt-1.5 mb-2"
        style={{ color: 'var(--foreground)' }}>
        {value}
      </p>
      {(trend || sublabel) && (
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <>
              {trendUp !== undefined && (
                trendUp
                  ? <TrendingUp className="w-3 h-3 flex-shrink-0 text-emerald-500 dark:text-emerald-400" />
                  : <TrendingDown className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
              )}
              <span className={`text-[11px] font-medium ${trendUp ? 'text-foreground' : 'text-muted-foreground'}`}>
                {trend}
              </span>
            </>
          )}
          {sublabel && (
            <span className="text-[11px] text-muted-foreground">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}