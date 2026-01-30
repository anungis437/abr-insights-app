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
  Calendar,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import ReactMarkdown from 'react-markdown'
import { useFeatureAccess } from '@/hooks/use-entitlements'

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
  const { hasAccess, isLoading: isCheckingAccess } = useFeatureAccess('aiCoachAccess')

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
    avgProgress: 0,
  })

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }
      setUser(currentUser)
    }
    loadUser()
  }, [supabase.auth, router])

  // Redirect if no access after loading
  useEffect(() => {
    if (!isCheckingAccess && !hasAccess && user) {
      router.push('/pricing?feature=ai-coach&upgrade=required')
    }
  }, [isCheckingAccess, hasAccess, user, router])

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
      const avgProgress =
        enrollments && enrollments.length > 0
          ? enrollments.reduce((sum: number, e: any) => sum + (e.progress || 0), 0) /
            enrollments.length
          : 0

      // Get points (handle empty table gracefully)
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', user.id)

      const totalPoints = pointsError
        ? 0
        : pointsData?.reduce((sum: number, p: any) => sum + (p.points || 0), 0) || 0

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
        avgProgress: Math.round(avgProgress),
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
            stats,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate coaching session')
      }

      const data = await response.json()

      setCurrentSession({
        session_type: type,
        insights_generated: data.insights || 'Unable to generate insights at this time.',
        recommendations: data.recommendations || [],
        learning_path: data.learningPath || [],
      })
    } catch (error) {
      console.error('Error generating coaching session:', error)
      setCurrentSession({
        session_type: type,
        insights_generated:
          'I apologize, but I encountered an error generating your coaching session. Please try again.',
        recommendations: [],
        learning_path: [],
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pt-16">
      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
                <Lightbulb className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">AI Learning Coach</h1>
                <p className="text-gray-600">
                  Personalized guidance powered by artificial intelligence
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="text-3xl font-bold text-gray-900">{stats.completed}</div>
                  <div className="mt-1 text-sm text-gray-600">Completed</div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-1 text-3xl font-bold text-orange-600">
                    {stats.currentStreak}
                    <Flame className="h-6 w-6" />
                  </div>
                  <div className="mt-1 text-sm text-gray-600">Day Streak</div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="text-3xl font-bold text-purple-600">{stats.totalPoints}</div>
                  <div className="mt-1 text-sm text-gray-600">Points</div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-1 text-3xl font-bold text-yellow-600">
                    {stats.badgesEarned}
                    <Award className="h-6 w-6" />
                  </div>
                  <div className="mt-1 text-sm text-gray-600">Badges</div>
                </div>
              </div>

              {/* Coaching Session */}
              {currentSession ? (
                <div className="space-y-6">
                  {/* Insights */}
                  <div className="rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-sm">
                    <div className="border-b border-purple-100 p-6">
                      <div className="flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                          <Sparkles className="h-6 w-6 text-purple-600" />
                          Your Personalized Coaching
                        </h2>
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                          Just for You
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="prose prose-sm max-w-none text-gray-700">
                        <ReactMarkdown>{currentSession.insights_generated}</ReactMarkdown>
                      </div>

                      {/* Feedback */}
                      <div className="mt-6 border-t border-purple-100 pt-6">
                        <p className="mb-3 text-sm text-gray-600">Was this coaching helpful?</p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleFeedback('helpful')}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-all hover:bg-gray-50"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            Helpful
                          </button>
                          <button
                            onClick={() => handleFeedback('somewhat_helpful')}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-all hover:bg-gray-50"
                          >
                            Somewhat
                          </button>
                          <button
                            onClick={() => handleFeedback('not_helpful')}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-all hover:bg-gray-50"
                          >
                            <ThumbsDown className="h-4 w-4" />
                            Not Helpful
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {currentSession.recommendations && currentSession.recommendations.length > 0 && (
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                      <div className="border-b p-6">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                          <Target className="h-5 w-5 text-teal-600" />
                          Recommended Actions
                        </h3>
                      </div>
                      <div className="space-y-3 p-6">
                        {currentSession.recommendations.map((rec, index) => (
                          <div
                            key={index}
                            className={`rounded-lg border-2 p-4 ${
                              rec.priority === 'high'
                                ? 'border-red-200 bg-red-50'
                                : rec.priority === 'medium'
                                  ? 'border-yellow-200 bg-yellow-50'
                                  : 'border-blue-200 bg-blue-50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs ${
                                      rec.priority === 'high'
                                        ? 'bg-red-100 text-red-700'
                                        : rec.priority === 'medium'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-blue-100 text-blue-700'
                                    }`}
                                  >
                                    {rec.priority} priority
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{rec.description}</p>
                              </div>
                            </div>
                            {rec.action_url && (
                              <button
                                onClick={() => router.push(rec.action_url!)}
                                className="mt-3 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-2 text-sm font-medium text-white transition-all hover:from-teal-700 hover:to-teal-800"
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
                    className="w-full rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
                  >
                    Start New Session
                  </button>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-purple-200 bg-white shadow-sm">
                  <div className="border-b p-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      Choose Your Coaching Session
                    </h2>
                  </div>
                  <div className="space-y-4 p-6">
                    <button
                      onClick={() => generateCoachingSession('comprehensive')}
                      disabled={isAnalyzing}
                      className="w-full rounded-lg border-2 border-purple-300 p-6 text-left transition-all hover:border-purple-500 hover:bg-purple-50 disabled:opacity-50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-2 text-lg font-bold text-gray-900">
                            Comprehensive Progress Review
                          </h3>
                          <p className="text-sm text-gray-600">
                            Get a complete analysis of your learning journey with personalized
                            feedback and actionable next steps.
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => generateCoachingSession('learning_path')}
                      disabled={isAnalyzing}
                      className="w-full rounded-lg border-2 border-blue-300 p-6 text-left transition-all hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                          <Target className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-2 text-lg font-bold text-gray-900">
                            Create Learning Path
                          </h3>
                          <p className="text-sm text-gray-600">
                            Generate a personalized course sequence optimized for your learning
                            goals and current level.
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => generateCoachingSession('at_risk')}
                      disabled={isAnalyzing}
                      className="w-full rounded-lg border-2 border-orange-300 p-6 text-left transition-all hover:border-orange-500 hover:bg-orange-50 disabled:opacity-50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
                          <AlertCircle className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-2 text-lg font-bold text-gray-900">
                            Re-engagement Support
                          </h3>
                          <p className="text-sm text-gray-600">
                            Get supportive guidance if you&rsquo;re struggling with motivation or
                            finding it hard to stay consistent.
                          </p>
                        </div>
                      </div>
                    </button>

                    <div className="border-t pt-4">
                      <h4 className="mb-3 font-semibold text-gray-900">Custom Question</h4>
                      <textarea
                        placeholder="Ask me anything about your learning journey..."
                        value={customQuery}
                        onChange={(e) => setCustomQuery(e.target.value)}
                        rows={3}
                        className="mb-3 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => generateCoachingSession('custom_query', customQuery)}
                        disabled={isAnalyzing || !customQuery.trim()}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-blue-600 px-6 py-3 font-medium text-white transition-all hover:from-teal-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5" />
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
              <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm">
                <div className="border-b border-blue-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900">How AI Coaching Works</h3>
                </div>
                <div className="space-y-3 p-6 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <p className="text-gray-700">
                      Analyzes your progress, patterns, and engagement
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <p className="text-gray-700">
                      Provides personalized, actionable recommendations
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <p className="text-gray-700">Adapts guidance based on your learning style</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <p className="text-gray-700">Tracks your progress and adjusts over time</p>
                  </div>
                </div>
              </div>

              {/* Pro Tips */}
              <div className="rounded-lg border border-yellow-200 bg-gradient-to-br from-yellow-50 to-white shadow-sm">
                <div className="border-b border-yellow-100 p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    Pro Tips
                  </h3>
                </div>
                <div className="space-y-3 p-6 text-sm text-gray-700">
                  <p>💡 Check in with your AI coach weekly for best results</p>
                  <p>🎯 Be specific in your questions for more targeted advice</p>
                  <p>📈 Act on recommendations to see real progress</p>
                  <p>🔥 Consistent small steps beat occasional big efforts</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b p-6">
                  <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                </div>
                <div className="space-y-2 p-6">
                  <button
                    onClick={() => router.push('/courses')}
                    className="flex w-full items-center justify-between rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium transition-all hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Browse Courses
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => router.push('/leaderboard')}
                    className="flex w-full items-center justify-between rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium transition-all hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      View Leaderboard
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => router.push('/analytics')}
                    className="flex w-full items-center justify-between rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium transition-all hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Track Progress
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>{' '}
    </div>
  )
}
