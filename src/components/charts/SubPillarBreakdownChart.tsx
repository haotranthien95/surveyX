'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { DIMENSION_COLORS, type DimensionName } from '@/lib/chart-colors';
import { getPerformanceZone } from '@/lib/performance-zones';
import type { SubPillarScore } from '@/lib/types/analytics';

const chartConfig = {
  score: { label: 'Favorable' },
} satisfies ChartConfig;

interface SubPillarBreakdownChartProps {
  data: SubPillarScore[];
}

function SubPillarTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: SubPillarScore }> }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  const zone = getPerformanceZone(item.score);
  return (
    <div className="rounded-lg border bg-background px-3 py-2.5 shadow-md text-xs space-y-1">
      <p className="font-medium text-foreground">{item.subPillar}</p>
      <p className="text-muted-foreground text-[10px]">{item.dimension}</p>
      <div className="flex items-center gap-1.5">
        <span className="font-semibold tabular-nums">{item.score}%</span>
        <span style={{ color: zone.color }}>{zone.label}</span>
      </div>
      <p className="text-muted-foreground">{item.questionCount} statement{item.questionCount !== 1 ? 's' : ''}</p>
    </div>
  );
}

const DIMENSION_ORDER = ['Camaraderie', 'Credibility', 'Fairness', 'Pride', 'Respect'];

export function SubPillarBreakdownChart({ data }: SubPillarBreakdownChartProps) {
  const [openDimensions, setOpenDimensions] = useState<Set<string>>(new Set(DIMENSION_ORDER));

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No sub-pillar data available.
      </p>
    );
  }

  // Group by dimension in defined order
  const grouped: Record<string, SubPillarScore[]> = {};
  for (const dim of DIMENSION_ORDER) {
    const items = data.filter(d => d.dimension === dim);
    if (items.length > 0) grouped[dim] = items;
  }

  const toggle = (dim: string) => {
    setOpenDimensions(prev => {
      const next = new Set(prev);
      if (next.has(dim)) next.delete(dim);
      else next.add(dim);
      return next;
    });
  };

  return (
    <div
      role="img"
      aria-label={`Sub-pillar breakdown: ${data.map(d => `${d.dimension} ${d.subPillar} ${d.score}%`).join(', ')}`}
      className="space-y-4"
    >
      {Object.entries(grouped).map(([dim, items]) => {
        const dimColor = DIMENSION_COLORS[dim as DimensionName] ?? 'hsl(220 70% 55%)';
        const isOpen = openDimensions.has(dim);
        const avgScore = Math.round(items.reduce((a, b) => a + b.score, 0) / items.length);
        const zone = getPerformanceZone(avgScore);

        const chartData = items.map(item => ({
          ...item,
          fill: dimColor,
        }));

        return (
          <div key={dim} className="border border-border/50 rounded-lg overflow-hidden">
            {/* Collapsible header */}
            <button
              type="button"
              onClick={() => toggle(dim)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
              aria-expanded={isOpen}
              aria-controls={`subpillar-${dim}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dimColor }} />
                <span className="text-sm font-medium text-foreground">{dim}</span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                  style={{ backgroundColor: zone.bgColor, color: zone.color }}
                >
                  {avgScore}% avg
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Chart panel */}
            {isOpen && (
              <div id={`subpillar-${dim}`} className="px-4 pb-4">
                <ChartContainer config={chartConfig} className="h-[140px] w-full">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 4, right: 48, bottom: 4, left: 8 }}
                    barGap={6}
                  >
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                      fontSize={10}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="subPillar"
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      width={90}
                    />
                    <ChartTooltip content={<SubPillarTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={28}>
                      {chartData.map((entry, idx) => {
                        const zone = getPerformanceZone(entry.score);
                        return <Cell key={idx} fill={zone.color} />;
                      })}
                      <LabelList
                        dataKey="score"
                        position="right"
                        formatter={(v: unknown) => `${v}%`}
                        className="fill-foreground text-[10px] font-medium"
                        offset={4}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
