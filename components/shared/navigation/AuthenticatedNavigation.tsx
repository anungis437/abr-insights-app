'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthContext'
import UserMenu from './UserMenu'
import NotificationBell from './NotificationBell'

export default function AuthenticatedNavigation() {
  const { user, profile, signOut } = useAuth()

  // Authenticated users have sidebar navigation, only show minimal mobile header
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm lg:hidden">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Logo - Links to dashboard */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600">
              <span className="text-xl font-bold text-white">ABR</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">ABR Insights</span>
          </Link>

          {/* Mobile: Notifications + User Menu */}
          <div className="flex items-center gap-3">
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

