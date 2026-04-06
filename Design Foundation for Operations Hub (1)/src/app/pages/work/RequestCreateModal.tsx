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
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Plus } from 'lucide-react';
import { Request, RequestType, RequestCategory } from './request-types';

interface RequestCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (request: Omit<Request, 'id'>) => void;
}

export const RequestCreateModal: React.FC<RequestCreateModalProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const [requestType, setRequestType] = useState<RequestType>('internal');
  const [category, setCategory] = useState<RequestCategory>('other');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim()) return;

    const newRequest: Omit<Request, 'id'> = {
      requestType,
      category,
      subject: subject.trim(),
      description: description.trim(),
      requestedById: '1', // Current user
      requestedByName: 'Sarah Chen',
      requestedByOrg: 'Internal',
      submittedDate: new Date().toISOString(),
      status: 'new',
      comments: [],
      activityLog: [
        {
          id: 'ra-new',
          userId: '1',
          action: 'created',
          timestamp: new Date().toISOString(),
        },
      ],
    };

    onCreate(newRequest);
    
    // Reset form
    setRequestType('internal');
    setCategory('other');
    setSubject('');
    setDescription('');
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Request</DialogTitle>
          <DialogDescription>
            Submit a new request for review and processing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requestType">Request Type</Label>
              <Select value={requestType} onValueChange={(val) => setRequestType(val as RequestType)}>
                <SelectTrigger id="requestType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as RequestCategory)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-talent">New Talent</SelectItem>
                  <SelectItem value="change-request">Change Request</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="leave">Leave</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="access">Access</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your request..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information about your request..."
              rows={5}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!subject.trim() || !description.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
