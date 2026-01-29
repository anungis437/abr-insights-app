/**
 * Courses Service
 * Replaces: base44.entities.Course
 * Table: courses
 */

import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'

export type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  thumbnail_url: string | null
  level: CourseLevel
  estimated_duration_minutes: number | null
  is_published: boolean
  is_featured: boolean

  // Content
  learning_objectives: string[] | null
  prerequisites: string[] | null
  tags: string[] | null

  // Metadata
  instructor_name: string | null
  instructor_bio: string | null

  // Stats
  total_lessons: number
  total_enrollments: number
  average_rating: number | null

  // Timestamps
  created_at: string
  updated_at: string
  published_at: string | null
  deleted_at: string | null
}

export type CourseInsert = Omit<
  Course,
  'id' | 'created_at' | 'updated_at' | 'total_enrollments' | 'average_rating'
>
export type CourseUpdate = Partial<CourseInsert>

export type CourseWithLessons = Course & {
  lessons: Lesson[]
}

export type Lesson = {
  id: string
  course_id: string
  title: string
  slug: string
  description: string | null
  content: string | null
  video_url: string | null
  duration_minutes: number | null
  order_index: number
  is_preview: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type LessonInsert = Omit<Lesson, 'id' | 'created_at' | 'updated_at'>
export type LessonUpdate = Partial<LessonInsert>

export class CoursesService {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createClient()
  }

  /**
   * List all courses with optional filters
   * Replaces: base44.entities.Course.list()
   */
  async list(
    filters?: { level?: CourseLevel; is_published?: boolean; tags?: string[] },
    options?: { limit?: number; offset?: number }
  ) {
    let query = this.supabase
      .from('courses')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (filters?.level) {
      query = query.eq('level', filters.level)
    }
    if (filters?.is_published !== undefined) {
      query = query.eq('is_published', filters.is_published)
    }
    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) throw error
    return { data: data as Course[], count: count || 0 }
  }

  /**
   * Get a course by ID with lessons
   * Replaces: base44.entities.Course.get()
   */
  async get(id: string, includeLessons = true) {
    const { data, error } = await this.supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) throw error

    if (includeLessons) {
      const lessons = await this.getLessons(id)
      return { ...data, lessons } as CourseWithLessons
    }

    return data as Course
  }

  /**
   * Get a course by slug
   */
  async getBySlug(slug: string, includeLessons = true) {
    const { data, error } = await this.supabase
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single()

    if (error) throw error

    if (includeLessons) {
      const lessons = await this.getLessons(data.id)
      return { ...data, lessons } as CourseWithLessons
    }

    return data as Course
  }

  /**
   * Create a new course
   * Replaces: base44.entities.Course.create()
   */
  async create(courseData: CourseInsert) {
    const { data, error } = await this.supabase.from('courses').insert(courseData).select().single()

    if (error) throw error
    return data as Course
  }

  /**
   * Update a course
   * Replaces: base44.entities.Course.update()
   */
  async update(id: string, updates: CourseUpdate) {
    const { data, error } = await this.supabase
      .from('courses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) throw error
    return data as Course
  }

  /**
   * Soft delete a course
   * Replaces: base44.entities.Course.delete()
   */
  async delete(id: string) {
    const { error } = await this.supabase
      .from('courses')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Publish a course
   */
  async publish(id: string) {
    const { data, error } = await this.supabase
      .from('courses')
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) throw error
    return data as Course
  }

  /**
   * Archive a course (unpublish)
   */
  async archive(id: string) {
    const { data, error } = await this.supabase
      .from('courses')
      .update({
        is_published: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) throw error
    return data as Course
  }

  /**
   * Get lessons for a course
   */
  async getLessons(courseId: string) {
    const { data, error } = await this.supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .is('deleted_at', null)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data as Lesson[]
  }

  /**
   * Get a single lesson
   */
  async getLesson(id: string) {
    const { data, error } = await this.supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) throw error
    return data as Lesson
  }

  /**
   * Create a lesson
   */
  async createLesson(lessonData: LessonInsert) {
    const { data, error } = await this.supabase.from('lessons').insert(lessonData).select().single()

    if (error) throw error

    // Update course lesson count
    await this.updateLessonCount(lessonData.course_id)

    return data as Lesson
  }

  /**
   * Update a lesson
   */
  async updateLesson(id: string, updates: LessonUpdate) {
    const { data, error } = await this.supabase
      .from('lessons')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) throw error
    return data as Lesson
  }

  /**
   * Delete a lesson
   */
  async deleteLesson(id: string) {
    // Get lesson to update course count
    const lesson = await this.getLesson(id)

    const { error } = await this.supabase
      .from('lessons')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error

    // Update course lesson count
    await this.updateLessonCount(lesson.course_id)
  }

  /**
   * Update total lesson count for a course
   */
  private async updateLessonCount(courseId: string) {
    const { count, error } = await this.supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)
      .is('deleted_at', null)

    if (error) throw error

    await this.supabase
      .from('courses')
      .update({ total_lessons: count || 0 })
      .eq('id', courseId)
  }

  /**
   * Reorder lessons
   */
  async reorderLessons(courseId: string, lessonIds: string[]) {
    const updates = lessonIds.map((id, index) => ({
      id,
      order_index: index,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await this.supabase.from('lessons').upsert(updates)

    if (error) throw error
  }
}

// Export singleton instance
export const coursesService = new CoursesService()
