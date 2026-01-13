'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthContext'
import type { UserRole } from '@/lib/navigation/navigationConfig'
import UserMenu from './UserMenu'
import NotificationBell from './NotificationBell'

export default function AuthenticatedNavigation() {
  const { user, profile, signOut } = useAuth()

  const role = (profile?.role as UserRole) || 'learner'

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm lg:pl-64">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Links to dashboard for authenticated users (hidden on desktop with sidebar) */}
          <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600">
              <span className="text-xl font-bold text-white">ABR</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">ABR Insights</span>
          </Link>

          {/* Desktop: Just show role badge and user menu */}
          <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-between">
            <div className="text-sm font-medium text-gray-600">
              {role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Dashboard
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <UserMenu
                user={user!}
                profile={profile}
                onSignOut={signOut}
              />
            </div>
          </div>

          {/* Mobile: Notifications + User Menu */}
          <div className="flex items-center gap-3 lg:hidden">
            <NotificationBell />
            <UserMenu
              user={user!}
              profile={profile}
              onSignOut={signOut}
            />
          </div>
        </div>
      </div>
    </nav>
  )
}

