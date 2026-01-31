/**
 * Skills Validation Service
 *
 * Manages skill tracking, proficiency assessment, and validation.
 * Integrates with quiz system for automatic skill validation.
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ProficiencyLevel = 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type ValidationStatus = 'pending' | 'validated' | 'expired' | 'failed'

export interface Skill {
  id: string
  name: string
  slug: string
  description: string | null
  category: string
  subcategory: string | null
  parent_skill_id: string | null
  regulatory_body: string | null
  difficulty_level: string
  importance_weight: number
  min_quiz_score: number
  min_practice_attempts: number
  expiry_months: number | null
  icon: string | null
  color: string | null
  order_index: number
  is_active: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserSkill {
  id: string
  user_id: string
  skill_id: string
  proficiency_level: ProficiencyLevel
  proficiency_score: number
  confidence_score: number
  is_validated: boolean
  validation_status: ValidationStatus
  validated_at: string | null
  expires_at: string | null
  total_assessments: number
  passed_assessments: number
  failed_assessments: number
  average_quiz_score: number
  best_quiz_score: number
  first_attempted_at: string | null
  last_practiced_at: string | null
  last_validated_at: string | null
  courses_completed: number
  lessons_completed: number
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserSkillWithDetails extends UserSkill {
  skill: Skill
}

export interface SkillsSummary {
  category: string
  regulatory_body: string | null
  total_skills: number
  validated_skills: number
  expired_skills: number
  advanced_skills: number
  avg_proficiency_score: number
  avg_confidence_score: number
  avg_quiz_score: number
  first_practice_date: string | null
  last_practice_date: string | null
  total_assessments: number
  passed_assessments: number
  courses_completed: number
}

export interface ActiveSkill {
  skill_id: string
  skill_name: string
  category: string
  subcategory: string | null
  regulatory_body: string | null
  proficiency_level: ProficiencyLevel
  proficiency_score: number
  confidence_score: number
  validated_at: string | null
  expires_at: string | null
  days_until_expiry: number | null
  expiring_soon: boolean
}

export interface ExpiringSkill {
  skill_id: string
  skill_name: string
  category: string
  regulatory_body: string | null
  proficiency_level: ProficiencyLevel
  expires_at: string
  days_until_expiry: number
}

export interface SkillsDashboardData {
  summary: SkillsSummary[]
  active_skills: ActiveSkill[]
  expiring_skills: ExpiringSkill[]
  total_stats: {
    total_skills: number
    validated_skills: number
    expired_skills: number
    novice: number
    beginner: number
    intermediate: number
    advanced: number
    expert: number
    avg_proficiency: number
    avg_confidence: number
    total_assessments: number
    passed_assessments: number
    pass_rate: number
  }
}

export interface SkillValidation {
  validation_id: string
  skill_id: string
  skill_name: string
  category: string
  validation_type: string
  validation_status: ValidationStatus
  score: number | null
  proficiency_level: ProficiencyLevel | null
  passed: boolean | null
  quiz_title: string | null
  course_title: string | null
  attempted_at: string
  validated_at: string | null
  expires_at: string | null
}

export interface RecommendedCourse {
  course_id: string
  course_title: string
  course_category: string
  skill_gaps: number
  target_proficiency: ProficiencyLevel
  estimated_improvement: number
}

export interface SkillProgress {
  skill: Skill
  user_skill: UserSkill | null
  validations: SkillValidation[]
  related_courses: {
    course_id: string
    course_title: string
    proficiency_level: ProficiencyLevel
  }[]
  prerequisites: Skill[]
  dependent_skills: Skill[]
}

// ============================================================================
// DASHBOARD FUNCTIONS
// ============================================================================

/**
 * Get comprehensive skills dashboard data for a user
 */
export async function getUserSkillsDashboard(userId: string): Promise<SkillsDashboardData | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_user_skills_dashboard', { p_user_id: userId })

    if (error) {
      logger.error('Error fetching skills dashboard:', error)
      return null
    }

    return data as SkillsDashboardData
  } catch (error) {
    logger.error('Unexpected error in getUserSkillsDashboard:', error)
    return null
  }
}

/**
 * Get skill validation history for a user
 */
export async function getSkillValidationHistory(
  userId: string,
  skillId?: string,
  limit: number = 50
): Promise<SkillValidation[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_skill_validation_history', {
      p_user_id: userId,
      p_skill_id: skillId || null,
      p_limit: limit,
    })

    if (error) {
      logger.error('Error fetching validation history:', error)
      return []
    }

    return (data || []) as SkillValidation[]
  } catch (error) {
    logger.error('Unexpected error in getSkillValidationHistory:', error)
    return []
  }
}

/**
 * Get recommended courses based on skill gaps
 */
export async function getRecommendedCourses(
  userId: string,
  limit: number = 10
): Promise<RecommendedCourse[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_recommended_courses_for_skills', {
      p_user_id: userId,
      p_limit: limit,
    })

    if (error) {
      logger.error('Error fetching recommended courses:', error)
      return []
    }

    return (data || []) as RecommendedCourse[]
  } catch (error) {
    logger.error('Unexpected error in getRecommendedCourses:', error)
    return []
  }
}

/**
 * Validate skills from quiz attempt
 */
export async function validateSkillsFromQuiz(
  userId: string,
  quizAttemptId: string
): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.rpc('validate_skill_from_quiz', {
      p_user_id: userId,
      p_quiz_attempt_id: quizAttemptId,
    })

    if (error) {
      logger.error('Error validating skills from quiz:', error)
      return false
    }

    return true
  } catch (error) {
    logger.error('Unexpected error in validateSkillsFromQuiz:', error)
    return false
  }
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get all skills (optionally filtered by category)
 */
export async function getSkills(category?: string, regulatoryBody?: string): Promise<Skill[]> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('skills')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    if (regulatoryBody) {
      query = query.eq('regulatory_body', regulatoryBody)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching skills:', error)
      return []
    }

    return (data || []) as Skill[]
  } catch (error) {
    logger.error('Unexpected error in getSkills:', error)
    return []
  }
}

/**
 * Get a single skill by ID or slug
 */
export async function getSkill(idOrSlug: string): Promise<Skill | null> {
  try {
    const supabase = await createClient()

    // Try by ID first, then by slug
    let { data, error } = await supabase.from('skills').select('*').eq('id', idOrSlug).single()

    if (error || !data) {
      const result = await supabase.from('skills').select('*').eq('slug', idOrSlug).single()

      data = result.data
      error = result.error
    }

    if (error) {
      logger.error('Error fetching skill:', error)
      return null
    }

    return data as Skill
  } catch (error) {
    logger.error('Unexpected error in getSkill:', error)
    return null
  }
}

/**
 * Get user's skills (with skill details)
 */
export async function getUserSkills(
  userId: string,
  category?: string
): Promise<UserSkillWithDetails[]> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('user_skills')
      .select(
        `
        *,
        skill:skills(*)
      `
      )
      .eq('user_id', userId)

    if (category) {
      query = query.eq('skill.category', category)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching user skills:', error)
      return []
    }

    return (data || []) as UserSkillWithDetails[]
  } catch (error) {
    logger.error('Unexpected error in getUserSkills:', error)
    return []
  }
}

/**
 * Get active validated skills for a user
 */
export async function getActiveValidatedSkills(userId: string): Promise<ActiveSkill[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('active_validated_skills')
      .select('*')
      .eq('user_id', userId)
      .order('proficiency_score', { ascending: false })

    if (error) {
      logger.error('Error fetching active validated skills:', error)
      return []
    }

    return (data || []) as ActiveSkill[]
  } catch (error) {
    logger.error('Unexpected error in getActiveValidatedSkills:', error)
    return []
  }
}

/**
 * Get skills expiring soon for a user
 */
export async function getExpiringSkills(
  userId: string,
  daysAhead: number = 90
): Promise<ExpiringSkill[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('skills_expiring_soon')
      .select('*')
      .eq('user_id', userId)
      .lte('days_until_expiry', daysAhead)
      .order('days_until_expiry', { ascending: true })

    if (error) {
      logger.error('Error fetching expiring skills:', error)
      return []
    }

    return (data || []) as ExpiringSkill[]
  } catch (error) {
    logger.error('Unexpected error in getExpiringSkills:', error)
    return []
  }
}

/**
 * Get skill categories with counts
 */
export async function getSkillCategories(): Promise<
  { category: string; count: number; color: string | null }[]
> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('skills')
      .select('category, color')
      .eq('is_active', true)

    if (error) {
      logger.error('Error fetching skill categories:', error)
      return []
    }

    // Count and deduplicate
    const categoryCounts = (data || []).reduce(
      (acc, skill) => {
        const existing = acc.find((c) => c.category === skill.category)
        if (existing) {
          existing.count++
        } else {
          acc.push({
            category: skill.category,
            count: 1,
            color: skill.color,
          })
        }
        return acc
      },
      [] as { category: string; count: number; color: string | null }[]
    )

    return categoryCounts.sort((a, b) => a.category.localeCompare(b.category))
  } catch (error) {
    logger.error('Unexpected error in getSkillCategories:', error)
    return []
  }
}

/**
 * Get skill progress details (for skill detail page)
 */
export async function getSkillProgress(
  userId: string,
  skillId: string
): Promise<SkillProgress | null> {
  try {
    const supabase = await createClient()

    // Get skill details
    const skill = await getSkill(skillId)
    if (!skill) return null

    // Get user skill data
    const { data: userSkillData } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId)
      .eq('skill_id', skillId)
      .single()

    // Get validation history
    const validations = await getSkillValidationHistory(userId, skillId, 20)

    // Get related courses
    const { data: relatedCoursesData } = await supabase
      .from('course_skills')
      .select(
        `
        course_id,
        proficiency_level,
        course:courses(title)
      `
      )
      .eq('skill_id', skillId)

    const relatedCourses = (relatedCoursesData || []).map((rc) => ({
      course_id: rc.course_id,
      course_title: (rc.course as any)?.title || 'Unknown Course',
      proficiency_level: rc.proficiency_level as ProficiencyLevel,
    }))

    // Get prerequisites
    const { data: prereqData } = await supabase
      .from('skill_prerequisites')
      .select('prerequisite_skill_id')
      .eq('skill_id', skillId)

    const prerequisites: Skill[] = []
    if (prereqData && prereqData.length > 0) {
      const prereqIds = prereqData.map((p) => p.prerequisite_skill_id)
      const { data: prereqSkills } = await supabase.from('skills').select('*').in('id', prereqIds)
      if (prereqSkills) {
        prerequisites.push(...(prereqSkills as Skill[]))
      }
    }

    // Get dependent skills (skills that require this one)
    const { data: dependentData } = await supabase
      .from('skill_prerequisites')
      .select('skill_id')
      .eq('prerequisite_skill_id', skillId)

    const dependentSkills: Skill[] = []
    if (dependentData && dependentData.length > 0) {
      const dependentIds = dependentData.map((d) => d.skill_id)
      const { data: depSkills } = await supabase.from('skills').select('*').in('id', dependentIds)
      if (depSkills) {
        dependentSkills.push(...(depSkills as Skill[]))
      }
    }

    return {
      skill,
      user_skill: userSkillData as UserSkill | null,
      validations,
      related_courses: relatedCourses,
      prerequisites,
      dependent_skills: dependentSkills,
    }
  } catch (error) {
    logger.error('Unexpected error in getSkillProgress:', error)
    return null
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format proficiency level for display
 */
export function formatProficiencyLevel(level: ProficiencyLevel): string {
  const labels: Record<ProficiencyLevel, string> = {
    novice: 'Novice',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    expert: 'Expert',
  }
  return labels[level] || level
}

/**
 * Get proficiency level color
 */
export function getProficiencyColor(level: ProficiencyLevel): string {
  const colors: Record<ProficiencyLevel, string> = {
    novice: 'text-gray-600 bg-gray-100',
    beginner: 'text-blue-600 bg-blue-100',
    intermediate: 'text-yellow-600 bg-yellow-100',
    advanced: 'text-purple-600 bg-purple-100',
    expert: 'text-green-600 bg-green-100',
  }
  return colors[level] || 'text-gray-600 bg-gray-100'
}

/**
 * Get proficiency level badge color (for borders/progress bars)
 */
export function getProficiencyBadgeColor(level: ProficiencyLevel): string {
  const colors: Record<ProficiencyLevel, string> = {
    novice: 'border-gray-300 bg-gray-50',
    beginner: 'border-blue-300 bg-blue-50',
    intermediate: 'border-yellow-300 bg-yellow-50',
    advanced: 'border-purple-300 bg-purple-50',
    expert: 'border-green-300 bg-green-50',
  }
  return colors[level] || 'border-gray-300 bg-gray-50'
}

/**
 * Get validation status display info
 */
export function getValidationStatus(status: ValidationStatus): { label: string; color: string } {
  const statuses: Record<ValidationStatus, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'text-gray-600 bg-gray-100' },
    validated: { label: 'Validated', color: 'text-green-600 bg-green-100' },
    expired: { label: 'Expired', color: 'text-orange-600 bg-orange-100' },
    failed: { label: 'Failed', color: 'text-red-600 bg-red-100' },
  }
  return statuses[status] || statuses.pending
}

/**
 * Calculate proficiency percentage
 */
export function calculateProficiencyPercentage(level: ProficiencyLevel, score: number): number {
  // Use the actual score, as it's already 0-100
  return Math.min(100, Math.max(0, score))
}

/**
 * Get expiry status and color
 */
export function getExpiryStatus(
  expiresAt: string | null,
  validationStatus: ValidationStatus
): { label: string; color: string } {
  if (!expiresAt) {
    return { label: 'No Expiry', color: 'text-gray-600 bg-gray-100' }
  }

  if (validationStatus === 'expired') {
    return { label: 'Expired', color: 'text-red-600 bg-red-100' }
  }

  const expiryDate = new Date(expiresAt)
  const now = new Date()
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) {
    return { label: 'Expired', color: 'text-red-600 bg-red-100' }
  } else if (daysUntilExpiry <= 30) {
    return { label: `${daysUntilExpiry} days left`, color: 'text-red-600 bg-red-100' }
  } else if (daysUntilExpiry <= 90) {
    return { label: `${daysUntilExpiry} days left`, color: 'text-orange-600 bg-orange-100' }
  } else {
    return { label: `${daysUntilExpiry} days left`, color: 'text-green-600 bg-green-100' }
  }
}

/**
 * Format skill score
 */
export function formatSkillScore(score: number): string {
  return `${score.toFixed(1)}%`
}

/**
 * Get pass rate color
 */
export function getPassRateColor(passRate: number): string {
  if (passRate >= 80) return 'text-green-600'
  if (passRate >= 60) return 'text-yellow-600'
  if (passRate >= 40) return 'text-orange-600'
  return 'text-red-600'
}

/**
 * Calculate skill gap percentage
 */
export function calculateSkillGap(currentScore: number, targetLevel: ProficiencyLevel): number {
  const targetScores: Record<ProficiencyLevel, number> = {
    novice: 10,
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 90,
  }

  const targetScore = targetScores[targetLevel]
  const gap = targetScore - currentScore

  return Math.max(0, gap)
}
