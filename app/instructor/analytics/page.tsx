'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function InstructorAnalyticsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to main analytics page
    router.push('/analytics')
  }, [router])

  return null
}
