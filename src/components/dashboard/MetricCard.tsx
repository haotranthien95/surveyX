'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  trend?: { value: number; label: string };
  color?: string;
}

export function MetricCard({ label, value, suffix = '%', trend, color = '#2563eb' }: MetricCardProps) {
  return (
    <Card className="p-4 border-gray-100 hover:shadow-sm transition-shadow duration-200 group">
      {/* Overline label per UX spec: 11px, uppercase, semibold, gray-500 */}
      <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[28px] font-semibold leading-none" style={{ color }}>
          {value}
        </span>
        {suffix && <span className="text-sm text-gray-400 font-normal">{suffix}</span>}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs mt-2 ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend.value >= 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{Math.abs(trend.value)}% {trend.label}</span>
        </div>
      )}
    </Card>
  );
}
