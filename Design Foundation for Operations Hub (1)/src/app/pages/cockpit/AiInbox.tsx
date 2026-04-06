import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Check, Clock, X, AlertCircle, AlertTriangle, Info, Ban } from 'lucide-react';
import { AiInsight } from './data';

interface AiInboxProps {
  insights: AiInsight[];
  onInsightClick: (insight: AiInsight) => void;
  onAccept: (insightId: string) => void;
  onSnooze: (insightId: string) => void;
  onDismiss: (insightId: string) => void;
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

const priorityDots = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-slate-400',
};

export const AiInbox: React.FC<AiInboxProps> = ({
  insights,
  onInsightClick,
  onAccept,
  onSnooze,
  onDismiss,
}) => {
  return (
    <div>
      <div className="space-y-3">
        {insights.map((insight) => {
          const config = typeConfig[insight.type];
          const Icon = config.icon;

          return (
            <Card
              key={insight.id}
              className="p-4 hover:shadow-sm transition-all cursor-pointer group"
              onClick={() => onInsightClick(insight)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${priorityDots[insight.priority]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={config.color}>
                      <Icon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                  <h4 className="font-medium mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{insight.relatedEntityType}: {insight.relatedEntityName}</span>
                    <span>•</span>
                    <span>{insight.timestamp}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  className="h-8 text-xs bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => onAccept(insight.id)}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => onSnooze(insight.id)}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Snooze
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => onDismiss(insight.id)}
                >
                  <X className="h-3 w-3 mr-1" />
                  Dismiss
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};