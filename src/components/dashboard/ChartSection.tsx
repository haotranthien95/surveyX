'use client';

import { Card } from '@/components/ui/card';
import { LazyChart } from '@/components/charts/LazyChart';

interface ChartSectionProps {
  title: string;
  description?: string;
  height?: number;
  children: React.ReactNode;
}

export function ChartSection({ title, description, height = 300, children }: ChartSectionProps) {
  return (
    <Card className="border-gray-100 overflow-hidden">
      {title && (
        <div className="px-5 pt-5 pb-0">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
      )}
      <div className="p-5">
        <LazyChart height={height}>
          {children}
        </LazyChart>
      </div>
    </Card>
  );
}
