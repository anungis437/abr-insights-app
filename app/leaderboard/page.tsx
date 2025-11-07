'use client'

/**
 * Leaderboard Page
 * Replaces legacy Leaderboard.jsx (116 lines) + Leaderboard component (148 lines)
 * Route: /leaderboard
 * Features: Rankings by points/courses/streak, organization filtering, user rank display
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Crown,
  Star,
  Users,
  Target,
  Zap,
  Filter
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import Navigation from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'

// Types
interface Profile {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  organization_id: string | null
}

interface Organization {
  id: string
  name: string
}

interface LeaderboardEntry {
  user_id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  total_points: number
  courses_completed: number
  current_streak: number
  achievements_earned: number
  level: number
}

export default function LeaderboardPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // State
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'points' | 'courses' | 'streak'>('points')
  const [loading, setLoading] = useState(true)

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
      
      if (currentUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()
        
        if (profileData) setProfile(profileData)
      }
    }
    loadUser()
  }, [supabase.auth])

  // Load organizations
  useEffect(() => {
    const loadOrganizations = async () => {
      const { data } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name')
      
      if (data) setOrganizations(data)
    }
    loadOrganizations()
  }, [supabase])

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true)
      
      try {
        // Get all profiles with their stats
        let query = supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            email,
            avatar_url,
            organization_id
          `)
        
        if (selectedOrgId !== 'all') {
          query = query.eq('organization_id', selectedOrgId)
        }
        
        const { data: profiles } = await query
        
        if (!profiles) {
          setLeaderboard([])
          setLoading(false)
          return
        }

        // Calculate stats for each user
        const leaderboardData = await Promise.all(
          profiles.map(async (profile) => {
            // Get total points
            const { data: pointsData } = await supabase
              .from('user_points')
              .select('points')
              .eq('user_id', profile.id)
            
            const total_points = pointsData?.reduce((sum, p) => sum + (p.points || 0), 0) || 0

            // Get courses completed
            const { count: coursesCompleted } = await supabase
              .from('enrollments')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', profile.id)
              .eq('status', 'completed')
            
            // Get current streak
            const { data: streakData } = await supabase
              .from('learning_streaks')
              .select('current_streak_days')
              .eq('user_id', profile.id)
              .single()
            
            // Get achievements count
            const { count: achievementsCount } = await supabase
              .from('user_achievements')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', profile.id)
            
            // Calculate level based on points
            const level = Math.floor(total_points / 100) + 1

            return {
              user_id: profile.id,
              full_name: profile.full_name,
              email: profile.email,
              avatar_url: profile.avatar_url,
              total_points,
              courses_completed: coursesCompleted || 0,
              current_streak: streakData?.current_streak_days || 0,
              achievements_earned: achievementsCount || 0,
              level
            }
          })
        )

        setLeaderboard(leaderboardData)
      } catch (error) {
        console.error('Error loading leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboard()
  }, [supabase, selectedOrgId])

  // Helper functions
  const getSortedLeaderboard = () => {
    const sorted = [...leaderboard]
    switch (activeTab) {
      case 'points':
        return sorted.sort((a, b) => b.total_points - a.total_points)
      case 'courses':
        return sorted.sort((a, b) => b.courses_completed - a.courses_completed)
      case 'streak':
        return sorted.sort((a, b) => b.current_streak - a.current_streak)
      default:
        return sorted
    }
  }

  const getUserRank = () => {
    if (!user) return null
    const sorted = getSortedLeaderboard()
    return sorted.findIndex(entry => entry.user_id === user.id) + 1
  }

  const getUserEntry = () => {
    if (!user) return null
    return leaderboard.find(entry => entry.user_id === user.id)
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />
    return null
  }

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800'
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
    return 'bg-gray-100 text-gray-700'
  }

  const getMetricValue = (entry: LeaderboardEntry) => {
    switch (activeTab) {
      case 'points':
        return entry.total_points
      case 'courses':
        return entry.courses_completed
      case 'streak':
        return entry.current_streak
      default:
        return 0
    }
  }

  const getMetricLabel = () => {
    switch (activeTab) {
      case 'points':
        return 'points'
      case 'courses':
        return 'courses'
      case 'streak':
        return 'day streak'
      default:
        return ''
    }
  }

  const sortedLeaderboard = getSortedLeaderboard()
  const userRank = getUserRank()
  const userEntry = getUserEntry()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Leaderboard</h1>
                <p className="text-gray-600">See how you rank among top learners</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Organizations</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
              <button
                onClick={() => setActiveTab('points')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === 'points'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Star className="w-4 h-4" />
                Points
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === 'courses'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Award className="w-4 h-4" />
                Courses
              </button>
              <button
                onClick={() => setActiveTab('streak')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === 'streak'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Streak
              </button>
            </div>
          </div>

          {/* User Rank Card */}
          {user && userEntry && userRank && (
            <div className="mb-8 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-6 border-2 border-teal-200 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {userEntry.avatar_url ? (
                      <img src={userEntry.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      (userEntry.full_name?.[0] || userEntry.email[0]).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Your Current Rank</p>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="text-5xl font-bold text-gray-900">
                        #{userRank}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {getMetricValue(userEntry)} {getMetricLabel()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Level {userEntry.level} · {userEntry.achievements_earned} achievements
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-teal-700 font-medium">
                      Keep learning to climb the ranks! 🚀
                    </p>
                  </div>
                </div>
                {profile?.organization_id && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-teal-200 shadow-sm">
                    <Users className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {organizations.find(o => o.id === profile.organization_id)?.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Top Performers
                </h2>
                <div className="text-sm text-gray-600">
                  Showing top {Math.min(sortedLeaderboard.length, 50)} learners
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading leaderboard...</p>
                </div>
              ) : sortedLeaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No data yet</p>
                  <p className="text-gray-500 text-sm">Start learning to see your rank!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedLeaderboard.slice(0, 50).map((entry, index) => {
                    const rank = index + 1
                    const isCurrentUser = user && entry.user_id === user.id
                    
                    return (
                      <div
                        key={entry.user_id}
                        className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                          rank <= 3
                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200'
                            : isCurrentUser
                            ? 'bg-teal-50 border-2 border-teal-200'
                            : 'bg-gray-50 border border-gray-200 hover:shadow-md'
                        }`}
                      >
                        {/* Rank Badge */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getRankBadgeClass(rank)}`}>
                          {getRankIcon(rank) || <span className="text-xl font-bold">#{rank}</span>}
                        </div>

                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          {entry.avatar_url ? (
                            <img src={entry.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-white text-lg font-bold">
                              {(entry.full_name?.[0] || entry.email[0]).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 truncate flex items-center gap-2">
                            {entry.full_name || entry.email.split('@')[0]}
                            {isCurrentUser && (
                              <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-full font-medium">
                                You
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              Level {entry.level}
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              {entry.achievements_earned} badges
                            </span>
                            {activeTab !== 'streak' && entry.current_streak > 0 && (
                              <span className="flex items-center gap-1">
                                <Zap className="w-4 h-4 text-orange-500" />
                                {entry.current_streak} day streak
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Metric Value */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-3xl font-bold text-gray-900">
                            {getMetricValue(entry)}
                          </div>
                          <div className="text-xs text-gray-600 uppercase tracking-wide">
                            {getMetricLabel()}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Total Learners</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{leaderboard.length}</p>
              <p className="text-sm text-gray-600 mt-1">Active participants</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Total Courses</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {leaderboard.reduce((sum, entry) => sum + entry.courses_completed, 0)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Completed by all users</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Total Points</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {leaderboard.reduce((sum, entry) => sum + entry.total_points, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">Earned collectively</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
