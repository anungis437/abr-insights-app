/**
 * Global loading UI
 * Shown during page transitions and initial page loads
 */
export default function Loading() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />

        {/* Loading text */}
        <p className="text-muted-foreground animate-pulse text-sm">Loading...</p>
      </div>
    </div>
  )
}
