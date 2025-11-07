/**
 * Saved Searches Service
 * Replaces: base44.entities.SavedSearch
 * Table: saved_searches
 */

import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

export type SearchType = 'tribunal_cases' | 'courses' | 'resources' | 'general'

export type SavedSearch = {
  id: string
  user_id: string
  name: string
  search_type: SearchType
  query_text: string | null
  filters: Record<string, any> | null
  is_favorite: boolean
  last_used_at: string | null
  use_count: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type SavedSearchInsert = Omit<SavedSearch, 'id' | 'created_at' | 'updated_at' | 'use_count' | 'last_used_at'>
export type SavedSearchUpdate = Partial<SavedSearchInsert>

export class SavedSearchesService {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createClient()
  }

  /**
   * Get user's saved searches
   * Replaces: base44.entities.SavedSearch.getUserSearches()
   */
  async getUserSearches(userId: string, options?: { searchType?: SearchType; favoritesOnly?: boolean }) {
    let query = this.supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('last_used_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (options?.searchType) {
      query = query.eq('search_type', options.searchType)
    }
    if (options?.favoritesOnly) {
      query = query.eq('is_favorite', true)
    }

    const { data, error } = await query

    if (error) throw error
    return data as SavedSearch[]
  }

  /**
   * Get saved search by ID
   * Replaces: base44.entities.SavedSearch.get()
   */
  async get(id: string) {
    const { data, error } = await this.supabase
      .from('saved_searches')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) throw error
    return data as SavedSearch
  }

  /**
   * Create saved search
   * Replaces: base44.entities.SavedSearch.create()
   */
  async create(search: SavedSearchInsert) {
    const { data, error } = await this.supabase
      .from('saved_searches')
      .insert({
        ...search,
        use_count: 0
      })
      .select()
      .single()

    if (error) throw error
    return data as SavedSearch
  }

  /**
   * Update saved search
   * Replaces: base44.entities.SavedSearch.update()
   */
  async update(id: string, updates: SavedSearchUpdate) {
    const { data, error } = await this.supabase
      .from('saved_searches')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) throw error
    return data as SavedSearch
  }

  /**
   * Soft delete saved search
   * Replaces: base44.entities.SavedSearch.delete()
   */
  async delete(id: string) {
    const { error } = await this.supabase
      .from('saved_searches')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(id: string) {
    const search = await this.get(id)
    
    const { data, error } = await this.supabase
      .from('saved_searches')
      .update({ 
        is_favorite: !search.is_favorite,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as SavedSearch
  }

  /**
   * Record search usage
   */
  async recordUsage(id: string) {
    const search = await this.get(id)

    const { data, error } = await this.supabase
      .from('saved_searches')
      .update({
        use_count: (search.use_count || 0) + 1,
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as SavedSearch
  }

  /**
   * Get most used searches
   */
  async getMostUsed(userId: string, limit = 5) {
    const { data, error } = await this.supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gt('use_count', 0)
      .order('use_count', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as SavedSearch[]
  }

  /**
   * Get recent searches
   */
  async getRecent(userId: string, limit = 5) {
    const { data, error } = await this.supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .not('last_used_at', 'is', null)
      .order('last_used_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as SavedSearch[]
  }

  /**
   * Check if search exists
   */
  async exists(userId: string, name: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('saved_searches')
      .select('id')
      .eq('user_id', userId)
      .eq('name', name)
      .is('deleted_at', null)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  }

  /**
   * Save or update search
   */
  async saveOrUpdate(userId: string, search: SavedSearchInsert) {
    // Check if search with same name exists
    const { data: existing } = await this.supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId)
      .eq('name', search.name)
      .is('deleted_at', null)
      .single()

    if (existing) {
      // Update existing
      return await this.update(existing.id, {
        query_text: search.query_text,
        filters: search.filters,
        search_type: search.search_type
      })
    }

    // Create new
    return await this.create(search)
  }

  /**
   * Get search statistics
   */
  async getStats(userId: string) {
    const [totalSearches, favoriteSearches, recentSearches] = await Promise.all([
      this.supabase
        .from('saved_searches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('deleted_at', null),
      this.supabase
        .from('saved_searches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_favorite', true)
        .is('deleted_at', null),
      this.supabase
        .from('saved_searches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('last_used_at', 'is', null)
        .is('deleted_at', null)
    ])

    return {
      total: totalSearches.count || 0,
      favorites: favoriteSearches.count || 0,
      recent: recentSearches.count || 0
    }
  }
}

// Export singleton instance
export const savedSearchesService = new SavedSearchesService()
