/**
 * Watch History Service
 * Phase 2 - Enhanced Learning Experience
 * Tracks detailed watch sessions for analytics and resume functionality
 */

import { createClient } from '@/lib/supabase/client'
import type { 
  WatchHistory, 
  CreateWatchHistoryData, 
  UpdateWatchHistoryData,
  WatchStatistics
} from '@/lib/types/courses'

const supabase = createClient()

/**
 * Start a new watch session
 */
export async function startWatchSession(
  userId: string,
  data: CreateWatchHistoryData
): Promise<WatchHistory> {
  const { data: watchHistory, error } = await supabase
    .from('watch_history')
    .insert({
      user_id: userId,
      ...data,
      started_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error starting watch session:', error)
    throw error
  }

  return watchHistory
}

/**
 * Update an ongoing watch session
 */
export async function updateWatchSession(
  sessionId: string,
  updates: UpdateWatchHistoryData
): Promise<WatchHistory> {
  const { data, error } = await supabase
    .from('watch_history')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()

  if (error) {
    console.error('Error updating watch session:', error)
    throw error
  }

  return data
}

/**
 * End a watch session
 */
export async function endWatchSession(
  sessionId: string,
  endPosition: number,
  duration: number,
  progressPercentage: number,
  completed: boolean = false
): Promise<WatchHistory> {
  return updateWatchSession(sessionId, {
    ended_at: new Date().toISOString(),
    end_position_seconds: Math.floor(endPosition),
    duration_seconds: Math.floor(duration),
    progress_percentage: progressPercentage,
    completed_session: completed
  })
}

/**
 * Get watch history for a specific lesson
 */
export async function getLessonWatchHistory(
  userId: string,
  lessonId: string,
  limit: number = 10
): Promise<WatchHistory[]> {
  const { data, error } = await supabase
    .from('watch_history')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching watch history:', error)
    throw error
  }

  return data || []
}

/**
 * Get recent watch history for a user
 */
export async function getRecentWatchHistory(
  userId: string,
  limit: number = 20
): Promise<WatchHistory[]> {
  const { data, error } = await supabase
    .from('watch_history')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent watch history:', error)
    throw error
  }

  return data || []
}

/**
 * Get watch statistics for a lesson
 */
export async function getLessonWatchStatistics(
  userId: string,
  lessonId: string
): Promise<WatchStatistics | null> {
  const { data, error } = await supabase
    .from('watch_statistics')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No data found
      return null
    }
    console.error('Error fetching watch statistics:', error)
    throw error
  }

  return data
}

/**
 * Get total watch time for a user (in seconds)
 */
export async function getTotalWatchTime(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('watch_history')
    .select('duration_seconds')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching total watch time:', error)
    return 0
  }

  return data?.reduce((sum: number, record: any) => sum + (record.duration_seconds || 0), 0) || 0
}

/**
 * Get watch time for a specific date range
 */
export async function getWatchTimeByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  const { data, error } = await supabase
    .from('watch_history')
    .select('duration_seconds')
    .eq('user_id', userId)
    .gte('watch_date', startDate)
    .lte('watch_date', endDate)

  if (error) {
    console.error('Error fetching watch time by date range:', error)
    return 0
  }

  return data?.reduce((sum: number, record: any) => sum + (record.duration_seconds || 0), 0) || 0
}

/**
 * Get the last watched position for a lesson (for resume)
 */
export async function getLastWatchedPosition(
  userId: string,
  lessonId: string
): Promise<number> {
  const { data, error } = await supabase
    .from('watch_history')
    .select('end_position_seconds')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No history found
      return 0
    }
    console.error('Error fetching last watched position:', error)
    return 0
  }

  return data?.end_position_seconds || 0
}

/**
 * Check if a lesson has been watched recently (within last 7 days)
 */
export async function hasRecentWatchHistory(
  userId: string,
  lessonId: string
): Promise<boolean> {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data, error } = await supabase
    .from('watch_history')
    .select('id')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .gte('started_at', sevenDaysAgo.toISOString())
    .limit(1)

  if (error) {
    console.error('Error checking recent watch history:', error)
    return false
  }

  return (data?.length || 0) > 0
}

/**
 * Get device and browser info for tracking
 */
export function getDeviceInfo(): { device_type: string; browser: string } {
  const ua = navigator.userAgent
  
  // Detect device type
  let device_type = 'desktop'
  if (/mobile/i.test(ua)) {
    device_type = 'mobile'
  } else if (/tablet|ipad/i.test(ua)) {
    device_type = 'tablet'
  }
  
  // Detect browser
  let browser = 'unknown'
  if (ua.includes('Chrome')) {
    browser = 'Chrome'
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox'
  } else if (ua.includes('Safari')) {
    browser = 'Safari'
  } else if (ua.includes('Edge')) {
    browser = 'Edge'
  }
  
  return { device_type, browser }
}
