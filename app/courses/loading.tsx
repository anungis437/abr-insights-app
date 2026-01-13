/**
 * Loading state for courses routes
 */
export default function CoursesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-10 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-5 w-full max-w-2xl animate-pulse rounded bg-muted" />
      </div>

      {/* Filters skeleton */}
      <div className="mb-6 flex flex-wrap gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-10 w-24 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>

      {/* Course grid skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            {/* Image skeleton */}
            <div className="h-48 animate-pulse bg-muted" />
            
            {/* Content skeleton */}
            <div className="p-6">
              <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-muted" />
              <div className="mb-4 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
              </div>
              
              {/* Meta info skeleton */}
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
