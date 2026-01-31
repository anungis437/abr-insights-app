/**
 * Get Stripe Customer Portal URL
 * Allows users to manage their subscription
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAnyPermission } from '@/lib/auth/permissions'
import { withRateLimit } from '@/lib/security/rateLimit'
import { PAYMENT_RATE_LIMITS } from '@/lib/security/rateLimitPresets'
import { logger } from '@/lib/utils/production-logger'

async function portalHandler(req: NextRequest) {
  // Check permissions - users need subscription.view to access portal
  const permissionError = await requireAnyPermission([
    'subscription.view',
    'subscription.manage',
    'admin.manage',
  ])
  if (permissionError) return permissionError

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

    // Get user's Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
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
