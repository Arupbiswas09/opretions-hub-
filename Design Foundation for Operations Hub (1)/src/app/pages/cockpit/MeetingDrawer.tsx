import React, { useState } from 'react';
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
import { Clock, Users as UsersIcon, Sparkles, Plus } from 'lucide-react';
import { Meeting, users } from './data';
import { Card } from '@/app/components/ui/card';

interface MeetingDrawerProps {
  meeting: Meeting | null;
  open: boolean;
  onClose: () => void;
}

export const MeetingDrawer: React.FC<MeetingDrawerProps> = ({ meeting, open, onClose }) => {
  const [showActionItems, setShowActionItems] = useState(false);

  if (!meeting) return null;

  const participants = meeting.participants
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <SheetHeader>
          <SheetTitle className="text-left">{meeting.title}</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {meeting.type ? meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1) : 'Meeting'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6 overflow-y-auto flex-1 pr-2 pb-4">{/* Meeting Info */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {meeting.startTime} - {meeting.endTime}
              </span>
            </div>
            {meeting.relatedEntityName && (
              <Badge variant="outline">
                {meeting.relatedEntityType}: {meeting.relatedEntityName}
              </Badge>
            )}
          </div>

          {/* Participants */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium mb-3">
              <UsersIcon className="h-4 w-4" />
              Participants ({participants.length})
            </div>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant?.id} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                      {participant?.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{participant?.name}</div>
                    <div className="text-xs text-muted-foreground">{participant?.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div>
            <div className="text-sm font-medium mb-2">Summary</div>
            <div className="text-sm text-muted-foreground">{meeting.summary}</div>
          </div>

          {/* Notes */}
          <div>
            <div className="text-sm font-medium mb-2">Notes</div>
            <div className="text-sm text-muted-foreground whitespace-pre-line">{meeting.notes}</div>
          </div>

          <Separator />

          {/* AI Summary */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-accent-foreground" />
              <div className="text-sm font-medium">AI Insights</div>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-foreground">Key Decisions:</span>
                <ul className="list-disc list-inside mt-1 text-muted-foreground space-y-1">
                  <li>Approved Q1 budget allocation</li>
                  <li>Agreed on weekly sync schedule</li>
                </ul>
              </div>
              <div>
                <span className="font-medium text-foreground">Action Items:</span>
                <ul className="list-disc list-inside mt-1 text-muted-foreground space-y-1">
                  <li>Sarah to send contract by EOD</li>
                  <li>David to review requirements document</li>
                </ul>
              </div>
              <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">
                Convert to tasks
              </Button>
            </div>
          </div>

          <Separator />

          {/* Action Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium">Action Items</div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => setShowActionItems(!showActionItems)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Item
              </Button>
            </div>
            <div className="space-y-2">
              {[
                { task: 'Send updated proposal to client', owner: 'Sarah Chen', status: 'pending' },
                { task: 'Review contract terms', owner: 'David Kim', status: 'completed' },
                { task: 'Schedule follow-up meeting', owner: 'Mark Johnson', status: 'pending' },
              ].map((item, idx) => (
                <Card key={idx} className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium mb-1">{item.task}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.owner}</span>
                        <span>•</span>
                        <Badge
                          variant="outline"
                          className={
                            item.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-xs'
                              : 'text-xs'
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pb-4">
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Join Meeting</Button>
            <Button variant="outline">Add to Calendar</Button>
            <Button variant="outline">Share Notes</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};