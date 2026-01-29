/**
 * Quiz Service
 * Manages quiz configuration, attempts, and scoring
 *
 * Security: All mutations protected by permission checks via RLS policies.
 * Policies defined in migrations 020-023.
 */

import { createClient } from '@/lib/supabase/client'
import type { QuestionWithOptions } from './quiz-questions'
import { getQuestion, getRandomQuestionsFromPool, shuffleArray } from './quiz-questions'

// ============================================================================
// TYPES
// ============================================================================

export interface Quiz {
  id: string
  course_id: string
  lesson_id?: string
  title: string
  description?: string
  instructions?: string
  quiz_type: string
  passing_score: number
  max_attempts: number
  time_limit_minutes?: number
  shuffle_questions: boolean
  shuffle_options: boolean
  show_correct_answers: boolean
  show_explanations: boolean
  allow_review: boolean
  require_completion: boolean
  available_from?: string
  available_until?: string
  order_index: number
  is_published: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  created_by?: string
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question_id?: string
  question_pool_id?: string
  points: number
  order_index: number
  is_required: boolean
}

export interface QuizAttempt {
  id: string
  quiz_id: string
  user_id: string
  attempt_number: number
  started_at: string
  submitted_at?: string
  time_spent_seconds?: number
  score?: number
  points_earned?: number
  points_possible?: number
  passed?: boolean
  status: 'in_progress' | 'submitted' | 'graded'
  answers: any[]
  responses?: QuizResponse[]
  metadata: Record<string, any>
}

export interface QuizResponse {
  id: string
  attempt_id: string
  question_id: string
  answer_data: any
  is_correct?: boolean
  points_earned?: number
  points_possible?: number
  time_spent_seconds?: number
  flagged: boolean
  grader_feedback?: string
  graded_at?: string
  graded_by?: string
  created_at: string
}

export interface QuizWithQuestions extends Quiz {
  questions: QuestionWithOptions[]
  user_attempts?: QuizAttempt[]
}

// ============================================================================
// QUIZ CRUD OPERATIONS
// ============================================================================

/**
 * Create a new quiz
 *
 * Required permissions: quizzes.create, courses.manage, or instructor.access
 * RLS Policy: quizzes_insert_with_permission
 */
export async function createQuiz(input: Partial<Quiz>): Promise<Quiz | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        course_id: input.course_id!,
        lesson_id: input.lesson_id,
        title: input.title!,
        description: input.description,
        instructions: input.instructions,
        quiz_type: input.quiz_type || 'assessment',
        passing_score: input.passing_score || 70,
        max_attempts: input.max_attempts || 3,
        time_limit_minutes: input.time_limit_minutes,
        shuffle_questions: input.shuffle_questions ?? true,
        shuffle_options: input.shuffle_options ?? true,
        show_correct_answers: input.show_correct_answers ?? true,
        show_explanations: input.show_explanations ?? true,
        allow_review: input.allow_review ?? true,
        require_completion: input.require_completion ?? false,
        available_from: input.available_from,
        available_until: input.available_until,
        order_index: input.order_index || 0,
        is_published: input.is_published ?? false,
        metadata: input.metadata || {},
      })
      .select()
      .single()

    if (error) {
      // Check for permission error
      if (error.code === '42501') {
        throw new Error('Insufficient permissions to create quiz')
      }
      throw error
    }
    return data
  } catch (error) {
    console.error('Error creating quiz:', error)
    return null
  }
}

/**
 * Get quiz by ID
 */
export async function getQuiz(quizId: string): Promise<Quiz | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from('quizzes').select('*').eq('id', quizId).single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return null
  }
}

/**
 * Get quiz with questions for a student attempt
 */
export async function getQuizForAttempt(
  quizId: string,
  userId: string
): Promise<QuizWithQuestions | null> {
  const supabase = createClient()

  try {
    // Get quiz details
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single()

    if (quizError) throw quizError

    // Get quiz questions configuration
    const { data: quizQuestions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: true })

    if (questionsError) throw questionsError

    // Build question list (from direct questions or pools)
    const questions: QuestionWithOptions[] = []
    for (const quizQuestion of quizQuestions || []) {
      if (quizQuestion.question_id) {
        // Direct question
        const question = await getQuestion(quizQuestion.question_id)
        if (question) questions.push(question)
      } else if (quizQuestion.question_pool_id) {
        // Random from pool (get 1 question)
        const poolQuestions = await getRandomQuestionsFromPool(quizQuestion.question_pool_id, 1)
        if (poolQuestions.length > 0) questions.push(poolQuestions[0])
      }
    }

    // Shuffle if configured
    const finalQuestions = quiz.shuffle_questions ? shuffleArray(questions) : questions

    // Shuffle options if configured
    if (quiz.shuffle_options) {
      finalQuestions.forEach((question) => {
        if (question.options) {
          question.options = shuffleArray(question.options)
        }
      })
    }

    // Get user's previous attempts
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('user_id', userId)
      .order('attempt_number', { ascending: false })

    return {
      ...quiz,
      questions: finalQuestions,
      user_attempts: attempts || [],
    }
  } catch (error) {
    console.error('Error fetching quiz for attempt:', error)
    return null
  }
}

/**
 * Get quizzes for a course or lesson
 */
export async function getQuizzes(filters: {
  course_id?: string
  lesson_id?: string
  is_published?: boolean
}): Promise<Quiz[]> {
  const supabase = createClient()

  try {
    let query = supabase.from('quizzes').select('*')

    if (filters.course_id) query = query.eq('course_id', filters.course_id)
    if (filters.lesson_id) query = query.eq('lesson_id', filters.lesson_id)
    if (filters.is_published !== undefined) query = query.eq('is_published', filters.is_published)

    const { data, error } = await query.order('order_index', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return []
  }
}

/**
 * Update quiz
 *
 * Required permissions: Quiz creator OR quizzes.update OR courses.manage
 * RLS Policy: quizzes_update_creator_or_permission
 */
export async function updateQuiz(quizId: string, updates: Partial<Quiz>): Promise<Quiz | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('quizzes')
      .update(updates)
      .eq('id', quizId)
      .select()
      .single()

    if (error) {
      // Check for permission error
      if (error.code === '42501') {
        throw new Error('Insufficient permissions to update quiz')
      }
      throw error
    }
    return data
  } catch (error) {
    console.error('Error updating quiz:', error)
    return null
  }
}

/**
 * Delete quiz
 *
 * Required permissions: Quiz creator OR quizzes.delete OR courses.manage
 * RLS Policy: quizzes_delete_creator_or_permission
 */
export async function deleteQuiz(quizId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase.from('quizzes').delete().eq('id', quizId)
    if (error) {
      // Check for permission error
      if (error.code === '42501') {
        throw new Error('Insufficient permissions to delete quiz')
      }
      throw error
    }
    return true
  } catch (error) {
    console.error('Error deleting quiz:', error)
    return false
  }
}

// ============================================================================
// QUIZ QUESTIONS MANAGEMENT
// ============================================================================

/**
 * Add a question to a quiz
 */
export async function addQuestionToQuiz(input: {
  quiz_id: string
  question_id?: string
  question_pool_id?: string
  points?: number
  order_index?: number
  is_required?: boolean
}): Promise<QuizQuestion | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert({
        quiz_id: input.quiz_id,
        question_id: input.question_id,
        question_pool_id: input.question_pool_id,
        points: input.points || 1,
        order_index: input.order_index || 0,
        is_required: input.is_required ?? true,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding question to quiz:', error)
    return null
  }
}

/**
 * Remove a question from a quiz
 */
export async function removeQuestionFromQuiz(quizQuestionId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase.from('quiz_questions').delete().eq('id', quizQuestionId)
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error removing question from quiz:', error)
    return false
  }
}

// ============================================================================
// QUIZ ATTEMPTS
// ============================================================================

/**
 * Start a new quiz attempt
 */
export async function startQuizAttempt(
  quizId: string,
  userId: string
): Promise<QuizAttempt | null> {
  const supabase = createClient()

  try {
    // Check if user can attempt (max attempts limit)
    const { data: attempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select('attempt_number')
      .eq('quiz_id', quizId)
      .eq('user_id', userId)
      .order('attempt_number', { ascending: false })
      .limit(1)

    if (attemptsError) throw attemptsError

    const nextAttemptNumber = (attempts?.[0]?.attempt_number || 0) + 1

    // Get quiz to check max_attempts
    const quiz = await getQuiz(quizId)
    if (quiz && quiz.max_attempts > 0 && nextAttemptNumber > quiz.max_attempts) {
      console.error('Maximum attempts reached')
      return null
    }

    // Create attempt
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quizId,
        user_id: userId,
        attempt_number: nextAttemptNumber,
        status: 'in_progress',
        answers: [],
        metadata: {},
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error starting quiz attempt:', error)
    return null
  }
}

/**
 * Submit a quiz response
 */
export async function submitQuizResponse(input: {
  attempt_id: string
  question_id: string
  answer_data: any
  time_spent_seconds?: number
}): Promise<QuizResponse | null> {
  const supabase = createClient()

  try {
    // Get question to evaluate answer
    const question = await getQuestion(input.question_id)
    if (!question) throw new Error('Question not found')

    // Evaluate answer based on question type
    const { is_correct, points_earned, points_possible } = evaluateAnswer(
      question,
      input.answer_data
    )

    // Insert response
    const { data, error } = await supabase
      .from('quiz_responses')
      .insert({
        attempt_id: input.attempt_id,
        question_id: input.question_id,
        answer_data: input.answer_data,
        is_correct,
        points_earned,
        points_possible,
        time_spent_seconds: input.time_spent_seconds,
        flagged: false,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error submitting quiz response:', error)
    return null
  }
}

/**
 * Submit entire quiz attempt
 */
export async function submitQuizAttempt(attemptId: string): Promise<QuizAttempt | null> {
  const supabase = createClient()

  try {
    // Calculate score using database function
    const { data: scoreData, error: scoreError } = await supabase.rpc('calculate_quiz_score', {
      attempt_id_param: attemptId,
    })

    if (scoreError) throw scoreError

    // Update attempt status
    const { data, error } = await supabase
      .from('quiz_attempts')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', attemptId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error submitting quiz attempt:', error)
    return null
  }
}

/**
 * Get quiz attempt with responses
 */
export async function getQuizAttempt(
  attemptId: string
): Promise<(QuizAttempt & { responses: QuizResponse[] }) | null> {
  const supabase = createClient()

  try {
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', attemptId)
      .single()

    if (attemptError) throw attemptError

    const { data: responses, error: responsesError } = await supabase
      .from('quiz_responses')
      .select('*')
      .eq('attempt_id', attemptId)

    if (responsesError) throw responsesError

    return {
      ...attempt,
      responses: responses || [],
    }
  } catch (error) {
    console.error('Error fetching quiz attempt:', error)
    return null
  }
}

/**
 * Get user's quiz attempts
 */
export async function getUserQuizAttempts(userId: string, quizId?: string): Promise<QuizAttempt[]> {
  const supabase = createClient()

  try {
    let query = supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })

    if (quizId) query = query.eq('quiz_id', quizId)

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching user quiz attempts:', error)
    return []
  }
}

// ============================================================================
// ANSWER EVALUATION
// ============================================================================

/**
 * Evaluate answer correctness and calculate points
 */
function evaluateAnswer(
  question: QuestionWithOptions,
  answer_data: any
): {
  is_correct: boolean
  points_earned: number
  points_possible: number
} {
  const points_possible = question.points

  switch (question.question_type) {
    case 'multiple_choice':
    case 'true_false':
      // Single correct answer
      const correctOption = question.options.find((opt) => opt.is_correct)
      const is_correct = answer_data.selected_option_id === correctOption?.id
      return {
        is_correct,
        points_earned: is_correct ? points_possible : 0,
        points_possible,
      }

    case 'multiple_response':
      // Multiple correct answers
      const correctOptions = question.options.filter((opt) => opt.is_correct).map((opt) => opt.id)
      const selectedOptions = answer_data.selected_option_ids || []
      const correctSelections = selectedOptions.filter((id: string) => correctOptions.includes(id))
      const incorrectSelections = selectedOptions.filter(
        (id: string) => !correctOptions.includes(id)
      )

      // Partial credit: (correct - incorrect) / total_correct
      const score =
        Math.max(0, correctSelections.length - incorrectSelections.length) / correctOptions.length
      return {
        is_correct: score === 1,
        points_earned: score * points_possible,
        points_possible,
      }

    case 'fill_blank':
      // Text matching (case-insensitive)
      const correctAnswer = question.options[0]?.option_text.toLowerCase().trim()
      const userAnswer = (answer_data.text_answer || '').toLowerCase().trim()
      const matches = correctAnswer === userAnswer
      return {
        is_correct: matches,
        points_earned: matches ? points_possible : 0,
        points_possible,
      }

    case 'drag_drop_order':
      // Check if order matches
      const correctOrder = question.options
        .sort((a, b) => a.order_index - b.order_index)
        .map((opt) => opt.id)
      const userOrder = answer_data.ordered_option_ids || []
      const orderMatches = JSON.stringify(correctOrder) === JSON.stringify(userOrder)
      return {
        is_correct: orderMatches,
        points_earned: orderMatches ? points_possible : 0,
        points_possible,
      }

    case 'matching':
      // Check pairs
      const correctPairs = question.metadata.correct_pairs || {}
      const userPairs = answer_data.pairs || {}
      let correctCount = 0
      const totalPairs = Object.keys(correctPairs).length

      Object.keys(correctPairs).forEach((key) => {
        if (userPairs[key] === correctPairs[key]) correctCount++
      })

      const matchScore = correctCount / totalPairs
      return {
        is_correct: matchScore === 1,
        points_earned: matchScore * points_possible,
        points_possible,
      }

    case 'calculation':
      // Numeric answer with tolerance
      const correctValue = parseFloat(question.metadata.correct_answer)
      const userValue = parseFloat(answer_data.numeric_answer)
      const tolerance = question.metadata.tolerance || 0.01
      const isCorrect = Math.abs(correctValue - userValue) <= tolerance
      return {
        is_correct: isCorrect,
        points_earned: isCorrect ? points_possible : 0,
        points_possible,
      }

    case 'essay':
    case 'case_study':
      // Requires manual grading
      return {
        is_correct: false,
        points_earned: 0,
        points_possible,
      }

    default:
      return {
        is_correct: false,
        points_earned: 0,
        points_possible,
      }
  }
}
