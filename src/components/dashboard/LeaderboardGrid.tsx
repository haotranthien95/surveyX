'use client';

import { Card } from '@/components/ui/card';

interface LeaderboardMetric {
  label: string;
  value: number;
  color: string;
}

interface LeaderboardGridProps {
  metrics: LeaderboardMetric[];
}

export function LeaderboardGrid({ metrics }: LeaderboardGridProps) {
  return (
    <Card className="p-5 border-gray-100">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-4">
        Leaderboard
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-6 gap-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{metric.label}</span>
              <span className="text-xs font-semibold tabular-nums" style={{ color: metric.color }}>
                {metric.value}%
              </span>
            </div>
            {/* Custom progress bar matching dimension colors */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${metric.value}%`, backgroundColor: metric.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
