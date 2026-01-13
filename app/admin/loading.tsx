/**
 * Loading state for admin routes
 */
export default function AdminLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with tabs skeleton */}
      <div className="mb-8">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-6 flex gap-4 border-b border-border">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-24 animate-pulse rounded-t bg-muted"
            />
          ))}
        </div>
      </div>

      {/* Content area skeleton */}
      <div className="rounded-lg border border-border bg-card p-6">
        {/* Toolbar skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="h-10 w-64 animate-pulse rounded bg-muted" />
          <div className="h-10 w-32 animate-pulse rounded bg-muted" />
        </div>

        {/* Table skeleton */}
        <div className="space-y-3">
          {/* Header row */}
          <div className="grid grid-cols-4 gap-4 border-b border-border pb-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-5 animate-pulse rounded bg-muted"
              />
            ))}
          </div>

          {/* Data rows */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-4 gap-4 py-3 border-b border-border"
            >
              {[...Array(4)].map((_, j) => (
                <div
                  key={j}
                  className="h-4 animate-pulse rounded bg-muted"
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
