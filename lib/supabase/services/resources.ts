/**
 * Resources & Bookmarks Service
 * Replaces: base44.entities.Resource, base44.entities.Bookmark
 * Tables: resources, resource_bookmarks
 */

import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ResourceType = 'article' | 'guide' | 'template' | 'tool' | 'video' | 'external_link'

export type Resource = {
  id: string
  title: string
  slug: string
  description: string | null
  type: ResourceType
  url: string | null
  file_url: string | null
  thumbnail_url: string | null
  content: string | null
  tags: string[] | null
  author_name: string | null
  published_at: string | null
  is_featured: boolean
  view_count: number
  download_count: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type ResourceBookmark = {
  id: string
  user_id: string
  resource_id: string
  notes: string | null
  created_at: string
  updated_at: string
}

export type ResourceInsert = Omit<
  Resource,
  'id' | 'created_at' | 'updated_at' | 'view_count' | 'download_count'
>
export type ResourceUpdate = Partial<ResourceInsert>

export type BookmarkInsert = Omit<ResourceBookmark, 'id' | 'created_at' | 'updated_at'>
export type BookmarkUpdate = Partial<BookmarkInsert>

export class ResourcesService {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createClient()
  }

  /**
   * List resources
   * Replaces: base44.entities.Resource.list()
   */
  async list(
    filters?: { type?: ResourceType; tags?: string[]; featured?: boolean },
    options?: { limit?: number; offset?: number }
  ) {
    let query = this.supabase
      .from('resources')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }
    if (filters?.featured) {
      query = query.eq('is_featured', true)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) throw error
    return { data: data as Resource[], count: count || 0 }
  }

  /**
   * Get resource by ID
   * Replaces: base44.entities.Resource.get()
   */
  async get(id: string) {
    const { data, error } = await this.supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) throw error

    // Increment view count
    await this.incrementViewCount(id)

    return data as Resource
  }

  /**
   * Get resource by slug
   */
  async getBySlug(slug: string) {
    const { data, error } = await this.supabase
      .from('resources')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single()

    if (error) throw error

    // Increment view count
    await this.incrementViewCount(data.id)

    return data as Resource
  }

  /**
   * Create resource
   * Replaces: base44.entities.Resource.create()
   */
  async create(resource: ResourceInsert) {
    const { data, error } = await this.supabase
      .from('resources')
      .insert({
        ...resource,
        view_count: 0,
        download_count: 0,
      })
      .select()
      .single()

    if (error) throw error
    return data as Resource
  }

  /**
   * Update resource
   * Replaces: base44.entities.Resource.update()
   */
  async update(id: string, updates: ResourceUpdate) {
    const { data, error } = await this.supabase
      .from('resources')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) throw error
    return data as Resource
  }

  /**
   * Soft delete resource
   * Replaces: base44.entities.Resource.delete()
   */
  async delete(id: string) {
    const { error } = await this.supabase
      .from('resources')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Increment view count
   */
  private async incrementViewCount(id: string) {
    await this.supabase.rpc('increment_resource_view_count', { resource_id: id })
  }

  /**
   * Increment download count
   */
  async incrementDownloadCount(id: string) {
    await this.supabase.rpc('increment_resource_download_count', { resource_id: id })
  }

  /**
   * Get user bookmarks
   * Replaces: base44.entities.Bookmark.getUserBookmarks()
   */
  async getUserBookmarks(userId: string, options?: { limit?: number; offset?: number }) {
    let query = this.supabase
      .from('resource_bookmarks')
      .select(
        `
        *,
        resource:resources(*)
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  }

  /**
   * Check if resource is bookmarked
   */
  async isBookmarked(userId: string, resourceId: string) {
    const { data, error } = await this.supabase
      .from('resource_bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('resource_id', resourceId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  }

  /**
   * Add bookmark
   * Replaces: base44.entities.Bookmark.create()
   */
  async addBookmark(userId: string, resourceId: string, notes?: string) {
    // Check if already bookmarked
    const exists = await this.isBookmarked(userId, resourceId)
    if (exists) {
      throw new Error('Resource already bookmarked')
    }

    const { data, error } = await this.supabase
      .from('resource_bookmarks')
      .insert({
        user_id: userId,
        resource_id: resourceId,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) throw error
    return data as ResourceBookmark
  }

  /**
   * Remove bookmark
   * Replaces: base44.entities.Bookmark.delete()
   */
  async removeBookmark(userId: string, resourceId: string) {
    const { error } = await this.supabase
      .from('resource_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('resource_id', resourceId)

    if (error) throw error
  }

  /**
   * Update bookmark notes
   */
  async updateBookmarkNotes(userId: string, resourceId: string, notes: string) {
    const { data, error } = await this.supabase
      .from('resource_bookmarks')
      .update({
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('resource_id', resourceId)
      .select()
      .single()

    if (error) throw error
    return data as ResourceBookmark
  }

  /**
   * Search resources
   */
  async search(query: string, options?: { limit?: number }) {
    const { data, error } = await this.supabase
      .from('resources')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .is('deleted_at', null)
      .limit(options?.limit || 20)

    if (error) throw error
    return data as Resource[]
  }

  /**
   * Get featured resources
   */
  async getFeatured(limit = 5) {
    const { data, error } = await this.supabase
      .from('resources')
      .select('*')
      .eq('is_featured', true)
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as Resource[]
  }
}

// Export singleton instance
export const resourcesService = new ResourcesService()
