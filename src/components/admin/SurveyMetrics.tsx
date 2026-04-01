'use client';

import { Pie, PieChart, Cell, Label } from 'recharts';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import type { Question } from '@/lib/types';

interface SurveyMetricsProps {
  questions: Question[];
  responseCount: number;
  tokenCount: number;
}

const QUESTION_TYPE_COLORS: Record<string, string> = {
  likert: 'hsl(220 70% 55%)',
  open_ended: 'hsl(25 75% 55%)',
  demographic: 'hsl(155 45% 45%)',
};

const RESPONSE_COLORS = {
  submitted: 'hsl(155 50% 48%)',
  pending: 'hsl(220 10% 78%)',
};

const questionConfig = {
  likert: { label: 'Likert', color: QUESTION_TYPE_COLORS.likert },
  open_ended: { label: 'Open-ended', color: QUESTION_TYPE_COLORS.open_ended },
  demographic: { label: 'Demographic', color: QUESTION_TYPE_COLORS.demographic },
} satisfies ChartConfig;

const responseConfig = {
  submitted: { label: 'Submitted', color: RESPONSE_COLORS.submitted },
  pending: { label: 'Pending', color: RESPONSE_COLORS.pending },
} satisfies ChartConfig;

export function SurveyMetrics({ questions, responseCount, tokenCount }: SurveyMetricsProps) {
  // Question type breakdown
  const likertCount = questions.filter(q => q.type === 'likert').length;
  const openEndedCount = questions.filter(q => q.type === 'open_ended').length;
  const demographicCount = questions.filter(q => q.type === 'demographic').length;

  const questionData = [
    { name: 'Likert', value: likertCount, fill: QUESTION_TYPE_COLORS.likert },
    { name: 'Open-ended', value: openEndedCount, fill: QUESTION_TYPE_COLORS.open_ended },
    { name: 'Demographic', value: demographicCount, fill: QUESTION_TYPE_COLORS.demographic },
  ].filter(d => d.value > 0);

  // Response rate
  const pendingCount = Math.max(0, tokenCount - responseCount);
  const responseRate = tokenCount > 0 ? Math.round((responseCount / tokenCount) * 100) : 0;

  const responseData = [
    { name: 'Submitted', value: responseCount, fill: RESPONSE_COLORS.submitted },
    { name: 'Pending', value: pendingCount, fill: RESPONSE_COLORS.pending },
  ].filter(d => d.value > 0);

  // Dimension breakdown from questions
  const dimensions = new Map<string, number>();
  for (const q of questions) {
    if (q.dimension) {
      dimensions.set(q.dimension, (dimensions.get(q.dimension) || 0) + 1);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Questions breakdown */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Questions</h3>
        <div className="flex items-center gap-4">
          <ChartContainer config={questionConfig} className="h-[100px] w-[100px] shrink-0">
            <PieChart>
              <Pie data={questionData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="90%" strokeWidth={2} stroke="hsl(var(--background))">
                {questionData.map(d => <Cell key={d.name} fill={d.fill} />)}
                <Label content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan className="fill-foreground text-lg font-semibold tabular-nums">{questions.length}</tspan>
                      </text>
                    );
                  }
                  return null;
                }} />
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="space-y-1">
            {questionData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="font-medium tabular-nums">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Response rate */}
      {tokenCount > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Response Rate</h3>
          <div className="flex items-center gap-4">
            <ChartContainer config={responseConfig} className="h-[100px] w-[100px] shrink-0">
              <PieChart>
                <Pie data={responseData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="90%" strokeWidth={2} stroke="hsl(var(--background))">
                  {responseData.map(d => <Cell key={d.name} fill={d.fill} />)}
                  <Label content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan className="fill-foreground text-lg font-semibold tabular-nums">{responseRate}%</tspan>
                        </text>
                      );
                    }
                    return null;
                  }} />
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: RESPONSE_COLORS.submitted }} />
                <span className="text-muted-foreground">Submitted</span>
                <span className="font-medium tabular-nums">{responseCount}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: RESPONSE_COLORS.pending }} />
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium tabular-nums">{pendingCount}</span>
              </div>
              <div className="text-[10px] text-muted-foreground/60 mt-1">
                {tokenCount} invitations sent
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dimensions */}
      {dimensions.size > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dimensions</h3>
          <div className="space-y-1.5">
            {Array.from(dimensions.entries()).map(([dim, count]) => (
              <div key={dim} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground capitalize">{dim}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 bg-muted/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground/30 rounded-full"
                      style={{ width: `${(count / questions.length) * 100}%` }}
                    />
                  </div>
                  <span className="font-medium tabular-nums w-4 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
