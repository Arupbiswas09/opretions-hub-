import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Clock } from 'lucide-react';
import { Meeting, users } from './data';

interface TodaysCalendarProps {
  meetings: Meeting[];
  onMeetingClick: (meeting: Meeting) => void;
}

export const TodaysCalendar: React.FC<TodaysCalendarProps> = ({ meetings, onMeetingClick }) => {
  const getUser = (userId: string) => users.find((u) => u.id === userId);

  return (
    <div>
      <div className="space-y-3">
        {meetings.map((meeting) => (
          <Card
            key={meeting.id}
            className="p-4 hover:shadow-sm transition-all cursor-pointer group"
            onClick={() => onMeetingClick(meeting)}
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground min-w-[90px]">
                <Clock className="h-4 w-4" />
                {meeting.startTime}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium mb-2">{meeting.title}</h4>
                {meeting.relatedEntityName && (
                  <Badge variant="outline" className="text-xs mb-3">
                    {meeting.relatedEntityType}: {meeting.relatedEntityName}
                  </Badge>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex items-center -space-x-2">
                    {meeting.participants.slice(0, 3).map((participantId) => {
                      const user = getUser(participantId);
                      return user ? (
                        <Avatar key={user.id} className="h-7 w-7 border-2 border-background">
                          <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                            {user.avatar}
                          </AvatarFallback>
                        </Avatar>
                      ) : null;
                    })}
                  </div>
                  {meeting.participants.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{meeting.participants.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};