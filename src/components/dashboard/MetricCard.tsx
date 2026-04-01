'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number;
  suffix?: string;
  trend?: { value: number; label: string };
  accent?: string;
}

// Integrated metric design — label and value as cohesive unit (not hero layout)
export function MetricCard({ label, value, suffix = '%', trend, accent }: MetricCardProps) {
  return (
    <div className="flex items-baseline gap-2 py-3">
      <span
        className="text-xl font-semibold tabular-nums tracking-tight"
        style={accent ? { color: accent } : undefined}
      >
        {value.toLocaleString()}{suffix}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
      {trend && (
        <span className={`inline-flex items-center gap-0.5 text-xs ml-auto ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend.value >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend.value)}%
        </span>
      )}
    </div>
  );
}
