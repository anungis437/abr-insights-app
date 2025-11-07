'use client'

/**
 * Dashboard Page
 * User dashboard with activity overview and quick actions
 * Part of Phase 5: Authenticated Pages Migration
 */

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  TrendingUp, 
  FileText,
  Target,
  Calendar,
  ArrowRight,
  User,
  Search
} from 'lucide-react'
import Navigation from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import { createClient } from '@/lib/supabase/client'
import { getCurrentProfile, type Profile } from '@/lib/supabase/services/profiles'
import { AchievementsService } from '@/lib/supabase/services/achievements'
import { ProgressService } from '@/lib/supabase/services/progress'

type DashboardStats = {
  coursesEnrolled: number
  coursesCompleted: number
  totalPoints: number
  achievementsEarned: number
  recentActivity: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    coursesEnrolled: 0,
    coursesCompleted: 0,
    totalPoints: 0,
    achievementsEarned: 0,
    recentActivity: 'No recent activity'
  })

  const checkAuth = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login?redirect=/dashboard')
      return
    }

    await loadData(user.id)
  }, [router])

  async function loadData(userId: string) {
    try {
      const [profileData] = await Promise.all([
        getCurrentProfile()
      ])

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
        achievementsEarned: achievements.length,
        recentActivity: profileData?.last_activity_at 
          ? new Date(profileData.last_activity_at).toLocaleDateString() 
          : 'No recent activity'
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
        <Navigation />
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
      <Navigation />
      
      <div className="container-custom py-12">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {profile?.display_name || profile?.first_name || 'there'}!
            </h1>
            <p className="mt-2 text-gray-600">
              Here&apos;s your learning progress overview
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/courses"
              className="group rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-lg bg-primary-100 p-3 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                  <BookOpen className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.coursesEnrolled}</p>
              <p className="text-sm text-gray-600">Courses Enrolled</p>
            </Link>

            <Link
              href="/courses"
              className="group rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-lg bg-green-100 p-3 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <Target className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.coursesCompleted}</p>
              <p className="text-sm text-gray-600">Courses Completed</p>
            </Link>

            <Link
              href="/achievements"
              className="group rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-lg bg-yellow-100 p-3 text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white transition-colors">
                  <Award className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-yellow-600 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPoints}</p>
              <p className="text-sm text-gray-600">Total Points</p>
            </Link>

            <Link
              href="/achievements"
              className="group rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-lg bg-purple-100 p-3 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.achievementsEarned}</p>
              <p className="text-sm text-gray-600">Achievements</p>
            </Link>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-primary-600" />
                  Quick Actions
                </h2>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Link
                    href="/cases/browse"
                    className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-all hover:border-primary-600 hover:shadow-md"
                  >
                    <div className="rounded-lg bg-primary-100 p-3 text-primary-600">
                      <Search className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Browse Cases</p>
                      <p className="text-sm text-gray-600">Explore case library</p>
                    </div>
                  </Link>

                  <Link
                    href="/courses"
                    className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-all hover:border-green-600 hover:shadow-md"
                  >
                    <div className="rounded-lg bg-green-100 p-3 text-green-600">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">View Courses</p>
                      <p className="text-sm text-gray-600">Continue learning</p>
                    </div>
                  </Link>

                  <Link
                    href="/profile"
                    className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-all hover:border-purple-600 hover:shadow-md"
                  >
                    <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Edit Profile</p>
                      <p className="text-sm text-gray-600">Update your info</p>
                    </div>
                  </Link>

                  <Link
                    href="/resources"
                    className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-600 hover:shadow-md"
                  >
                    <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Resources</p>
                      <p className="text-sm text-gray-600">Access materials</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Recent Activity Placeholder */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary-600" />
                  Recent Activity
                </h2>
                
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-gray-600">
                    Last activity: {stats.recentActivity}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Activity tracking will show your recent course progress and achievements
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Profile Summary */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-white shadow-lg">
                <div className="mb-4 flex items-center gap-4">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.display_name || 'Profile'}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full border-2 border-white object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-white/20">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-lg font-semibold">
                      {profile?.display_name || profile?.first_name || 'User'}
                    </h3>
                    {profile?.job_title && (
                      <p className="text-sm opacity-90">{profile.job_title}</p>
                    )}
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="mt-4 block w-full rounded-lg bg-white/20 py-2 text-center font-medium transition-colors hover:bg-white/30"
                >
                  View Profile
                </Link>
              </div>

              {/* Learning Goals */}
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Learning Goals
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-gray-600">Course Completion</span>
                      <span className="font-semibold text-gray-900">
                        {stats.coursesEnrolled > 0 
                          ? Math.round((stats.coursesCompleted / stats.coursesEnrolled) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div 
                        className="h-full bg-primary-600 transition-all duration-300"
                        style={{ 
                          width: stats.coursesEnrolled > 0 
                            ? `${(stats.coursesCompleted / stats.coursesEnrolled) * 100}%`
                            : '0%'
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Keep up the great work! Complete courses to earn more achievements and climb the leaderboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
