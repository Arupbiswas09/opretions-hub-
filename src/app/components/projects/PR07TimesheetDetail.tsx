import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Send } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiStatusPill } from '../bonsai/BonsaiStatusPill';

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

  return (
    <div className="p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to My Timesheets
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Timesheet - Week of {timesheet.weekOf}</h1>
          <p className="text-sm text-stone-500">{timesheet.employee}</p>
        </div>
        <BonsaiStatusPill status={getStatusColor(timesheet.status)} label={timesheet.status} />
      </div>

      {/* Weekly Grid */}
      <div className="bg-white rounded-lg border border-stone-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-700 w-64">Project</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-700 w-64">Task</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-700 w-20">Mon<br/>01/13</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-700 w-20">Tue<br/>01/14</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-700 w-20">Wed<br/>01/15</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-700 w-20">Thu<br/>01/16</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-700 w-20">Fri<br/>01/17</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-700 w-20">Sat<br/>01/18</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-700 w-20">Sun<br/>01/19</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-700 w-20 bg-stone-100">Total</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={entry.project}
                      onChange={(e) => updateEntry(entry.id, 'project', e.target.value as any)}
                      placeholder="Select project"
                      className="w-full px-2 py-1 text-sm border border-stone-200 rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                      disabled={timesheet.status !== 'Draft'}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={entry.task}
                      onChange={(e) => updateEntry(entry.id, 'task', e.target.value as any)}
                      placeholder="Task description"
                      className="w-full px-2 py-1 text-sm border border-stone-200 rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                        className="w-full px-2 py-1 text-sm text-center border border-stone-200 rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                        disabled={timesheet.status !== 'Draft'}
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3 bg-stone-50">
                    <div className="text-sm font-semibold text-center text-stone-800">
                      {calculateEntryTotal(entry)}h
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {timesheet.status === 'Draft' && (
                      <button
                        onClick={() => removeEntry(entry.id)}
                        className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {/* Daily Totals Row */}
              <tr className="bg-stone-100 font-semibold">
                <td colSpan={2} className="px-4 py-3 text-sm text-stone-800">Daily Totals</td>
                {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map((day) => (
                  <td key={day} className="px-4 py-3 text-sm text-center text-stone-800">
                    {calculateDayTotal(day)}h
                  </td>
                ))}
                <td className="px-4 py-3 bg-primary/10">
                  <div className="text-sm font-bold text-center text-primary">
                    {calculateWeekTotal()}h
                  </div>
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {timesheet.status === 'Draft' && (
          <div className="p-4 border-t border-stone-200">
            <BonsaiButton size="sm" variant="ghost" icon={<Plus />} onClick={addEntry}>
              Add Entry
            </BonsaiButton>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg border border-stone-200 p-6 mb-6">
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          placeholder="Add any notes about this week's work..."
          disabled={timesheet.status !== 'Draft'}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          {timesheet.status === 'Rejected' && (
            <div className="text-sm text-red-600">
              <strong>Rejection Reason:</strong> Please add more detail to task descriptions.
            </div>
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
