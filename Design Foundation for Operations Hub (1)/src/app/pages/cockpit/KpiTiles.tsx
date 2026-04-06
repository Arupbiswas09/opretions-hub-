import React from 'react';
import { useNavigate } from 'react-router';
import { Card } from '@/app/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { kpiData } from './data';

export const KpiTiles = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {kpiData.map((kpi) => (
        <Card
          key={kpi.id}
          className="p-4 cursor-pointer hover:shadow-md hover:border-accent transition-all group"
          onClick={() => navigate(kpi.linkTo)}
        >
          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground mb-1">{kpi.title}</div>
            <div className="text-2xl font-semibold mb-2 group-hover:text-accent transition-colors">
              {kpi.value}
            </div>
            {kpi.trend && (
              <div className="flex items-center gap-1 text-xs">
                {kpi.trend === 'up' && <ArrowUp className="w-3 h-3 text-success" />}
                {kpi.trend === 'down' && <ArrowDown className="w-3 h-3 text-danger" />}
                {kpi.trend === 'neutral' && <Minus className="w-3 h-3 text-muted-foreground" />}
                <span className="text-muted-foreground">{kpi.trendValue}</span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
