'use client';

import { ChartProvider } from '@/components/charts/ChartProvider';
import { MetricCard } from './MetricCard';
import { LeaderboardGrid } from './LeaderboardGrid';
import { ChartSection } from './ChartSection';
import { DimensionBarChart } from '@/components/charts/DimensionBarChart';
import { ResponseDonutChart } from '@/components/charts/ResponseDonutChart';
import { ENPSGauge } from '@/components/charts/ENPSGauge';
import { HorizontalBarRanking } from '@/components/charts/HorizontalBarRanking';
import { FadeIn } from '@/components/motion/FadeIn';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DIMENSION_COLORS } from '@/lib/chart-colors';
import { ErrorBoundary } from './ErrorBoundary';

interface DashboardData {
  eesScore: number;
  eesTrend: number;
  gptwScore: number;
  responseRate: number;
  totalResponses: number;
  dimensions: { dimension: string; score: number }[];
  sentiment: { positive: number; neutral: number; negative: number };
  enps: { score: number; promoters: number; passives: number; detractors: number };
  strengths: { label: string; score: number }[];
  opportunities: { label: string; score: number }[];
  leaderboard: { label: string; value: number; color: string }[];
}

export function DashboardCharts({ data }: { data: DashboardData }) {
  return (
    <ChartProvider>
      <div className="space-y-10">

        {/* Hero metrics — Optimus-style large numbers with inline labels */}
        <FadeIn>
          <div className="flex flex-wrap gap-x-10 gap-y-6 md:gap-x-14">
            <MetricCard label="Employee Engagement" value={data.eesScore} trend={{ value: data.eesTrend, label: 'vs last year' }} />
            <MetricCard label="Great Place to Work" value={data.gptwScore} accent={DIMENSION_COLORS.Camaraderie} />
            <MetricCard label="Response Rate" value={data.responseRate} accent={DIMENSION_COLORS.Fairness} />
            <MetricCard label="Responses" value={data.totalResponses} suffix="" />
          </div>
        </FadeIn>

        {/* Leaderboard — Optimus scrolling marquee ticker */}
        <LeaderboardGrid metrics={data.leaderboard} />

        {/* Dimensions — asymmetric 2:1 grid */}
        <FadeIn delay={0.15}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <ErrorBoundary>
                <ChartSection title="Key Dimensions" description="% favorable by GPTW dimension">
                  <DimensionBarChart data={data.dimensions} />
                </ChartSection>
              </ErrorBoundary>
            </div>
            <div className="lg:col-span-2">
              <ErrorBoundary>
                <ChartSection title="Sentiment" description="Response distribution">
                  <ResponseDonutChart {...data.sentiment} />
                </ChartSection>
              </ErrorBoundary>
            </div>
          </div>
        </FadeIn>

        {/* ENPS + Rankings — different layout ratio */}
        <FadeIn delay={0.2}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <ErrorBoundary>
                <ChartSection title="Net Promoter Score" description="Employee NPS">
                  <ENPSGauge {...data.enps} />
                </ChartSection>
              </ErrorBoundary>
            </div>
            <div className="lg:col-span-3">
              <ErrorBoundary>
                <Tabs defaultValue="strengths">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">Statement Rankings</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Highest and lowest scoring statements</p>
                    </div>
                    <TabsList className="h-8 bg-muted/50">
                      <TabsTrigger value="strengths" className="text-xs px-3 h-7">Strengths</TabsTrigger>
                      <TabsTrigger value="opportunities" className="text-xs px-3 h-7">Opportunities</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="strengths" className="mt-0">
                    <HorizontalBarRanking items={data.strengths} baseHue={155} />
                  </TabsContent>
                  <TabsContent value="opportunities" className="mt-0">
                    <HorizontalBarRanking items={data.opportunities} baseHue={0} />
                  </TabsContent>
                </Tabs>
              </ErrorBoundary>
            </div>
          </div>
        </FadeIn>
      </div>
    </ChartProvider>
  );
}
