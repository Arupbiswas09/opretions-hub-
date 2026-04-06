import React from 'react';
import { Tag } from '@/app/components/ui/tag';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Button } from '@/app/components/ui/button';
import { MessageSquare, UserPlus, Calendar as CalendarIcon } from 'lucide-react';
import { Task, users } from './data';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskComplete: (taskId: string) => void;
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

export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskClick, onTaskComplete }) => {
  const getOwner = (ownerId: string) => users.find((u) => u.id === ownerId);

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const owner = getOwner(task.ownerId);
        const isOverdue = task.isOverdue;

        return (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-3 border rounded-lg hover:shadow-sm transition-all cursor-pointer group ${
              isOverdue ? 'border-red-200 bg-red-50/30' : 'border-border bg-card'
            }`}
            onClick={() => onTaskClick(task)}
          >
            <Checkbox
              checked={task.status === 'done'}
              onCheckedChange={() => onTaskComplete(task.id)}
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                <span className={`font-medium text-sm ${isOverdue ? 'text-red-700' : 'text-foreground'}`}>
                  {task.title}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Tag variant={entityVariants[task.entityType]} className="text-xs">
                  {entityLabels[task.entityType]}: {task.entityName}
                </Tag>
                <Tag variant={priorityVariants[task.priority]} className="text-xs">
                  {priorityLabels[task.priority]}
                </Tag>
                <Tag variant={statusVariants[task.status]} className="text-xs">
                  {statusLabels[task.status]}
                </Tag>
                <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                  Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {isOverdue && ' (Overdue)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {task.comments.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task);
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </div>

            {owner && (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                  {owner.avatar}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        );
      })}
    </div>
  );
};