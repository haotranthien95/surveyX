'use client';

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
  // Duplicate for seamless infinite loop
  const items = [...metrics, ...metrics];

  return (
    <div className="py-4 border-y border-border" role="list" aria-label="Performance marquee">
      <div className="marquee-strip">
        <div className="marquee-content">
          {items.map((metric, i) => {
            const zone = getPerformanceZone(metric.value);
            return (
              <div
                key={`${metric.label}-${i}`}
                role="listitem"
                className="flex items-center gap-2.5 px-6 whitespace-nowrap"
              >
                {/* Zone dot */}
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: zone.color }} />
                {/* Score */}
                <span className="text-lg font-semibold tabular-nums tracking-tight" style={{ color: zone.color }}>
                  {metric.value}%
                </span>
                {/* Label */}
                <span className="text-xs text-muted-foreground">{metric.label}</span>
                {/* Zone micro-badge */}
                <span
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                  style={{ color: zone.color, backgroundColor: zone.bgColor }}
                >
                  {zone.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
