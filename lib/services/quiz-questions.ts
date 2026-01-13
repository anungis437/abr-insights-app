/**
 * Quiz Questions Service
 * Manages question bank operations: CRUD, pools, random selection
 * 
 * Security: All mutations protected by permission checks via RLS policies.
 * Policies defined in migrations 020-023.
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export type QuestionType =
  | 'multiple_choice'
  | 'multiple_response'
  | 'true_false'
  | 'matching'
  | 'fill_blank'
  | 'drag_drop_order'
  | 'case_study'
  | 'calculation'
  | 'essay'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface Question {
  id: string
  course_id: string
  lesson_id?: string
  question_type: QuestionType
  difficulty_level: DifficultyLevel
  question_text: string
  question_html?: string
  explanation?: string
  points: number
  time_limit_seconds?: number
  order_index: number
  tags: string[]
  metadata: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
}

export interface QuestionOption {
  id: string
  question_id: string
  option_text: string
  option_html?: string
  is_correct: boolean
  feedback?: string
  order_index: number
  metadata: Record<string, any>
  created_at: string
}

export interface QuestionWithOptions extends Question {
  options: QuestionOption[]
}

export interface QuestionPool {
  id: string
  course_id: string
  name: string
  description?: string
  tags: string[]
  created_at: string
  updated_at: string
  created_by?: string
}

export interface CreateQuestionInput {
  course_id: string
  lesson_id?: string
  question_type: QuestionType
  difficulty_level?: DifficultyLevel
  question_text: string
  question_html?: string
  explanation?: string
  points?: number
  time_limit_seconds?: number
  order_index?: number
  tags?: string[]
  metadata?: Record<string, any>
  options?: Omit<QuestionOption, 'id' | 'question_id' | 'created_at'>[]
}

export interface UpdateQuestionInput {
  question_text?: string
  question_html?: string
  explanation?: string
  difficulty_level?: DifficultyLevel
  points?: number
  time_limit_seconds?: number
  tags?: string[]
  metadata?: Record<string, any>
  is_active?: boolean
}

// ============================================================================
// QUESTION CRUD OPERATIONS
// ============================================================================

/**
 * Create a new question with optional answer options
 * 
 * Required permissions: questions.create, courses.manage, or instructor.access
 * RLS Policy: questions_insert_with_permission
 */
export async function createQuestion(input: CreateQuestionInput): Promise<QuestionWithOptions | null> {
  const supabase = createClient()

  try {
    // Insert question
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .insert({
        course_id: input.course_id,
        lesson_id: input.lesson_id,
        question_type: input.question_type,
        difficulty_level: input.difficulty_level || 'intermediate',
        question_text: input.question_text,
        question_html: input.question_html,
        explanation: input.explanation,
        points: input.points || 1,
        time_limit_seconds: input.time_limit_seconds,
        order_index: input.order_index || 0,
        tags: input.tags || [],
        metadata: input.metadata || {},
      })
      .select()
      .single()

    if (questionError) {
      // Check for permission error
      if (questionError.code === '42501') {
        throw new Error('Insufficient permissions to create question')
      }
      throw questionError
    }

    // Insert options if provided
    let options: QuestionOption[] = []
    if (input.options && input.options.length > 0) {
      const { data: optionsData, error: optionsError } = await supabase
        .from('question_options')
        .insert(
          input.options.map((opt, index) => ({
            question_id: question.id,
            option_text: opt.option_text,
            option_html: opt.option_html,
            is_correct: opt.is_correct,
            feedback: opt.feedback,
            order_index: opt.order_index ?? index,
            metadata: opt.metadata || {},
          }))
        )
        .select()

      if (optionsError) throw optionsError
      options = optionsData || []
    }

    return {
      ...question,
      options,
    }
  } catch (error) {
    console.error('Error creating question:', error)
    return null
  }
}

/**
 * Get a question by ID with its options
 */
export async function getQuestion(questionId: string): Promise<QuestionWithOptions | null> {
  const supabase = createClient()

  try {
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single()

    if (questionError) throw questionError

    const { data: options, error: optionsError } = await supabase
      .from('question_options')
      .select('*')
      .eq('question_id', questionId)
      .order('order_index', { ascending: true })

    if (optionsError) throw optionsError

    return {
      ...question,
      options: options || [],
    }
  } catch (error) {
    console.error('Error fetching question:', error)
    return null
  }
}

/**
 * Get all questions for a course or lesson
 */
export async function getQuestions(filters: {
  course_id?: string
  lesson_id?: string
  question_type?: QuestionType
  difficulty_level?: DifficultyLevel
  tags?: string[]
  is_active?: boolean
}): Promise<QuestionWithOptions[]> {
  const supabase = createClient()

  try {
    let query = supabase.from('questions').select('*')

    if (filters.course_id) query = query.eq('course_id', filters.course_id)
    if (filters.lesson_id) query = query.eq('lesson_id', filters.lesson_id)
    if (filters.question_type) query = query.eq('question_type', filters.question_type)
    if (filters.difficulty_level) query = query.eq('difficulty_level', filters.difficulty_level)
    if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active)
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags)
    }

    const { data: questions, error } = await query.order('order_index', { ascending: true })

    if (error) throw error

    // Fetch options for all questions
    const questionsWithOptions = await Promise.all(
      (questions || []).map(async (question) => {
        const { data: options } = await supabase
          .from('question_options')
          .select('*')
          .eq('question_id', question.id)
          .order('order_index', { ascending: true })

        return {
          ...question,
          options: options || [],
        }
      })
    )

    return questionsWithOptions
  } catch (error) {
    console.error('Error fetching questions:', error)
    return []
  }
}

/**
 * Update a question
 * 
 * Required permissions: Question creator OR questions.update OR courses.manage
 * RLS Policy: questions_update_creator_or_permission
 */
export async function updateQuestion(
  questionId: string,
  updates: UpdateQuestionInput
): Promise<Question | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('questions')
      .update(updates)
      .eq('id', questionId)
      .select()
      .single()

    if (error) {
      // Check for permission error
      if (error.code === '42501') {
        throw new Error('Insufficient permissions to update question')
      }
      throw error
    }
    return data
  } catch (error) {
    console.error('Error updating question:', error)
    return null
  }
}

/**
 * Delete a question (soft delete by setting is_active = false)
 * 
 * Required permissions: Question creator OR questions.delete OR courses.manage
 * RLS Policy: questions_delete_creator_or_permission (hard delete), questions_update_creator_or_permission (soft delete)
 */
export async function deleteQuestion(questionId: string, hardDelete = false): Promise<boolean> {
  const supabase = createClient()

  try {
    if (hardDelete) {
      const { error } = await supabase.from('questions').delete().eq('id', questionId)
      if (error) {
        // Check for permission error
        if (error.code === '42501') {
          throw new Error('Insufficient permissions to delete question')
        }
        throw error
      }
    } else {
      const { error } = await supabase
        .from('questions')
        .update({ is_active: false })
        .eq('id', questionId)
      if (error) {
        // Check for permission error
        if (error.code === '42501') {
          throw new Error('Insufficient permissions to update question')
        }
        throw error
      }
    }
    return true
  } catch (error) {
    console.error('Error deleting question:', error)
    return false
  }
}

// ============================================================================
// QUESTION OPTIONS OPERATIONS
// ============================================================================

/**
 * Add an option to a question
 */
export async function addQuestionOption(
  questionId: string,
  option: Omit<QuestionOption, 'id' | 'question_id' | 'created_at'>
): Promise<QuestionOption | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('question_options')
      .insert({
        question_id: questionId,
        ...option,
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding question option:', error)
    return null
  }
}

/**
 * Update a question option
 */
export async function updateQuestionOption(
  optionId: string,
  updates: Partial<Omit<QuestionOption, 'id' | 'question_id' | 'created_at'>>
): Promise<QuestionOption | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('question_options')
      .update(updates)
      .eq('id', optionId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating question option:', error)
    return null
  }
}

/**
 * Delete a question option
 */
export async function deleteQuestionOption(optionId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase.from('question_options').delete().eq('id', optionId)
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting question option:', error)
    return false
  }
}

// ============================================================================
// QUESTION POOLS
// ============================================================================

/**
 * Create a question pool
 */
export async function createQuestionPool(input: {
  course_id: string
  name: string
  description?: string
  tags?: string[]
  question_ids?: string[]
}): Promise<QuestionPool | null> {
  const supabase = createClient()

  try {
    // Create pool
    const { data: pool, error: poolError } = await supabase
      .from('question_pools')
      .insert({
        course_id: input.course_id,
        name: input.name,
        description: input.description,
        tags: input.tags || [],
      })
      .select()
      .single()

    if (poolError) throw poolError

    // Add questions to pool if provided
    if (input.question_ids && input.question_ids.length > 0) {
      const { error: questionsError } = await supabase.from('pool_questions').insert(
        input.question_ids.map((question_id) => ({
          pool_id: pool.id,
          question_id,
          weight: 1,
        }))
      )

      if (questionsError) throw questionsError
    }

    return pool
  } catch (error) {
    console.error('Error creating question pool:', error)
    return null
  }
}

/**
 * Add questions to a pool
 */
export async function addQuestionsToPool(
  poolId: string,
  questionIds: string[],
  weight = 1
): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase.from('pool_questions').insert(
      questionIds.map((question_id) => ({
        pool_id: poolId,
        question_id,
        weight,
      }))
    )

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error adding questions to pool:', error)
    return false
  }
}

/**
 * Get random questions from a pool
 */
export async function getRandomQuestionsFromPool(
  poolId: string,
  count: number
): Promise<QuestionWithOptions[]> {
  const supabase = createClient()

  try {
    // Get all question IDs from pool with weights
    const { data: poolQuestions, error: poolError } = await supabase
      .from('pool_questions')
      .select('question_id, weight')
      .eq('pool_id', poolId)

    if (poolError) throw poolError

    if (!poolQuestions || poolQuestions.length === 0) return []

    // Weighted random selection
    const selectedIds = weightedRandomSelection(
      poolQuestions.map((pq) => ({ id: pq.question_id, weight: pq.weight })),
      Math.min(count, poolQuestions.length)
    )

    // Fetch full questions with options
    const questions = await Promise.all(
      selectedIds.map((id) => getQuestion(id))
    )

    return questions.filter((q): q is QuestionWithOptions => q !== null)
  } catch (error) {
    console.error('Error getting random questions from pool:', error)
    return []
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Weighted random selection algorithm
 */
function weightedRandomSelection(
  items: { id: string; weight: number }[],
  count: number
): string[] {
  const selected: string[] = []
  const remaining = [...items]

  for (let i = 0; i < count && remaining.length > 0; i++) {
    const totalWeight = remaining.reduce((sum, item) => sum + item.weight, 0)
    let random = Math.random() * totalWeight

    for (let j = 0; j < remaining.length; j++) {
      random -= remaining[j].weight
      if (random <= 0) {
        selected.push(remaining[j].id)
        remaining.splice(j, 1)
        break
      }
    }
  }

  return selected
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Get question statistics for analytics
 */
export async function getQuestionStats(questionId: string): Promise<{
  total_attempts: number
  correct_attempts: number
  average_time: number
  difficulty_rating: number
} | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('quiz_responses')
      .select('is_correct, time_spent_seconds')
      .eq('question_id', questionId)

    if (error) throw error

    if (!data || data.length === 0) {
      return {
        total_attempts: 0,
        correct_attempts: 0,
        average_time: 0,
        difficulty_rating: 0,
      }
    }

    const total_attempts = data.length
    const correct_attempts = data.filter((r) => r.is_correct).length
    const average_time =
      data.reduce((sum, r) => sum + (r.time_spent_seconds || 0), 0) / total_attempts
    const difficulty_rating = 1 - correct_attempts / total_attempts

    return {
      total_attempts,
      correct_attempts,
      average_time,
      difficulty_rating,
    }
  } catch (error) {
    console.error('Error fetching question stats:', error)
    return null
  }
}
