'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { DIMENSION_COLORS, type DimensionName } from '@/lib/chart-colors';

const chartConfig = {
  score: { label: 'Favorable' },
  Credibility: { label: 'Credibility', color: DIMENSION_COLORS.Credibility },
  Respect: { label: 'Respect', color: DIMENSION_COLORS.Respect },
  Fairness: { label: 'Fairness', color: DIMENSION_COLORS.Fairness },
  Pride: { label: 'Pride', color: DIMENSION_COLORS.Pride },
  Camaraderie: { label: 'Camaraderie', color: DIMENSION_COLORS.Camaraderie },
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
        <BarChart data={chartData} accessibilityLayer>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="dimension" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}% favorable`} />} />
          <Bar dataKey="score" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
