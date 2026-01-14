import { SidebarNavItem } from './sidebarConfig'

/**
 * Permission requirements for navigation items
 * Maps nav item labels to required permissions
 */
export const navPermissions: Record<string, string | string[]> = {
  // Admin Section
  'Admin Dashboard': ['admin.view', 'admin.access'],
  'User Management': ['users.view', 'users.manage'],
  'Role Management': ['roles.view', 'roles.manage'],
  'Permissions': ['permissions.view', 'permissions.manage'],
  'Organization Settings': ['organizations.update', 'organizations.manage'],
  
  // Courses Section
  'Create Course': 'courses.create',
  'Manage Courses': ['courses.update', 'courses.manage'],
  'Course Settings': 'courses.manage',
  
  // Tribunal Cases
  'Create Case': 'cases.create',
  'Manage Cases': ['cases.update', 'cases.manage'],
  'Case Analytics': ['cases.view', 'analytics.view'],
  
  // Analytics
  'Analytics': 'analytics.view',
  'Reports': ['reports.view', 'reports.generate'],
  'AI Insights': 'ai.view',
  
  // AI Features
  'AI Training': ['ai.train', 'ai.manage'],
  'ML Models': 'ai.manage',
  
  // Audit & Compliance
  'Audit Logs': 'audit.view',
  'Compliance': ['compliance.view', 'compliance.manage'],
  
  // Content Management
  'Resources': ['resources.view', 'resources.manage'],
  'Content Library': ['content.view', 'content.manage'],
}

/**
 * Filter navigation items based on user permissions
 * Removes items user doesn't have permission to access
 */
export function filterNavByPermissions(
  navItems: SidebarNavItem[],
  userPermissions: Set<string>
): SidebarNavItem[] {
  return navItems
    .map(item => {
      // Check if item has permission requirements
      const requiredPerms = navPermissions[item.label]
      
      // If no permissions defined, item is always visible
      if (!requiredPerms) {
        // Still filter children recursively
        if (item.children) {
          return {
            ...item,
            children: filterNavByPermissions(item.children, userPermissions)
          }
        }
        return item
      }
      
      // Check single permission
      if (typeof requiredPerms === 'string') {
        if (!userPermissions.has(requiredPerms)) {
          return null
        }
      }
      
      // Check multiple permissions (user needs ANY of them)
      if (Array.isArray(requiredPerms)) {
        const hasAny = requiredPerms.some(perm => userPermissions.has(perm))
        if (!hasAny) {
          return null
        }
      }
      
      // Filter children recursively
      if (item.children) {
        return {
          ...item,
          children: filterNavByPermissions(item.children, userPermissions)
        }
      }
      
      return item
    })
    .filter((item): item is SidebarNavItem => item !== null)
}

/**
 * Check if user has access to any nav item in a section
 * Used to hide entire sections if user has no access
 */
export function hasAccessToSection(
  section: SidebarNavItem,
  userPermissions: Set<string>
): boolean {
  // Check section itself
  const requiredPerms = navPermissions[section.label]
  
  if (requiredPerms) {
    if (typeof requiredPerms === 'string') {
      if (userPermissions.has(requiredPerms)) return true
    }
    if (Array.isArray(requiredPerms)) {
      if (requiredPerms.some(perm => userPermissions.has(perm))) return true
    }
  }
  
  // Check children recursively
  if (section.children) {
    return section.children.some(child => hasAccessToSection(child, userPermissions))
  }
  
  // If no permissions defined, assume accessible
  return !requiredPerms
}
