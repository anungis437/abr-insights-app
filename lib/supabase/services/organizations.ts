/**
 * Organizations Service
 * Replaces: base44.entities.Organization
 * Table: organizations
 */

import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

export type SubscriptionTier = 'free' | 'professional' | 'enterprise'

export type Organization = {
  id: string
  name: string
  slug: string
  subscription_tier: SubscriptionTier
  max_users: number | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  billing_email: string | null
  settings: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type OrganizationInsert = Omit<
  Organization,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>
export type OrganizationUpdate = Partial<OrganizationInsert>

export class OrganizationsService {
  private supabase: SupabaseClient

  constructor(supabase?: SupabaseClient) {
    this.supabase = supabase || createClient()
  }

  /**
   * List all organizations
   * Replaces: base44.entities.Organization.list()
   */
  async list(options?: { limit?: number; offset?: number }) {
    let query = this.supabase
      .from('organizations')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) throw error
    return { data: data as Organization[], count: count || 0 }
  }

  /**
   * Get an organization by ID
   * Replaces: base44.entities.Organization.get()
   */
  async get(id: string) {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) throw error
    return data as Organization
  }

  /**
   * Get an organization by slug
   */
  async getBySlug(slug: string) {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single()

    if (error) throw error
    return data as Organization
  }

  /**
   * Create a new organization
   * Replaces: base44.entities.Organization.create()
   */
  async create(orgData: OrganizationInsert) {
    const { data, error } = await this.supabase
      .from('organizations')
      .insert(orgData)
      .select()
      .single()

    if (error) throw error
    return data as Organization
  }

  /**
   * Update an organization
   * Replaces: base44.entities.Organization.update()
   */
  async update(id: string, updates: OrganizationUpdate) {
    const { data, error } = await this.supabase
      .from('organizations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) throw error
    return data as Organization
  }

  /**
   * Soft delete an organization
   * Replaces: base44.entities.Organization.delete()
   */
  async delete(id: string) {
    const { error } = await this.supabase
      .from('organizations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Update organization settings
   */
  async updateSettings(id: string, settings: Record<string, any>) {
    const { data, error } = await this.supabase
      .from('organizations')
      .update({
        settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) throw error
    return data as Organization
  }

  /**
   * Update subscription tier
   */
  async updateSubscription(id: string, tier: SubscriptionTier, maxUsers?: number) {
    const updates: Partial<Organization> = {
      subscription_tier: tier,
      updated_at: new Date().toISOString(),
    }

    if (maxUsers !== undefined) {
      updates.max_users = maxUsers
    }

    const { data, error } = await this.supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) throw error
    return data as Organization
  }

  /**
   * Update Stripe integration
   */
  async updateStripeInfo(id: string, stripeCustomerId: string, stripeSubscriptionId?: string) {
    const { data, error } = await this.supabase
      .from('organizations')
      .update({
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) throw error
    return data as Organization
  }

  /**
   * Get organization member count
   */
  async getMemberCount(id: string) {
    const { count, error } = await this.supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', id)
      .in('status', ['active', 'invited'])

    if (error) throw error
    return count || 0
  }

  /**
   * Check if organization can add more users
   */
  async canAddUsers(id: string) {
    const org = await this.get(id)
    if (!org.max_users) return true // Unlimited

    const currentCount = await this.getMemberCount(id)
    return currentCount < org.max_users
  }
}

// Export singleton instance
export const organizationsService = new OrganizationsService()
