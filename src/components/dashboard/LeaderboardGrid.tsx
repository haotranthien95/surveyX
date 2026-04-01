'use client';

import { FadeIn } from '@/components/motion/FadeIn';

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
    <FadeIn delay={0.2}>
      <div className="overflow-x-auto">
        <div className="flex gap-6 min-w-max py-1" role="list" aria-label="Leaderboard metrics">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex items-center gap-2" role="listitem">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: metric.color }} />
              <span className="text-sm font-medium tabular-nums" style={{ color: metric.color }}>
                {metric.value}%
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{metric.label}</span>
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}
