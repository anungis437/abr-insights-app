'use client'

import { useAuth } from '@/lib/auth/AuthContext'
import Sidebar from './Sidebar'
import { getSidebarNavigation, type UserRole } from '@/lib/navigation/sidebarConfig'

/**
 * Wrapper component that provides the appropriate sidebar navigation
 * based on the user's authentication state and role
 */
export default function SidebarWrapper() {
  const { user, profile, loading } = useAuth()

  // Don't show sidebar if not authenticated
  if (!user || loading) {
    return null
  }

  const role = profile?.role as UserRole | null
  const navItems = getSidebarNavigation(role)

  return <Sidebar items={navItems} role={role} />
}
