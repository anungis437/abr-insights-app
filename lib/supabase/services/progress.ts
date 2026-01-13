/**
 * Progress Tracking Service
 * Replaces: base44.entities.Progress
 * Tables: enrollments, lesson_progress
 */

import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

export type CourseEnrollment = {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
  started_at: string | null
  completed_at: string | null
  progress_percentage: number
  last_accessed_at: string | null
  certificate_issued: boolean
  created_at: string
  updated_at: string
}

export type LessonProgress = {
  id: string
  user_id: string
  lesson_id: string
  course_id: string
  started_at: string | null
  completed_at: string | null
  time_spent_seconds: number
  last_position_seconds: number | null
  quiz_score: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type EnrollmentInsert = Omit<CourseEnrollment, 'id' | 'created_at' | 'updated_at'>
export type EnrollmentUpdate = Partial<EnrollmentInsert>

export type LessonProgressInsert = Omit<LessonProgress, 'id' | 'created_at' | 'updated_at'>
export type LessonProgressUpdate = Partial<LessonProgressInsert>

export type UserProgress = {
  enrollment: CourseEnrollment
  lessons: LessonProgress[]
  completedLessons: number
  totalLessons: number
}

export class ProgressService {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createClient()
  }

  /**
   * Enroll user in a course
   * Replaces: base44.entities.Progress.enroll()
   */
  async enroll(userId: string, courseId: string) {
    const { data, error } = await this.supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        enrolled_at: new Date().toISOString(),
        progress_percentage: 0,
        certificate_issued: false
      })
      .select()
      .single()

    if (error) throw error
    return data as CourseEnrollment
  }

  /**
   * Get user's enrollment in a course
   */
  async getEnrollment(userId: string, courseId: string) {
    const { data, error } = await this.supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    if (error) throw error
    return data as CourseEnrollment
  }

  /**
   * Get all enrollments for a user
   * Replaces: base44.entities.Progress.getUserEnrollments()
   */
  async getUserEnrollments(userId: string, options?: { limit?: number; offset?: number }) {
    let query = this.supabase
      .from('enrollments')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('last_accessed_at', { ascending: false, nullsFirst: false })
      .order('enrolled_at', { ascending: false })

    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1)
    }

    const { data, error, count } = await query

    if (error) throw error
    return { data: data as CourseEnrollment[], count: count || 0 }
  }

  /**
   * Get complete progress for a user in a course
   * Replaces: base44.entities.Progress.getCourseProgress()
   */
  async getCourseProgress(userId: string, courseId: string): Promise<UserProgress> {
    // Get enrollment
    const enrollment = await this.getEnrollment(userId, courseId)

    // Get lesson progress
    const { data: lessons, error } = await this.supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Get total lessons count
    const { count: totalLessons } = await this.supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)
      .is('deleted_at', null)

    const completedLessons = lessons.filter(l => l.completed_at !== null).length

    return {
      enrollment,
      lessons: lessons as LessonProgress[],
      completedLessons,
      totalLessons: totalLessons || 0
    }
  }

  /**
   * Start a lesson
   * Replaces: base44.entities.Progress.startLesson()
   */
  async startLesson(userId: string, lessonId: string, courseId: string) {
    // Check if progress already exists
    const { data: existing } = await this.supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single()

    if (existing) {
      // Update existing
      const { data, error } = await this.supabase
        .from('lesson_progress')
        .update({
          started_at: existing.started_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return data as LessonProgress
    }

    // Create new progress
    const { data, error } = await this.supabase
      .from('lesson_progress')
      .insert({
        user_id: userId,
        lesson_id: lessonId,
        course_id: courseId,
        started_at: new Date().toISOString(),
        time_spent_seconds: 0
      })
      .select()
      .single()

    if (error) throw error

    // Update enrollment started_at if first lesson
    await this.updateEnrollmentStarted(userId, courseId)

    return data as LessonProgress
  }

  /**
   * Complete a lesson
   * Replaces: base44.entities.Progress.completeLesson()
   */
  async completeLesson(userId: string, lessonId: string, courseId: string, quizScore?: number) {
    const { data, error } = await this.supabase
      .from('lesson_progress')
      .update({
        completed_at: new Date().toISOString(),
        quiz_score: quizScore,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .select()
      .single()

    if (error) throw error

    // Update course progress percentage
    await this.updateCourseProgress(userId, courseId)

    return data as LessonProgress
  }

  /**
   * Update lesson position (for video progress)
   */
  async updateLessonPosition(userId: string, lessonId: string, positionSeconds: number, timeSpentSeconds: number) {
    const { data, error } = await this.supabase
      .from('lesson_progress')
      .update({
        last_position_seconds: positionSeconds,
        time_spent_seconds: timeSpentSeconds,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .select()
      .single()

    if (error) throw error
    return data as LessonProgress
  }

  /**
   * Save lesson notes
   */
  async saveLessonNotes(userId: string, lessonId: string, notes: string) {
    const { data, error } = await this.supabase
      .from('lesson_progress')
      .update({
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .select()
      .single()

    if (error) throw error
    return data as LessonProgress
  }

  /**
   * Update enrollment last accessed
   */
  async updateLastAccessed(userId: string, courseId: string) {
    const { error } = await this.supabase
      .from('enrollments')
      .update({
        last_accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('course_id', courseId)

    if (error) throw error
  }

  /**
   * Update enrollment started_at if not set
   */
  private async updateEnrollmentStarted(userId: string, courseId: string) {
    const { data } = await this.supabase
      .from('enrollments')
      .select('started_at')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    if (!data?.started_at) {
      await this.supabase
        .from('enrollments')
        .update({
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('course_id', courseId)
    }
  }

  /**
   * Calculate and update course progress percentage
   */
  private async updateCourseProgress(userId: string, courseId: string) {
    // Get total lessons
    const { count: totalLessons } = await this.supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)
      .is('deleted_at', null)

    if (!totalLessons || totalLessons === 0) return

    // Get completed lessons
    const { count: completedLessons } = await this.supabase
      .from('lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .not('completed_at', 'is', null)

    const progressPercentage = Math.round(((completedLessons || 0) / totalLessons) * 100)

    // Update enrollment
    const updateData: Partial<CourseEnrollment> = {
      progress_percentage: progressPercentage,
      updated_at: new Date().toISOString()
    }

    // Mark as completed if 100%
    if (progressPercentage === 100) {
      updateData.completed_at = new Date().toISOString()
    }

    await this.supabase
      .from('enrollments')
      .update(updateData)
      .eq('user_id', userId)
      .eq('course_id', courseId)
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    const [enrollments, completedCourses] = await Promise.all([
      this.supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      this.supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
    ])

    return {
      totalEnrollments: enrollments.count || 0,
      completedCourses: completedCourses.count || 0
    }
  }

  /**
   * Issue certificate
   */
  async issueCertificate(userId: string, courseId: string) {
    const { data, error } = await this.supabase
      .from('enrollments')
      .update({
        certificate_issued: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .select()
      .single()

    if (error) throw error
    return data as CourseEnrollment
  }
}

// Export singleton instance
export const progressService = new ProgressService()

