import React from 'react';
import { Tag } from '@/app/components/ui/tag';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Task } from './types';
import { users } from './data';

interface TaskKanbanViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const priorityColors = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-blue-500',
};

const entityTypeVariants: Record<string, any> = {
  project: 'entity-project',
  client: 'entity-client',
  job: 'entity-job',
  candidate: 'entity-candidate',
  internal: 'neutral',
};

const columns = [
  { id: 'todo', title: 'To Do', status: 'todo' as const },
  { id: 'in-progress', title: 'In Progress', status: 'in-progress' as const },
  { id: 'blocked', title: 'Blocked', status: 'blocked' as const },
  { id: 'waiting', title: 'Waiting', status: 'waiting' as const },
  { id: 'done', title: 'Done', status: 'done' as const },
];

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({ tasks, onTaskClick }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  return (
    <div className="grid grid-cols-5 gap-4">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.status);

        return (
          <div key={column.id} className="flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <h3 className="font-medium text-sm">{column.title}</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {columnTasks.length}
              </span>
            </div>

            <div className="space-y-2 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto">
              {columnTasks.map((task) => {
                const assignee = users.find((u) => u.id === task.assigneeId);

                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={`p-3 bg-card border-l-4 ${priorityColors[task.priority]} border border-border rounded-lg hover:shadow-sm cursor-pointer transition-all`}
                  >
                    <div className="font-medium text-sm mb-2 line-clamp-2">{task.title}</div>

                    <Tag variant={entityTypeVariants[task.entityType]} className="text-xs mb-2">
                      {task.entityName}
                    </Tag>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
                      <div className={`text-xs ${task.isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                        {formatDate(task.dueDate)}
                      </div>

                      {assignee && (
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">{assignee.avatar}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>

                    {task.isOverdue && (
                      <Tag variant="priority-high" className="mt-2 w-full justify-center text-xs">
                        Overdue
                      </Tag>
                    )}
                  </div>
                );
              })}

              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground">
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