'use client'

/**
 * QuizList Component
 * Displays available quizzes with attempt history and status
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  AlertTriangle,
  Trophy,
  FileText,
} from 'lucide-react'
import { getQuizzes } from '@/lib/services/quiz'
import { getUserQuizAttempts } from '@/lib/services/quiz'
import type { Quiz, QuizAttempt } from '@/lib/services/quiz'

interface QuizListProps {
  courseId?: string
  lessonId?: string
  userId: string
}

interface QuizWithAttempts extends Quiz {
  attempts: QuizAttempt[]
  best_score?: number
  attempts_remaining: number
  last_attempt?: QuizAttempt
  can_retake: boolean
}

export function QuizList({ courseId, lessonId, userId }: QuizListProps) {
  const [quizzes, setQuizzes] = useState<QuizWithAttempts[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        // Get quizzes
        const quizzesData = await getQuizzes({
          course_id: courseId,
          lesson_id: lessonId,
          is_published: true,
        })

        // Get attempts for each quiz
        const quizzesWithAttempts = await Promise.all(
          quizzesData.map(async (quiz) => {
            const attempts = await getUserQuizAttempts(userId, quiz.id)
            const best_score =
              attempts.length > 0 ? Math.max(...attempts.map((a) => a.score || 0)) : undefined
            const attempts_remaining = quiz.max_attempts - attempts.length
            const last_attempt = attempts.length > 0 ? attempts[0] : undefined
            const can_retake = attempts_remaining > 0 && (!last_attempt || !last_attempt.passed)

            return {
              ...quiz,
              attempts,
              best_score,
              attempts_remaining,
              last_attempt,
              can_retake,
            }
          })
        )

        setQuizzes(quizzesWithAttempts)
      } catch (error) {
        console.error('Error fetching quizzes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [courseId, lessonId, userId])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="mb-2 h-6 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
            </CardHeader>
            <CardContent>
              <div className="h-20 rounded bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (quizzes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <p className="text-muted-foreground">No quizzes available at this time.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} userId={userId} />
      ))}
    </div>
  )
}

function QuizCard({ quiz, userId }: { quiz: QuizWithAttempts; userId: string }) {
  const hasAttempted = quiz.attempts.length > 0
  const hasPassed = quiz.last_attempt?.passed || false
  const isInProgress = quiz.last_attempt?.status === 'in_progress'

  // Determine quiz status
  let statusBadge: React.ReactNode = null
  if (hasPassed) {
    statusBadge = (
      <Badge variant="default" className="bg-green-600">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Passed
      </Badge>
    )
  } else if (quiz.attempts_remaining === 0) {
    statusBadge = (
      <Badge variant="destructive">
        <XCircle className="mr-1 h-3 w-3" />
        Failed
      </Badge>
    )
  } else if (hasAttempted) {
    statusBadge = (
      <Badge variant="secondary">
        <AlertTriangle className="mr-1 h-3 w-3" />
        In Progress
      </Badge>
    )
  } else {
    statusBadge = (
      <Badge variant="outline">
        <PlayCircle className="mr-1 h-3 w-3" />
        Not Started
      </Badge>
    )
  }

  // Format availability dates
  const isAvailable = () => {
    const now = new Date()
    if (quiz.available_from && new Date(quiz.available_from) > now) return false
    if (quiz.available_until && new Date(quiz.available_until) < now) return false
    return true
  }

  const available = isAvailable()

  return (
    <Card className={!available ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{quiz.title}</CardTitle>
            <div className="text-muted-foreground mt-1 text-sm">
              {quiz.quiz_type === 'certification' && <Trophy className="mr-1 inline h-4 w-4" />}
              {quiz.quiz_type}
            </div>
          </div>
          {statusBadge}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {quiz.description && (
          <p className="text-muted-foreground line-clamp-2 text-sm">{quiz.description}</p>
        )}

        {/* Quiz Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Passing Score</div>
            <div className="font-semibold">{quiz.passing_score}%</div>
          </div>
          <div>
            <div className="text-muted-foreground">Time Limit</div>
            <div className="font-semibold">
              {quiz.time_limit_minutes ? `${quiz.time_limit_minutes} min` : 'Unlimited'}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Attempts</div>
            <div className="font-semibold">
              {quiz.attempts.length} / {quiz.max_attempts}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Best Score</div>
            <div className="font-semibold">
              {quiz.best_score !== undefined ? `${quiz.best_score.toFixed(1)}%` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Progress Bar for Best Score */}
        {quiz.best_score !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Your Progress</span>
              <span className="font-medium">{quiz.best_score.toFixed(0)}%</span>
            </div>
            <Progress value={quiz.best_score} className="h-2" />
          </div>
        )}

        {/* Last Attempt Info */}
        {quiz.last_attempt && (
          <div className="text-muted-foreground text-xs">
            Last attempt: {new Date(quiz.last_attempt.started_at).toLocaleDateString()} •{' '}
            {quiz.last_attempt.score?.toFixed(1)}%
          </div>
        )}

        {/* Availability Warning */}
        {!available && (
          <div className="rounded border border-orange-200 bg-orange-50 p-2 text-sm text-orange-900">
            <Clock className="mr-1 inline h-4 w-4" />
            {quiz.available_from && new Date(quiz.available_from) > new Date()
              ? `Available from ${new Date(quiz.available_from).toLocaleDateString()}`
              : 'No longer available'}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {quiz.can_retake && available ? (
            <Link href={`/courses/quiz/${quiz.id}`} className="flex-1">
              <Button className="w-full">{hasAttempted ? 'Retry Quiz' : 'Start Quiz'}</Button>
            </Link>
          ) : hasPassed ? (
            <Link href={`/courses/quiz/${quiz.id}/results`} className="flex-1">
              <Button variant="outline" className="w-full">
                View Results
              </Button>
            </Link>
          ) : (
            <Button variant="outline" disabled className="flex-1">
              {quiz.attempts_remaining === 0 ? 'No Attempts Left' : 'Unavailable'}
            </Button>
          )}

          {hasAttempted && (
            <Link href={`/courses/quiz/${quiz.id}/history`}>
              <Button variant="outline">History</Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
