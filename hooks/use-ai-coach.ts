'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'

export interface Recommendation {
  type: 'course' | 'skill' | 'practice' | 'connection'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  action_url?: string
}

export interface CoachingSession {
  id?: string
  session_type: string
  insights_generated: string
  recommendations: Recommendation[]
  learning_path?: string[]
  created_at?: string
  user_feedback?: string
}

export interface LearningStats {
  completed: number
  inProgress: number
  totalPoints: number
  currentStreak: number
  badgesEarned: number
  avgProgress: number
}

export function useAICoach() {
  const { user } = useAuth()
  const [currentSession, setCurrentSession] = useState<CoachingSession | null>(null)
  const [stats, setStats] = useState<LearningStats>({
    completed: 0,
    inProgress: 0,
    totalPoints: 0,
    currentStreak: 0,
    badgesEarned: 0,
    avgProgress: 0,
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user stats
  useEffect(() => {
    if (!user) return

    const loadStats = async () => {
      try {
        // You would implement actual stats fetching here
        // For now, this is a placeholder
        setStats({
          completed: 0,
          inProgress: 0,
          totalPoints: 0,
          currentStreak: 0,
          badgesEarned: 0,
          avgProgress: 0,
        })
      } catch (err) {
        console.error('Failed to load stats:', err)
      }
    }

    loadStats()
  }, [user])

  const analyzeProgress = useCallback(async () => {
    if (!user) {
      setError('You must be logged in to use the AI coach')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_progress',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze progress')
      }

      const data = await response.json()
      setCurrentSession(data.session || data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Coach analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }, [user])

  const getCustomGuidance = useCallback(
    async (query: string) => {
      if (!user) {
        setError('You must be logged in to use the AI coach')
        return
      }

      if (!query.trim()) {
        setError('Please enter a question')
        return
      }

      setIsAnalyzing(true)
      setError(null)

      try {
        const response = await fetch('/api/ai/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'custom_guidance',
            query,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to get guidance')
        }

        const data = await response.json()
        setCurrentSession(data.session || data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred'
        setError(errorMessage)
        console.error('Coach guidance error:', err)
      } finally {
        setIsAnalyzing(false)
      }
    },
    [user]
  )

  const provideFeedback = useCallback(
    async (sessionId: string, feedback: 'helpful' | 'not_helpful') => {
      try {
        const response = await fetch('/api/ai/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            feedback,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to submit feedback')
        }

        // Update local session
        if (currentSession && currentSession.id === sessionId) {
          setCurrentSession({
            ...currentSession,
            user_feedback: feedback,
          })
        }
      } catch (err) {
        console.error('Feedback error:', err)
      }
    },
    [currentSession]
  )

  return {
    currentSession,
    stats,
    isAnalyzing,
    error,
    analyzeProgress,
    getCustomGuidance,
    provideFeedback,
  }
}
