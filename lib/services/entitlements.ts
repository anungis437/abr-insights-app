/**
 * Entitlements Service
 * Single source of truth for user/organization subscription entitlements
 *
 * This service consolidates entitlements from organization_subscriptions table,
 * resolving the split between profiles.subscription_tier, organizations.subscription_tier,
 * and organization_subscriptions (the canonical source).
 *
 * @see docs/ENTITLEMENTS_SOURCE_OF_TRUTH.md
 */

import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { isInternalRole } from '@/lib/types/roles'

export interface UserEntitlements {
  organizationId: string
  tier: 'FREE' | 'PROFESSIONAL' | 'BUSINESS' | 'BUSINESS_PLUS' | 'ENTERPRISE'
  status: 'active' | 'trialing' | 'past_due' | 'canceled'
  seatCount: number
  seatsUsed: number
  seatsAvailable: number
  hasSeat: boolean
  inGracePeriod: boolean
  gracePeriodEndsAt: string | null
  features: EntitlementFeatures
}

export interface EntitlementFeatures {
  maxCoursesAuthored: number
  maxStudentsPerCourse: number
  maxOrganizationMembers: number
  aiAssistantAccess: boolean
  aiCoachAccess: boolean
  advancedAnalytics: boolean
  customBranding: boolean
  ssoEnabled: boolean
  prioritySupport: boolean
  exportCapabilities: boolean
  citatoryIntegration: boolean
}

interface TierLimits {
  maxCoursesAuthored: number
  maxStudentsPerCourse: number
  maxOrganizationMembers: number
  features: EntitlementFeatures
}

/**
 * Tier configuration and feature matrix
 */
const TIER_CONFIG: Record<string, TierLimits> = {
  FREE: {
    maxCoursesAuthored: 1,
    maxStudentsPerCourse: 10,
    maxOrganizationMembers: 1,
    features: {
      maxCoursesAuthored: 1,
      maxStudentsPerCourse: 10,
      maxOrganizationMembers: 1,
      aiAssistantAccess: false,
      aiCoachAccess: false,
      advancedAnalytics: false,
      customBranding: false,
      ssoEnabled: false,
      prioritySupport: false,
      exportCapabilities: false,
      citatoryIntegration: false,
    },
  },
  PROFESSIONAL: {
    maxCoursesAuthored: 10,
    maxStudentsPerCourse: 100,
    maxOrganizationMembers: 5,
    features: {
      maxCoursesAuthored: 10,
      maxStudentsPerCourse: 100,
      maxOrganizationMembers: 5,
      aiAssistantAccess: true,
      aiCoachAccess: true,
      advancedAnalytics: true,
      customBranding: false,
      ssoEnabled: false,
      prioritySupport: false,
      exportCapabilities: true,
      citatoryIntegration: true,
    },
  },
  BUSINESS: {
    maxCoursesAuthored: 50,
    maxStudentsPerCourse: 500,
    maxOrganizationMembers: 25,
    features: {
      maxCoursesAuthored: 50,
      maxStudentsPerCourse: 500,
      maxOrganizationMembers: 25,
      aiAssistantAccess: true,
      aiCoachAccess: true,
      advancedAnalytics: true,
      customBranding: true,
      ssoEnabled: true,
      prioritySupport: true,
      exportCapabilities: true,
      citatoryIntegration: true,
    },
  },
  BUSINESS_PLUS: {
    maxCoursesAuthored: 200,
    maxStudentsPerCourse: 2000,
    maxOrganizationMembers: 100,
    features: {
      maxCoursesAuthored: 200,
      maxStudentsPerCourse: 2000,
      maxOrganizationMembers: 100,
      aiAssistantAccess: true,
      aiCoachAccess: true,
      advancedAnalytics: true,
      customBranding: true,
      ssoEnabled: true,
      prioritySupport: true,
      exportCapabilities: true,
      citatoryIntegration: true,
    },
  },
  ENTERPRISE: {
    maxCoursesAuthored: -1, // unlimited
    maxStudentsPerCourse: -1, // unlimited
    maxOrganizationMembers: -1, // unlimited
    features: {
      maxCoursesAuthored: -1,
      maxStudentsPerCourse: -1,
      maxOrganizationMembers: -1,
      aiAssistantAccess: true,
      aiCoachAccess: true,
      advancedAnalytics: true,
      customBranding: true,
      ssoEnabled: true,
      prioritySupport: true,
      exportCapabilities: true,
      citatoryIntegration: true,
    },
  },
}

/**
 * Get user's organization entitlements
 *
 * CANONICAL ENTITLEMENT CHECK - USE THIS FOR ALL ENTITLEMENT QUERIES
 *
 * This function queries organization_subscriptions as the single source of truth
 * and returns a comprehensive entitlements object.
 *
 * IMPORTANT: Internal staff roles (super_admin, compliance_officer, investigator, analyst)
 * bypass all subscription checks and get ENTERPRISE-level access automatically.
 *
 * @param userId - User ID to check entitlements for
 * @param client - Optional Supabase client (for admin/webhook contexts)
 * @returns UserEntitlements object or null if user has no organization
 */
export async function getUserEntitlements(
  userId: string,
  client?: SupabaseClient
): Promise<UserEntitlements | null> {
  const supabase = client || (await createClient())

  // 0. CHECK FOR INTERNAL STAFF ROLES FIRST - BYPASS SUBSCRIPTION SYSTEM
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, organization_id')
    .eq('id', userId)
    .single()

  if (profile && isInternalRole(profile.role)) {
    // Internal staff roles (super_admin, compliance_officer, investigator, analyst)
    // get ENTERPRISE-level access without subscription checks
    return {
      organizationId: profile.organization_id || userId,
      tier: 'ENTERPRISE',
      status: 'active',
      seatCount: -1, // Unlimited
      seatsUsed: 0,
      seatsAvailable: -1, // Unlimited
      hasSeat: true,
      inGracePeriod: false,
      gracePeriodEndsAt: null,
      features: TIER_CONFIG.ENTERPRISE.features,
    }
  }

  // 1. Get user's organization membership
  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', userId)
    .single()

  if (membershipError || !membership) {
    // User not in any organization - return FREE tier
    return {
      organizationId: userId, // Use user ID as pseudo-org for individual users
      tier: 'FREE',
      status: 'active',
      seatCount: 1,
      seatsUsed: 1,
      seatsAvailable: 0,
      hasSeat: true,
      inGracePeriod: false,
      gracePeriodEndsAt: null,
      features: TIER_CONFIG.FREE.features,
    }
  }

  // 2. Get organization subscription (SINGLE SOURCE OF TRUTH)
  const { data: subscription, error: subscriptionError } = await supabase
    .from('organization_subscriptions')
    .select('*')
    .eq('organization_id', membership.organization_id)
    .single()

  if (subscriptionError || !subscription) {
    // No subscription = FREE tier for organization
    return {
      organizationId: membership.organization_id,
      tier: 'FREE',
      status: 'active',
      seatCount: 1,
      seatsUsed: 0,
      seatsAvailable: 1,
      hasSeat: true,
      inGracePeriod: false,
      gracePeriodEndsAt: null,
      features: TIER_CONFIG.FREE.features,
    }
  }

  // 3. Check if user has allocated seat
  const { data: seat, error: seatError } = await supabase
    .from('seat_allocations')
    .select('status')
    .eq('subscription_id', subscription.id)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  const hasSeat = !!seat || subscription.tier === 'FREE'

  return {
    organizationId: membership.organization_id,
    tier: subscription.tier as UserEntitlements['tier'],
    status: subscription.status as UserEntitlements['status'],
    seatCount: subscription.seat_count,
    seatsUsed: subscription.seats_used,
    seatsAvailable: subscription.seat_count - subscription.seats_used,
    hasSeat,
    inGracePeriod: !!subscription.grace_period_ends_at,
    gracePeriodEndsAt: subscription.grace_period_ends_at,
    features: getTierFeatures(subscription.tier),
  }
}

/**
 * Check if user has specific feature access
 *
 * @param userId - User ID to check
 * @param feature - Feature key to check access for
 * @param client - Optional Supabase client
 * @returns true if user has access to the feature
 */
export async function hasFeatureAccess(
  userId: string,
  feature: keyof EntitlementFeatures,
  client?: SupabaseClient
): Promise<boolean> {
  const entitlements = await getUserEntitlements(userId, client)
  if (!entitlements) return false

  const featureValue = entitlements.features[feature]

  // Handle numeric features (limits)
  if (typeof featureValue === 'number') {
    return featureValue > 0 || featureValue === -1 // -1 means unlimited
  }

  // Handle boolean features
  return featureValue as boolean
}

/**
 * Check if user can perform an action based on current usage vs limits
 *
 * @param userId - User ID to check
 * @param action - Action type: 'create_course', 'add_student', etc.
 * @param currentUsage - Current usage count
 * @param client - Optional Supabase client
 * @returns Object with allowed status and optional reason
 */
export async function canPerformAction(
  userId: string,
  action: 'create_course' | 'add_student' | 'add_org_member',
  currentUsage: number,
  client?: SupabaseClient
): Promise<{ allowed: true } | { allowed: false; reason: string; upgradeUrl: string }> {
  const entitlements = await getUserEntitlements(userId, client)

  if (!entitlements) {
    return {
      allowed: false,
      reason: 'No entitlements found',
      upgradeUrl: '/pricing',
    }
  }

  const tierConfig = TIER_CONFIG[entitlements.tier]
  if (!tierConfig) {
    return {
      allowed: false,
      reason: 'Invalid subscription tier',
      upgradeUrl: '/pricing',
    }
  }

  let limit: number
  let featureName: string

  switch (action) {
    case 'create_course':
      limit = tierConfig.maxCoursesAuthored
      featureName = 'courses'
      break
    case 'add_student':
      limit = tierConfig.maxStudentsPerCourse
      featureName = 'students per course'
      break
    case 'add_org_member':
      limit = tierConfig.maxOrganizationMembers
      featureName = 'organization members'
      break
    default:
      return {
        allowed: false,
        reason: 'Unknown action',
        upgradeUrl: '/pricing',
      }
  }

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true }
  }

  // Check if current usage is below limit
  if (currentUsage < limit) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: `You've reached your ${entitlements.tier} tier limit of ${limit} ${featureName}. Upgrade to add more.`,
    upgradeUrl: `/pricing?upgrade=${entitlements.tier.toLowerCase()}`,
  }
}

/**
 * Get organization entitlements (for org admins)
 *
 * @param organizationId - Organization ID
 * @param client - Optional Supabase client
 * @returns Organization entitlements or null
 */
export async function getOrganizationEntitlements(
  organizationId: string,
  client?: SupabaseClient
): Promise<Omit<UserEntitlements, 'hasSeat'> | null> {
  const supabase = client || (await createClient())

  const { data: subscription, error } = await supabase
    .from('organization_subscriptions')
    .select('*')
    .eq('organization_id', organizationId)
    .single()

  if (error || !subscription) {
    return {
      organizationId,
      tier: 'FREE',
      status: 'active',
      seatCount: 1,
      seatsUsed: 0,
      seatsAvailable: 1,
      inGracePeriod: false,
      gracePeriodEndsAt: null,
      features: TIER_CONFIG.FREE.features,
    }
  }

  return {
    organizationId,
    tier: subscription.tier as UserEntitlements['tier'],
    status: subscription.status as UserEntitlements['status'],
    seatCount: subscription.seat_count,
    seatsUsed: subscription.seats_used,
    seatsAvailable: subscription.seat_count - subscription.seats_used,
    inGracePeriod: !!subscription.grace_period_ends_at,
    gracePeriodEndsAt: subscription.grace_period_ends_at,
    features: getTierFeatures(subscription.tier),
  }
}

/**
 * Get feature set for a given tier
 */
function getTierFeatures(tier: string): EntitlementFeatures {
  const config = TIER_CONFIG[tier.toUpperCase()]
  return config ? config.features : TIER_CONFIG.FREE.features
}

/**
 * Check if tier allows unlimited usage for a specific feature
 */
export function isUnlimited(tier: string, feature: 'courses' | 'students' | 'members'): boolean {
  const config = TIER_CONFIG[tier.toUpperCase()]
  if (!config) return false

  switch (feature) {
    case 'courses':
      return config.maxCoursesAuthored === -1
    case 'students':
      return config.maxStudentsPerCourse === -1
    case 'members':
      return config.maxOrganizationMembers === -1
    default:
      return false
  }
}

/**
 * Get tier comparison for upgrade flows
 */
export function getTierComparison(currentTier: string, targetTier: string) {
  const current = TIER_CONFIG[currentTier.toUpperCase()] || TIER_CONFIG.FREE
  const target = TIER_CONFIG[targetTier.toUpperCase()] || TIER_CONFIG.FREE

  return {
    currentTier,
    targetTier,
    improvements: {
      courses: {
        current: current.maxCoursesAuthored,
        target: target.maxCoursesAuthored,
        isUnlimited: target.maxCoursesAuthored === -1,
      },
      students: {
        current: current.maxStudentsPerCourse,
        target: target.maxStudentsPerCourse,
        isUnlimited: target.maxStudentsPerCourse === -1,
      },
      members: {
        current: current.maxOrganizationMembers,
        target: target.maxOrganizationMembers,
        isUnlimited: target.maxOrganizationMembers === -1,
      },
    },
    newFeatures: Object.entries(target.features)
      .filter(([key, value]) => !current.features[key as keyof EntitlementFeatures] && value)
      .map(([key]) => key),
  }
}

// Export tier config for UI components that need to display limits
export { TIER_CONFIG }
