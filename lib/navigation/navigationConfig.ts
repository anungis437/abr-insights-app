import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Users,
  Settings,
  Shield,
  FileText,
  TrendingUp,
  Database,
  Cpu,
  Building2,
  GraduationCap,
  Search,
  Home,
  CreditCard,
  type LucideIcon,
} from 'lucide-react'

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

export type NavLink = {
  label: string
  href: string
  icon?: LucideIcon
  badge?: string | number
  requiresAuth?: boolean
  allowedRoles?: UserRole[]
  children?: NavLink[] // For dropdowns
  external?: boolean
  description?: string // For accessibility
}

export type NavigationConfig = {
  public: NavLink[]
  authenticated: {
    base: NavLink[] // All authenticated users get these
    byRole: Record<UserRole, NavLink[]> // Role-specific additions
  }
  userMenu: NavLink[] // Dropdown menu items
}

// Public navigation - Marketing focused
const publicNavigation: NavLink[] = [
  {
    label: 'About',
    href: '/about',
    description: 'Learn about ABR Insights',
  },
  {
    label: 'Courses',
    href: '/courses',
    icon: GraduationCap,
    description: 'Browse our course catalog',
  },
  {
    label: 'Cases',
    href: '/cases',
    icon: FileText,
    description: 'Explore our case database',
  },
  {
    label: 'Pricing',
    href: '/pricing',
    description: 'View pricing plans',
  },
  {
    label: 'Resources',
    href: '#',
    description: 'Access resources and help',
    children: [
      { label: 'Blog', href: '/blog' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Help Center', href: '/help' },
      { label: 'Contact', href: '/contact' },
    ],
  },
]

// Base navigation for all authenticated users
const authenticatedBaseNavigation: NavLink[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'View your dashboard',
  },
  {
    label: 'Learning',
    href: '#',
    icon: GraduationCap,
    description: 'Access your learning materials',
    children: [
      { label: 'My Courses', href: '/training', icon: BookOpen },
      { label: 'Browse Catalog', href: '/courses', icon: Search },
      { label: 'My Progress', href: '/dashboard', icon: TrendingUp },
    ],
  },
  {
    label: 'Cases',
    href: '#',
    icon: FileText,
    description: 'Browse and explore cases',
    children: [
      { label: 'Browse Cases', href: '/cases/browse' },
      { label: 'Tribunal Cases', href: '/tribunal-cases' },
    ],
  },
]

// Role-specific navigation additions
const roleSpecificNavigation: Record<UserRole, NavLink[]> = {
  learner: [],

  viewer: [],

  guest: [],

  educator: [
    {
      label: 'Content',
      href: '#',
      icon: BookOpen,
      description: 'Manage your content',
      children: [
        { label: 'Create Course', href: '/admin/courses/create' },
        { label: 'My Courses', href: '/admin/courses' },
        { label: 'Content Library', href: '/resources' },
      ],
    },
  ],

  analyst: [
    {
      label: 'Analytics',
      href: '#',
      icon: BarChart3,
      description: 'View analytics and reports',
      children: [
        { label: 'Dashboard', href: '/analytics' },
        { label: 'Create Report', href: '/analytics/create' },
        { label: 'Data Explorer', href: '/analytics/explore' },
        { label: 'Case Explorer', href: '/cases/explore' },
      ],
    },
  ],

  investigator: [
    {
      label: 'Analytics',
      href: '#',
      icon: BarChart3,
      description: 'View analytics and reports',
      children: [
        { label: 'Dashboard', href: '/analytics' },
        { label: 'Case Explorer', href: '/cases/explore' },
        { label: 'Case Analysis', href: '/analytics/cases' },
        { label: 'Data Explorer', href: '/analytics/explore' },
      ],
    },
  ],

  org_admin: [
    {
      label: 'Admin',
      href: '#',
      icon: Settings,
      description: 'Organization administration',
      children: [
        { label: 'Team Management', href: '/admin/team', icon: Users },
        { label: 'Org Settings', href: '/admin/org-settings', icon: Building2 },
        { label: 'Usage Analytics', href: '/admin/analytics', icon: BarChart3 },
      ],
    },
  ],

  compliance_officer: [
    {
      label: 'Compliance',
      href: '#',
      icon: Shield,
      description: 'Compliance and audit tools',
      children: [
        { label: 'Audit Logs', href: '/admin/audit-logs' },
        { label: 'Flagged Cases', href: '/cases/flagged' },
        { label: 'Compliance Reports', href: '/admin/compliance' },
        { label: 'Team Activity', href: '/admin/team-activity' },
      ],
    },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'View analytics',
    },
  ],

  super_admin: [
    {
      label: 'Admin',
      href: '#',
      icon: Shield,
      description: 'Platform administration',
      children: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Organizations', href: '/admin/organizations', icon: Building2 },
        { label: 'Users', href: '/admin/users', icon: Users },
        { label: 'Team', href: '/admin/team', icon: Users },
        { label: 'Cases', href: '/admin/cases', icon: FileText },
        { label: 'Courses', href: '/admin/courses', icon: GraduationCap },
        { label: 'ML Features', href: '/admin/ml', icon: Cpu },
        { label: 'AI Models', href: '/admin/ai-models', icon: Cpu },
        { label: 'Ingestion', href: '/admin/ingestion', icon: Database },
        { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { label: 'Compliance', href: '/admin/compliance', icon: Shield },
        { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
        { label: 'Team Activity', href: '/admin/team-activity', icon: BarChart3 },
        { label: 'Org Settings', href: '/admin/org-settings', icon: Settings },
        { label: 'Permissions', href: '/admin/permissions', icon: Shield },
        { label: 'SSO Config', href: '/admin/sso-config', icon: Settings },
      ],
    },
  ],
}

// User menu dropdown (appears when clicking user avatar/name)
const userMenuItems: NavLink[] = [
  { label: 'My Profile', href: '/profile', icon: Users },
  { label: 'Settings', href: '/profile', icon: Settings },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'Achievements', href: '/achievements', icon: Shield },
  { label: 'My Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Help & Support', href: '/help', icon: FileText },
]

export const navigationConfig: NavigationConfig = {
  public: publicNavigation,
  authenticated: {
    base: authenticatedBaseNavigation,
    byRole: roleSpecificNavigation,
  },
  userMenu: userMenuItems,
}

/**
 * Get navigation links for a specific role
 * Merges base authenticated navigation with role-specific additions
 */
export function getNavigationForRole(role: UserRole | null): NavLink[] {
  if (!role || role === 'guest') {
    return publicNavigation
  }

  const roleNav = roleSpecificNavigation[role] || []
  return [...authenticatedBaseNavigation, ...roleNav]
}

/**
 * Check if a user has access to a specific navigation item
 */
export function canAccessNavItem(
  item: NavLink,
  role: UserRole | null,
  isAuthenticated: boolean
): boolean {
  // Public items are always accessible
  if (!item.requiresAuth) {
    return true
  }

  // Auth required but user not authenticated
  if (!isAuthenticated) {
    return false
  }

  // No role restrictions - all authenticated users can access
  if (!item.allowedRoles || item.allowedRoles.length === 0) {
    return true
  }

  // Check if user's role is in allowed roles
  return role ? item.allowedRoles.includes(role) : false
}

/**
 * Get user menu items (profile dropdown)
 */
export function getUserMenuItems(): NavLink[] {
  return userMenuItems
}
