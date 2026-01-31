'use client'

import { logger } from '@/lib/utils/production-logger'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { createClient } from '@/lib/supabase/client'

export type SubscriptionTier = 'free' | 'professional' | 'enterprise'
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'

export interface Subscription {
  tier: SubscriptionTier
  status: SubscriptionStatus
  stripeCustomerId: string | null
  currentPeriodEnd: string | null
  isActive: boolean
  isPro: boolean
  isEnterprise: boolean
  canAccessFeature: (feature: string) => boolean
}

const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  free: ['basic_courses', 'community_forum', 'basic_search'],
  professional: [
    'basic_courses',
    'community_forum',
    'basic_search',
    'all_courses',
    'ai_search',
    'certificates',
    'analytics',
    'priority_support',
    'downloadable_resources',
  ],
  enterprise: [
    'basic_courses',
    'community_forum',
    'basic_search',
    'all_courses',
    'ai_search',
    'certificates',
    'analytics',
    'priority_support',
    'downloadable_resources',
    'unlimited_team',
    'custom_branding',
    'api_access',
    'dedicated_manager',
    'custom_courses',
    'sla_support',
  ],
}

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) {
      setSubscription(null)
      setLoading(false)
      return
    }

    async function fetchSubscription() {
      try {
        const supabase = createClient()

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(
            'stripe_customer_id, subscription_tier, subscription_status, subscription_current_period_end'
          )
          .eq('id', user!.id)
          .single()

        if (profileError) throw profileError

        const tier = (profile.subscription_tier || 'free') as SubscriptionTier
        const status = (profile.subscription_status || 'active') as SubscriptionStatus
        const isActive = status === 'active' || status === 'trialing'

        setSubscription({
          tier,
          status,
          stripeCustomerId: profile.stripe_customer_id,
          currentPeriodEnd: profile.subscription_current_period_end,
          isActive,
          isPro: isActive && (tier === 'professional' || tier === 'enterprise'),
          isEnterprise: isActive && tier === 'enterprise',
          canAccessFeature: (feature: string) => {
            if (!isActive) return TIER_FEATURES.free.includes(feature)
            return TIER_FEATURES[tier]?.includes(feature) || false
          },
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch subscription'))
        logger.error('Error fetching subscription:', { error: err, context: 'useSubscription' })
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()

    // Subscribe to changes
    const supabase = createClient()
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        () => {
          fetchSubscription()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user])

  const createCheckoutSession = async (tier: 'FREE' | 'PROFESSIONAL' | 'ENTERPRISE') => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }

      return data
    } catch (err) {
      logger.error('Error creating checkout session:', { error: err, context: 'useSubscription' })
      throw err
    }
  }

  const openCustomerPortal = async () => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to open customer portal')
      }

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }

      return data
    } catch (err) {
      logger.error('Error opening customer portal:', { error: err, context: 'useSubscription' })
      throw err
    }
  }

  return {
    subscription,
    loading,
    error,
    createCheckoutSession,
    openCustomerPortal,
  }
}
