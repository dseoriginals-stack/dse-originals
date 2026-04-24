import Skeleton from "./Skeleton"

export default function CheckoutSkeleton() {
  return (
    <div className="bg-[var(--bg-main)] min-h-screen pb-32">
      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        <Skeleton variant="text" width="200px" height="32px" className="mb-6" />

        {/* Steps */}
        <div className="flex items-center mb-8 px-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <Skeleton variant="circular" width="32px" height="32px" />
                <Skeleton variant="text" width="40px" height="10px" className="mt-2" />
              </div>
              {i < 3 && <Skeleton className="flex-1 h-[2px] mx-2 mb-4" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 md:gap-10">
          <div className="space-y-6">
            <div className="bg-white p-7 rounded-3xl border border-[var(--border-light)] space-y-6">
              <Skeleton variant="text" width="60%" height="24px" className="border-b border-[var(--border-light)] pb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton height="120px" className="rounded-2xl" />
                <Skeleton height="120px" className="rounded-2xl" />
              </div>
              <Skeleton height="56px" className="rounded-full mt-6" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="h-fit">
            <div className="bg-white p-7 rounded-3xl border border-[var(--border-light)] space-y-4">
              <Skeleton variant="text" width="100px" height="24px" />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton width="56px" height="56px" className="rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" width="80%" height="14px" />
                      <Skeleton variant="text" width="40%" height="12px" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <Skeleton variant="text" width="100%" height="14px" />
                <Skeleton variant="text" width="100%" height="14px" />
                <Skeleton variant="text" width="100%" height="24px" className="pt-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
