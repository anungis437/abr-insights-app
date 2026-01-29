/**
 * AI Coaching Sessions Service
 * Replaces: base44.entities.AICoachingSession
 * Table: ai_coaching_sessions
 */

import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

export type SessionStatus = 'active' | 'completed' | 'cancelled'

export type AICoachingSession = {
  id: string
  user_id: string
  topic: string
  status: SessionStatus
  started_at: string
  ended_at: string | null
  total_messages: number
  ai_model: string | null
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string
}

export type SessionMessage = {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens_used: number | null
  created_at: string
}

export type AICoachingSessionInsert = Omit<
  AICoachingSession,
  'id' | 'created_at' | 'updated_at' | 'total_messages'
>
export type AICoachingSessionUpdate = Partial<AICoachingSessionInsert>

export type SessionMessageInsert = Omit<SessionMessage, 'id' | 'created_at'>

export class AICoachingService {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createClient()
  }

  /**
   * Get user sessions
   * Replaces: base44.entities.AICoachingSession.getUserSessions()
   */
  async getUserSessions(userId: string, options?: { limit?: number; offset?: number }) {
    let query = this.supabase
      .from('ai_coaching_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('started_at', { ascending: false })

    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) throw error
    return { data: data as AICoachingSession[], count: count || 0 }
  }

  /**
   * Get session by ID
   * Replaces: base44.entities.AICoachingSession.get()
   */
  async getSession(id: string) {
    const { data, error } = await this.supabase
      .from('ai_coaching_sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as AICoachingSession
  }

  /**
   * Create new session
   * Replaces: base44.entities.AICoachingSession.create()
   */
  async createSession(userId: string, topic: string, aiModel = 'gpt-4') {
    const { data, error } = await this.supabase
      .from('ai_coaching_sessions')
      .insert({
        user_id: userId,
        topic,
        status: 'active',
        started_at: new Date().toISOString(),
        total_messages: 0,
        ai_model: aiModel,
      })
      .select()
      .single()

    if (error) throw error
    return data as AICoachingSession
  }

  /**
   * Update session
   */
  async updateSession(id: string, updates: AICoachingSessionUpdate) {
    const { data, error } = await this.supabase
      .from('ai_coaching_sessions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as AICoachingSession
  }

  /**
   * End session
   * Replaces: base44.entities.AICoachingSession.end()
   */
  async endSession(id: string) {
    const { data, error } = await this.supabase
      .from('ai_coaching_sessions')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as AICoachingSession
  }

  /**
   * Cancel session
   */
  async cancelSession(id: string) {
    const { data, error } = await this.supabase
      .from('ai_coaching_sessions')
      .update({
        status: 'cancelled',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as AICoachingSession
  }

  /**
   * Get session messages
   * Replaces: base44.entities.AICoachingSession.getMessages()
   */
  async getSessionMessages(sessionId: string) {
    const { data, error } = await this.supabase
      .from('ai_session_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data as SessionMessage[]
  }

  /**
   * Add message to session
   * Replaces: base44.entities.AICoachingSession.addMessage()
   */
  async addMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    tokensUsed?: number
  ) {
    const { data, error } = await this.supabase
      .from('ai_session_messages')
      .insert({
        session_id: sessionId,
        role,
        content,
        tokens_used: tokensUsed || null,
      })
      .select()
      .single()

    if (error) throw error

    // Update session message count
    await this.updateMessageCount(sessionId)

    return data as SessionMessage
  }

  /**
   * Update session message count
   */
  private async updateMessageCount(sessionId: string) {
    const { count, error } = await this.supabase
      .from('ai_session_messages')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId)

    if (error) throw error

    await this.supabase
      .from('ai_coaching_sessions')
      .update({
        total_messages: count || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
  }

  /**
   * Get active session for user
   */
  async getActiveSession(userId: string) {
    const { data, error } = await this.supabase
      .from('ai_coaching_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as AICoachingSession | null
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    const { data: sessions } = await this.supabase
      .from('ai_coaching_sessions')
      .select('total_messages, status')
      .eq('user_id', userId)

    if (!sessions) return { totalSessions: 0, totalMessages: 0, completedSessions: 0 }

    return {
      totalSessions: sessions.length,
      totalMessages: sessions.reduce((sum, s) => sum + (s.total_messages || 0), 0),
      completedSessions: sessions.filter((s) => s.status === 'completed').length,
    }
  }
}

// Export singleton instance
export const aiCoachingService = new AICoachingService()
