'use client'

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
  Filter
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
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
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
      const [
        matchesData,
        requestsData,
        buddiesData
      ] = await Promise.all([
        socialService.findStudyBuddyMatches(userId),
        socialService.getPendingStudyBuddyRequests(userId),
        socialService.getStudyBuddies(userId, 'accepted')
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

  const filteredMatches = matches.filter(match => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      match.display_name?.toLowerCase().includes(query) ||
      match.bio?.toLowerCase().includes(query) ||
      match.interests?.some((i: string) => i.toLowerCase().includes(query))
    )
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-16">      
      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Study Buddies</h1>
                <p className="text-gray-600">Find compatible learning partners and grow together</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8 inline-flex gap-2 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
            <button
              onClick={() => setActiveTab('buddies')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === 'buddies'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" />
              Active Buddies ({activeBuddies.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === 'requests'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Requests ({pendingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === 'matches'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Find Matches ({matches.length})
            </button>
          </div>

          {/* Active Buddies Tab */}
          {activeTab === 'buddies' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Study Buddies</h2>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              ) : activeBuddies.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No study buddies yet</p>
                  <p className="text-gray-500 text-sm">Find compatible matches to get started!</p>
                  <button
                    onClick={() => setActiveTab('matches')}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Find Study Buddies
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeBuddies.map((buddy) => (
                    <div key={buddy.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                          {buddy.buddy?.avatar_url ? (
                            <Image
                              src={buddy.buddy.avatar_url}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-white text-xl font-bold">
                              {(buddy.buddy?.full_name?.[0] || 'U').toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {buddy.buddy?.full_name || 'Unknown User'}
                          </h3>
                          {/* Bio not available in StudyBuddy - would need to fetch full profile */}
                          
                          {buddy.shared_goals && buddy.shared_goals.length > 0 && (
                            <div className="mb-2">
                              <div className="flex items-center gap-1 text-sm text-gray-700 mb-1">
                                <Target className="w-4 h-4" />
                                <span className="font-medium">Shared Goals:</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {buddy.shared_goals.map((goal, idx) => (
                                  <span key={idx} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                    {goal}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {buddy.target_courses && buddy.target_courses.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1 text-sm text-gray-700 mb-1">
                                <BookOpen className="w-4 h-4" />
                                <span className="font-medium">Target Courses:</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {buddy.target_courses.slice(0, 3).map((course, idx) => (
                                  <span key={idx} className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-full">
                                    {course}
                                  </span>
                                ))}
                                {buddy.target_courses.length > 3 && (
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                    +{buddy.target_courses.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-3 text-xs text-gray-500">
                            <Calendar className="w-3 h-3 inline mr-1" />
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Requests</h2>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No pending requests</p>
                  <p className="text-gray-500 text-sm">Requests will appear here when others want to connect</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center overflow-hidden relative">
                          {request.buddy?.avatar_url ? (
                            <Image
                              src={request.buddy.avatar_url}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold">
                              {(request.buddy?.full_name?.[0] || 'U').toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {request.buddy?.full_name || 'Unknown User'}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Requested {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request.id)}
                          className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Find Study Buddies</h2>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, interests, or skills..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Finding matches...</p>
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No matches found</p>
                  <p className="text-gray-500 text-sm">Try adjusting your search or check back later</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMatches.map((match) => (
                    <div key={match.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="text-center mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden relative">
                          {match.avatar_url ? (
                            <Image
                              src={match.avatar_url}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-white text-2xl font-bold">
                              {(match.display_name?.[0] || 'U').toUpperCase()}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                          {match.display_name || 'Unknown User'}
                        </h3>
                        {match.study_pace && (
                          <span className="text-sm text-gray-600 capitalize">{match.study_pace} learner</span>
                        )}
                      </div>
                      
                      {match.bio && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{match.bio}</p>
                      )}
                      
                      {match.interests && match.interests.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-700 mb-2">Interests:</p>
                          <div className="flex flex-wrap gap-1">
                            {match.interests.slice(0, 3).map((interest, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                {interest}
                              </span>
                            ))}
                            {match.interests.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                +{match.interests.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleSendRequest(match.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
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
