/**
 * Notifications Service
 * Replaces: base44.entities.Notification
 * Table: notifications
 */

import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

export type NotificationType = 
  | 'course_update'
  | 'achievement'
  | 'message'
  | 'reminder'
  | 'system'
  | 'milestone'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export type Notification = {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  link_url: string | null
  metadata: Record<string, any> | null
  read_at: string | null
  created_at: string
  expires_at: string | null
}

export type NotificationInsert = Omit<Notification, 'id' | 'created_at' | 'read_at'>
export type NotificationUpdate = Partial<NotificationInsert>

export class NotificationsService {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createClient()
  }

  /**
   * Get user notifications
   * Replaces: base44.entities.Notification.getUserNotifications()
   */
  async getUserNotifications(userId: string, options?: { unreadOnly?: boolean; limit?: number; offset?: number }) {
    let query = this.supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options?.unreadOnly) {
      query = query.is('read_at', null)
    }

    // Filter out expired
    query = query.or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)

    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1)
    }

    const { data, error, count } = await query

    if (error) throw error
    return { data: data as Notification[], count: count || 0 }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string) {
    const { count, error } = await this.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null)
      .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)

    if (error) throw error
    return count || 0
  }

  /**
   * Create notification
   * Replaces: base44.entities.Notification.create()
   */
  async create(notification: NotificationInsert) {
    const { data, error } = await this.supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()

    if (error) throw error
    return data as Notification
  }

  /**
   * Mark notification as read
   * Replaces: base44.entities.Notification.markAsRead()
   */
  async markAsRead(id: string) {
    const { data, error } = await this.supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Notification
  }

  /**
   * Mark all as read for user
   */
  async markAllAsRead(userId: string) {
    const { error } = await this.supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null)

    if (error) throw error
  }

  /**
   * Delete notification
   */
  async delete(id: string) {
    const { error } = await this.supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Delete all read notifications for user
   */
  async deleteRead(userId: string) {
    const { error } = await this.supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .not('read_at', 'is', null)

    if (error) throw error
  }

  /**
   * Send notification to user
   */
  async send(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      priority?: NotificationPriority
      linkUrl?: string
      metadata?: Record<string, any>
      expiresAt?: string
    }
  ) {
    return await this.create({
      user_id: userId,
      type,
      title,
      message,
      priority: options?.priority || 'normal',
      link_url: options?.linkUrl || null,
      metadata: options?.metadata || null,
      expires_at: options?.expiresAt || null
    })
  }

  /**
   * Send bulk notifications
   */
  async sendBulk(notifications: NotificationInsert[]) {
    const { data, error } = await this.supabase
      .from('notifications')
      .insert(notifications)
      .select()

    if (error) throw error
    return data as Notification[]
  }
}

// Export singleton instance
export const notificationsService = new NotificationsService()
