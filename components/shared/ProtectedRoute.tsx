'use client'

import { useAuth } from '@/lib/auth/AuthContext'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  requireRole?: string | string[]
  requireOnboarding?: boolean
}

/**
 * Protected route wrapper component that requires authentication
 * Handles redirects and permission checks
 */
export default function ProtectedRoute({
  children,
  redirectTo = '/auth/login',
  requireRole,
  requireOnboarding = false,
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, useRequireAuth will handle redirect
  if (!user || !profile) {
    return null
  }

  // Check role requirements
  if (requireRole) {
    const roles = Array.isArray(requireRole) ? requireRole : [requireRole]
    if (!roles.includes(profile.status)) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="mt-2 text-gray-600">You don&apos;t have permission to access this page.</p>
          </div>
        </div>
      )
    }
  }

  // Check onboarding requirements
  if (requireOnboarding && !profile.onboarding_completed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Complete Onboarding</h1>
          <p className="mt-2 text-gray-600">
            Please complete your onboarding process to access this page.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
