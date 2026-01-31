'use client'

import { logger } from '@/lib/utils/production-logger'
/**
 * useEntitlements Hook
 * Client-side hook for accessing user entitlements from canonical source
 *
 * This hook replaces legacy subscription checks with the new entitlements service.
 * Use this instead of checking profiles.subscription_tier directly.
 *
 * @see lib/services/entitlements.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import type { UserEntitlements, EntitlementFeatures } from '@/lib/services/entitlements'

interface UseEntitlementsReturn {
  entitlements: UserEntitlements | null
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
  hasFeature: (feature: keyof EntitlementFeatures) => boolean
  canPerformAction: (
    action: 'create_course' | 'add_student' | 'add_org_member',
    currentUsage: number
  ) => Promise<{ allowed: boolean; reason?: string; upgradeUrl?: string }>
}

export function useEntitlements(): UseEntitlementsReturn {
  const { user } = useAuth()
  const [entitlements, setEntitlements] = useState<UserEntitlements | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchEntitlements = useCallback(async () => {
    if (!user) {
      setEntitlements(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/entitlements')

      if (!response.ok) {
        throw new Error('Failed to fetch entitlements')
      }

      const data = await response.json()
      setEntitlements(data.entitlements)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch entitlements'))
      logger.error('Error fetching entitlements:', { error: err, context: 'useEntitlements' })
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchEntitlements()
  }, [fetchEntitlements])

  const hasFeature = useCallback(
    (feature: keyof EntitlementFeatures): boolean => {
      if (!entitlements) return false
      const featureValue = entitlements.features[feature]

      // Handle numeric features (limits)
      if (typeof featureValue === 'number') {
        return featureValue > 0 || featureValue === -1 // -1 means unlimited
      }

      // Handle boolean features
      return featureValue as boolean
    },
    [entitlements]
  )

  const canPerformAction = useCallback(
    async (
      action: 'create_course' | 'add_student' | 'add_org_member',
      currentUsage: number
    ): Promise<{ allowed: boolean; reason?: string; upgradeUrl?: string }> => {
      if (!entitlements) {
        return {
          allowed: false,
          reason: 'No entitlements loaded',
          upgradeUrl: '/pricing',
        }
      }

      // Client-side quick check based on loaded entitlements
      let limit: number
      let featureName: string

      switch (action) {
        case 'create_course':
          limit = entitlements.features.maxCoursesAuthored
          featureName = 'courses'
          break
        case 'add_student':
          limit = entitlements.features.maxStudentsPerCourse
          featureName = 'students per course'
          break
        case 'add_org_member':
          limit = entitlements.seatCount
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
    },
    [entitlements]
  )

  return {
    entitlements,
    loading,
    error,
    refresh: fetchEntitlements,
    hasFeature,
    canPerformAction,
  }
}

/**
 * Helper hook for simple feature checks
 */
export function useFeatureAccess(feature: keyof EntitlementFeatures): boolean {
  const { hasFeature } = useEntitlements()
  return hasFeature(feature)
}

/**
 * Helper hook for tier checks (legacy compatibility)
 */
export function useTierCheck(
  requiredTier: 'FREE' | 'PROFESSIONAL' | 'BUSINESS' | 'BUSINESS_PLUS' | 'ENTERPRISE'
): boolean {
  const { entitlements } = useEntitlements()

  if (!entitlements) return false

  const tierOrder = ['FREE', 'PROFESSIONAL', 'BUSINESS', 'BUSINESS_PLUS', 'ENTERPRISE']
  const currentTierIndex = tierOrder.indexOf(entitlements.tier)
  const requiredTierIndex = tierOrder.indexOf(requiredTier)

  return currentTierIndex >= requiredTierIndex
}
