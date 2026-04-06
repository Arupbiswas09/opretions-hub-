import React, { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { CheckSquare, FileText, AlertCircle } from 'lucide-react';

interface QuickCaptureProps {
  onCapture: (text: string, type: 'task' | 'note' | 'issue') => void;
}

export const QuickCapture: React.FC<QuickCaptureProps> = ({ onCapture }) => {
  const [input, setInput] = useState('');
  const [recentCaptures, setRecentCaptures] = useState<Array<{ text: string; type: string; time: string }>>([
    { text: 'Follow up with John about contract', type: 'task', time: '10 min ago' },
    { text: 'Client mentioned budget concerns', type: 'note', time: '1 hour ago' },
    { text: 'Dev environment access needed', type: 'issue', time: '2 hours ago' },
  ]);

  const handleCapture = (type: 'task' | 'note' | 'issue') => {
    if (input.trim()) {
      onCapture(input, type);
      setRecentCaptures([
        { text: input, type, time: 'Just now' },
        ...recentCaptures.slice(0, 2),
      ]);
      setInput('');
    }
  };

  return (
    <div>
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">What's on your mind?</label>
            <Input
              placeholder='E.g., "Remind John to send contract tomorrow"'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCapture('task');
                }
              }}
              className="border-border rounded-lg h-12"
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              size="default"
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => handleCapture('task')}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Add Task
            </Button>
            <Button
              size="default"
              variant="outline"
              className="flex-1"
              onClick={() => handleCapture('note')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Add Note
            </Button>
            <Button
              size="default"
              variant="outline"
              className="flex-1"
              onClick={() => handleCapture('issue')}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Log Issue
            </Button>
          </div>
        </div>
      </Card>

      {recentCaptures.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">Recent Captures</h3>
          <div className="space-y-2">
            {recentCaptures.map((capture, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm mb-1">{capture.text}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{capture.type}</span>
                      <span>•</span>
                      <span>{capture.time}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};