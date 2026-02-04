'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Plus, Search, TrendingUp, Users } from 'lucide-react'

export default function DiscussionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login?redirect=/discussions')
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
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community Discussions</h1>
              <p className="mt-2 text-gray-600">
                Connect with learners, share insights, and get help
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-white hover:bg-primary-700">
              <Plus className="h-5 w-5" />
              New Discussion
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <select className="rounded-lg border border-gray-200 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>All Topics</option>
              <option>Courses</option>
              <option>Cases</option>
              <option>General</option>
            </select>
            <select className="rounded-lg border border-gray-200 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>Latest</option>
              <option>Popular</option>
              <option>Unanswered</option>
            </select>
          </div>

          {/* Coming Soon Message */}
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Discussions Coming Soon</h3>
            <p className="mb-6 text-gray-600">
              This feature is currently in development. Soon you&apos;ll be able to ask questions,
              share insights, and connect with the community.
            </p>

            {/* Feature Preview */}
            <div className="mt-8 grid gap-6 text-left md:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-6">
                <MessageSquare className="mb-3 h-8 w-8 text-primary-600" />
                <h4 className="mb-2 font-semibold text-gray-900">Ask Questions</h4>
                <p className="text-sm text-gray-600">
                  Get help from instructors and fellow learners
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-6">
                <TrendingUp className="mb-3 h-8 w-8 text-primary-600" />
                <h4 className="mb-2 font-semibold text-gray-900">Share Insights</h4>
                <p className="text-sm text-gray-600">Contribute your knowledge and experiences</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-6">
                <Users className="mb-3 h-8 w-8 text-primary-600" />
                <h4 className="mb-2 font-semibold text-gray-900">Build Community</h4>
                <p className="text-sm text-gray-600">
                  Connect with peers who share your learning goals
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
