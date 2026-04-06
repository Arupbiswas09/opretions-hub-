import React from 'react';
import { Tag } from '@/app/components/ui/tag';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Card } from '@/app/components/ui/card';
import { Task } from './types';
import { users } from './data';

interface TaskGridViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const priorityVariants = {
  high: 'priority-high' as const,
  medium: 'priority-medium' as const,
  low: 'priority-low' as const,
};

const statusVariants = {
  'todo': 'status-todo' as const,
  'in-progress': 'status-in-progress' as const,
  'blocked': 'status-blocked' as const,
  'waiting': 'status-waiting' as const,
  'done': 'status-done' as const,
};

const statusLabels = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'blocked': 'Blocked',
  'waiting': 'Waiting',
  'done': 'Done',
};

const entityTypeVariants: Record<string, any> = {
  project: 'entity-project',
  client: 'entity-client',
  job: 'entity-job',
  candidate: 'entity-candidate',
  internal: 'neutral',
};

export const TaskGridView: React.FC<TaskGridViewProps> = ({ tasks, onTaskClick }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No tasks found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tasks.map((task) => {
        const assignee = users.find((u) => u.id === task.assigneeId);

        return (
          <Card
            key={task.id}
            onClick={() => onTaskClick(task)}
            className="p-4 hover:shadow-md cursor-pointer transition-all"
          >
            <div className="space-y-3">
              {/* Title */}
              <div className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
                {task.title}
              </div>

              {/* Description */}
              <div className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                {task.description}
              </div>

              {/* Entity chip */}
              <Tag variant={entityTypeVariants[task.entityType]}>
                {task.entityName}
              </Tag>

              {/* Priority and Status */}
              <div className="flex gap-2 flex-wrap">
                <Tag variant={priorityVariants[task.priority]}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Tag>
                <Tag variant={statusVariants[task.status]}>
                  {statusLabels[task.status]}
                </Tag>
              </div>

              {/* Due date and assignee */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className={`text-xs ${task.isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                  {formatDate(task.dueDate)}
                </div>

                {assignee && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">{assignee.avatar}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>

              {task.isOverdue && (
                <Tag variant="priority-high" className="w-full justify-center">
                  Overdue
                </Tag>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};