'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { Skeleton } from '@/components/ui/skeleton';

interface PermissionGateProps {
  /** Permission(s) required to render children */
  permission?: string | string[];
  /** If true, requires ANY of the permissions. If false, requires ALL */
  requireAny?: boolean;
  /** Content to show while checking permissions */
  fallback?: ReactNode;
  /** Content to show when permission is denied */
  denied?: ReactNode;
  /** Children to render when permission is granted */
  children: ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 * 
 * @example
 * ```tsx
 * <PermissionGate permission="courses.create">
 *   <CreateCourseButton />
 * </PermissionGate>
 * 
 * <PermissionGate 
 *   permission={['courses.update', 'courses.manage']} 
 *   requireAny
 * >
 *   <EditButton />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  permission,
  requireAny = true,
  fallback = <Skeleton className="h-10 w-24" />,
  denied = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  if (loading) {
    return <>{fallback}</>;
  }

  // No permission specified, always show
  if (!permission) {
    return <>{children}</>;
  }

  // Single permission check
  if (typeof permission === 'string') {
    return hasPermission(permission) ? <>{children}</> : <>{denied}</>;
  }

  // Multiple permissions check
  const hasAccess = requireAny
    ? hasAnyPermission(permission)
    : hasAllPermissions(permission);

  return hasAccess ? <>{children}</> : <>{denied}</>;
}

/**
 * Component for checking permission with custom render props
 * 
 * @example
 * ```tsx
 * <PermissionCheck permission="courses.create">
 *   {({ allowed, loading }) => (
 *     loading ? <Skeleton /> : allowed ? <Button /> : <DisabledButton />
 *   )}
 * </PermissionCheck>
 * ```
 */
export function PermissionCheck({
  permission,
  requireAny = true,
  children,
}: {
  permission?: string | string[];
  requireAny?: boolean;
  children: (result: { allowed: boolean; loading: boolean }) => ReactNode;
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  if (!permission) {
    return <>{children({ allowed: true, loading: false })}</>;
  }

  const allowed =
    typeof permission === 'string'
      ? hasPermission(permission)
      : requireAny
      ? hasAnyPermission(permission)
      : hasAllPermissions(permission);

  return <>{children({ allowed, loading })}</>;
}
