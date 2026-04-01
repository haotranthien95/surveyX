import { Skeleton } from '@/components/ui/skeleton';

export function SurveyDetailSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Back link */}
      <Skeleton className="h-4 w-32" />

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-4 w-80" />
        <div className="flex gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-36 rounded-md" />
        <Skeleton className="h-10 w-40 rounded-md" />
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-muted/30 px-3 py-2 flex gap-4">
          {[40, 200, 200, 60, 80].map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: w }} />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="px-3 py-3 flex gap-4 border-t border-border">
            <Skeleton className="h-3 w-[40px]" />
            <Skeleton className="h-3 w-[200px]" />
            <Skeleton className="h-3 w-[200px]" />
            <Skeleton className="h-3 w-[60px]" />
            <Skeleton className="h-3 w-[80px]" />
          </div>
        ))}
      </div>
    </div>
  );
}
