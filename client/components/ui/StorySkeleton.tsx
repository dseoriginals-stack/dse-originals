import Skeleton from "./Skeleton"

export default function StorySkeleton() {
  return (
    <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] border border-[var(--border-light)] shadow-sm overflow-hidden flex flex-col shrink-0 w-[85vw] md:w-auto h-full">
      <Skeleton className="w-full aspect-square rounded-none" />
      <div className="p-8 space-y-4 flex-1 flex flex-col">
        <Skeleton variant="text" width="75%" height="24px" />
        <div className="space-y-2">
          <Skeleton variant="text" width="100%" height="12px" />
          <Skeleton variant="text" width="85%" height="12px" />
        </div>
        <div className="pt-6 flex items-center gap-3 mt-auto">
          <Skeleton variant="circular" width="32px" height="32px" />
          <div className="space-y-1">
            <Skeleton variant="text" width="80px" height="10px" />
            <Skeleton variant="text" width="48px" height="8px" />
          </div>
        </div>
      </div>
    </div>
  )
}
