'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp } from 'lucide-react'

export default function InstructorProgressPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Progress Tracking</h1>
            <p className="mt-2 text-gray-600">Monitor student progress across your courses</p>
          </div>

          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <TrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Progress Tracking</h3>
            <p className="text-gray-600">
              Advanced progress tracking features are coming soon. You&apos;ll be able to view
              detailed analytics on student performance and engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
