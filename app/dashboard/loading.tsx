/**
 * Loading state for dashboard routes
 */
export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="bg-muted h-8 w-48 animate-pulse rounded" />
        <div className="bg-muted mt-2 h-4 w-96 animate-pulse rounded" />
      </div>

      {/* Stats grid skeleton */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border-border bg-card rounded-lg border p-6">
            <div className="bg-muted h-4 w-24 animate-pulse rounded" />
            <div className="bg-muted mt-2 h-8 w-16 animate-pulse rounded" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border-border bg-card rounded-lg border p-6">
            <div className="bg-muted mb-4 h-6 w-32 animate-pulse rounded" />
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div
                  key={j}
                  className="bg-muted h-4 animate-pulse rounded"
                  style={{ width: `${80 - j * 10}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
