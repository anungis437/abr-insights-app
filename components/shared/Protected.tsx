'use client'

import { ReactNode } from 'react'
import { usePermissionCheck, useAnyPermission, useAllPermissions } from '@/lib/hooks/usePermissions'
import { Skeleton } from '@/components/ui/skeleton'

interface ProtectedProps {
  children: ReactNode
  permission?: string
  anyPermissions?: string[]
  allPermissions?: string[]
  fallback?: ReactNode
  loading?: ReactNode
}

/**
 * Component that conditionally renders children based on user permissions
 * 
 * @example
 * ```tsx
 * <Protected permission="courses.create">
 *   <CreateCourseButton />
 * </Protected>
 * 
 * <Protected anyPermissions={['courses.update', 'courses.manage']}>
 *   <EditCourseButton />
 * </Protected>
 * ```
 */
export function Protected({
  children,
  permission,
  anyPermissions,
  allPermissions,
  fallback = null,
  loading: loadingComponent = <Skeleton className="h-8 w-32" />,
}: ProtectedProps) {
  // Determine which hook to use based on props
  const singleCheck = usePermissionCheck(permission || '')
  const anyCheck = useAnyPermission(anyPermissions || [])
  const allCheck = useAllPermissions(allPermissions || [])

  let allowed = false
  let loading = false
  let error = null

  if (permission) {
    allowed = singleCheck.allowed
    loading = singleCheck.loading
    error = singleCheck.error
  } else if (anyPermissions) {
    allowed = anyCheck.allowed
    loading = anyCheck.loading
    error = anyCheck.error
  } else if (allPermissions) {
    allowed = allCheck.allowed
    loading = allCheck.loading
    error = allCheck.error
  }

  if (loading) {
    return <>{loadingComponent}</>
  }

  if (error) {
    console.error('[Protected] Permission check error:', error)
    return <>{fallback}</>
  }

  return allowed ? <>{children}</> : <>{fallback}</>
}

interface PermissionGateProps {
  children: (hasPermission: boolean) => ReactNode
  permission?: string
  anyPermissions?: string[]
  allPermissions?: string[]
}

/**
 * Render prop component that passes permission status to children
 * 
 * @example
 * ```tsx
 * <PermissionGate permission="courses.delete">
 *   {(canDelete) => (
 *     <Button 
 *       disabled={!canDelete}
 *       onClick={canDelete ? handleDelete : undefined}
 *     >
 *       Delete
 *     </Button>
 *   )}
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  children,
  permission,
  anyPermissions,
  allPermissions,
}: PermissionGateProps) {
  const singleCheck = usePermissionCheck(permission || '')
  const anyCheck = useAnyPermission(anyPermissions || [])
  const allCheck = useAllPermissions(allPermissions || [])

  let allowed = false
  let loading = false

  if (permission) {
    allowed = singleCheck.allowed
    loading = singleCheck.loading
  } else if (anyPermissions) {
    allowed = anyCheck.allowed
    loading = anyCheck.loading
  } else if (allPermissions) {
    allowed = allCheck.allowed
    loading = allCheck.loading
  }

  if (loading) {
    return <Skeleton className="h-8 w-32" />
  }

  return <>{children(allowed)}</>
}

/**
 * HOC to protect a component with permission checks
 * 
 * @example
 * ```tsx
 * const ProtectedButton = withPermission(
 *   Button, 
 *   { permission: 'courses.create' }
 * );
 * 
 * // Usage:
 * <ProtectedButton>Create Course</ProtectedButton>
 * ```
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  config: {
    permission?: string
    anyPermissions?: string[]
    allPermissions?: string[]
    fallback?: ReactNode
  }
) {
  return function PermissionProtectedComponent(props: P) {
    return (
      <Protected {...config}>
        <Component {...props} />
      </Protected>
    )
  }
}
