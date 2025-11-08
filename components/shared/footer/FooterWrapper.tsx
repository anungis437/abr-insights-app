'use client'

import { useAuth } from '@/lib/auth/AuthContext'
import dynamic from 'next/dynamic'

// Dynamic imports for code splitting
const PublicFooter = dynamic(() => import('./PublicFooter'), {
  ssr: true,
})

const AuthenticatedFooter = dynamic(() => import('./AuthenticatedFooter'), {
  ssr: true,
})

/**
 * Smart footer wrapper that renders the appropriate footer based on auth state
 * - Public users see PublicFooter (marketing focused with 4 columns)
 * - Authenticated users see AuthenticatedFooter (user focused with 3 columns + user info)
 */
export default function FooterWrapper() {
  const { user, loading } = useAuth()

  // During initial load, render public footer to avoid flash
  if (loading) {
    return <PublicFooter />
  }

  return user ? <AuthenticatedFooter /> : <PublicFooter />
}
