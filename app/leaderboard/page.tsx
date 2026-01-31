'use client'

import { logger } from '@/lib/utils/production-logger'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

/**
 * Enhanced Leaderboard Page (Phase 5)
 * Route: /leaderboard
 * Features: Multiple leaderboard types, time periods, rank changes, user position
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
  Filter,
  ChevronUp,
  ChevronDown,
  Minus,
  Calendar,
} from 'lucide-react'
import Image from 'next/image'
import { gamificationService } from '@/lib/services/gamification'
import type { User } from '@supabase/supabase-js'
import type { Leaderboard, LeaderboardEntry } from '@/lib/services/gamification'

export default function LeaderboardPage() {
  const router = useRouter()
  const [supabase] = useState(() => {
    if (typeof window === 'undefined') return null as any
    return createClient()
  })

  // State
  const [user, setUser] = useState<User | null>(null)
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([])
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<Leaderboard | null>(null)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      setUser(currentUser)
    }
    loadUser()
  }, [supabase.auth])

  // Load leaderboards
  useEffect(() => {
    const loadLeaderboards = async () => {
      setLoading(true)
      try {
        const boards = await gamificationService.getLeaderboards()
        setLeaderboards(boards)

        // Default to first global leaderboard
        const defaultBoard = boards.find(
          (b) => b.leaderboard_type === 'global' && b.time_period === 'all_time'
        )
        if (defaultBoard) {
          setSelectedLeaderboard(defaultBoard)
        } else if (boards.length > 0) {
          setSelectedLeaderboard(boards[0])
        }
      } catch (error) {
        logger.error('Error loading leaderboards:', { error: error, context: 'dynamic' })
      } finally {
        setLoading(false)
      }
    }
    loadLeaderboards()
  }, [])

  // Load leaderboard entries
  useEffect(() => {
    const loadEntries = async () => {
      if (!selectedLeaderboard) return

      setLoading(true)
      try {
        // Get top 50 entries
        const topEntries = await gamificationService.getLeaderboardEntries(
          selectedLeaderboard.id,
          50,
          0
        )
        setEntries(topEntries)

        // Get user's entry if logged in
        if (user) {
          const userLeaderboardEntry = await gamificationService.getUserLeaderboardEntry(
            selectedLeaderboard.id,
            user.id
          )
          setUserEntry(userLeaderboardEntry)
        }
      } catch (error) {
        logger.error('Error loading leaderboard entries:', { error: error, context: 'dynamic' })
      } finally {
        setLoading(false)
      }
    }
    loadEntries()
  }, [selectedLeaderboard, user])

  // Helper functions
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-600" />
    return null
  }

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800'
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
    return 'bg-gray-100 text-gray-700'
  }

  const getRankChangeIndicator = (rankChange: number) => {
    if (rankChange > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <ChevronUp className="h-4 w-4" />
          <span className="text-xs font-medium">+{rankChange}</span>
        </div>
      )
    } else if (rankChange < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <ChevronDown className="h-4 w-4" />
          <span className="text-xs font-medium">{rankChange}</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 text-gray-400">
        <Minus className="h-4 w-4" />
      </div>
    )
  }

  const getLeaderboardIcon = (type: string) => {
    switch (type) {
      case 'global':
        return <Trophy className="h-4 w-4" />
      case 'course':
        return <Award className="h-4 w-4" />
      case 'organization':
        return <Users className="h-4 w-4" />
      case 'skill':
        return <Target className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  const getTimePeriodLabel = (period: string) => {
    switch (period) {
      case 'all_time':
        return 'All Time'
      case 'yearly':
        return 'This Year'
      case 'monthly':
        return 'This Month'
      case 'weekly':
        return 'This Week'
      case 'daily':
        return 'Today'
      default:
        return period
    }
  }

  // Group leaderboards by type
  const leaderboardsByType = leaderboards.reduce(
    (acc, board) => {
      if (!acc[board.leaderboard_type]) {
        acc[board.leaderboard_type] = []
      }
      acc[board.leaderboard_type].push(board)
      return acc
    },
    {} as Record<string, Leaderboard[]>
  )

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pt-16">
      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg">
                <Trophy className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Leaderboard</h1>
                <p className="text-gray-600">See how you rank among top learners</p>
              </div>
            </div>
          </div>

          {/* Leaderboard Selection */}
          <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Leaderboard Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Leaderboard Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(leaderboardsByType).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      const board = leaderboardsByType[type]?.[0]
                      if (board) setSelectedLeaderboard(board)
                    }}
                    className={`flex items-center gap-2 rounded-lg px-4 py-3 transition-all ${
                      selectedLeaderboard?.leaderboard_type === type
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'border border-gray-200 bg-white text-gray-700 hover:shadow-md'
                    }`}
                  >
                    {getLeaderboardIcon(type)}
                    <span className="font-medium capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Period */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Time Period</label>
              <div className="grid grid-cols-2 gap-2">
                {selectedLeaderboard &&
                  leaderboardsByType[selectedLeaderboard.leaderboard_type]?.map((board) => (
                    <button
                      key={board.id}
                      onClick={() => setSelectedLeaderboard(board)}
                      className={`flex items-center gap-2 rounded-lg px-4 py-3 transition-all ${
                        selectedLeaderboard?.id === board.id
                          ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                          : 'border border-gray-200 bg-white text-gray-700 hover:shadow-md'
                      }`}
                    >
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">{getTimePeriodLabel(board.time_period)}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* User Rank Card */}
          {user && userEntry && (
            <div className="mb-8 rounded-lg border-2 border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50 p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-3xl font-bold text-white shadow-lg">
                    {userEntry.user?.avatar_url ? (
                      <Image src={userEntry.user.avatar_url} alt="" fill className="object-cover" />
                    ) : (
                      <span>{(userEntry.user?.full_name?.[0] || 'U').toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-gray-600">Your Current Rank</p>
                    <div className="mb-2 flex items-center gap-4">
                      <div className="text-5xl font-bold text-gray-900">#{userEntry.rank}</div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {userEntry.score.toLocaleString()} points
                        </p>
                        {userEntry.percentile !== null && userEntry.percentile !== undefined && (
                          <p className="text-sm text-gray-600">
                            Top {(100 - userEntry.percentile).toFixed(1)}%
                          </p>
                        )}
                        <div className="mt-1 flex items-center gap-2">
                          {getRankChangeIndicator(userEntry.rank_change)}
                          {userEntry.previous_rank && (
                            <span className="text-xs text-gray-600">
                              from #{userEntry.previous_rank}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-teal-700">
                      Keep learning to climb the ranks! ðŸš€
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  {selectedLeaderboard?.name || 'Top Performers'}
                </h2>
                <div className="text-sm text-gray-600">Showing top {entries.length} learners</div>
              </div>
              {selectedLeaderboard?.description && (
                <p className="mt-2 text-gray-600">{selectedLeaderboard.description}</p>
              )}
            </div>

            <div className="p-6">
              {loading ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-teal-500"></div>
                  <p className="text-gray-600">Loading leaderboard...</p>
                </div>
              ) : entries.length === 0 ? (
                <div className="py-12 text-center">
                  <Trophy className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                  <p className="mb-2 text-lg text-gray-600">No data yet</p>
                  <p className="text-sm text-gray-500">Start learning to see your rank!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry) => {
                    const isCurrentUser = user && entry.user_id === user.id
                    const rank = entry.rank

                    return (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-4 rounded-lg p-4 transition-all ${
                          rank <= 3
                            ? 'border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50'
                            : isCurrentUser
                              ? 'border-2 border-teal-200 bg-teal-50'
                              : 'border border-gray-200 bg-gray-50 hover:shadow-md'
                        }`}
                      >
                        {/* Rank Badge */}
                        <div
                          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${getRankBadgeClass(rank)}`}
                        >
                          {getRankIcon(rank) || <span className="text-xl font-bold">#{rank}</span>}
                        </div>

                        {/* Rank Change */}
                        <div className="flex-shrink-0">
                          {getRankChangeIndicator(entry.rank_change)}
                        </div>

                        {/* Avatar */}
                        <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-400 to-teal-600 shadow-md">
                          {entry.user?.avatar_url ? (
                            <Image
                              src={entry.user.avatar_url}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold text-white">
                              {(entry.user?.full_name?.[0] || 'U').toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="min-w-0 flex-1">
                          <h4 className="flex items-center gap-2 truncate font-bold text-gray-900">
                            {entry.user?.full_name || 'Unknown User'}
                            {isCurrentUser && (
                              <span className="rounded-full bg-teal-100 px-2 py-1 text-xs font-medium text-teal-700">
                                You
                              </span>
                            )}
                          </h4>
                          <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                            {entry.percentile !== null && entry.percentile !== undefined && (
                              <span>Top {(100 - entry.percentile).toFixed(1)}%</span>
                            )}
                            {entry.previous_score !== null &&
                              entry.previous_score !== undefined && (
                                <span
                                  className={`flex items-center gap-1 ${
                                    entry.score > entry.previous_score
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {entry.score > entry.previous_score ? '+' : ''}
                                  {(entry.score - entry.previous_score).toLocaleString()} pts
                                </span>
                              )}
                          </div>
                        </div>

                        {/* Score */}
                        <div className="flex-shrink-0 text-right">
                          <div className="text-3xl font-bold text-gray-900">
                            {entry.score.toLocaleString()}
                          </div>
                          <div className="text-xs uppercase tracking-wide text-gray-600">
                            points
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
          {entries.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{entries.length}</p>
                <p className="mt-1 text-sm text-gray-600">Active learners</p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Total Points</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {entries.reduce((sum, entry) => sum + entry.score, 0).toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-gray-600">Earned collectively</p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                    <TrendingUp className="h-5 w-5 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Average Score</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(
                    entries.reduce((sum, entry) => sum + entry.score, 0) / entries.length
                  ).toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-gray-600">Points per learner</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
