/**
 * Seat Management Service
 * Handles organization subscription seat allocation and enforcement
 */

import { createClient } from '@/lib/supabase/server'

export interface OrgSubscription {
  subscription_id: string
  tier: 'FREE' | 'PROFESSIONAL' | 'BUSINESS' | 'BUSINESS_PLUS' | 'ENTERPRISE'
  status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing' | 'unpaid'
  seat_count: number
  seats_used: number
  seats_available: number
  in_grace_period: boolean
  grace_period_ends_at: string | null
}

export interface SeatAllocation {
  id: string
  subscription_id: string
  user_id: string
  allocated_by: string | null
  role_in_org: string | null
  status: 'active' | 'revoked' | 'suspended'
  allocated_at: string
  revoked_at: string | null
}

export interface SubscriptionInvoice {
  id: string
  subscription_id: string
  stripe_invoice_id: string
  stripe_charge_id: string | null
  amount_due: number
  amount_paid: number
  currency: string
  tax_amount: number
  tax_breakdown: { type: string; rate: number; amount: number }[] | null
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'
  invoice_date: string
  due_date: string | null
  paid_at: string | null
  invoice_pdf_url: string | null
}

/**
 * Check if organization can add users (seat enforcement)
 */
export async function canAddUsers(
  orgId: string,
  count: number = 1
): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('can_add_users', {
    org_id: orgId,
    count,
  })

  if (error) {
    console.error('Error checking seat availability:', error)
    return false
  }

  return data === true
}

/**
 * Get organization subscription info
 */
export async function getOrgSubscription(
  orgId: string
): Promise<OrgSubscription | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_org_subscription', {
    org_id: orgId,
  })

  if (error) {
    console.error('Error fetching org subscription:', error)
    return null
  }

  return data?.[0] || null
}

/**
 * Allocate seat to user
 */
export async function allocateSeat(
  subscriptionId: string,
  userId: string,
  allocatedBy: string,
  roleInOrg: string = 'member'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Check if seat already allocated
  const { data: existing } = await supabase
    .from('seat_allocations')
    .select('id, status')
    .eq('subscription_id', subscriptionId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    if (existing.status === 'active') {
      return { success: true } // Already allocated
    }

    // Reactivate revoked seat
    const { error } = await supabase
      .from('seat_allocations')
      .update({
        status: 'active',
        revoked_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  }

  // Create new allocation
  const { error } = await supabase.from('seat_allocations').insert({
    subscription_id: subscriptionId,
    user_id: userId,
    allocated_by: allocatedBy,
    role_in_org: roleInOrg,
    status: 'active',
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Revoke seat from user
 */
export async function revokeSeat(
  subscriptionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('seat_allocations')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('subscription_id', subscriptionId)
    .eq('user_id', userId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Get all seat allocations for a subscription
 */
export async function getSeatAllocations(
  subscriptionId: string
): Promise<SeatAllocation[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('seat_allocations')
    .select('*')
    .eq('subscription_id', subscriptionId)
    .order('allocated_at', { ascending: false })

  if (error) {
    console.error('Error fetching seat allocations:', error)
    return []
  }

  return data || []
}

/**
 * Get user's seat allocation status
 */
export async function getUserSeatStatus(
  userId: string,
  orgId: string
): Promise<{
  hasSeat: boolean
  allocation: SeatAllocation | null
  subscription: OrgSubscription | null
}> {
  const supabase = await createClient()

  // Get org subscription
  const subscription = await getOrgSubscription(orgId)

  if (!subscription) {
    return { hasSeat: true, allocation: null, subscription: null } // No subscription = free tier
  }

  // Get user's allocation
  const { data: allocation } = await supabase
    .from('seat_allocations')
    .select('*')
    .eq('subscription_id', subscription.subscription_id)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  return {
    hasSeat: !!allocation || subscription.tier === 'FREE',
    allocation: allocation || null,
    subscription,
  }
}

/**
 * Record invoice for subscription
 */
export async function recordInvoice(
  subscriptionId: string,
  invoiceData: {
    stripe_invoice_id: string
    stripe_charge_id?: string | null
    amount_due: number
    amount_paid: number
    currency: string
    tax_amount?: number
    tax_breakdown?: { type: string; rate: number; amount: number }[] | null
    status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'
    invoice_date: string
    due_date?: string | null
    paid_at?: string | null
    invoice_pdf_url?: string | null
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase.from('subscription_invoices').insert({
    subscription_id: subscriptionId,
    ...invoiceData,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Get invoices for subscription
 */
export async function getSubscriptionInvoices(
  subscriptionId: string
): Promise<SubscriptionInvoice[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscription_invoices')
    .select('*')
    .eq('subscription_id', subscriptionId)
    .order('invoice_date', { ascending: false })

  if (error) {
    console.error('Error fetching invoices:', error)
    return []
  }

  return data || []
}

/**
 * Update subscription details
 */
export async function updateOrgSubscription(
  subscriptionId: string,
  updates: Partial<{
    status: string
    seat_count: number
    amount_cents: number
    current_period_start: string
    current_period_end: string
    canceled_at: string | null
    grace_period_ends_at: string | null
  }>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('organization_subscriptions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Create organization subscription
 */
export async function createOrgSubscription(data: {
  organization_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  tier: 'FREE' | 'PROFESSIONAL' | 'BUSINESS' | 'BUSINESS_PLUS' | 'ENTERPRISE'
  status: 'active' | 'trialing' | 'past_due'
  seat_count: number
  billing_email?: string
  billing_address?: object
  tax_ids?: { type: string; value: string }[]
  amount_cents: number
  currency?: string
  billing_interval?: 'month' | 'year'
  current_period_start?: string
  current_period_end?: string
  trial_start?: string
  trial_end?: string
}): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
  const supabase = await createClient()

  const { data: subscription, error } = await supabase
    .from('organization_subscriptions')
    .insert({
      ...data,
      seats_used: 0,
      currency: data.currency || 'CAD',
    })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, subscriptionId: subscription.id }
}

/**
 * Get subscription by Stripe ID
 */
export async function getSubscriptionByStripeId(
  stripeSubscriptionId: string
): Promise<{
  id: string
  organization_id: string
  tier: string
  status: string
  seat_count: number
  seats_used: number
} | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organization_subscriptions')
    .select('id, organization_id, tier, status, seat_count, seats_used')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single()

  if (error) {
    console.error('Error fetching subscription by Stripe ID:', error)
    return null
  }

  return data
}

/**
 * Enforce seat limits (to be called in invite/add user flows)
 */
export async function enforceSeats(
  orgId: string,
  requestedCount: number = 1
): Promise<
  | { allowed: true }
  | { allowed: false; reason: string; subscription: OrgSubscription }
> {
  const subscription = await getOrgSubscription(orgId)

  if (!subscription) {
    return { allowed: true } // No subscription = free tier, allow
  }

  const canAdd = await canAddUsers(orgId, requestedCount)

  if (!canAdd) {
    if (subscription.in_grace_period) {
      return {
        allowed: false,
        reason: `Grace period ends ${subscription.grace_period_ends_at}. Upgrade or reduce users.`,
        subscription,
      }
    }

    return {
      allowed: false,
      reason: `No available seats. ${subscription.seats_available} of ${subscription.seat_count} seats available.`,
      subscription,
    }
  }

  return { allowed: true }
}
