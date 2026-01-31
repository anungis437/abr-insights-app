/**
 * Get Stripe Customer Portal URL
 * Allows users to manage their subscription
 *
 * Protected by:
 * - Authentication: Required
 * - CSRF: Required (prevents unauthorized subscription changes)
 * - Rate Limiting: Applied
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withRateLimit } from '@/lib/security/rateLimit'
import { PAYMENT_RATE_LIMITS } from '@/lib/security/rateLimitPresets'
import { validateCSRFToken } from '@/lib/security/csrf'
import { logger } from '@/lib/utils/production-logger'

async function portalHandler(req: NextRequest) {
  try {
    // Lazy load Stripe to avoid build-time initialization
    const { stripe } = await import('@/lib/stripe')

    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate CSRF token (P1 security - prevent unauthorized subscription management)
    const csrfValid = await validateCSRFToken(req, user.id)
    if (!csrfValid) {
      logger.warn('CSRF validation failed for portal', { userId: user.id })
      return NextResponse.json(
        { error: 'Invalid security token. Please refresh and try again.' },
        { status: 403 }
      )
    }

    // Get user's profile with organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId: string | null = null

    // Priority 1: Check for org subscription (canonical path)
    // Note: RLS allows org members to view their org's subscription (org_subscriptions_select policy)
    // If this fails, user may not be an org member or subscription doesn't exist
    if (profile?.organization_id) {
      const { data: orgSubscription } = await supabase
        .from('organization_subscriptions')
        .select('stripe_customer_id')
        .eq('organization_id', profile.organization_id)
        .single()

      if (orgSubscription?.stripe_customer_id) {
        customerId = orgSubscription.stripe_customer_id
      }
    }

    // Priority 2: Fallback to individual subscription (legacy path)
    if (!customerId && profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id
    }

    if (!customerId) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    logger.error('Stripe portal session creation failed', error as Error)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}

// Apply rate limiting - 20 portal access requests per hour per user
export const POST = withRateLimit(PAYMENT_RATE_LIMITS.portal, portalHandler)
