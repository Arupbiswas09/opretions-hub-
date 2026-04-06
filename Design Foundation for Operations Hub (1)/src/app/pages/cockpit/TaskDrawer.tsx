import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/app/components/ui/sheet';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { CheckCircle, UserPlus, Calendar, Link as LinkIcon, Sparkles } from 'lucide-react';
import { Task, users } from './data';

interface TaskDrawerProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}

const priorityColors = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-slate-50 text-slate-600 border-slate-200',
};

const priorityLabels = {
  high: 'High Priority',
  medium: 'Medium Priority',
  low: 'Low Priority',
};

const statusColors = {
  todo: 'bg-slate-50 text-slate-600 border-slate-200',
  'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
  blocked: 'bg-red-50 text-red-700 border-red-200',
  waiting: 'bg-amber-50 text-amber-700 border-amber-200',
  done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const statusLabels = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  blocked: 'Blocked',
  waiting: 'Waiting',
  done: 'Done',
};

const entityColors = {
  project: 'bg-purple-50 text-purple-700 border-purple-200',
  client: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  job: 'bg-teal-50 text-teal-700 border-teal-200',
  candidate: 'bg-pink-50 text-pink-700 border-pink-200',
  communication: 'bg-sky-50 text-sky-700 border-sky-200',
};

const entityLabels = {
  project: 'Project',
  client: 'Client',
  job: 'Job',
  candidate: 'Candidate',
  communication: 'Communication',
};

export const TaskDrawer: React.FC<TaskDrawerProps> = ({ task, open, onClose }) => {
  if (!task) return null;

  const owner = users.find((u) => u.id === task.ownerId);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <SheetHeader>
          <SheetTitle className="text-left">{task.title}</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {task.description}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6 overflow-y-auto flex-1 pr-2 pb-4">
          {/* Status and Priority */}
          <div className="flex gap-2 flex-wrap">
            <Badge className={priorityColors[task.priority]}>
              {priorityLabels[task.priority]}
            </Badge>
            <Badge className={statusColors[task.status]}>
              {statusLabels[task.status]}
            </Badge>
            {task.isOverdue && (
              <Badge className="bg-red-100 text-red-700 border-red-200">
                Overdue
              </Badge>
            )}
          </div>

          {/* Linked Records */}
          <div>
            <div className="text-sm font-medium mb-2">Linked to</div>
            <Badge className={entityColors[task.entityType]}>
              {entityLabels[task.entityType]}: {task.entityName}
            </Badge>
          </div>

          {/* Due Date */}
          <div>
            <div className="text-sm font-medium mb-1">Due Date</div>
            <div className={`text-sm ${task.isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {task.isOverdue && ' (Overdue)'}
            </div>
          </div>

          {/* Owner */}
          {owner && (
            <div>
              <div className="text-sm font-medium mb-2">Owner</div>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                    {owner.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{owner.name}</div>
                  <div className="text-xs text-muted-foreground">{owner.email}</div>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Description */}
          <div>
            <div className="text-sm font-medium mb-2">Description</div>
            <div className="text-sm text-muted-foreground">{task.description}</div>
          </div>

          {/* AI Suggestions */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-accent-foreground" />
              <div className="text-sm font-medium">AI Suggestions</div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="font-medium text-foreground">Next step:</span>
                {task.status === 'blocked' && 'Escalate blocker to team lead'}
                {task.status === 'waiting' && 'Send follow-up reminder'}
                {task.status === 'todo' && 'Start with highest priority subtask'}
                {task.status === 'in-progress' && 'Update progress in comments'}
                {task.status === 'done' && 'Archive and create follow-up if needed'}
              </div>
              {task.status !== 'done' && task.comments.length === 0 && (
                <div className="flex gap-2">
                  <span className="font-medium text-foreground">Missing:</span>
                  No progress updates logged
                </div>
              )}
              <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">
                Draft follow-up message
              </Button>
            </div>
          </div>

          <Separator />

          {/* Comments */}
          <div>
            <div className="text-sm font-medium mb-3">
              Comments ({task.comments.length})
            </div>
            {task.comments.length > 0 ? (
              <div className="space-y-3">
                {task.comments.map((comment) => {
                  const commenter = users.find((u) => u.id === comment.userId);
                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                          {commenter?.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{commenter?.name}</span>
                          <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{comment.text}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No comments yet</div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pb-4">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Done
            </Button>
            <Button variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Reassign
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Reschedule
            </Button>
            <Button variant="outline">
              <LinkIcon className="h-4 w-4 mr-2" />
              Link Communication
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};