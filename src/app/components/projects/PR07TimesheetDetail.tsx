import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Send } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';
import { dashboardFoldRootRelaxedClass, DashboardScrollPanel } from '../dashboard/DashboardFoldLayout';

interface TimesheetEntry {
  id: string;
  project: string;
  task: string;
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
}

interface PR07TimesheetDetailProps {
  timesheet: any;
  onBack: () => void;
  onSubmit: () => void;
}

export function PR07TimesheetDetail({ timesheet, onBack, onSubmit }: PR07TimesheetDetailProps) {
  const [entries, setEntries] = useState<TimesheetEntry[]>([
    {
      id: '1',
      project: 'Website Redesign',
      task: 'Homepage Design',
      mon: 8,
      tue: 6,
      wed: 8,
      thu: 7,
      fri: 5,
      sat: 0,
      sun: 0,
    },
    {
      id: '2',
      project: 'Website Redesign',
      task: 'Client Feedback Meeting',
      mon: 0,
      tue: 2,
      wed: 0,
      thu: 1,
      fri: 0,
      sat: 0,
      sun: 0,
    },
    {
      id: '3',
      project: 'Mobile App Development',
      task: 'UI Component Library',
      mon: 0,
      tue: 0,
      wed: 0,
      thu: 0,
      fri: 3,
      sat: 0,
      sun: 0,
    },
  ]);

  const [notes, setNotes] = useState('');

  const calculateDayTotal = (day: keyof Omit<TimesheetEntry, 'id' | 'project' | 'task'>) => {
    return entries.reduce((sum, entry) => sum + entry[day], 0);
  };

  const calculateEntryTotal = (entry: TimesheetEntry) => {
    return entry.mon + entry.tue + entry.wed + entry.thu + entry.fri + entry.sat + entry.sun;
  };

  const calculateWeekTotal = () => {
    return entries.reduce((sum, entry) => sum + calculateEntryTotal(entry), 0);
  };

  const updateEntry = (id: string, field: string, value: number) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const addEntry = () => {
    setEntries([...entries, {
      id: Date.now().toString(),
      project: '',
      task: '',
      mon: 0,
      tue: 0,
      wed: 0,
      thu: 0,
      fri: 0,
      sat: 0,
      sun: 0,
    }]);
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const getStatusColor = (status: string): 'active' | 'pending' | 'inactive' | 'archived' => {
    switch (status) {
      case 'Draft': return 'archived';
      case 'Submitted': return 'pending';
      case 'Approved': return 'active';
      case 'Rejected': return 'inactive';
      case 'Pending Client Approval': return 'pending';
      case 'Client Approved': return 'active';
      case 'Client Rejected': return 'inactive';
      default: return 'archived';
    }
  };

  const inputClass =
    'w-full rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20';

  return (
    <div className={dashboardFoldRootRelaxedClass}>
      <button
        type="button"
        onClick={onBack}
        className="mb-2 flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Week of {timesheet.weekOf}
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{timesheet.employee}</p>
        </div>
        <BonsaiStatusPill status={getStatusColor(timesheet.status)} label={timesheet.status} />
      </div>

      <DashboardScrollPanel size="lg" className="-mr-0.5 min-h-[200px]">
        <div className="hub-surface hub-surface-elevated mb-4 overflow-hidden rounded-2xl sm:mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/35">
                  <th className="w-64 px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Project</th>
                  <th className="w-64 px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Task</th>
                  <th className="w-20 px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Mon<br />01/13</th>
                  <th className="w-20 px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Tue<br />01/14</th>
                  <th className="w-20 px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Wed<br />01/15</th>
                  <th className="w-20 px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Thu<br />01/16</th>
                  <th className="w-20 px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Fri<br />01/17</th>
                  <th className="w-20 px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Sat<br />01/18</th>
                  <th className="w-20 px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Sun<br />01/19</th>
                  <th className="w-20 bg-muted/50 px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Total</th>
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((entry) => (
                  <tr key={entry.id} className="transition-colors hover:bg-[var(--row-hover-bg)]">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={entry.project}
                        onChange={(e) => updateEntry(entry.id, 'project', e.target.value as any)}
                        placeholder="Project"
                        className={inputClass}
                        disabled={timesheet.status !== 'Draft'}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={entry.task}
                        onChange={(e) => updateEntry(entry.id, 'task', e.target.value as any)}
                        placeholder="Task"
                        className={inputClass}
                        disabled={timesheet.status !== 'Draft'}
                      />
                    </td>
                    {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map((day) => (
                      <td key={day} className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={entry[day]}
                          onChange={(e) => updateEntry(entry.id, day, parseFloat(e.target.value) || 0)}
                          className={`${inputClass} text-center tabular-nums`}
                          disabled={timesheet.status !== 'Draft'}
                        />
                      </td>
                    ))}
                    <td className="bg-muted/30 px-4 py-3">
                      <div className="text-center text-sm font-semibold tabular-nums text-foreground">
                        {calculateEntryTotal(entry)}h
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {timesheet.status === 'Draft' && (
                        <button
                          type="button"
                          onClick={() => removeEntry(entry.id)}
                          className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                <tr className="bg-muted/40 font-semibold">
                  <td colSpan={2} className="px-4 py-3 text-sm text-foreground">
                    Daily totals
                  </td>
                  {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map((day) => (
                    <td key={day} className="px-4 py-3 text-center text-sm tabular-nums text-foreground">
                      {calculateDayTotal(day)}h
                    </td>
                  ))}
                  <td className="bg-primary/10 px-4 py-3">
                    <div className="text-center text-sm font-bold tabular-nums text-primary">{calculateWeekTotal()}h</div>
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          {timesheet.status === 'Draft' && (
            <div className="border-t border-border p-4">
              <BonsaiButton size="sm" variant="ghost" icon={<Plus className="h-4 w-4" />} onClick={addEntry}>
                Add row
              </BonsaiButton>
            </div>
          )}
        </div>
      </DashboardScrollPanel>

      <div className="hub-surface hub-surface-elevated mb-6 rounded-2xl p-5 sm:p-6">
        <label className="mb-2 block text-sm font-medium text-foreground">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Optional"
          disabled={timesheet.status !== 'Draft'}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {timesheet.status === 'Rejected' && (
            <p className="text-[13px] text-muted-foreground">
              <span className="font-medium text-foreground">Returned:</span> Add more task detail.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {timesheet.status === 'Draft' && (
            <>
              <BonsaiButton variant="ghost" icon={<Save />}>
                Save Draft
              </BonsaiButton>
              <BonsaiButton variant="primary" icon={<Send />} onClick={onSubmit}>
                Submit for Approval
              </BonsaiButton>
            </>
          )}
          {timesheet.status === 'Rejected' && (
            <BonsaiButton variant="primary" icon={<Send />} onClick={onSubmit}>
              Resubmit Timesheet
            </BonsaiButton>
          )}
        </div>
      </div>
    </div>
  );
}
