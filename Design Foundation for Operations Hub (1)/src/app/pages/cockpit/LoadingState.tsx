import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';

export const CockpitLoadingState = () => {
  return (
    <div className="p-8 space-y-6">
      {/* KPI Tiles Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-24" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Work Loading */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="flex gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-9 w-20" />
              ))}
            </div>
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-xl">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column Loading */}
        <div className="space-y-6">
          {/* AI Inbox Loading */}
          <Card className="p-4">
            <Skeleton className="h-5 w-24 mb-4" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-3 border rounded-xl">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4 mb-2" />
                  <Skeleton className="h-7 w-full" />
                </div>
              ))}
            </div>
          </Card>

          {/* Calendar Loading */}
          <Card className="p-4">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-3 border rounded-xl">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Capture Loading */}
          <Card className="p-4">
            <Skeleton className="h-5 w-28 mb-3" />
            <Skeleton className="h-10 w-full mb-3" />
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
