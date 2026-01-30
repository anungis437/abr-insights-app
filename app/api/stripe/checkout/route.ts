/**
 * Create Stripe Checkout Session
 * API endpoint to initiate payment
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const checkoutSchema = z.object({
  tier: z.enum(['FREE', 'PROFESSIONAL', 'BUSINESS', 'BUSINESS_PLUS', 'ENTERPRISE']),
  seat_count: z.number().int().min(1).default(1),
  organization_id: z.string().uuid().optional(),
  billing_email: z.string().email().optional(),
})

export async function POST(req: NextRequest) {
  try {
    // Lazy load Stripe to avoid build-time initialization
    const { stripe, getOrCreateStripeCustomer, STRIPE_PRICES } = await import('@/lib/stripe')

    const supabase = await createClient()

    // Get authenticated user (no special permissions required)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Validate input - accept tier, seat_count, and org_id
    const validation = checkoutSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid input. Must include tier, optional seat_count and organization_id',
        },
        { status: 400 }
      )
    }

    const { tier, seat_count, organization_id, billing_email } = validation.data

    // If org_id provided, verify user is org admin
    if (organization_id) {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organization_id)
        .eq('user_id', user.id)
        .single()

      if (!membership || !['owner', 'admin'].includes(membership.role)) {
        return NextResponse.json(
          { error: 'Must be organization admin to purchase subscription' },
          { status: 403 }
        )
      }
    }

    // Map tier to server-approved price ID
    const priceId = STRIPE_PRICES[tier]
    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured for this tier' }, { status: 400 })
    }

    // Get or create Stripe customer
    const customer = await getOrCreateStripeCustomer(user.id, user.email!)

    // Determine quantity based on seat count
    const quantity = seat_count || 1

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      // Enable tax collection
      automatic_tax: {
        enabled: true,
      },
      customer_update: {
        address: 'auto',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
        tier: tier,
        seat_count: quantity.toString(),
        organization_id: organization_id || '',
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          tier: tier,
          seat_count: quantity.toString(),
          organization_id: organization_id || '',
        },
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
