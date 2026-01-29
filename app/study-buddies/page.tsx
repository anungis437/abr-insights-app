'use client'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

/**
 * Study Buddies Page (Phase 5)
 * Route: /study-buddies
 * Features: Find compatible study partners, send/accept requests, view active buddies
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Users,
  UserPlus,
  Check,
  X,
  Target,
  BookOpen,
  Calendar,
  MessageCircle,
  Search,
  Filter,
} from 'lucide-react'
import Image from 'next/image'
import { socialService } from '@/lib/services/social'
import type { User } from '@supabase/supabase-js'
import type { UserProfileExtended, StudyBuddy } from '@/lib/services/social'

// StudyBuddyMatch is just UserProfileExtended from the service
type StudyBuddyMatch = UserProfileExtended

export default function StudyBuddiesPage() {
  const router = useRouter()
  const supabase = createClient()

  // State
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'matches' | 'requests' | 'buddies'>('buddies')
  const [matches, setMatches] = useState<StudyBuddyMatch[]>([])
  const [pendingRequests, setPendingRequests] = useState<StudyBuddy[]>([])
  const [activeBuddies, setActiveBuddies] = useState<StudyBuddy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push('/auth/login?redirect=/study-buddies')
        return
      }

      setUser(currentUser)
      await loadData(currentUser.id)
    }
    loadUser()
  }, [supabase.auth, router])

  async function loadData(userId: string) {
    setLoading(true)
    try {
      const [matchesData, requestsData, buddiesData] = await Promise.all([
        socialService.findStudyBuddyMatches(userId),
        socialService.getPendingStudyBuddyRequests(userId),
        socialService.getStudyBuddies(userId, 'accepted'),
      ])

      setMatches(matchesData as StudyBuddyMatch[])
      setPendingRequests(requestsData)
      setActiveBuddies(buddiesData)
    } catch (error) {
      console.error('Error loading study buddy data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendRequest(buddyId: string) {
    if (!user) return

    try {
      await socialService.sendStudyBuddyRequest(user.id, buddyId, [], [])
      // Refresh matches
      const matchesData = await socialService.findStudyBuddyMatches(user.id)
      setMatches(matchesData as StudyBuddyMatch[])
    } catch (error) {
      console.error('Error sending study buddy request:', error)
    }
  }

  async function handleAcceptRequest(requestId: string) {
    try {
      await socialService.acceptStudyBuddyRequest(requestId)
      // Refresh data
      if (user) await loadData(user.id)
    } catch (error) {
      console.error('Error accepting request:', error)
    }
  }

  async function handleDeclineRequest(requestId: string) {
    try {
      await socialService.declineStudyBuddyRequest(requestId)
      // Refresh requests
      if (user) {
        const requestsData = await socialService.getPendingStudyBuddyRequests(user.id)
        setPendingRequests(requestsData)
      }
    } catch (error) {
      console.error('Error declining request:', error)
    }
  }

  const filteredMatches = matches.filter((match) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      match.display_name?.toLowerCase().includes(query) ||
      match.bio?.toLowerCase().includes(query) ||
      match.interests?.some((i: string) => i.toLowerCase().includes(query))
    )
  })

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pt-16">
      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Study Buddies</h1>
                <p className="text-gray-600">Find compatible learning partners and grow together</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8 inline-flex gap-2 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('buddies')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 transition-all ${
                activeTab === 'buddies'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="h-4 w-4" />
              Active Buddies ({activeBuddies.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 transition-all ${
                activeTab === 'requests'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              Requests ({pendingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 transition-all ${
                activeTab === 'matches'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              Find Matches ({matches.length})
            </button>
          </div>

          {/* Active Buddies Tab */}
          {activeTab === 'buddies' && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Your Study Buddies</h2>

              {loading ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              ) : activeBuddies.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                  <p className="mb-2 text-lg text-gray-600">No study buddies yet</p>
                  <p className="text-sm text-gray-500">Find compatible matches to get started!</p>
                  <button
                    onClick={() => setActiveTab('matches')}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                  >
                    <UserPlus className="h-4 w-4" />
                    Find Study Buddies
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {activeBuddies.map((buddy) => (
                    <div
                      key={buddy.id}
                      className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
                          {buddy.buddy?.avatar_url ? (
                            <Image
                              src={buddy.buddy.avatar_url}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-xl font-bold text-white">
                              {(buddy.buddy?.full_name?.[0] || 'U').toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="mb-1 text-lg font-bold text-gray-900">
                            {buddy.buddy?.full_name || 'Unknown User'}
                          </h3>
                          {/* Bio not available in StudyBuddy - would need to fetch full profile */}

                          {buddy.shared_goals && buddy.shared_goals.length > 0 && (
                            <div className="mb-2">
                              <div className="mb-1 flex items-center gap-1 text-sm text-gray-700">
                                <Target className="h-4 w-4" />
                                <span className="font-medium">Shared Goals:</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {buddy.shared_goals.map((goal, idx) => (
                                  <span
                                    key={idx}
                                    className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700"
                                  >
                                    {goal}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {buddy.target_courses && buddy.target_courses.length > 0 && (
                            <div>
                              <div className="mb-1 flex items-center gap-1 text-sm text-gray-700">
                                <BookOpen className="h-4 w-4" />
                                <span className="font-medium">Target Courses:</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {buddy.target_courses.slice(0, 3).map((course, idx) => (
                                  <span
                                    key={idx}
                                    className="rounded-full bg-teal-100 px-2 py-1 text-xs text-teal-700"
                                  >
                                    {course}
                                  </span>
                                ))}
                                {buddy.target_courses.length > 3 && (
                                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                    +{buddy.target_courses.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="mt-3 text-xs text-gray-500">
                            <Calendar className="mr-1 inline h-3 w-3" />
                            Connected {new Date(buddy.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pending Requests Tab */}
          {activeTab === 'requests' && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Pending Requests</h2>

              {loading ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="py-12 text-center">
                  <MessageCircle className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                  <p className="mb-2 text-lg text-gray-600">No pending requests</p>
                  <p className="text-sm text-gray-500">
                    Requests will appear here when others want to connect
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
                          {request.buddy?.avatar_url ? (
                            <Image
                              src={request.buddy.avatar_url}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="font-bold text-white">
                              {(request.buddy?.full_name?.[0] || 'U').toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {request.buddy?.full_name || 'Unknown User'}
                          </h3>
                          <p className="mt-1 text-xs text-gray-500">
                            Requested {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="flex items-center gap-1 rounded-lg bg-green-500 px-3 py-2 text-white transition-colors hover:bg-green-600"
                        >
                          <Check className="h-4 w-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request.id)}
                          className="flex items-center gap-1 rounded-lg bg-red-500 px-3 py-2 text-white transition-colors hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Find Matches Tab */}
          {activeTab === 'matches' && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">Find Study Buddies</h2>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, interests, or skills..."
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
                  <p className="text-gray-600">Finding matches...</p>
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className="py-12 text-center">
                  <UserPlus className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                  <p className="mb-2 text-lg text-gray-600">No matches found</p>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search or check back later
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredMatches.map((match) => (
                    <div
                      key={match.id}
                      className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-md"
                    >
                      <div className="mb-4 text-center">
                        <div className="relative mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
                          {match.avatar_url ? (
                            <Image src={match.avatar_url} alt="" fill className="object-cover" />
                          ) : (
                            <span className="text-2xl font-bold text-white">
                              {(match.display_name?.[0] || 'U').toUpperCase()}
                            </span>
                          )}
                        </div>
                        <h3 className="mb-1 text-lg font-bold text-gray-900">
                          {match.display_name || 'Unknown User'}
                        </h3>
                        {match.study_pace && (
                          <span className="text-sm capitalize text-gray-600">
                            {match.study_pace} learner
                          </span>
                        )}
                      </div>

                      {match.bio && (
                        <p className="mb-4 line-clamp-2 text-sm text-gray-600">{match.bio}</p>
                      )}

                      {match.interests && match.interests.length > 0 && (
                        <div className="mb-4">
                          <p className="mb-2 text-xs font-medium text-gray-700">Interests:</p>
                          <div className="flex flex-wrap gap-1">
                            {match.interests.slice(0, 3).map((interest, idx) => (
                              <span
                                key={idx}
                                className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700"
                              >
                                {interest}
                              </span>
                            ))}
                            {match.interests.length > 3 && (
                              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                +{match.interests.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => handleSendRequest(match.id)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                      >
                        <UserPlus className="h-4 w-4" />
                        Send Request
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
