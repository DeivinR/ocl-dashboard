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

export const ChatMessagesSkeleton = () => (
  <div className="flex flex-1 flex-col gap-4 p-4">
    <div className="flex justify-start">
      <Skeleton className="h-16 w-64 rounded-2xl rounded-bl-md" />
    </div>
    <div className="flex justify-end">
      <Skeleton className="h-12 w-48 rounded-2xl rounded-br-md" />
    </div>
    <div className="flex justify-start">
      <Skeleton className="h-20 w-72 rounded-2xl rounded-bl-md" />
    </div>
    <div className="flex justify-end">
      <Skeleton className="h-10 w-32 rounded-2xl rounded-br-md" />
    </div>
  </div>
);
