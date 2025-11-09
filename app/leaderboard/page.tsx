'use client'

/**
 * Enhanced Leaderboard Page (Phase 5)
 * Route: /leaderboard
 * Features: Multiple leaderboard types, time periods, rank changes, user position
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
  Filter,
  ChevronUp,
  ChevronDown,
  Minus,
  Calendar
} from 'lucide-react'
import Image from 'next/image'
import { gamificationService } from '@/lib/services/gamification'
import type { User } from '@supabase/supabase-js'
import type { Leaderboard, LeaderboardEntry } from '@/lib/services/gamification'

export default function LeaderboardPage() {
  const router = useRouter()
  const supabase = createClient()
  
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
      const { data: { user: currentUser } } = await supabase.auth.getUser()
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
        const defaultBoard = boards.find(b => b.leaderboard_type === 'global' && b.time_period === 'all_time')
        if (defaultBoard) {
          setSelectedLeaderboard(defaultBoard)
        } else if (boards.length > 0) {
          setSelectedLeaderboard(boards[0])
        }
      } catch (error) {
        console.error('Error loading leaderboards:', error)
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
        console.error('Error loading leaderboard entries:', error)
      } finally {
        setLoading(false)
      }
    }
    loadEntries()
  }, [selectedLeaderboard, user])

  // Helper functions
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

  const getRankChangeIndicator = (rankChange: number) => {
    if (rankChange > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <ChevronUp className="w-4 h-4" />
          <span className="text-xs font-medium">+{rankChange}</span>
        </div>
      )
    } else if (rankChange < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <ChevronDown className="w-4 h-4" />
          <span className="text-xs font-medium">{rankChange}</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 text-gray-400">
        <Minus className="w-4 h-4" />
      </div>
    )
  }

  const getLeaderboardIcon = (type: string) => {
    switch (type) {
      case 'global':
        return <Trophy className="w-4 h-4" />
      case 'course':
        return <Award className="w-4 h-4" />
      case 'organization':
        return <Users className="w-4 h-4" />
      case 'skill':
        return <Target className="w-4 h-4" />
      default:
        return <Star className="w-4 h-4" />
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
  const leaderboardsByType = leaderboards.reduce((acc, board) => {
    if (!acc[board.leaderboard_type]) {
      acc[board.leaderboard_type] = []
    }
    acc[board.leaderboard_type].push(board)
    return acc
  }, {} as Record<string, Leaderboard[]>)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-16">      
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

          {/* Leaderboard Selection */}
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Leaderboard Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                      selectedLeaderboard?.leaderboard_type === type
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-200 hover:shadow-md'
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <div className="grid grid-cols-2 gap-2">
                {selectedLeaderboard && 
                  leaderboardsByType[selectedLeaderboard.leaderboard_type]?.map((board) => (
                    <button
                      key={board.id}
                      onClick={() => setSelectedLeaderboard(board)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                        selectedLeaderboard?.id === board.id
                          ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-200 hover:shadow-md'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{getTimePeriodLabel(board.time_period)}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* User Rank Card */}
          {user && userEntry && (
            <div className="mb-8 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-6 border-2 border-teal-200 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                    {userEntry.user?.avatar_url ? (
                      <Image
                        src={userEntry.user.avatar_url}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span>{(userEntry.user?.full_name?.[0] || 'U').toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Your Current Rank</p>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="text-5xl font-bold text-gray-900">
                        #{userEntry.rank}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {userEntry.score.toLocaleString()} points
                        </p>
                        {userEntry.percentile !== null && userEntry.percentile !== undefined && (
                          <p className="text-sm text-gray-600">
                            Top {(100 - userEntry.percentile).toFixed(1)}%
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {getRankChangeIndicator(userEntry.rank_change)}
                          {userEntry.previous_rank && (
                            <span className="text-xs text-gray-600">
                              from #{userEntry.previous_rank}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-teal-700 font-medium">
                      Keep learning to climb the ranks! 🚀
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  {selectedLeaderboard?.name || 'Top Performers'}
                </h2>
                <div className="text-sm text-gray-600">
                  Showing top {entries.length} learners
                </div>
              </div>
              {selectedLeaderboard?.description && (
                <p className="text-gray-600 mt-2">{selectedLeaderboard.description}</p>
              )}
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading leaderboard...</p>
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No data yet</p>
                  <p className="text-gray-500 text-sm">Start learning to see your rank!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry) => {
                    const isCurrentUser = user && entry.user_id === user.id
                    const rank = entry.rank
                    
                    return (
                      <div
                        key={entry.id}
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

                        {/* Rank Change */}
                        <div className="flex-shrink-0">
                          {getRankChangeIndicator(entry.rank_change)}
                        </div>

                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden relative">
                          {entry.user?.avatar_url ? (
                            <Image
                              src={entry.user.avatar_url}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-white text-lg font-bold">
                              {(entry.user?.full_name?.[0] || 'U').toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 truncate flex items-center gap-2">
                            {entry.user?.full_name || 'Unknown User'}
                            {isCurrentUser && (
                              <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-full font-medium">
                                You
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            {entry.percentile !== null && entry.percentile !== undefined && (
                              <span>Top {(100 - entry.percentile).toFixed(1)}%</span>
                            )}
                            {entry.previous_score !== null && entry.previous_score !== undefined && (
                              <span className={`flex items-center gap-1 ${
                                entry.score > entry.previous_score ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {entry.score > entry.previous_score ? '+' : ''}
                                {(entry.score - entry.previous_score).toLocaleString()} pts
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-3xl font-bold text-gray-900">
                            {entry.score.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600 uppercase tracking-wide">
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
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{entries.length}</p>
                <p className="text-sm text-gray-600 mt-1">Active learners</p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Total Points</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {entries.reduce((sum, entry) => sum + entry.score, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">Earned collectively</p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Average Score</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(entries.reduce((sum, entry) => sum + entry.score, 0) / entries.length).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">Points per learner</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
