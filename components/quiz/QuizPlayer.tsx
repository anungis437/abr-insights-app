'use client'

import { logger } from '@/lib/utils/production-logger'

/**
 * QuizPlayer Component
 * Interactive quiz interface with timed assessments, multiple attempts, and progress tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Award,
  Download,
} from 'lucide-react'
import type { QuizWithQuestions, QuizAttempt } from '@/lib/services/quiz'
import {
  startQuizAttempt,
  submitQuizResponse,
  submitQuizAttempt,
  getQuizAttempt,
} from '@/lib/services/quiz'
import { QuestionRenderer } from './QuestionRenderer'
import { generateCertificateAction } from '@/lib/actions/certificates'
import type { Certificate } from '@/lib/services/certificates'

interface QuizPlayerProps {
  quiz: QuizWithQuestions
  userId: string
  onComplete?: (attempt: QuizAttempt) => void
}

interface QuestionAnswer {
  question_id: string
  answer_data: any
  time_spent_seconds: number
  flagged: boolean
}

export function QuizPlayer({ quiz, userId, onComplete }: QuizPlayerProps) {
  const router = useRouter()
  const { toast } = useToast()

  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({})
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [showResults, setShowResults] = useState(false)
  const [attemptResults, setAttemptResults] = useState<QuizAttempt | null>(null)
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [generatingCertificate, setGeneratingCertificate] = useState(false)
  const [certificateError, setCertificateError] = useState<string | null>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const totalQuestions = quiz.questions.length
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100

  // Check if user can attempt
  const canAttempt = quiz.user_attempts && quiz.user_attempts.length < quiz.max_attempts
  const attemptsRemaining = quiz.max_attempts - (quiz.user_attempts?.length || 0)

  // Initialize quiz attempt
  useEffect(() => {
    const initAttempt = async () => {
      if (!canAttempt) {
        toast({
          title: 'Maximum Attempts Reached',
          description: `You have used all ${quiz.max_attempts} attempts for this quiz.`,
          variant: 'destructive',
        })
        return
      }

      const attempt = await startQuizAttempt(quiz.id, userId)
      if (attempt) {
        setAttemptId(attempt.id)

        // Initialize timer if quiz has time limit
        if (quiz.time_limit_minutes) {
          setTimeRemaining(quiz.time_limit_minutes * 60)
        }
      } else {
        toast({
          title: 'Error',
          description: 'Failed to start quiz attempt. Please try again.',
          variant: 'destructive',
        })
      }
    }

    initAttempt()
  }, [quiz.id, userId, quiz.max_attempts, quiz.time_limit_minutes, canAttempt, toast])

  // Timer countdown
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !showResults) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            handleAutoSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
  }, [timeRemaining, showResults])

  // Format time remaining
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle answer change
  const handleAnswerChange = useCallback(
    (answer_data: any) => {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)

      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          question_id: currentQuestion.id,
          answer_data,
          time_spent_seconds: timeSpent,
          flagged: prev[currentQuestion.id]?.flagged || false,
        },
      }))
    },
    [currentQuestion.id, questionStartTime]
  )

  // Navigate to question
  const goToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalQuestions) {
        setCurrentQuestionIndex(index)
        setQuestionStartTime(Date.now())
      }
    },
    [totalQuestions]
  )

  // Flag question for review
  const toggleFlag = useCallback(() => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        question_id: currentQuestion.id,
        answer_data: prev[currentQuestion.id]?.answer_data || null,
        time_spent_seconds: prev[currentQuestion.id]?.time_spent_seconds || 0,
        flagged: !prev[currentQuestion.id]?.flagged,
      },
    }))
  }, [currentQuestion.id])

  // Submit quiz
  const handleSubmit = useCallback(async () => {
    if (!attemptId) return

    setIsSubmitting(true)

    try {
      // Submit all responses
      for (const answer of Object.values(answers)) {
        await submitQuizResponse({
          attempt_id: attemptId,
          question_id: answer.question_id,
          answer_data: answer.answer_data,
          time_spent_seconds: answer.time_spent_seconds,
        })
      }

      // Submit attempt
      const completedAttempt = await submitQuizAttempt(attemptId)

      if (completedAttempt) {
        // Get full results
        const results = await getQuizAttempt(attemptId)
        setAttemptResults(results)
        setShowResults(true)

        toast({
          title: 'Quiz Submitted',
          description: `You scored ${completedAttempt.score?.toFixed(1)}%`,
          variant: completedAttempt.passed ? 'default' : 'destructive',
        })

        if (onComplete) {
          onComplete(completedAttempt)
        }
      }
    } catch (error) {
      logger.error('Error submitting quiz:', { error: error, context: 'QuizPlayer' })
      toast({
        title: 'Submission Error',
        description: 'Failed to submit quiz. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [attemptId, answers, onComplete, toast])

  // Auto-submit when time expires
  const handleAutoSubmit = useCallback(async () => {
    toast({
      title: 'Time Expired',
      description: 'Your quiz has been automatically submitted.',
      variant: 'destructive',
    })
    await handleSubmit()
  }, [toast, handleSubmit])

  // Handle certificate generation
  const handleGenerateCertificate = async () => {
    if (!attemptId || !attemptResults?.passed) return

    setGeneratingCertificate(true)
    setCertificateError(null)

    try {
      // Get user's full name from their profile or use a default
      const recipientName = userId // This should be replaced with actual user name

      const result = await generateCertificateAction(attemptId, recipientName)

      if (result.success && result.certificate) {
        setCertificate(result.certificate)
        toast({
          title: 'Certificate Generated',
          description: 'Your certificate is ready to download!',
        })
      } else {
        setCertificateError(result.error || 'Failed to generate certificate')
        toast({
          title: 'Certificate Error',
          description: result.error || 'Failed to generate certificate',
          variant: 'destructive',
        })
      }
    } catch (error) {
      logger.error('Error generating certificate:', { error: error, context: 'QuizPlayer' })
      setCertificateError('An unexpected error occurred')
      toast({
        title: 'Certificate Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setGeneratingCertificate(false)
    }
  }

  // Render results view
  if (showResults && attemptResults) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {attemptResults.passed ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              Quiz Complete
            </CardTitle>
            <div className="text-muted-foreground text-sm">
              Attempt {attemptResults.attempt_number} of {quiz.max_attempts}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Summary */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{attemptResults.score?.toFixed(1)}%</div>
                    <div className="text-muted-foreground text-sm">Final Score</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {attemptResults.points_earned}/{attemptResults.points_possible}
                    </div>
                    <div className="text-muted-foreground text-sm">Points</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {Math.floor((attemptResults.time_spent_seconds || 0) / 60)}m
                    </div>
                    <div className="text-muted-foreground text-sm">Time Spent</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pass/Fail Status */}
            <div
              className={`rounded-lg p-4 ${
                attemptResults.passed
                  ? 'border border-green-200 bg-green-50'
                  : 'border border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {attemptResults.passed ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">
                      Congratulations! You passed the quiz.
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-900">
                      You did not pass. Passing score: {quiz.passing_score}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Certificate Generation */}
            {attemptResults.passed && quiz.quiz_type === 'certification' && (
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                <div className="flex items-start gap-3">
                  <Award className="mt-1 h-6 w-6 flex-shrink-0 text-purple-600" />
                  <div className="flex-1">
                    <h3 className="mb-2 font-semibold text-purple-900">
                      {certificate ? 'Certificate Ready!' : 'Earn Your Certificate'}
                    </h3>
                    {certificate ? (
                      <div className="space-y-3">
                        <p className="text-sm text-purple-800">
                          Your certificate has been generated. Certificate #
                          {certificate.certificate_number}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            className="h-8 px-3 py-1.5 text-sm"
                            onClick={() => router.push(`/certificates/${certificate.id}`)}
                          >
                            <Award className="mr-2 h-4 w-4" />
                            View Certificate
                          </Button>
                          {certificate.pdf_url && (
                            <Button
                              variant="outline"
                              className="h-8 px-3 py-1.5 text-sm"
                              onClick={() => window.open(certificate.pdf_url, '_blank')}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-purple-800">
                          You&apos;ve successfully completed this quiz! Generate your certificate to
                          commemorate your achievement.
                        </p>
                        <Button
                          className="h-8 px-3 py-1.5 text-sm"
                          onClick={handleGenerateCertificate}
                          disabled={generatingCertificate}
                        >
                          {generatingCertificate ? (
                            <>Generating...</>
                          ) : (
                            <>
                              <Award className="mr-2 h-4 w-4" />
                              Generate Certificate
                            </>
                          )}
                        </Button>
                        {certificateError && (
                          <p className="text-sm text-red-600">{certificateError}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Review Answers */}
            {quiz.allow_review && quiz.show_correct_answers && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Answer Review</h3>
                {quiz.questions.map((question, index) => {
                  const response = attemptResults.responses?.find(
                    (r) => r.question_id === question.id
                  )
                  return (
                    <Card key={question.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          Question {index + 1}
                          {response?.is_correct ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="font-medium">{question.question_text}</p>
                          {response && (
                            <div className="text-muted-foreground text-sm">
                              Your answer: {JSON.stringify(response.answer_data)}
                            </div>
                          )}
                          {quiz.show_explanations && question.explanation && (
                            <div className="mt-2 rounded border border-blue-200 bg-blue-50 p-3">
                              <p className="text-sm text-blue-900">{question.explanation}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              {attemptsRemaining > 0 && !attemptResults.passed && (
                <Button onClick={() => window.location.reload()}>
                  Retry Quiz ({attemptsRemaining} attempts left)
                </Button>
              )}
              <Button variant="outline" onClick={() => router.back()}>
                Back to Course
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render quiz attempt view
  if (!attemptId || !canAttempt) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Unavailable</CardTitle>
            <div className="text-muted-foreground mt-1 text-sm">
              {!canAttempt
                ? 'You have reached the maximum number of attempts for this quiz.'
                : 'Unable to start quiz attempt.'}
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.back()}>
              Back to Course
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Quiz Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{quiz.title}</CardTitle>
              <div className="text-muted-foreground mt-1 text-sm">
                Attempt {(quiz.user_attempts?.length || 0) + 1} of {quiz.max_attempts}
              </div>
            </div>
            {timeRemaining !== null && (
              <div
                className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
                  timeRemaining < 300 ? 'bg-red-100 text-red-900' : 'bg-blue-100 text-blue-900'
                }`}
              >
                <Clock className="h-5 w-5" />
                <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span>{progressPercentage.toFixed(0)}% Complete</span>
            </div>
            <Progress value={progressPercentage} />
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">
              Question {currentQuestionIndex + 1}
              {currentQuestion.time_limit_seconds && (
                <span className="text-muted-foreground ml-2 text-sm">
                  ({currentQuestion.time_limit_seconds}s time limit)
                </span>
              )}
            </CardTitle>
            <Button
              variant={answers[currentQuestion.id]?.flagged ? 'default' : 'outline'}
              onClick={toggleFlag}
              className="px-2 py-1"
            >
              <Flag className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-muted-foreground mt-1 text-sm">
            {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''} â€¢{' '}
            {currentQuestion.difficulty_level}
          </div>
        </CardHeader>
        <CardContent>
          <QuestionRenderer
            question={currentQuestion}
            value={answers[currentQuestion.id]?.answer_data}
            onChange={handleAnswerChange}
            showCorrectAnswer={false}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => goToQuestion(currentQuestionIndex - 1)}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {/* Question navigator */}
          <div className="flex gap-1">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => goToQuestion(index)}
                className={`h-8 w-8 rounded text-xs font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-primary text-primary-foreground'
                    : answers[quiz.questions[index].id]
                      ? 'bg-green-100 text-green-900 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label={`Go to question ${index + 1}`}
              >
                {index + 1}
                {answers[quiz.questions[index].id]?.flagged && (
                  <Flag className="ml-0.5 inline h-3 w-3" />
                )}
              </button>
            ))}
          </div>
        </div>

        {currentQuestionIndex === totalQuestions - 1 ? (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Quiz
              </>
            )}
          </Button>
        ) : (
          <Button onClick={() => goToQuestion(currentQuestionIndex + 1)}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Unanswered Questions Warning */}
      {Object.keys(answers).length < totalQuestions && (
        <Card className="mt-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-orange-900">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">
                You have {totalQuestions - Object.keys(answers).length} unanswered question
                {totalQuestions - Object.keys(answers).length !== 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
