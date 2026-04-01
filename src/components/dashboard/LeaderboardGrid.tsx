'use client';

interface LeaderboardMetric {
  label: string;
  value: number;
  color: string;
}

interface LeaderboardGridProps {
  metrics: LeaderboardMetric[];
}

// Optimus-style scrolling metric ticker — duplicated for seamless loop
export function LeaderboardGrid({ metrics }: LeaderboardGridProps) {
  const items = [...metrics, ...metrics]; // duplicate for seamless marquee

  return (
    <div role="list" aria-label="Leaderboard metrics" className="py-5 border-y border-border">
      <div className="marquee-strip">
        <div className="marquee-content">
          {items.map((metric, i) => (
            <div
              key={`${metric.label}-${i}`}
              role="listitem"
              className="flex items-baseline gap-2 px-6 whitespace-nowrap"
            >
              <span
                className="text-xl font-medium tabular-nums tracking-tight"
                style={{ color: metric.color }}
              >
                {metric.value}%
              </span>
              <span className="text-xs text-muted-foreground">{metric.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
