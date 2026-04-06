import React from 'react';
import { Tag } from '@/app/components/ui/tag';
import { Card } from '@/app/components/ui/card';
import { Task, TaskStatus } from './data';

interface TaskKanbanProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const columns: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'in-progress', label: 'In Progress' },
  { status: 'blocked', label: 'Blocked' },
  { status: 'waiting', label: 'Waiting' },
  { status: 'done', label: 'Done' },
];

const priorityVariants = {
  high: 'priority-high' as const,
  medium: 'priority-medium' as const,
  low: 'priority-low' as const,
};

const priorityLabels = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const entityVariants: Record<string, any> = {
  project: 'entity-project',
  client: 'entity-client',
  job: 'entity-job',
  candidate: 'entity-candidate',
  communication: 'entity-communication',
};

const entityLabels = {
  project: 'Project',
  client: 'Client',
  job: 'Job',
  candidate: 'Candidate',
  communication: 'Communication',
};

export const TaskKanban: React.FC<TaskKanbanProps> = ({ tasks, onTaskClick }) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.status);
        
        return (
          <div key={column.status} className="flex-shrink-0 w-72">
            <div className="mb-3">
              <h3 className="font-medium text-sm text-muted-foreground mb-1">{column.label}</h3>
              <div className="text-xs text-muted-foreground">{columnTasks.length} tasks</div>
            </div>
            <div className="space-y-2">
              {columnTasks.map((task) => (
                <Card
                  key={task.id}
                  className={`p-3 cursor-pointer hover:shadow-md transition-all ${
                    task.isOverdue ? 'border-red-200 bg-red-50/30' : ''
                  }`}
                  onClick={() => onTaskClick(task)}
                >
                  <div className="mb-2">
                    <h4 className={`font-medium text-sm mb-1 ${task.isOverdue ? 'text-red-700' : ''}`}>
                      {task.title}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Tag variant={entityVariants[task.entityType]} className="text-xs">
                      {entityLabels[task.entityType]}
                    </Tag>
                    <Tag variant={priorityVariants[task.priority]} className="text-xs">
                      {priorityLabels[task.priority]}
                    </Tag>
                  </div>
                  <div className={`text-xs ${task.isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                    Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {task.isOverdue && ' (Overdue)'}
                  </div>
                </Card>
              ))}
              {columnTasks.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed border-border rounded-lg">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};