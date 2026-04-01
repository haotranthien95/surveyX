'use client';

import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface RankingItem {
  label: string;
  score: number;
}

interface HorizontalBarRankingProps {
  items: RankingItem[];
  color?: string;
}

const chartConfig = {
  score: { label: 'Score' },
} satisfies ChartConfig;

export function HorizontalBarRanking({ items, color = 'hsl(var(--foreground))' }: HorizontalBarRankingProps) {
  const data = items.map((item) => ({
    name: item.label.length > 45 ? item.label.slice(0, 42) + '...' : item.label,
    score: item.score,
    fill: color,
  }));

  return (
    <div role="img" aria-label={`Ranking: ${items.map(i => `${i.label} ${i.score}%`).join(', ')}`}>
      <ChartContainer config={chartConfig} className="h-[400px] w-full">
        <BarChart data={data} layout="vertical" accessibilityLayer margin={{ left: 8, right: 16 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={11} width={180} />
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}% favorable`} />} />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={16} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
