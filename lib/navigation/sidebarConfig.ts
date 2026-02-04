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
  Award,
  Calendar,
  Target,
  MessageSquare,
  Bell,
  Briefcase,
  ClipboardList,
  FileSpreadsheet,
  UserCog,
  Lock,
  Activity,
  Trophy,
  LogOut,
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

export type SidebarNavItem = {
  label: string
  href?: string
  icon?: LucideIcon
  badge?: string | number
  children?: SidebarNavItem[]
  description?: string
}

// Learner Navigation
const learnerNav: SidebarNavItem[] = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Learning',
    icon: GraduationCap,
    children: [
      { label: 'My Courses', href: '/training', icon: BookOpen },
      { label: 'Browse Catalog', href: '/training', icon: Search },
      { label: 'My Progress', href: '/dashboard', icon: TrendingUp },
      { label: 'Achievements', href: '/achievements', icon: Award },
    ],
  },
  {
    label: 'Cases',
    icon: FileText,
    children: [
      { label: 'Explore Cases', href: '/cases/explore', icon: Search },
      { label: 'Browse All', href: '/cases/browse', icon: FileText },
    ],
  },
  {
    label: 'Community',
    icon: Users,
    children: [
      { label: 'Study Buddies', href: '/study-buddies', icon: Users },
      { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
      { label: 'Discussions', href: '/discussions', icon: MessageSquare },
    ],
  },
  {
    label: 'Profile',
    icon: UserCog,
    children: [
      { label: 'My Profile', href: '/profile', icon: Users },
      { label: 'Settings', href: '/profile', icon: Settings },
      { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
      { label: 'Certificates', href: '/certificates', icon: Award },
      { label: 'Sign Out', href: '/auth/signout', icon: LogOut },
    ],
  },
]

// Educator Navigation
const educatorNav: SidebarNavItem[] = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Content',
    icon: BookOpen,
    children: [
      { label: 'My Courses', href: '/instructor/courses', icon: BookOpen },
      { label: 'Create Course', href: '/admin/courses/create', icon: GraduationCap },
      { label: 'Content Library', href: '/resources', icon: Database },
      { label: 'Course Analytics', href: '/instructor/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Students',
    icon: Users,
    children: [
      { label: 'Student List', href: '/instructor/students', icon: Users },
      { label: 'Progress Tracking', href: '/instructor/progress', icon: TrendingUp },
      { label: 'Grading', href: '/instructor/grading', icon: ClipboardList },
    ],
  },
  {
    label: 'Learning',
    icon: GraduationCap,
    children: [
      { label: 'My Courses', href: '/training', icon: BookOpen },
      { label: 'Browse Catalog', href: '/courses', icon: Search },
    ],
  },
  {
    label: 'Profile',
    icon: UserCog,
    children: [
      { label: 'My Profile', href: '/profile', icon: Users },
      { label: 'Settings', href: '/profile', icon: Settings },
      { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
      { label: 'Sign Out', href: '/auth/signout', icon: LogOut },
    ],
  },
]

// Analyst Navigation
const analystNav: SidebarNavItem[] = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    children: [
      { label: 'Dashboard', href: '/analytics', icon: LayoutDashboard },
      { label: 'Reports', href: '/analytics/reports', icon: FileSpreadsheet },
      { label: 'Data Explorer', href: '/analytics/explore', icon: Search },
      { label: 'Case Analysis', href: '/analytics/cases', icon: FileText },
      { label: 'Trends', href: '/analytics/trends', icon: TrendingUp },
    ],
  },
  {
    label: 'Cases',
    icon: FileText,
    children: [
      { label: 'All Cases', href: '/cases/browse', icon: FileText },
      { label: 'Tribunal Cases', href: '/tribunal-cases', icon: Briefcase },
      { label: 'Case Analytics', href: '/analytics/cases', icon: BarChart3 },
    ],
  },
  {
    label: 'Team',
    href: '/admin/team',
    icon: Users,
  },
  {
    label: 'Profile',
    icon: UserCog,
    children: [
      { label: 'My Profile', href: '/profile', icon: Users },
      { label: 'Settings', href: '/profile', icon: Settings },
      { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
      { label: 'Sign Out', href: '/auth/signout', icon: LogOut },
    ],
  },
]

// Investigator Navigation (similar to analyst with case focus)
const investigatorNav: SidebarNavItem[] = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Cases',
    icon: FileText,
    children: [
      { label: 'All Cases', href: '/cases/browse', icon: FileText },
      { label: 'My Cases', href: '/cases/my-cases', icon: Briefcase },
      { label: 'Tribunal Cases', href: '/tribunal-cases', icon: Briefcase },
      { label: 'Flagged Cases', href: '/cases/flagged', icon: Shield },
    ],
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    children: [
      { label: 'Dashboard', href: '/analytics', icon: LayoutDashboard },
      { label: 'Case Analysis', href: '/analytics/cases', icon: FileText },
      { label: 'Data Explorer', href: '/analytics/explore', icon: Search },
    ],
  },
  {
    label: 'Team',
    href: '/admin/team',
    icon: Users,
  },
  {
    label: 'Profile',
    icon: UserCog,
    children: [
      { label: 'My Profile', href: '/profile', icon: Users },
      { label: 'Settings', href: '/profile', icon: Settings },
      { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
      { label: 'Sign Out', href: '/auth/signout', icon: LogOut },
    ],
  },
]

// Org Admin Navigation
const orgAdminNav: SidebarNavItem[] = [
  {
    label: 'Home',
    href: '/admin/dashboard',
    icon: Home,
  },
  {
    label: 'Organization',
    icon: Building2,
    children: [
      { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Team Management', href: '/admin/team', icon: Users },
      { label: 'Settings', href: '/admin/org-settings', icon: Settings },
      { label: 'Usage Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Users & Roles',
    icon: Users,
    children: [
      { label: 'All Users', href: '/admin/users', icon: Users },
      { label: 'Roles', href: '/admin/roles', icon: Shield },
      { label: 'Permissions', href: '/admin/permissions', icon: Lock },
      { label: 'Activity', href: '/admin/team-activity', icon: Activity },
    ],
  },
  {
    label: 'Content',
    icon: BookOpen,
    children: [
      { label: 'Courses', href: '/admin/courses', icon: GraduationCap },
      { label: 'Cases', href: '/admin/cases', icon: FileText },
    ],
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    children: [
      { label: 'Dashboard', href: '/analytics', icon: LayoutDashboard },
      { label: 'Reports', href: '/analytics/reports', icon: FileSpreadsheet },
    ],
  },
  {
    label: 'Profile',
    icon: UserCog,
    children: [
      { label: 'My Profile', href: '/profile', icon: Users },
      { label: 'Settings', href: '/profile', icon: Settings },
      { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
      { label: 'Sign Out', href: '/auth/signout', icon: LogOut },
    ],
  },
]

// Compliance Officer Navigation
const complianceNav: SidebarNavItem[] = [
  {
    label: 'Home',
    href: '/admin/compliance',
    icon: Home,
  },
  {
    label: 'Compliance',
    icon: Shield,
    children: [
      { label: 'Dashboard', href: '/admin/compliance', icon: LayoutDashboard },
      { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
      { label: 'Flagged Cases', href: '/cases/flagged', icon: Shield },
      { label: 'Reports', href: '/admin/compliance/reports', icon: FileSpreadsheet },
      { label: 'Team Activity', href: '/admin/team-activity', icon: Activity },
    ],
  },
  {
    label: 'Cases',
    icon: FileText,
    children: [
      { label: 'All Cases', href: '/cases/browse', icon: FileText },
      { label: 'Flagged Cases', href: '/cases/flagged', icon: Shield },
      { label: 'Tribunal Cases', href: '/tribunal-cases', icon: Briefcase },
    ],
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    label: 'Profile',
    icon: UserCog,
    children: [
      { label: 'My Profile', href: '/profile', icon: Users },
      { label: 'Settings', href: '/profile', icon: Settings },
      { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
      { label: 'Sign Out', href: '/auth/signout', icon: LogOut },
    ],
  },
]

// Super Admin Navigation (has access to everything)
const superAdminNav: SidebarNavItem[] = [
  {
    label: 'Home',
    href: '/admin/dashboard',
    icon: Home,
  },
  {
    label: 'Administration',
    icon: Shield,
    children: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Organizations', href: '/admin/organizations', icon: Building2 },
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'Roles & Permissions', href: '/admin/permissions', icon: Lock },
      { label: 'SSO Config', href: '/admin/sso-config', icon: Settings },
    ],
  },
  {
    label: 'Content',
    icon: BookOpen,
    children: [
      { label: 'Courses', href: '/admin/courses', icon: GraduationCap },
      { label: 'Create Course', href: '/admin/courses/create', icon: GraduationCap },
      { label: 'Cases', href: '/admin/cases', icon: FileText },
      { label: 'Create Case', href: '/admin/cases/create', icon: FileText },
      { label: 'Content Library', href: '/resources', icon: Database },
    ],
  },
  {
    label: 'Data & AI',
    icon: Cpu,
    children: [
      { label: 'ML Features', href: '/admin/ml', icon: Cpu },
      { label: 'AI Models', href: '/admin/ai-models', icon: Cpu },
      { label: 'Data Ingestion', href: '/admin/ingestion', icon: Database },
    ],
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    children: [
      { label: 'Platform Analytics', href: '/admin/analytics', icon: BarChart3 },
      { label: 'Usage Reports', href: '/analytics/reports', icon: FileSpreadsheet },
      { label: 'Data Explorer', href: '/analytics/explore', icon: Search },
    ],
  },
  {
    label: 'Compliance',
    icon: Shield,
    children: [
      { label: 'Dashboard', href: '/admin/compliance', icon: Shield },
      { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
      { label: 'Team Activity', href: '/admin/team-activity', icon: Activity },
      { label: 'Flagged Cases', href: '/cases/flagged', icon: Shield },
    ],
  },
  {
    label: 'Team',
    href: '/admin/team',
    icon: Users,
  },
  {
    label: 'Profile',
    icon: UserCog,
    children: [
      { label: 'My Profile', href: '/profile', icon: Users },
      { label: 'Settings', href: '/profile', icon: Settings },
      { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
      { label: 'Sign Out', href: '/auth/signout', icon: LogOut },
    ],
  },
]

// Viewer Navigation (read-only)
const viewerNav: SidebarNavItem[] = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Browse',
    icon: Search,
    children: [
      { label: 'Courses', href: '/courses', icon: GraduationCap },
      { label: 'Cases', href: '/cases/browse', icon: FileText },
      { label: 'Resources', href: '/resources', icon: Database },
    ],
  },
  {
    label: 'Profile',
    icon: UserCog,
    children: [
      { label: 'My Profile', href: '/profile', icon: Users },
      { label: 'Settings', href: '/profile', icon: Settings },
      { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
      { label: 'Sign Out', href: '/auth/signout', icon: LogOut },
    ],
  },
]

// Guest Navigation (minimal access)
const guestNav: SidebarNavItem[] = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Browse',
    icon: Search,
    children: [
      { label: 'Courses', href: '/courses', icon: GraduationCap },
      { label: 'Public Cases', href: '/cases/browse', icon: FileText },
    ],
  },
  {
    label: 'Profile',
    icon: UserCog,
    children: [
      { label: 'My Profile', href: '/profile', icon: Users },
      { label: 'Sign Out', href: '/auth/signout', icon: LogOut },
    ],
  },
]

// Export role-specific navigation
export const sidebarNavigationByRole: Record<UserRole, SidebarNavItem[]> = {
  learner: learnerNav,
  educator: educatorNav,
  analyst: analystNav,
  investigator: investigatorNav,
  org_admin: orgAdminNav,
  compliance_officer: complianceNav,
  super_admin: superAdminNav,
  viewer: viewerNav,
  guest: guestNav,
}

/**
 * Get sidebar navigation for a specific role
 */
export function getSidebarNavigation(role: UserRole | null): SidebarNavItem[] {
  if (!role) {
    return guestNav
  }

  return sidebarNavigationByRole[role] || learnerNav
}
