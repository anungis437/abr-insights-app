'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Briefcase, Search } from 'lucide-react'

export default function MyCasesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login?redirect=/cases/my-cases')
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
            <h1 className="text-3xl font-bold text-gray-900">My Cases</h1>
            <p className="mt-2 text-gray-600">Cases you&apos;ve saved or are working on</p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search your cases..."
                className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <Briefcase className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No Saved Cases</h3>
            <p className="mb-6 text-gray-600">
              Save cases for quick access or to organize your research.
            </p>
            <button
              onClick={() => router.push('/cases/browse')}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
            >
              <Search className="h-5 w-5" />
              Browse Cases
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
