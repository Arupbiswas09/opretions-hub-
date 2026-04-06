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
import { Clock, AlertTriangle, Info, Ban, CheckCircle, Link as LinkIcon } from 'lucide-react';
import { AiInsight } from './data';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Label } from '@/app/components/ui/label';

interface AiDetailModalProps {
  insight: AiInsight | null;
  open: boolean;
  onClose: () => void;
  onCreateTask: () => void;
}

const typeConfig = {
  'follow-up': {
    label: 'Follow-up',
    icon: Clock,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  risk: {
    label: 'Risk',
    icon: AlertTriangle,
    color: 'bg-red-50 text-red-700 border-red-200',
  },
  'missing-info': {
    label: 'Missing Info',
    icon: Info,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  blocker: {
    label: 'Blocker',
    icon: Ban,
    color: 'bg-orange-50 text-orange-700 border-orange-200',
  },
};

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

export const AiDetailModal: React.FC<AiDetailModalProps> = ({
  insight,
  open,
  onClose,
  onCreateTask,
}) => {
  const [actionType, setActionType] = useState<'create' | 'link'>('create');

  if (!insight) return null;

  const config = typeConfig[insight.type];
  const Icon = config.icon;

  // Capitalize entity type
  const capitalizeEntityType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span>{insight.title}</span>
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {insight.description}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6 overflow-y-auto flex-1 pr-2 pb-4">
          {/* Tags */}
          <div className="flex gap-2 flex-wrap">
            <Badge className={config.color}>{config.label}</Badge>
            <Badge className={priorityColors[insight.priority]}>{priorityLabels[insight.priority]}</Badge>
            <Badge variant="outline">
              {capitalizeEntityType(insight.relatedEntityType)}: {insight.relatedEntityName}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <div className="text-sm font-medium mb-1">Issue</div>
            <div className="text-sm text-muted-foreground">{insight.description}</div>
          </div>

          <Separator />

          {/* Reasoning */}
          <div>
            <div className="text-sm font-medium mb-2">Why this matters</div>
            <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
              {insight.reasoning}
            </div>
          </div>

          {/* Suggested Action */}
          <div>
            <div className="text-sm font-medium mb-2">Suggested action</div>
            <div className="text-sm text-foreground bg-accent/10 border border-accent/20 p-3 rounded-lg">
              {insight.suggestedAction}
            </div>
          </div>

          <Separator />

          {/* Action Type Selection */}
          <div>
            <div className="text-sm font-medium mb-3">What would you like to do?</div>
            <RadioGroup value={actionType} onValueChange={(val) => setActionType(val as 'create' | 'link')}>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer">
                  <RadioGroupItem value="create" id="create" className="mt-0.5" />
                  <Label htmlFor="create" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Create new task</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Generate a new task with the suggested action and link it to{' '}
                      {insight.relatedEntityName}
                    </div>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer">
                  <RadioGroupItem value="link" id="link" className="mt-0.5" />
                  <Label htmlFor="link" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <LinkIcon className="h-4 w-4" />
                      <span className="font-medium">Link to existing task</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Associate this insight with a task you're already working on
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 pb-4">
            <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={onCreateTask}>
              {actionType === 'create' ? 'Create Task' : 'Select Task'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};