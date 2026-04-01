'use client';

import { Pie, PieChart, Cell, Label } from 'recharts';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { ENPS_COLORS } from '@/lib/chart-colors';

const chartConfig = {
  promoters: { label: 'Promoters', color: ENPS_COLORS.promoter },
  passives: { label: 'Passives', color: ENPS_COLORS.passive },
  detractors: { label: 'Detractors', color: ENPS_COLORS.detractor },
} satisfies ChartConfig;

interface ENPSGaugeProps {
  score: number;
  promoters: number;
  passives: number;
  detractors: number;
}

export function ENPSGauge({ score, promoters, passives, detractors }: ENPSGaugeProps) {
  const data = [
    { name: 'Promoters', value: promoters, fill: ENPS_COLORS.promoter },
    { name: 'Passives', value: passives, fill: ENPS_COLORS.passive },
    { name: 'Detractors', value: detractors, fill: ENPS_COLORS.detractor },
  ];

  return (
    <div role="img" aria-label={`ENPS gauge: score ${score}. ${promoters}% promoters, ${passives}% passives, ${detractors}% detractors`}>
      <ChartContainer config={chartConfig} className="h-[220px] w-full">
        <PieChart accessibilityLayer>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            startAngle={180}
            endAngle={0}
            innerRadius="70%"
            outerRadius="95%"
            strokeWidth={2}
            stroke="hsl(var(--background))"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text x={viewBox.cx} y={(viewBox.cy || 0) - 4} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 12} className="fill-foreground text-3xl font-semibold tabular-nums">
                        {score}
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 12} className="fill-muted-foreground text-xs">
                        ENPS Score
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
