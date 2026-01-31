import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_PRICES, getOrCreateStripeCustomer } from '@/lib/stripe'
import { logger } from '@/lib/utils/production-logger'
import { sanitizeError } from '@/lib/utils/error-responses'

export async function POST(request: NextRequest) {
  // P0 Security: Block in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { priceId, tier } = body

    if (!priceId || !tier) {
      return NextResponse.json({ error: 'Missing priceId or tier' }, { status: 400 })
    }

    // Validate tier
    const validTiers = ['PROFESSIONAL', 'BUSINESS', 'BUSINESS_PLUS', 'ENTERPRISE']
    if (!validTiers.includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    // Get or create Stripe customer
    const customer = await getOrCreateStripeCustomer(user.id, user.email!)

    // Get user profile for organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
      metadata: {
        user_id: user.id,
        tier: tier,
        organization_id: profile?.organization_id || '',
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          tier: tier,
          organization_id: profile?.organization_id || '',
        },
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    logger.error('Checkout session creation error:', { error: error })
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
