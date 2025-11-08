/**
 * Dashboard Analytics Service
 * Provides comprehensive learning analytics and statistics
 * Part of Phase 2 Task 4: Learning Dashboard Enhancement
 */

import { createClient } from '@/lib/supabase/client'

export interface LearningStreak {
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  streak_dates: string[]
}

export interface SkillProgress {
  skill_name: string
  lessons_completed: number
  total_lessons: number
  completion_percentage: number
  time_spent_seconds: number
}

export interface RecentActivity {
  id: string
  lesson_id: string
  lesson_title: string
  course_title: string
  activity_type: 'watch' | 'note' | 'complete'
  activity_date: string
  duration_seconds?: number
}

export interface CECredits {
  total_credits_earned: number
  credits_by_category: {
    category: string
    credits: number
  }[]
  credits_this_year: number
}

export interface DashboardStats {
  total_watch_time: number
  lessons_started: number
  lessons_completed: number
  average_completion_rate: number
  longest_session: number
  notes_created: number
  current_streak: number
  ce_credits_earned: number
}

/**
 * Get comprehensive dashboard statistics for a user
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats | null> {
  try {
    const supabase = createClient()

    // Get watch history stats
    const { data: watchStats } = await supabase
      .from('watch_history')
      .select('duration_seconds, completed')
      .eq('user_id', userId)

    // Get lesson progress stats
    const { data: progressStats } = await supabase
      .from('lesson_progress')
      .select('lesson_id, completed')
      .eq('user_id', userId)

    // Get notes count
    const { count: notesCount } = await supabase
      .from('lesson_notes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Calculate watch time statistics
    const totalWatchTime = watchStats?.reduce((sum, session) => 
      sum + (session.duration_seconds || 0), 0) || 0
    
    const completedSessions = watchStats?.filter(s => s.completed).length || 0
    const totalSessions = watchStats?.length || 0
    const averageCompletionRate = totalSessions > 0 
      ? Math.round((completedSessions / totalSessions) * 100) 
      : 0

    const longestSession = watchStats?.reduce((max, session) => 
      Math.max(max, session.duration_seconds || 0), 0) || 0

    // Get unique lessons started and completed
    const uniqueLessons = new Set(progressStats?.map(p => p.lesson_id) || [])
    const completedLessons = progressStats?.filter(p => p.completed).length || 0

    // Get current streak
    const streak = await getLearningStreak(userId)

    // Get CE credits
    const ceCredits = await getCECreditsEarned(userId)

    return {
      total_watch_time: totalWatchTime,
      lessons_started: uniqueLessons.size,
      lessons_completed: completedLessons,
      average_completion_rate: averageCompletionRate,
      longest_session: longestSession,
      notes_created: notesCount || 0,
      current_streak: streak?.current_streak || 0,
      ce_credits_earned: ceCredits?.total_credits_earned || 0
    }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return null
  }
}

/**
 * Calculate learning streak (consecutive days with activity)
 */
export async function getLearningStreak(userId: string): Promise<LearningStreak | null> {
  try {
    const supabase = createClient()

    // Get all distinct activity dates from watch history
    const { data: sessions } = await supabase
      .from('watch_history')
      .select('session_start')
      .eq('user_id', userId)
      .order('session_start', { ascending: false })

    if (!sessions || sessions.length === 0) {
      return {
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
        streak_dates: []
      }
    }

    // Extract unique dates (YYYY-MM-DD format)
    const activityDates = [...new Set(
      sessions.map(s => s.session_start.split('T')[0])
    )].sort().reverse()

    // Calculate current streak
    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let checkDate = new Date(today)
    const streakDates: string[] = []

    for (const dateStr of activityDates) {
      const activityDate = new Date(dateStr)
      activityDate.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor((checkDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 0 || (currentStreak > 0 && daysDiff === 1)) {
        currentStreak++
        streakDates.push(dateStr)
        checkDate = activityDate
      } else if (daysDiff > 1) {
        break
      }
    }

    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 1

    for (let i = 1; i < activityDates.length; i++) {
      const prevDate = new Date(activityDates[i - 1])
      const currDate = new Date(activityDates[i])
      const daysDiff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 1) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 1
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak)

    return {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_activity_date: activityDates[0],
      streak_dates: streakDates
    }
  } catch (error) {
    console.error('Error calculating learning streak:', error)
    return null
  }
}

/**
 * Get progress breakdown by skill/topic
 */
export async function getSkillProgress(userId: string): Promise<SkillProgress[]> {
  try {
    const supabase = createClient()

    // Get all enrolled courses with lessons and progress
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select(`
        course:courses (
          id,
          title,
          modules:course_modules (
            lessons (
              id,
              title,
              skill_tags
            )
          )
        )
      `)
      .eq('user_id', userId)

    if (!enrollments) return []

    // Get lesson progress
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('lesson_id, completed')
      .eq('user_id', userId)

    // Get watch history for time spent
    const { data: watchHistory } = await supabase
      .from('watch_history')
      .select('lesson_id, duration_seconds')
      .eq('user_id', userId)

    const progressMap = new Map(progressData?.map(p => [p.lesson_id, p.completed]) || [])
    const timeMap = new Map<string, number>()
    
    // Aggregate time spent per lesson
    watchHistory?.forEach(w => {
      const current = timeMap.get(w.lesson_id) || 0
      timeMap.set(w.lesson_id, current + (w.duration_seconds || 0))
    })

    // Aggregate by skill
    const skillMap = new Map<string, { completed: number; total: number; time: number }>()

    enrollments.forEach(enrollment => {
      const course = enrollment.course as any
      if (!course?.modules) return

      course.modules.forEach((module: any) => {
        module.lessons?.forEach((lesson: any) => {
          const skills = lesson.skill_tags || ['General']
          
          skills.forEach((skill: string) => {
            const current = skillMap.get(skill) || { completed: 0, total: 0, time: 0 }
            current.total++
            if (progressMap.get(lesson.id)) {
              current.completed++
            }
            current.time += timeMap.get(lesson.id) || 0
            skillMap.set(skill, current)
          })
        })
      })
    })

    return Array.from(skillMap.entries()).map(([skill, data]) => ({
      skill_name: skill,
      lessons_completed: data.completed,
      total_lessons: data.total,
      completion_percentage: Math.round((data.completed / data.total) * 100),
      time_spent_seconds: data.time
    }))
  } catch (error) {
    console.error('Error getting skill progress:', error)
    return []
  }
}

/**
 * Get recent learning activity
 */
export async function getRecentActivity(userId: string, limit: number = 10): Promise<RecentActivity[]> {
  try {
    const supabase = createClient()

    // Get recent watch sessions
    const { data: sessions } = await supabase
      .from('watch_history')
      .select(`
        id,
        session_start,
        duration_seconds,
        completed,
        lesson:lessons (
          id,
          title,
          course_module:course_modules (
            course:courses (
              title
            )
          )
        )
      `)
      .eq('user_id', userId)
      .order('session_start', { ascending: false })
      .limit(limit)

    // Get recent notes
    const { data: notes } = await supabase
      .from('lesson_notes')
      .select(`
        id,
        created_at,
        lesson:lessons (
          id,
          title,
          course_module:course_modules (
            course:courses (
              title
            )
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    const activities: RecentActivity[] = []

    // Process watch sessions
    sessions?.forEach(session => {
      const lesson = session.lesson as any
      if (lesson) {
        activities.push({
          id: session.id,
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          course_title: lesson.course_module?.course?.title || 'Unknown Course',
          activity_type: session.completed ? 'complete' : 'watch',
          activity_date: session.session_start,
          duration_seconds: session.duration_seconds
        })
      }
    })

    // Process notes
    notes?.forEach(note => {
      const lesson = note.lesson as any
      if (lesson) {
        activities.push({
          id: note.id,
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          course_title: lesson.course_module?.course?.title || 'Unknown Course',
          activity_type: 'note',
          activity_date: note.created_at
        })
      }
    })

    // Sort by date and limit
    return activities
      .sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime())
      .slice(0, limit)
  } catch (error) {
    console.error('Error getting recent activity:', error)
    return []
  }
}

/**
 * Get CE credits earned
 */
export async function getCECreditsEarned(userId: string): Promise<CECredits | null> {
  try {
    const supabase = createClient()

    // Get all completed lessons with CE credits
    const { data: completedLessons } = await supabase
      .from('lesson_progress')
      .select(`
        lesson:lessons (
          ce_credits,
          category,
          completed_at
        )
      `)
      .eq('user_id', userId)
      .eq('completed', true)

    if (!completedLessons) {
      return {
        total_credits_earned: 0,
        credits_by_category: [],
        credits_this_year: 0
      }
    }

    let totalCredits = 0
    let creditsThisYear = 0
    const categoryMap = new Map<string, number>()
    const currentYear = new Date().getFullYear()

    completedLessons.forEach(item => {
      const lesson = item.lesson as any
      if (lesson?.ce_credits) {
        const credits = lesson.ce_credits
        totalCredits += credits

        // Count this year's credits
        if (lesson.completed_at) {
          const completedYear = new Date(lesson.completed_at).getFullYear()
          if (completedYear === currentYear) {
            creditsThisYear += credits
          }
        }

        // Aggregate by category
        const category = lesson.category || 'General'
        const current = categoryMap.get(category) || 0
        categoryMap.set(category, current + credits)
      }
    })

    return {
      total_credits_earned: totalCredits,
      credits_by_category: Array.from(categoryMap.entries()).map(([category, credits]) => ({
        category,
        credits
      })),
      credits_this_year: creditsThisYear
    }
  } catch (error) {
    console.error('Error getting CE credits:', error)
    return null
  }
}

/**
 * Format seconds into human-readable time
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
}
