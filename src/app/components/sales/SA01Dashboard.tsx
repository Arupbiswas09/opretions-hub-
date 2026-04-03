import React from 'react';
import { TrendingUp, DollarSign, Target, Clock, ArrowUpRight, Plus } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';

interface SA01DashboardProps {
  onNavigateToDeals: () => void;
  onNavigateToPipeline: () => void;
  onCreateDeal: () => void;
}

export function SA01Dashboard({ onNavigateToDeals, onNavigateToPipeline, onCreateDeal }: SA01DashboardProps) {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Sales Dashboard</h1>
          <p className="text-sm text-stone-500">Track your deals and performance</p>
        </div>
        <BonsaiButton variant="primary" icon={<Plus />} onClick={onCreateDeal}>
          Create Deal
        </BonsaiButton>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-600">Total Pipeline</p>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-stone-800">$485,000</p>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> 12% from last month
          </p>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-600">Active Deals</p>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-stone-800">23</p>
          <p className="text-xs text-stone-500 mt-1">18 Project, 5 Talent</p>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-600">Win Rate</p>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-stone-800">68%</p>
          <p className="text-xs text-green-600 mt-1">Above target</p>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-stone-600">Avg Close Time</p>
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-stone-800">42 days</p>
          <p className="text-xs text-stone-500 mt-1">Target: 45 days</p>
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Project Pipeline */}
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-800">Project Pipeline</h3>
            <button 
              onClick={onNavigateToPipeline}
              className="text-sm text-primary hover:underline"
            >
              View Pipeline →
            </button>
          </div>
          <div className="space-y-3">
            {[
              { stage: 'New Lead', count: 5, value: '$125K' },
              { stage: 'Qualified', count: 3, value: '$85K' },
              { stage: 'Discovery Scheduled', count: 4, value: '$110K' },
              { stage: 'Proposal Sent', count: 3, value: '$95K' },
              { stage: 'Negotiation', count: 3, value: '$75K' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-stone-800">{item.stage}</p>
                  <p className="text-xs text-stone-500">{item.count} deals</p>
                </div>
                <p className="text-sm font-semibold text-stone-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Talent Pipeline */}
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-800">Talent Pipeline</h3>
            <button 
              onClick={onNavigateToPipeline}
              className="text-sm text-primary hover:underline"
            >
              View Pipeline →
            </button>
          </div>
          <div className="space-y-3">
            {[
              { stage: 'New Request', count: 2, value: '$45K' },
              { stage: 'Qualified', count: 1, value: '$25K' },
              { stage: 'Profiles Shared', count: 1, value: '$30K' },
              { stage: 'Interviewing', count: 0, value: '$0' },
              { stage: 'Placement', count: 1, value: '$28K' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-stone-800">{item.stage}</p>
                  <p className="text-xs text-stone-500">{item.count} deals</p>
                </div>
                <p className="text-sm font-semibold text-stone-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-800">Recent Deals</h3>
          <button 
            onClick={onNavigateToDeals}
            className="text-sm text-primary hover:underline"
          >
            View All →
          </button>
        </div>
        <div className="space-y-2">
          {[
            { name: 'Website Redesign Project', client: 'Acme Corp', value: '$45,000', stage: 'Proposal Sent' },
            { name: 'Senior Designer Placement', client: 'Tech Startup', value: '$28,000', stage: 'Interviewing' },
            { name: 'Brand Identity Package', client: 'Local Retail', value: '$15,000', stage: 'Discovery Scheduled' },
            { name: 'React Developer Search', client: 'SaaS Company', value: '$35,000', stage: 'Profiles Shared' },
          ].map((deal, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 hover:bg-stone-50 rounded-lg cursor-pointer">
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-800">{deal.name}</p>
                <p className="text-xs text-stone-500">{deal.client}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-stone-800">{deal.value}</p>
                <BonsaiStatusPill status="pending" label={deal.stage} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
