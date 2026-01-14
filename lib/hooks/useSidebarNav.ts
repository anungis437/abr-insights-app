import { useMemo } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { usePermissions } from './usePermissions'
import { sidebarConfig, SidebarNavItem } from '@/lib/navigation/sidebarConfig'
import { filterNavByPermissions } from '@/lib/navigation/navPermissions'

/**
 * Hook to get filtered sidebar navigation based on user role and permissions
 * 
 * @example
 * ```tsx
 * function Sidebar() {
 *   const { navigation, isLoading } = useSidebarNav()
 *   
 *   if (isLoading) return <SidebarSkeleton />
 *   
 *   return (
 *     <nav>
 *       {navigation.map(item => (
 *         <NavItem key={item.label} item={item} />
 *       ))}
 *     </nav>
 *   )
 * }
 * ```
 */
export function useSidebarNav() {
  const { profile } = useAuth()
  const { permissions, isLoading: permissionsLoading } = usePermissions()
  
  const navigation = useMemo(() => {
    // No profile or still loading
    if (!profile || permissionsLoading) {
      return []
    }
    
    // Get base navigation for user's role
    const roleNav = sidebarConfig[profile.role]
    if (!roleNav) {
      console.warn(`No navigation config found for role: ${profile.role}`)
      return []
    }
    
    // Convert permissions array to Set for efficient lookup
    const permissionSet = new Set(permissions.map(p => p.name))
    
    // Filter navigation based on permissions
    return filterNavByPermissions(roleNav, permissionSet)
  }, [profile, permissions, permissionsLoading])
  
  return {
    navigation,
    isLoading: !profile || permissionsLoading,
    role: profile?.role || null
  }
}

/**
 * Hook to check if user has access to a specific navigation item
 * 
 * @example
 * ```tsx
 * const hasAccess = useNavItemAccess('User Management')
 * 
 * if (!hasAccess) return null
 * 
 * return <Link href="/admin/users">User Management</Link>
 * ```
 */
export function useNavItemAccess(itemLabel: string): boolean {
  const { permissions } = usePermissions()
  const { navPermissions } = require('@/lib/navigation/navPermissions')
  
  const requiredPerms = navPermissions[itemLabel]
  
  // No permissions required - accessible to all
  if (!requiredPerms) return true
  
  const permissionSet = new Set(permissions.map(p => p.name))
  
  // Single permission check
  if (typeof requiredPerms === 'string') {
    return permissionSet.has(requiredPerms)
  }
  
  // Multiple permissions - user needs ANY of them
  if (Array.isArray(requiredPerms)) {
    return requiredPerms.some(perm => permissionSet.has(perm))
  }
  
  return false
}
