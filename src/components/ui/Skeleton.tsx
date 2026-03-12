interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="mx-auto max-w-6xl pb-20 md:pb-0">
      <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-200 to-slate-300 p-6 md:p-10">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
          <div className="w-full flex-1">
            <Skeleton className="mb-2 h-5 w-32" />
            <Skeleton className="mb-2 h-12 w-48" />
            <div className="flex flex-col gap-2 md:flex-row md:gap-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
          <div className="w-full rounded-xl bg-white/20 p-4 md:w-auto md:min-w-[200px]">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <Skeleton className="mb-4 h-5 w-32" />
            <Skeleton className="mb-2 h-8 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const ConversationListSkeleton = () => (
  <div className="space-y-2 p-2">
    {Array.from({ length: 6 }, (_, i) => (
      <div key={`conversation-skeleton-${i}`} className="flex flex-col gap-2 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    ))}
  </div>
);

export const GoalsDashboardSkeleton = () => (
  <div className="mt-8">
    <div className="mb-4 flex items-center gap-2">
      <Skeleton className="h-5 w-5 rounded" />
      <Skeleton className="h-5 w-48" />
    </div>
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_-3px_rgba(0,51,102,0.1)]">
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
      <div className="divide-y divide-slate-50 px-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex gap-4 py-4">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ChatMessagesSkeleton = () => (
  <div className="flex flex-1 flex-col gap-0">
    <div className="mx-auto flex w-full max-w-3xl items-end gap-2 px-4 pb-2 pt-4">
      <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
      <Skeleton className="h-14 w-64 rounded-2xl rounded-bl-sm" />
    </div>
    <div className="mx-auto flex w-full max-w-3xl justify-end px-4 pb-2 pt-4">
      <div className="flex max-w-[80%] items-end gap-2">
        <Skeleton className="h-12 w-48 rounded-2xl rounded-br-sm" />
        <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
      </div>
    </div>
    <div className="mx-auto flex w-full max-w-3xl items-end gap-2 px-4 pb-2 pt-4">
      <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
      <Skeleton className="h-20 w-72 rounded-2xl rounded-bl-sm" />
    </div>
    <div className="mx-auto flex w-full max-w-3xl justify-end px-4 pb-2 pt-4">
      <div className="flex max-w-[80%] items-end gap-2">
        <Skeleton className="h-10 w-40 rounded-2xl rounded-br-sm" />
        <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
      </div>
    </div>
  </div>
);
