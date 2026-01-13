'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';

export interface PermissionHookResult {
  permissions: string[];
  loading: boolean;
  error: Error | null;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing user permissions with caching and real-time updates
 * 
 * @example
 * ```tsx
 * const { hasPermission, loading } = usePermissions();
 * 
 * if (loading) return <Skeleton />;
 * 
 * return (
 *   <div>
 *     {hasPermission('courses.create') && <CreateButton />}
 *     {hasPermission('courses.delete') && <DeleteButton />}
 *   </div>
 * );
 * ```
 */
export function usePermissions(): PermissionHookResult {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPermissions = useCallback(async () => {
    if (!user?.id) {
      setPermissions(new Set());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      // Load user's direct permissions
      const { data: userPerms, error: userPermsError } = await supabase
        .from('user_permissions')
        .select(`
          permissions (
            name
          )
        `)
        .eq('user_id', user.id);

      if (userPermsError) throw userPermsError;

      // Load permissions from user's roles
      const { data: rolePerms, error: rolePermsError } = await supabase
        .from('user_roles')
        .select(`
          roles (
            role_permissions (
              permissions (
                name
              )
            )
          )
        `)
        .eq('user_id', user.id);

      if (rolePermsError) throw rolePermsError;

      // Combine all permissions into a Set for fast lookup
      const allPermissions = new Set<string>();

      // Add direct permissions
      userPerms?.forEach((up: any) => {
        if (up.permissions?.name) {
          allPermissions.add(up.permissions.name);
        }
      });

      // Add role permissions
      rolePerms?.forEach((ur: any) => {
        ur.roles?.role_permissions?.forEach((rp: any) => {
          if (rp.permissions?.name) {
            allPermissions.add(rp.permissions.name);
          }
        });
      });

      setPermissions(allPermissions);
    } catch (err) {
      console.error('Error loading permissions:', err);
      setError(err instanceof Error ? err : new Error('Failed to load permissions'));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return permissions.has(permission);
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (perms: string[]): boolean => {
      return perms.some((p) => permissions.has(p));
    },
    [permissions]
  );

  const hasAllPermissions = useCallback(
    (perms: string[]): boolean => {
      return perms.every((p) => permissions.has(p));
    },
    [permissions]
  );

  return {
    permissions: Array.from(permissions),
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refresh: loadPermissions,
  };
}

/**
 * Simple hook for checking a single permission
 * 
 * @example
 * ```tsx
 * const { allowed, loading } = usePermissionCheck('courses.create');
 * 
 * if (loading) return <Skeleton />;
 * if (!allowed) return null;
 * 
 * return <CreateButton />;
 * ```
 */
export function usePermissionCheck(permission: string) {
  const { hasPermission, loading, error } = usePermissions();

  return {
    allowed: hasPermission(permission),
    loading,
    error,
  };
}

/**
 * Hook for checking multiple permissions with OR logic
 * 
 * @example
 * ```tsx
 * const { allowed, loading } = useAnyPermissionCheck([
 *   'courses.update',
 *   'courses.manage'
 * ]);
 * ```
 */
export function useAnyPermissionCheck(permissions: string[]) {
  const { hasAnyPermission, loading, error } = usePermissions();

  return {
    allowed: hasAnyPermission(permissions),
    loading,
    error,
  };
}

/**
 * Hook for checking multiple permissions with AND logic
 * 
 * @example
 * ```tsx
 * const { allowed, loading } = useAllPermissionsCheck([
 *   'courses.view',
 *   'courses.create'
 * ]);
 * ```
 */
export function useAllPermissionsCheck(permissions: string[]) {
  const { hasAllPermissions, loading, error } = usePermissions();

  return {
    allowed: hasAllPermissions(permissions),
    loading,
    error,
  };
}
