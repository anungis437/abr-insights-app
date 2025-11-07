'use client'

import { useAuth } from '@/lib/auth/AuthContext'
import dynamic from 'next/dynamic'

// Dynamic imports for code splitting
const PublicNavigation = dynamic(() => import('./PublicNavigation'), {
  ssr: true,
})

const AuthenticatedNavigation = dynamic(() => import('./AuthenticatedNavigation'), {
  ssr: true,
})

/**
 * Smart navigation wrapper that renders the appropriate navigation based on auth state
 * - Public users see PublicNavigation (marketing focused)
 * - Authenticated users see AuthenticatedNavigation (role-aware with features)
 */
export default function NavigationWrapper() {
  const { user, loading } = useAuth()

  // During initial load, render public navigation to avoid flash
  if (loading) {
    return <PublicNavigation />
  }

  return user ? <AuthenticatedNavigation /> : <PublicNavigation />
}
