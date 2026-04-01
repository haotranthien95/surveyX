'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { DIMENSION_COLORS, type DimensionName } from '@/lib/chart-colors';

const chartConfig = {
  score: { label: 'Favorable' },
} satisfies ChartConfig;

interface DimensionBarChartProps {
  data: { dimension: string; score: number }[];
}

export function DimensionBarChart({ data }: DimensionBarChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    fill: DIMENSION_COLORS[d.dimension as DimensionName] || DIMENSION_COLORS.Credibility,
  }));

  return (
    <div role="img" aria-label={`Bar chart: ${data.map(d => `${d.dimension} ${d.score}%`).join(', ')}`}>
      <ChartContainer config={chartConfig} className="h-[280px] w-full">
        <BarChart data={chartData} accessibilityLayer barGap={8} margin={{ top: 24, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <XAxis
            dataKey="dimension"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
            width={44}
          />
          <ChartTooltip
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
            content={<ChartTooltipContent formatter={(value) => `${value}% favorable`} />}
          />
          <Bar dataKey="score" radius={[5, 5, 0, 0]} maxBarSize={48}>
            {chartData.map((entry) => (
              <Cell key={entry.dimension} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="score"
              position="top"
              formatter={(v) => `${v}%`}
              className="fill-foreground text-xs font-medium"
              offset={6}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
