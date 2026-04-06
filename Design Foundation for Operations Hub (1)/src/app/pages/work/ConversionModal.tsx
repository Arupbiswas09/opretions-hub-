import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { CheckSquare, AlertCircle, Briefcase, LinkIcon } from 'lucide-react';
import { Request } from './request-types';
import { users } from './data';

interface ConversionModalProps {
  open: boolean;
  onClose: () => void;
  request: Request;
  conversionType: 'task' | 'issue' | 'project';
  onComplete: () => void;
}

export const ConversionModal: React.FC<ConversionModalProps> = ({
  open,
  onClose,
  request,
  conversionType,
  onComplete,
}) => {
  const [owner, setOwner] = useState(request.ownerId || '1');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');

  const conversionConfig = {
    task: {
      title: 'Convert to Task',
      icon: CheckSquare,
      color: 'text-blue-600',
      description: 'Create a task to track the work needed for this request',
    },
    issue: {
      title: 'Convert to Issue',
      icon: AlertCircle,
      color: 'text-red-600',
      description: 'Create an issue to investigate and resolve this problem',
    },
    project: {
      title: 'Convert to Project/Job',
      icon: Briefcase,
      color: 'text-purple-600',
      description: 'Create a project or job requirement for this larger initiative',
    },
  };

  const config = conversionConfig[conversionType];
  const Icon = config.icon;

  const handleConvert = () => {
    // In real app, would create the corresponding record
    console.log('Converting request to', conversionType, {
      owner,
      priority,
      dueDate,
    });
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.color}`} />
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Source Request Info */}
          <div className="p-3 border border-border rounded-lg bg-muted/20">
            <div className="text-xs font-medium text-muted-foreground mb-2">Source Request</div>
            <div className="text-sm font-medium">{request.subject}</div>
            <div className="text-xs text-muted-foreground mt-1">
              From {request.requestedByName} ({request.requestedByOrg})
            </div>
          </div>

          {/* Preview of what will be created */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="title">
                {conversionType === 'task' && 'Task Title'}
                {conversionType === 'issue' && 'Issue Title'}
                {conversionType === 'project' && 'Project/Job Title'}
              </Label>
              <Input
                id="title"
                defaultValue={request.subject}
                placeholder="Enter title..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner">Owner</Label>
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger id="owner">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {conversionType === 'task' && (
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(val) => setPriority(val as any)}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {conversionType === 'issue' && (
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select value={priority} onValueChange={(val) => setPriority(val as any)}>
                  <SelectTrigger id="severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {conversionType !== 'project' && (
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            )}

            {request.relatedEntityName && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <LinkIcon className="h-3 w-3" />
                  Linked Entity
                </Label>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                  {request.relatedEntityName}
                </Badge>
              </div>
            )}
          </div>

          {/* Notice */}
          <div className="p-3 border border-blue-500/20 rounded-lg bg-blue-500/5">
            <div className="flex items-start gap-2">
              <LinkIcon className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                This request will remain linked to the created {conversionType}. You can always trace back to the original request.
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConvert}>
            <Icon className="h-4 w-4 mr-2" />
            Create {conversionType === 'task' ? 'Task' : conversionType === 'issue' ? 'Issue' : 'Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
