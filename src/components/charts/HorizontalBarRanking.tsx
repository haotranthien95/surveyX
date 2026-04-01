'use client';

import { getRankingGradient } from '@/lib/chart-colors';

interface RankingItem {
  label: string;
  score: number;
}

interface HorizontalBarRankingProps {
  items: RankingItem[];
  baseHue?: number; // 155=green for strengths, 0=red for opportunities
}

// Custom pure-CSS ranking chart — better control than Recharts for this pattern
export function HorizontalBarRanking({ items, baseHue = 155 }: HorizontalBarRankingProps) {
  const max = Math.max(...items.map((i) => i.score), 100);

  return (
    <div
      role="img"
      aria-label={`Ranking: ${items.map(i => `${i.label} ${i.score}%`).join(', ')}`}
      className="space-y-2.5"
    >
      {items.map((item, i) => (
        <div key={item.label} className="group flex items-center gap-3">
          {/* Rank number */}
          <span className="text-[11px] tabular-nums text-muted-foreground/50 w-4 text-right shrink-0">
            {i + 1}
          </span>

          {/* Label + bar */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] text-foreground/80 truncate pr-2" title={item.label}>
                {item.label}
              </span>
              <span className="text-[12px] font-medium tabular-nums shrink-0" style={{ color: getRankingGradient(i, items.length, baseHue) }}>
                {item.score}%
              </span>
            </div>
            <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${(item.score / max) * 100}%`,
                  backgroundColor: getRankingGradient(i, items.length, baseHue),
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
