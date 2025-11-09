'use client'

/**
 * Dashboard Page - Simplified Hero Metric Design
 * Focus on what matters: current streak and actionable next steps
 * Part of Phase 5: Authenticated Pages Migration
 */

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  Award, 
  FileText,
  Search,
  ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentProfile, type Profile } from '@/lib/supabase/services/profiles'
import { AchievementsService } from '@/lib/supabase/services/achievements'
import { ProgressService } from '@/lib/supabase/services/progress'
import LearningDashboard from '@/components/dashboard/LearningDashboard'
import { useLanguage } from '@/lib/contexts/LanguageContext'

type DashboardStats = {
  coursesEnrolled: number
  coursesCompleted: number
  totalPoints: number
  achievementsEarned: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    coursesEnrolled: 0,
    coursesCompleted: 0,
    totalPoints: 0,
    achievementsEarned: 0
  })

  const checkAuth = useCallback(async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.replace('/auth/login')
      return
    }

    const userId = session.user.id
    setUserId(userId)

    // Load profile and stats
    await loadDashboardData(userId)
  }, [router])

  const loadDashboardData = async (userId: string) => {
    try {
      // Get profile
      const profileData = await getCurrentProfile()
      setProfile(profileData)

      // Load stats from services
      const achievementsService = new AchievementsService()
      const progressService = new ProgressService()

      const [points, achievements, enrollments] = await Promise.all([
        achievementsService.getUserPoints(userId).catch(() => ({ total_points: 0 })),
        achievementsService.getUserAchievements(userId).catch(() => []),
        progressService.getUserEnrollments(userId).catch(() => ({ data: [], count: 0 }))
      ])

      // Count completed courses
      const completedCount = enrollments.data.filter(e => e.completed_at !== null).length

      setStats({
        coursesEnrolled: enrollments.count || 0,
        coursesCompleted: completedCount,
        totalPoints: points.total_points || 0,
        achievementsEarned: achievements.length
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent mx-auto" />
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">      
      <div className="container-custom py-8">
        <div className="mx-auto max-w-6xl">
          {/* Simplified Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {profile?.display_name || profile?.first_name || 'Learner'}! 👋
            </h1>
            <p className="mt-2 text-gray-600">
              {stats.coursesEnrolled === 0 
                ? 'Ready to start your legal education journey?'
                : `You're enrolled in ${stats.coursesEnrolled} course${stats.coursesEnrolled === 1 ? '' : 's'}`
              }
            </p>
          </div>

          {/* Two-Column Layout */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Main Content (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* LearningDashboard Component - Shows Hero Streak + Limited Stats */}
              {userId && <LearningDashboard userId={userId} />}
            </div>

            {/* Right Column - Quick Stats & Actions (1/3 width) */}
            <div className="space-y-6">
              {/* Consolidated Stats Card */}
              <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-gray-600">Courses Progress</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {stats.coursesCompleted}/{stats.coursesEnrolled}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-yellow-100 p-2 text-yellow-600">
                        <Award className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-gray-600">Total Points</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {stats.totalPoints.toLocaleString()}
                    </span>
                  </div>
                </div>
                {stats.coursesEnrolled === 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                      Earn points by completing lessons and achieving milestones
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/cases/browse"
                    className="flex items-center justify-between rounded-lg p-3 text-gray-700 hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <Search className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Browse Cases</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>

                  <Link
                    href="/courses"
                    className="flex items-center justify-between rounded-lg p-3 text-gray-700 hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">View All Courses</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>

                  <Link
                    href="/achievements"
                    className="flex items-center justify-between rounded-lg p-3 text-gray-700 hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <Award className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">My Achievements</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>

                  <Link
                    href="/resources"
                    className="flex items-center justify-between rounded-lg p-3 text-gray-700 hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Learning Resources</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
