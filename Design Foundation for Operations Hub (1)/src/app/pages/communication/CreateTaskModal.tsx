import React, { useState } from 'react';
import { Conversation } from './types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { MessageSquare } from 'lucide-react';

interface CreateTaskModalProps {
  conversation: Conversation;
  open: boolean;
  onClose: () => void;
  onCreateTask: (task: any) => void;
}

const entityColors: Record<string, string> = {
  client: 'bg-blue-50 text-blue-700 border-blue-100',
  project: 'bg-purple-50 text-purple-700 border-purple-100',
  job: 'bg-orange-50 text-orange-700 border-orange-100',
  candidate: 'bg-green-50 text-green-700 border-green-100',
  deal: 'bg-amber-50 text-amber-700 border-amber-100',
  contact: 'bg-gray-50 text-gray-700 border-gray-200',
};

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  conversation,
  open,
  onClose,
  onCreateTask,
}) => {
  const [title, setTitle] = useState(
    conversation.subject || `Follow up with ${conversation.primaryContact.name}`
  );
  const [description, setDescription] = useState(
    `Task created from conversation with ${conversation.primaryContact.name}.\n\n${conversation.snippet}`
  );
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('me');

  const handleCreate = () => {
    onCreateTask({
      title,
      description,
      priority,
      dueDate,
      assignee,
      source: 'communication',
      linkedEntities: conversation.linkedEntities,
      conversationId: conversation.id,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Task from Conversation</DialogTitle>
          <DialogDescription>
            Create a new task based on the conversation with{' '}
            {conversation.primaryContact.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Source Indicator */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900">
                Source: Conversation with {conversation.primaryContact.name}
              </p>
              <p className="text-xs text-blue-700 truncate">{conversation.snippet}</p>
            </div>
          </div>

          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="AI-summarized description"
              rows={4}
            />
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger id="assignee">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="me">Me</SelectItem>
                <SelectItem value="sarah">Sarah Johnson</SelectItem>
                <SelectItem value="john">John Smith</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Linked Entities */}
          {conversation.linkedEntities.length > 0 && (
            <div className="space-y-2">
              <Label>Linked Entities (pre-filled)</Label>
              <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
                {conversation.linkedEntities.map((entity) => (
                  <Badge
                    key={entity.id}
                    variant="outline"
                    className={entityColors[entity.type]}
                  >
                    {entity.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};