// Permission types for the admin UI
export interface Permission {
  id: string
  slug: string
  name: string
  description: string
  resource: string
  action: string
  category: string
  is_system: boolean
  created_at: string
}

export interface Role {
  id: string
  name: string
  slug: string
  description: string | null
  level: number
  is_system: boolean
  created_at: string
}

export interface RolePermission {
  id: string
  role_id: string
  permission_id: string
  created_at: string
  permission?: Permission
  role?: Role
}

export interface UserRole {
  id: string
  user_id: string
  role_id: string
  organization_id: string
  scope_type: string | null
  scope_id: string | null
  valid_from: string
  valid_until: string | null
  created_at: string
  role?: Role
}

export interface ResourcePermission {
  id: string
  permission_id: string
  permission_slug: string
  scope_type: 'user' | 'role' | 'organization' | 'public'
  scope_id: string
  scope_name?: string
  resource_type?: string
  resource_id?: string
  granted_by: string
  expires_at?: string
  created_at: string
}

export interface PermissionOverride {
  id: string
  user_id: string
  user_email?: string
  permission_id: string
  permission_slug: string
  override_type: 'grant' | 'deny' | 'elevate'
  approval_status: 'pending' | 'approved' | 'rejected'
  resource_type?: string
  resource_id?: string
  reason: string
  requested_by: string
  requested_by_email?: string
  approved_by?: string
  approved_at?: string
  expires_at?: string
  created_at: string
}

export interface PermissionMatrixRow {
  permission: Permission
  roles: Record<string, boolean> // role_id -> has permission
}

export interface UserWithRoles {
  id: string
  email: string
  full_name: string | null
  organization_id: string | null
  roles: UserRole[]
  permissions: string[] // permission slugs
  effective_permissions: Permission[]
}

// Permission categories from migration 020
export type PermissionCategory =
  | 'ai'
  | 'embeddings'
  | 'courses'
  | 'cases'
  | 'gamification'
  | 'organization'
  | 'analytics'
  | 'audit'
  | 'users'
  | 'roles'
  | 'social'
  | 'admin'
  | 'compliance'
  | 'billing'
  | 'system'

export const PERMISSION_CATEGORIES: Record<
  PermissionCategory,
  { label: string; description: string; icon: string }
> = {
  ai: {
    label: 'AI & Machine Learning',
    description: 'AI chat, coaching, training, and automation',
    icon: '🤖',
  },
  embeddings: {
    label: 'Semantic Search',
    description: 'Vector embeddings and semantic search',
    icon: '🔍',
  },
  courses: {
    label: 'Courses & Learning',
    description: 'Course content, lessons, quizzes, and certificates',
    icon: '📚',
  },
  cases: {
    label: 'Case Law',
    description: 'Tribunal cases database and search',
    icon: '⚖️',
  },
  gamification: {
    label: 'Gamification',
    description: 'Points, achievements, leaderboards, and social features',
    icon: '🏆',
  },
  organization: {
    label: 'Organization',
    description: 'Organization settings, teams, and subscriptions',
    icon: '🏢',
  },
  analytics: {
    label: 'Analytics',
    description: 'Usage analytics and reporting',
    icon: '📊',
  },
  audit: {
    label: 'Audit & Compliance',
    description: 'Audit logs, compliance reports, and security',
    icon: '📋',
  },
  users: {
    label: 'User Management',
    description: 'User accounts, profiles, and invitations',
    icon: '👥',
  },
  roles: {
    label: 'Roles & Permissions',
    description: 'Role management and permission assignment',
    icon: '🔐',
  },
  social: {
    label: 'Social Features',
    description: 'Study groups, follows, peer reviews',
    icon: '💬',
  },
  admin: {
    label: 'Administration',
    description: 'Platform administration and configuration',
    icon: '⚙️',
  },
  compliance: {
    label: 'Compliance',
    description: 'Data compliance, privacy, and regulations',
    icon: '✓',
  },
  billing: {
    label: 'Billing',
    description: 'Subscription billing and payment management',
    icon: '💳',
  },
  system: {
    label: 'System',
    description: 'System-level operations and maintenance',
    icon: '🔧',
  },
}

// Helper to get category from permission slug
export function getPermissionCategory(permission: Permission): PermissionCategory {
  const resource = permission.resource.toLowerCase()

  if (resource === 'ai') return 'ai'
  if (resource === 'embeddings') return 'embeddings'
  if (['courses', 'lessons', 'quizzes', 'certificates', 'ce_credits'].includes(resource))
    return 'courses'
  if (resource === 'cases') return 'cases'
  if (['gamification', 'achievements', 'leaderboards', 'points'].includes(resource))
    return 'gamification'
  if (['organization', 'subscriptions', 'teams'].includes(resource)) return 'organization'
  if (resource === 'analytics') return 'analytics'
  if (['audit_logs', 'compliance'].includes(resource)) return 'audit'
  if (['users', 'profiles'].includes(resource)) return 'users'
  if (resource === 'roles') return 'roles'
  if (resource === 'social') return 'social'
  if (resource === 'admin') return 'admin'
  if (resource === 'billing') return 'billing'

  return 'system'
}

// Helper to group permissions by category
export function groupPermissionsByCategory(
  permissions: Permission[]
): Record<PermissionCategory, Permission[]> {
  const grouped = {} as Record<PermissionCategory, Permission[]>

  // Initialize all categories
  Object.keys(PERMISSION_CATEGORIES).forEach((cat) => {
    grouped[cat as PermissionCategory] = []
  })

  // Group permissions
  permissions.forEach((permission) => {
    const category = getPermissionCategory(permission)
    grouped[category].push(permission)
  })

  return grouped
}

// Role level configuration (from migration 001)
export const ROLE_LEVELS = {
  guest: 0,
  learner: 10,
  instructor: 20,
  analyst: 30,
  manager: 40,
  org_admin: 50,
  super_admin: 60,
  system: 70,
} as const

export type RoleLevel = keyof typeof ROLE_LEVELS

// Helper to check if user can assign role
export function canAssignRole(userLevel: number, targetLevel: number): boolean {
  // Must be at least one level higher to assign
  return userLevel > targetLevel
}
