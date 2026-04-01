'use client';

import { Pie, PieChart, Cell, Label } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { SENTIMENT_COLORS } from '@/lib/chart-colors';

const chartConfig = {
  positive: { label: 'Positive', color: SENTIMENT_COLORS.positive },
  neutral: { label: 'Neutral', color: SENTIMENT_COLORS.neutral },
  negative: { label: 'Negative', color: SENTIMENT_COLORS.negative },
} satisfies ChartConfig;

interface ResponseDonutChartProps {
  positive: number;
  neutral: number;
  negative: number;
}

export function ResponseDonutChart({ positive, neutral, negative }: ResponseDonutChartProps) {
  const data = [
    { name: 'Positive', value: positive, fill: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: neutral, fill: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: negative, fill: SENTIMENT_COLORS.negative },
  ];

  return (
    <div role="img" aria-label={`Donut chart: ${positive}% positive, ${neutral}% neutral, ${negative}% negative`}>
      <ChartContainer config={chartConfig} className="h-[280px] w-full">
        <PieChart accessibilityLayer>
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="65%" outerRadius="90%" strokeWidth={2} stroke="hsl(var(--background))">
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 8} className="fill-foreground text-2xl font-semibold tabular-nums">
                        {positive}%
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 14} className="fill-muted-foreground text-xs">
                        Positive
                      </tspan>
                    </text>
                  );
                }
                return null;
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}
