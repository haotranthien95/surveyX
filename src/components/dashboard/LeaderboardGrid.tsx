import { getPerformanceZone } from '@/lib/performance-zones';

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
    <div className="py-3 border-y border-border" role="list" aria-label="Performance metrics">
      <div className="flex flex-wrap">
        {metrics.map((metric) => {
          const zone = getPerformanceZone(metric.value);
          return (
            <div
              key={metric.label}
              role="listitem"
              className="flex items-baseline gap-1.5 px-5 py-1 whitespace-nowrap"
            >
              <span
                className="text-sm font-semibold tabular-nums"
                style={{ color: zone.color }}
              >
                {metric.value}%
              </span>
              <span className="text-[11px] text-muted-foreground">{metric.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
