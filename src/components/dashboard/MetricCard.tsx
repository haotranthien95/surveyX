'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { CountUp } from '@/components/motion/CountUp';

interface MetricCardProps {
  label: string;
  value: number;
  suffix?: string;
  trend?: { value: number; label: string };
  accent?: string;
}

// Optimus-style: large number with inline label, not stacked cards
export function MetricCard({ label, value, suffix = '%', trend, accent }: MetricCardProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-2">
        <span
          className="text-3xl md:text-4xl font-light tracking-tight tabular-nums"
          style={accent ? { color: accent } : undefined}
        >
          <CountUp value={value} suffix={suffix} />
        </span>
        <span className="text-xs text-muted-foreground leading-tight max-w-[80px]">
          {label}
        </span>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[11px] ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend.value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{Math.abs(trend.value)}% {trend.label}</span>
        </div>
      )}
    </div>
  );
}
