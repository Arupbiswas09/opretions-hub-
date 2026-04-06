import React from 'react';
import { Tag } from '@/app/components/ui/tag';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Button } from '@/app/components/ui/button';
import {
  MessageSquare,
  UserCheck,
  MoreHorizontal,
  Sparkles,
  Mail,
  Calendar,
  Pencil,
} from 'lucide-react';
import { Task } from './types';
import { users } from './data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

interface TaskListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
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

const sourceIcons = {
  ai: Sparkles,
  email: Mail,
  meeting: Calendar,
  manual: Pencil,
};

const entityTypeVariants: Record<string, any> = {
  project: 'entity-project',
  client: 'entity-client',
  job: 'entity-job',
  candidate: 'entity-candidate',
  internal: 'neutral',
};

export const TaskListView: React.FC<TaskListViewProps> = ({ tasks, onTaskClick, onTaskUpdate }) => {
  const handleCheckboxChange = (task: Task, checked: boolean) => {
    onTaskUpdate(task.id, { status: checked ? 'done' : 'todo' });
  };

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
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="w-10 px-4 py-3 text-left"></th>
            <th className="px-4 py-3 text-left text-sm font-medium">Task</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Related Entity</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Priority</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Assignee</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Due Date</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Source</th>
            <th className="w-10 px-4 py-3 text-left"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tasks.map((task) => {
            const assignee = users.find((u) => u.id === task.assigneeId);
            const SourceIcon = sourceIcons[task.source];

            return (
              <tr
                key={task.id}
                className="hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => onTaskClick(task)}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={task.status === 'done'}
                    onCheckedChange={(checked) => handleCheckboxChange(task, !!checked)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{task.title}</div>
                      {task.comments.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3" />
                          <span>{task.comments.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Tag variant={entityTypeVariants[task.entityType]}>
                    {task.entityName}
                  </Tag>
                </td>
                <td className="px-4 py-3">
                  <Tag variant={priorityVariants[task.priority]}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Tag>
                </td>
                <td className="px-4 py-3">
                  <Tag variant={statusVariants[task.status]}>
                    {statusLabels[task.status]}
                  </Tag>
                </td>
                <td className="px-4 py-3">
                  {assignee && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{assignee.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate">{assignee.name}</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className={`text-sm ${task.isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                    {formatDate(task.dueDate)}
                    {task.isOverdue && (
                      <Tag variant="priority-high" className="ml-2">
                        Overdue
                      </Tag>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <SourceIcon className="h-3 w-3" />
                    <span className="capitalize">{task.source}</span>
                  </div>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onTaskClick(task)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Add Comment
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Reassign
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Change Status
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};