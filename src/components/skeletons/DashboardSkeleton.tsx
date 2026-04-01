import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-10 animate-in" style={{ animationDelay: '0ms' }}>
      {/* Title */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Survey selector */}
      <Skeleton className="h-8 w-64 rounded-lg" />

      {/* Hero metrics */}
      <div className="flex flex-wrap gap-x-12 gap-y-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Marquee */}
      <div className="py-3 border-y border-border">
        <div className="flex gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} className="h-5 w-24" />
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Skeleton className="h-9 w-96 rounded-lg" />

      {/* Chart grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
        <div className="lg:col-span-2 space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-[260px] w-full rounded-lg" />
        </div>
        <div className="lg:col-span-3 space-y-3">
          <Skeleton className="h-4 w-40" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-4" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
