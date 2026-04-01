import { Skeleton } from '@/components/ui/skeleton';

export function SurveyListSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>

      {/* Survey items */}
      <div className="divide-y divide-border">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-4 py-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-10 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
