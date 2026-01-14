'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutPage() {
  const router = useRouter()

  useEffect(() => {
    const signOut = async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    }

    signOut()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Signing out...</h2>
        <p className="text-muted-foreground">Please wait while we log you out.</p>
      </div>
    </div>
  )
}
