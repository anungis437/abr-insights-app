/**
 * Loading state for admin routes
 */
export default function AdminLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with tabs skeleton */}
      <div className="mb-8">
        <div className="bg-muted h-10 w-48 animate-pulse rounded" />
        <div className="border-border mt-6 flex gap-4 border-b">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-muted h-10 w-24 animate-pulse rounded-t" />
          ))}
        </div>
      </div>

      {/* Content area skeleton */}
      <div className="border-border bg-card rounded-lg border p-6">
        {/* Toolbar skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="bg-muted h-10 w-64 animate-pulse rounded" />
          <div className="bg-muted h-10 w-32 animate-pulse rounded" />
        </div>

        {/* Table skeleton */}
        <div className="space-y-3">
          {/* Header row */}
          <div className="border-border grid grid-cols-4 gap-4 border-b pb-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-muted h-5 animate-pulse rounded" />
            ))}
          </div>

          {/* Data rows */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border-border grid grid-cols-4 gap-4 border-b py-3">
              {[...Array(4)].map((_, j) => (
                <div
                  key={j}
                  className="bg-muted h-4 animate-pulse rounded"
                  style={{ width: `${70 + Math.random() * 30}%` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
