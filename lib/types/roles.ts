/**
 * Role Configuration and Metadata
 * 
 * This file defines role types, metadata, and access patterns
 * for the ABR Insights application.
 */

export type UserRole =
  | 'super_admin'
  | 'compliance_officer'
  | 'org_admin'
  | 'analyst'
  | 'investigator'
  | 'educator'
  | 'learner'
  | 'viewer'
  | 'guest'

export interface RoleMetadata {
  slug: UserRole
  name: string
  description: string
  level: number
  /** If true, role cannot be selected during public signup */
  isInternal: boolean
  /** If true, role cannot be deleted from system */
  isSystem: boolean
  /** Default landing page after login */
  defaultLandingPage: string
  /** Icon identifier for UI display */
  icon?: string
}

/**
 * Comprehensive role configuration
 * 
 * Internal Roles (isInternal: true):
 * - super_admin: Platform administration
 * - compliance_officer: Legal/compliance oversight
 * - investigator: Internal case investigation (NOT for public subscription)
 * - analyst: Internal data analysis (NOT for public subscription)
 * 
 * Public Roles (isInternal: false):
 * - org_admin: Organization administrators (available via subscription)
 * - educator: Course creators (available via subscription)
 * - learner: Default end-user role
 * - viewer: Read-only access
 * - guest: Temporary/unauthenticated access
 */
export const ROLE_CONFIG: Record<UserRole, RoleMetadata> = {
  super_admin: {
    slug: 'super_admin',
    name: 'Super Admin',
    description: 'Full platform access and system configuration',
    level: 60,
    isInternal: true,
    isSystem: true,
    defaultLandingPage: '/admin/dashboard',
    icon: 'Shield',
  },
  compliance_officer: {
    slug: 'compliance_officer',
    name: 'Compliance Officer',
    description: 'Legal and compliance oversight',
    level: 50,
    isInternal: true,
    isSystem: true,
    defaultLandingPage: '/admin/compliance',
    icon: 'FileText',
  },
  org_admin: {
    slug: 'org_admin',
    name: 'Organization Admin',
    description: 'Organization management and team administration',
    level: 50,
    isInternal: false, // Available via subscription
    isSystem: false,
    defaultLandingPage: '/org/dashboard',
    icon: 'Building2',
  },
  analyst: {
    slug: 'analyst',
    name: 'Analyst',
    description: 'Internal data analysis and reporting (staff only)',
    level: 30,
    isInternal: true, // NOT available for public subscription
    isSystem: false,
    defaultLandingPage: '/analytics',
    icon: 'BarChart3',
  },
  investigator: {
    slug: 'investigator',
    name: 'Investigator',
    description: 'Internal case investigation and research (staff only)',
    level: 30,
    isInternal: true, // NOT available for public subscription
    isSystem: false,
    defaultLandingPage: '/analytics',
    icon: 'Search',
  },
  educator: {
    slug: 'educator',
    name: 'Educator',
    description: 'Course creation and content management',
    level: 20,
    isInternal: false, // Available via subscription
    isSystem: false,
    defaultLandingPage: '/instructor/dashboard',
    icon: 'GraduationCap',
  },
  learner: {
    slug: 'learner',
    name: 'Learner',
    description: 'Course enrollment and learning activities',
    level: 10,
    isInternal: false, // Default public role
    isSystem: false,
    defaultLandingPage: '/', // Homepage with course catalog
    icon: 'BookOpen',
  },
  viewer: {
    slug: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to content',
    level: 5,
    isInternal: false,
    isSystem: false,
    defaultLandingPage: '/dashboard',
    icon: 'Eye',
  },
  guest: {
    slug: 'guest',
    name: 'Guest',
    description: 'Temporary access to public content',
    level: 0,
    isInternal: false,
    isSystem: false,
    defaultLandingPage: '/',
    icon: 'User',
  },
}

/**
 * Get roles available for public selection (signup, pricing, etc.)
 */
export function getPublicRoles(): RoleMetadata[] {
  return Object.values(ROLE_CONFIG).filter((role) => !role.isInternal)
}

/**
 * Get roles available for subscription assignment
 * (excludes internal staff roles)
 */
export function getSubscriptionRoles(): RoleMetadata[] {
  return Object.values(ROLE_CONFIG).filter(
    (role) => !role.isInternal && role.slug !== 'guest' && role.slug !== 'viewer'
  )
}

/**
 * Get all internal staff roles
 */
export function getInternalRoles(): RoleMetadata[] {
  return Object.values(ROLE_CONFIG).filter((role) => role.isInternal)
}

/**
 * Check if a role is internal-only
 */
export function isInternalRole(role: UserRole): boolean {
  return ROLE_CONFIG[role]?.isInternal ?? false
}

/**
 * Get default landing page for a role
 */
export function getDefaultLandingPage(role: UserRole | null): string {
  if (!role) return '/dashboard'
  return ROLE_CONFIG[role]?.defaultLandingPage ?? '/dashboard'
}

/**
 * Check if a role can be assigned via subscription
 */
export function canAssignViaSubscription(role: UserRole): boolean {
  const config = ROLE_CONFIG[role]
  return !config.isInternal && config.slug !== 'guest'
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  return ROLE_CONFIG[role]?.name ?? role
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  return ROLE_CONFIG[role]?.description ?? ''
}
