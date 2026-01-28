/**
 * Create Stripe Checkout Session
 * API endpoint to initiate payment
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAnyPermission } from '@/lib/auth/permissions'
import { z } from 'zod'

const checkoutSchema = z.object({
  tier: z.enum(['FREE', 'PROFESSIONAL', 'ENTERPRISE']),
})

export async function POST(req: NextRequest) {
  // Check permissions - users need subscription.manage to create checkout sessions
  const permissionError = await requireAnyPermission(['subscription.manage', 'admin.manage']);
  if (permissionError) return permissionError;

  try {
    // Lazy load Stripe to avoid build-time initialization
    const { stripe, getOrCreateStripeCustomer, STRIPE_PRICES } = await import('@/lib/stripe')
    
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    
    // Validate input - only accept tier, not arbitrary priceId
    const validation = checkoutSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be FREE, PROFESSIONAL, or ENTERPRISE' },
        { status: 400 }
      )
    }

    const { tier } = validation.data
    
    // Map tier to server-approved price ID
    const priceId = STRIPE_PRICES[tier]
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not configured for this tier' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    const customer = await getOrCreateStripeCustomer(user.id, user.email!)

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
        tier: tier.toLowerCase(),
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          tier: tier.toLowerCase(),
        },
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
