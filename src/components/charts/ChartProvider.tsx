'use client';

// No global registration needed — shadcn/ui charts use Recharts
export function ChartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
