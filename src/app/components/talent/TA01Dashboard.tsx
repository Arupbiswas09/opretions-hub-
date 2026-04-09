import React from 'react';
import { Briefcase, Users, Calendar, CheckCircle } from 'lucide-react';
import { HubStatTile } from '../ops/HubStatTile';
import { dashboardFoldRootClass } from '../dashboard/DashboardFoldLayout';

interface TA01DashboardProps {
  onNavigateToJobs: () => void;
  onNavigateToCandidates: () => void;
}

export function TA01Dashboard({ onNavigateToJobs, onNavigateToCandidates }: TA01DashboardProps) {
  return (
    <div className={dashboardFoldRootClass}>
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Talent Dashboard</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">Talent-on-Demand staffing overview</p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-4">
        <HubStatTile label="Active jobs" value="12" sub="+3 this month" delay={0} />
        <HubStatTile label="Talent pool" value="284" sub="58 active candidates" delay={0.05} />
        <HubStatTile label="Interviews" value="8" sub="This week" delay={0.1} />
        <HubStatTile label="Placements" value="5" sub="This month" delay={0.15} />
      </div>

      <div className="hub-surface hub-surface-elevated p-4 sm:p-6">
        <h3 className="font-semibold text-foreground mb-4">Jobs pipeline</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[
            { stage: 'Sourcing', count: 4 },
            { stage: 'Profiles shared', count: 3 },
            { stage: 'Interviewing', count: 3 },
            { stage: 'Offer', count: 2 },
          ].map((item) => (
            <div
              key={item.stage}
              className="min-w-[100px] flex-1 rounded-xl border border-border bg-muted/40 p-3 sm:min-w-[120px] sm:p-4"
            >
              <p className="text-xs text-muted-foreground mb-1">{item.stage}</p>
              <p className="text-xl font-semibold tabular-nums text-foreground sm:text-2xl">{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={onNavigateToJobs}
          className="hub-surface hub-surface-elevated rounded-xl p-4 text-left transition-colors hover:bg-[color:var(--row-hover-bg)] sm:p-6"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Briefcase className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Manage jobs</h3>
          <p className="text-sm text-muted-foreground">View open positions and pipeline</p>
        </button>

        <button
          type="button"
          onClick={onNavigateToCandidates}
          className="hub-surface hub-surface-elevated rounded-xl p-4 text-left transition-colors hover:bg-[color:var(--row-hover-bg)] sm:p-6"
        >
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 border border-border">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Talent pool</h3>
          <p className="text-sm text-muted-foreground">Browse and manage candidates</p>
        </button>
      </div>
    </div>
  );
}
