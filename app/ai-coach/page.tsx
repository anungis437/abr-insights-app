'use client'

/**
 * AI Coach Page
 * Replaces legacy AICoach.jsx (713 lines)
 * Route: /ai-coach
 * Features: Personalized learning coaching, progress analysis, learning path recommendations
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Lightbulb,
  TrendingUp,
  Target,
  Sparkles,
  BookOpen,
  Trophy,
  AlertCircle,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Flame,
  Award,
  CheckCircle,
  ArrowRight,
  Star,
  Calendar
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import ReactMarkdown from 'react-markdown'

// Types
interface CoachingSession {
  id?: string
  session_type: string
  insights_generated: string
  recommendations: Recommendation[]
  learning_path?: string[]
  created_at?: string
  user_feedback?: string
}

interface Recommendation {
  type: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  action_url?: string
}

interface Stats {
  completed: number
  inProgress: number
  totalPoints: number
  currentStreak: number
  badgesEarned: number
  avgProgress: number
}

export default function AICoachPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // State
  const [user, setUser] = useState<User | null>(null)
  const [currentSession, setCurrentSession] = useState<CoachingSession | null>(null)
  const [customQuery, setCustomQuery] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [stats, setStats] = useState<Stats>({
    completed: 0,
    inProgress: 0,
    totalPoints: 0,
    currentStreak: 0,
    badgesEarned: 0,
    avgProgress: 0
  })

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      setUser(currentUser)
    }
    loadUser()
  }, [supabase.auth, router])

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      if (!user) return

      // Get enrollments
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('status, progress')
        .eq('user_id', user.id)

      const completed = enrollments?.filter((e: any) => e.status === 'completed').length || 0
      const inProgress = enrollments?.filter((e: any) => e.status === 'in_progress').length || 0
      const avgProgress = enrollments && enrollments.length > 0
        ? enrollments.reduce((sum: number, e: any) => sum + (e.progress || 0), 0) / enrollments.length
        : 0

      // Get points (handle empty table gracefully)
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', user.id)

      const totalPoints = pointsError ? 0 : (pointsData?.reduce((sum: number, p: any) => sum + (p.points || 0), 0) || 0)

      // Get streak
      const { data: streakData } = await supabase
        .from('learning_streaks')
        .select('current_streak_days')
        .eq('user_id', user.id)
        .single()

      // Get badges
      const { count: badgesCount } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      setStats({
        completed,
        inProgress,
        totalPoints,
        currentStreak: streakData?.current_streak_days || 0,
        badgesEarned: badgesCount || 0,
        avgProgress: Math.round(avgProgress)
      })
    }
    loadStats()
  }, [supabase, user])

  // Generate coaching session
  const generateCoachingSession = async (type: string, query?: string) => {
    setIsAnalyzing(true)

    try {
      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionType: type,
          query: query || undefined,
          context: {
            userId: user?.id,
            stats
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate coaching session')
      }

      const data = await response.json()

      setCurrentSession({
        session_type: type,
        insights_generated: data.insights || 'Unable to generate insights at this time.',
        recommendations: data.recommendations || [],
        learning_path: data.learningPath || []
      })

    } catch (error) {
      console.error('Error generating coaching session:', error)
      setCurrentSession({
        session_type: type,
        insights_generated: 'I apologize, but I encountered an error generating your coaching session. Please try again.',
        recommendations: [],
        learning_path: []
      })
    }

    setIsAnalyzing(false)
  }

  const handleFeedback = async (feedbackType: string) => {
    if (currentSession) {
      // Save feedback (could be stored in database)
      // Future: Save to coaching_sessions table
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-16">      
      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Lightbulb className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">AI Learning Coach</h1>
                <p className="text-gray-600">Personalized guidance powered by artificial intelligence</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-gray-900">{stats.completed}</div>
                  <div className="text-sm text-gray-600 mt-1">Completed</div>
                </div>
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-orange-600 flex items-center gap-1">
                    {stats.currentStreak}
                    <Flame className="w-6 h-6" />
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Day Streak</div>
                </div>
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-purple-600">{stats.totalPoints}</div>
                  <div className="text-sm text-gray-600 mt-1">Points</div>
                </div>
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-yellow-600 flex items-center gap-1">
                    {stats.badgesEarned}
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Badges</div>
                </div>
              </div>

              {/* Coaching Session */}
              {currentSession ? (
                <div className="space-y-6">
                  {/* Insights */}
                  <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg border-2 border-purple-200 shadow-sm">
                    <div className="p-6 border-b border-purple-100">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <Sparkles className="w-6 h-6 text-purple-600" />
                          Your Personalized Coaching
                        </h2>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          Just for You
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="prose prose-sm max-w-none text-gray-700">
                        <ReactMarkdown>{currentSession.insights_generated}</ReactMarkdown>
                      </div>

                      {/* Feedback */}
                      <div className="mt-6 pt-6 border-t border-purple-100">
                        <p className="text-sm text-gray-600 mb-3">Was this coaching helpful?</p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleFeedback('helpful')}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            Helpful
                          </button>
                          <button
                            onClick={() => handleFeedback('somewhat_helpful')}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                          >
                            Somewhat
                          </button>
                          <button
                            onClick={() => handleFeedback('not_helpful')}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                          >
                            <ThumbsDown className="w-4 h-4" />
                            Not Helpful
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {currentSession.recommendations && currentSession.recommendations.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="p-6 border-b">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Target className="w-5 h-5 text-teal-600" />
                          Recommended Actions
                        </h3>
                      </div>
                      <div className="p-6 space-y-3">
                        {currentSession.recommendations.map((rec, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-2 ${
                              rec.priority === 'high'
                                ? 'border-red-200 bg-red-50'
                                : rec.priority === 'medium'
                                ? 'border-yellow-200 bg-yellow-50'
                                : 'border-blue-200 bg-blue-50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    rec.priority === 'high'
                                      ? 'bg-red-100 text-red-700'
                                      : rec.priority === 'medium'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {rec.priority} priority
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{rec.description}</p>
                              </div>
                            </div>
                            {rec.action_url && (
                              <button
                                onClick={() => router.push(rec.action_url!)}
                                className="mt-3 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg text-sm font-medium hover:from-teal-700 hover:to-teal-800 transition-all"
                              >
                                Take Action
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setCurrentSession(null)}
                    className="w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all"
                  >
                    Start New Session
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg border-2 border-purple-200 shadow-sm">
                  <div className="p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Choose Your Coaching Session</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <button
                      onClick={() => generateCoachingSession('comprehensive')}
                      disabled={isAnalyzing}
                      className="w-full text-left p-6 rounded-lg border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-2">Comprehensive Progress Review</h3>
                          <p className="text-sm text-gray-600">
                            Get a complete analysis of your learning journey with personalized feedback and actionable next steps.
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => generateCoachingSession('learning_path')}
                      disabled={isAnalyzing}
                      className="w-full text-left p-6 rounded-lg border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-2">Create Learning Path</h3>
                          <p className="text-sm text-gray-600">
                            Generate a personalized course sequence optimized for your learning goals and current level.
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => generateCoachingSession('at_risk')}
                      disabled={isAnalyzing}
                      className="w-full text-left p-6 rounded-lg border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50 transition-all disabled:opacity-50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-2">Re-engagement Support</h3>
                          <p className="text-sm text-gray-600">
                            Get supportive guidance if you&rsquo;re struggling with motivation or finding it hard to stay consistent.
                          </p>
                        </div>
                      </div>
                    </button>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold text-gray-900 mb-3">Custom Question</h4>
                      <textarea
                        placeholder="Ask me anything about your learning journey..."
                        value={customQuery}
                        onChange={(e) => setCustomQuery(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3"
                      />
                      <button
                        onClick={() => generateCoachingSession('custom_query', customQuery)}
                        disabled={isAnalyzing || !customQuery.trim()}
                        className="w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg font-medium hover:from-teal-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Get Coaching
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* How It Works */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200 shadow-sm">
                <div className="p-6 border-b border-blue-100">
                  <h3 className="text-lg font-bold text-gray-900">How AI Coaching Works</h3>
                </div>
                <div className="p-6 space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">Analyzes your progress, patterns, and engagement</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">Provides personalized, actionable recommendations</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">Adapts guidance based on your learning style</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">Tracks your progress and adjusts over time</p>
                  </div>
                </div>
              </div>

              {/* Pro Tips */}
              <div className="bg-gradient-to-br from-yellow-50 to-white rounded-lg border border-yellow-200 shadow-sm">
                <div className="p-6 border-b border-yellow-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    Pro Tips
                  </h3>
                </div>
                <div className="p-6 space-y-3 text-sm text-gray-700">
                  <p>💡 Check in with your AI coach weekly for best results</p>
                  <p>🎯 Be specific in your questions for more targeted advice</p>
                  <p>📈 Act on recommendations to see real progress</p>
                  <p>🔥 Consistent small steps beat occasional big efforts</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-6 space-y-2">
                  <button
                    onClick={() => router.push('/courses')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Browse Courses
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => router.push('/leaderboard')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      View Leaderboard
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => router.push('/analytics')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Track Progress
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>    </div>
  )
}
