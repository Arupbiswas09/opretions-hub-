import React from 'react';
import { Briefcase, Users, Calendar, TrendingUp, CheckCircle, Clock } from 'lucide-react';

interface TA01DashboardProps {
  onNavigateToJobs: () => void;
  onNavigateToCandidates: () => void;
}

export function TA01Dashboard({ onNavigateToJobs, onNavigateToCandidates }: TA01DashboardProps) {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-800">Talent Dashboard</h1>
        <p className="text-sm text-stone-500">Talent-on-Demand staffing overview</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-600">Active Jobs</p>
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-semibold text-stone-800">12</p>
          <p className="text-xs text-stone-600 mt-1">+3 this month</p>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-600">Talent Pool</p>
            <Users className="w-5 h-5 text-stone-600" />
          </div>
          <p className="text-3xl font-semibold text-stone-600">284</p>
          <p className="text-xs text-stone-600 mt-1">58 active candidates</p>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-600">Interviews</p>
            <Calendar className="w-5 h-5 text-stone-600" />
          </div>
          <p className="text-3xl font-semibold text-stone-600">8</p>
          <p className="text-xs text-stone-600 mt-1">This week</p>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-600">Placements</p>
            <CheckCircle className="w-5 h-5 text-stone-600" />
          </div>
          <p className="text-3xl font-semibold text-stone-600">5</p>
          <p className="text-xs text-stone-600 mt-1">This month</p>
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className="bg-white rounded-lg border border-stone-200 p-6 mb-6">
        <h3 className="font-semibold text-stone-800 mb-4">Jobs Pipeline</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[
            { stage: 'Sourcing', count: 4, color: 'bg-stone-100 text-stone-600' },
            { stage: 'Profiles Shared', count: 3, color: 'bg-stone-100 text-stone-600' },
            { stage: 'Interviewing', count: 3, color: 'bg-stone-100 text-stone-600' },
            { stage: 'Offer', count: 2, color: 'bg-stone-100 text-stone-700' },
          ].map((item) => (
            <div key={item.stage} className="flex-1 min-w-[120px] p-4 bg-stone-50 rounded-lg border border-stone-200">
              <p className="text-xs text-stone-600 mb-1">{item.stage}</p>
              <p className={`text-2xl font-semibold ${item.color.split(' ')[1]}`}>{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={onNavigateToJobs}
          className="bg-white rounded-lg border border-stone-200 p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <Briefcase className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-stone-800 mb-2">Manage Jobs</h3>
          <p className="text-sm text-stone-600">View open positions and pipeline</p>
        </button>

        <button
          onClick={onNavigateToCandidates}
          className="bg-white rounded-lg border border-stone-200 p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-stone-600" />
          </div>
          <h3 className="font-semibold text-stone-800 mb-2">Talent Pool</h3>
          <p className="text-sm text-stone-600">Browse and manage candidates</p>
        </button>
      </div>
    </div>
  );
}
