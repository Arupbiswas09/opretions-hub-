import React from 'react';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';

export function TA03JobsPipeline() {
  const stages = [
    { name: 'New', jobs: [{ id: '1', title: 'Backend Engineer', client: 'Tech Co' }] },
    { name: 'Qualified', jobs: [] },
    { name: 'Sourcing', jobs: [
      { id: '2', title: 'Senior React Developer', client: 'Tech Startup Inc' },
      { id: '3', title: 'DevOps Engineer', client: 'Cloud Corp' },
    ]},
    { name: 'Profiles Shared', jobs: [{ id: '4', title: 'Data Scientist', client: 'AI Labs' }] },
    { name: 'Interviewing', jobs: [{ id: '5', title: 'UX Designer', client: 'Acme Corporation' }] },
    { name: 'Offer/Placement', jobs: [{ id: '6', title: 'Product Manager', client: 'Local Retail Co' }] },
    { name: 'Won', jobs: [] },
    { name: 'Lost', jobs: [] },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-800">Jobs Pipeline</h1>
        <p className="text-sm text-stone-500">Kanban view by job stage</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage.name} className="flex-shrink-0 w-80">
            <div className="bg-stone-100 rounded-t-lg px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-stone-800">{stage.name}</h3>
              <span className="text-xs font-medium text-stone-600 bg-stone-200 px-2 py-1 rounded-full">
                {stage.jobs.length}
              </span>
            </div>
            <div className="bg-stone-50 rounded-b-lg p-4 min-h-[400px] space-y-3">
              {stage.jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-lg border border-stone-200 p-4 cursor-move hover:shadow-md transition-shadow"
                >
                  <h4 className="font-medium text-stone-800 mb-2">{job.title}</h4>
                  <p className="text-sm text-stone-600 mb-3">{job.client}</p>
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>8 candidates</span>
                    <span>2 days in stage</span>
                  </div>
                </div>
              ))}
              {stage.jobs.length === 0 && (
                <p className="text-center text-sm text-stone-400 py-8">No jobs</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-stone-100 border border-stone-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Drag & Drop:</strong> Drag jobs between stages to update pipeline. Changes create activity entries.
        </p>
      </div>
    </div>
  );
}
