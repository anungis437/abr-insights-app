'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const signOut = async () => {
      try {
        const supabase = createClient()

        // Set a timeout to ensure we redirect even if signout hangs
        const timeoutId = setTimeout(() => {
          console.warn('Sign out taking too long, redirecting anyway')
          router.push('/')
        }, 3000) // 3 second timeout

        await supabase.auth.signOut()

        clearTimeout(timeoutId)

        // Clear any local storage or session data
        if (typeof window !== 'undefined') {
          localStorage.clear()
        }

        // Redirect to homepage
        router.push('/')
        router.refresh()
      } catch (err) {
        console.error('Sign out error:', err)
        setError('An error occurred during sign out. Redirecting...')

        // Still redirect even on error
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 1000)
      }
    }

    signOut()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-semibold">
          {error ? 'Redirecting...' : 'Signing out...'}
        </h2>
        <p className="text-muted-foreground">{error || 'Please wait while we log you out.'}</p>
      </div>
    </div>
  )
}
