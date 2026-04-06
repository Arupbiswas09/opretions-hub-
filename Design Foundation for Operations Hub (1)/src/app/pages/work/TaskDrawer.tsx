import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/app/components/ui/sheet';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Calendar,
  User,
  Link as LinkIcon,
  MessageSquare,
  Activity,
  Sparkles,
  CheckCircle2,
  UserCheck,
  Plus,
  Mail,
} from 'lucide-react';
import { Task } from './types';
import { users } from './data';

interface TaskDrawerProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Task>) => void;
  isCreating?: boolean;
}

const priorityColors = {
  high: 'bg-red-500/10 text-red-600 border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  low: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

const statusColors = {
  'todo': 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  'in-progress': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'blocked': 'bg-red-500/10 text-red-600 border-red-500/20',
  'waiting': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  'done': 'bg-green-500/10 text-green-600 border-green-500/20',
};

const entityTypeColors = {
  project: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  client: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  job: 'bg-green-500/10 text-green-600 border-green-500/20',
  candidate: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  internal: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

export const TaskDrawer: React.FC<TaskDrawerProps> = ({ task, open, onClose, onSave, isCreating }) => {
  const [newComment, setNewComment] = useState('');

  if (!task && !isCreating) return null;

  const assignee = task ? users.find((u) => u.id === task.assigneeId) : null;
  const creator = task ? users.find((u) => u.id === task.createdById) : null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // In real app, would call API
      setNewComment('');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">
            {isCreating ? 'Create New Task' : task?.title}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground text-left">
            {isCreating 
              ? 'Fill in the details to create a new task' 
              : task?.description || 'Task details'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6 pb-4">
          {task && (
            <>
              {/* Status and Priority */}
              <div className="flex gap-2 flex-wrap">
                <Badge className={priorityColors[task.priority]}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </Badge>
                <Badge className={statusColors[task.status]}>
                  {task.status === 'in-progress' ? 'In Progress' : 
                   task.status === 'todo' ? 'To Do' : 
                   task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Badge>
                {task.isOverdue && (
                  <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                    Overdue
                  </Badge>
                )}
                <Badge className={entityTypeColors[task.entityType]}>
                  {task.entityType.charAt(0).toUpperCase() + task.entityType.slice(1)}
                </Badge>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Status Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    Status
                  </label>
                  <Select value={task.status} onValueChange={(val) => onSave({ status: val as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="waiting">Waiting</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={task.priority} onValueChange={(val) => onSave({ priority: val as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Due Date
                  </label>
                  <div className="text-sm p-2 border border-border rounded-lg">
                    {formatDate(task.dueDate)}
                  </div>
                </div>

                {/* Assignee */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Assignee
                  </label>
                  {assignee && (
                    <div className="flex items-center gap-2 p-2 border border-border rounded-lg">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{assignee.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{assignee.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Linked Records */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  Linked Records
                </label>
                <Badge variant="outline" className={entityTypeColors[task.entityType]}>
                  {task.entityName}
                </Badge>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <div className="text-sm text-muted-foreground p-3 border border-border rounded-lg bg-muted/20">
                  {task.description}
                </div>
              </div>

              {/* AI Section */}
              <div className="border border-purple-500/20 rounded-lg p-4 bg-purple-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <h3 className="font-medium text-sm">AI Insights</h3>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium text-xs text-muted-foreground mb-1">Suggested Next Action</div>
                    <div className="text-sm">Schedule a follow-up meeting with stakeholders to discuss timeline.</div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-xs text-muted-foreground mb-1">Missing Information</div>
                    <div className="text-sm">Budget approval status not documented</div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Mail className="h-4 w-4 mr-2" />
                    Draft Follow-Up Message
                  </Button>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  Comments ({task.comments.length})
                </label>

                <div className="space-y-3">
                  {task.comments.map((comment) => {
                    const commentUser = users.find((u) => u.id === comment.userId);
                    return (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{commentUser?.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{commentUser?.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(comment.timestamp)}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">{comment.text}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                  />
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    Post
                  </Button>
                </div>
              </div>

              {/* Activity Log */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Activity Log
                </label>

                <div className="space-y-2">
                  {task.activityLog.map((activity) => {
                    const activityUser = activity.userId === 'ai' ? null : users.find((u) => u.id === activity.userId);
                    
                    return (
                      <div key={activity.id} className="flex gap-3 text-sm">
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(activity.timestamp)}
                        </div>
                        <div className="flex items-center gap-1">
                          {activityUser ? (
                            <span className="font-medium">{activityUser.name}</span>
                          ) : (
                            <span className="font-medium flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-purple-600" />
                              AI
                            </span>
                          )}
                          <span className="text-muted-foreground">{activity.action}</span>
                          {activity.details && (
                            <span className="text-muted-foreground">- {activity.details}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {isCreating && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Task creation form would go here...</p>
            </div>
          )}
        </div>

        <SheetFooter className="border-t border-border pt-4 mt-6">
          <div className="flex gap-2 w-full">
            {task && !isCreating && (
              <>
                <Button variant="outline" className="flex-1">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Reassign
                </Button>
                <Button variant="outline" className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Follow-Up
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    onSave({ status: 'done' });
                    onClose();
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              </>
            )}
            {isCreating && (
              <>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button>Create Task</Button>
              </>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};