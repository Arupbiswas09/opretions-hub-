import React from 'react';
import { Tag } from '@/app/components/ui/tag';
import { Card } from '@/app/components/ui/card';
import { Task } from './data';

interface TaskGridProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

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

const statusVariants = {
  todo: 'status-todo' as const,
  'in-progress': 'status-in-progress' as const,
  blocked: 'status-blocked' as const,
  waiting: 'status-waiting' as const,
  done: 'status-done' as const,
};

const statusLabels = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  blocked: 'Blocked',
  waiting: 'Waiting',
  done: 'Done',
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

export const TaskGrid: React.FC<TaskGridProps> = ({ tasks, onTaskClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <Card
          key={task.id}
          className={`p-4 cursor-pointer hover:shadow-md transition-all ${
            task.isOverdue ? 'border-red-200 bg-red-50/30' : ''
          }`}
          onClick={() => onTaskClick(task)}
        >
          <div className="mb-3">
            <h4 className={`font-medium text-sm mb-2 ${task.isOverdue ? 'text-red-700' : ''}`}>
              {task.title}
            </h4>
            <div className="text-xs text-muted-foreground line-clamp-2">{task.description}</div>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-3">
            <Tag variant={entityVariants[task.entityType]} className="text-xs">
              {entityLabels[task.entityType]}: {task.entityName}
            </Tag>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <Tag variant={priorityVariants[task.priority]} className="text-xs">
                {priorityLabels[task.priority]}
              </Tag>
              <Tag variant={statusVariants[task.status]} className="text-xs">
                {statusLabels[task.status]}
              </Tag>
            </div>
            <div className={`text-xs ${task.isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};