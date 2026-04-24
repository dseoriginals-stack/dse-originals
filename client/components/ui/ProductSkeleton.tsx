import Skeleton from "./Skeleton"

export default function ProductSkeleton() {
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-2xl md:rounded-3xl border border-[var(--border-light)] overflow-hidden h-full flex flex-col">
      <div className="relative aspect-[4/5] w-full">
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <Skeleton variant="text" width="40%" height="10px" />
          <Skeleton variant="text" width="80%" height="20px" />
        </div>
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <Skeleton variant="text" width="60px" height="24px" />
            <Skeleton variant="text" width="40px" height="12px" />
          </div>
          <Skeleton variant="circular" width="32px" height="32px" className="md:hidden" />
        </div>
      </div>
    </div>
  )
}
