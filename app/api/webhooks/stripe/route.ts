/**
 * Stripe Webhook Handler
 * Handles Stripe events (payments, subscriptions, etc.)
 */

import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/utils/logger'
import {
  createOrgSubscription,
  updateOrgSubscription,
  recordInvoice,
  getSubscriptionByStripeId,
  allocateSeat,
} from '@/lib/services/seat-management'

export async function POST(req: NextRequest) {
  // Lazy load Stripe to avoid build-time initialization
  const { stripe } = await import('@/lib/stripe')

  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    logger.error('Stripe webhook misconfigured: STRIPE_WEBHOOK_SECRET not set', new Error('Missing environment variable'))
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    logger.error('Stripe webhook signature verification failed', err as Error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  logger.webhook('Stripe event received', { eventType: event.type, eventId: event.id })

  // Check idempotency - prevent duplicate processing
  const supabase = createAdminClient()
  const { data: existingEvent } = await supabase
    .from('stripe_webhook_events')
    .select('id')
    .eq('id', event.id)
    .single()

  if (existingEvent) {
    logger.webhook('Stripe event already processed, skipping', { eventId: event.id })
    return NextResponse.json({ received: true, skipped: true })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoiceFailed(event.data.object as Stripe.Invoice)
        break

      default:
        logger.webhook('Unhandled Stripe event type', { eventType: event.type })
    }

    // Mark event as processed
    await supabase.from('stripe_webhook_events').insert({
      id: event.id,
      event_type: event.type,
      processed_at: new Date().toISOString(),
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Stripe webhook event processing failed', error as Error, {
      eventType: event?.type,
      eventId: event?.id,
    })
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

/**
 * Handle successful checkout
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient()
  const userId = session.metadata?.supabase_user_id
  const orgId = session.metadata?.organization_id
  const tier = session.metadata?.tier || 'PROFESSIONAL'
  const seatCount = parseInt(session.metadata?.seat_count || '1', 10)

  if (!userId) {
    logger.error('Checkout completed without user ID', new Error('Missing supabase_user_id'), {
      sessionId: session.id,
      organizationId: orgId,
    })
    return
  }

  logger.billing('Checkout completed', { userId, orgId, tier, seatCount })

  // Get subscription ID from session
  const subscriptionId = session.subscription as string

  if (!subscriptionId) {
    logger.error('Checkout session missing subscription ID', new Error('No subscription in session'), {
      sessionId: session.id,
      userId,
      organizationId: orgId,
    })
    return
  }

  // Fetch full subscription details from Stripe
  const { stripe } = await import('@/lib/stripe')
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // If organization subscription, create org subscription record
  if (orgId) {
    const result = await createOrgSubscription({
      organization_id: orgId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: session.customer as string,
      tier: tier as any,
      status: subscription.status as any,
      seat_count: seatCount,
      billing_email: session.customer_email || undefined,
      amount_cents: subscription.items.data[0]?.price.unit_amount || 0,
      currency: subscription.currency.toUpperCase(),
      billing_interval: subscription.items.data[0]?.price.recurring?.interval as any,
      current_period_start: new Date(
        (subscription as any).current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      trial_start: (subscription as any).trial_start
        ? new Date((subscription as any).trial_start * 1000).toISOString()
        : undefined,
      trial_end: (subscription as any).trial_end
        ? new Date((subscription as any).trial_end * 1000).toISOString()
        : undefined,
    }, supabase)

    if (result.success && result.subscriptionId) {
      // Allocate seat to purchasing user
      await allocateSeat(result.subscriptionId, userId, userId, 'admin', supabase)
      logger.billing('Organization subscription created and seat allocated', {
        subscriptionId: result.subscriptionId,
        orgId,
        userId,
      })
    } else {
      logger.error('Failed to create organization subscription', new Error(result.error || 'Unknown error'), {
        organizationId: orgId,
        userId,
        stripeSessionId: session.id,
      })
    }
  } else {
    // Fallback: Update profile (legacy individual subscriptions)
    const { error } = await supabase
      .from('profiles')
      .update({
        stripe_customer_id: session.customer as string,
        subscription_status: 'active',
        subscription_tier: tier.toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      logger.error('Failed to update user subscription profile', error as Error, {
        userId,
        customerId: session.customer as string,
        tier,
      })
    }
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const supabase = createAdminClient()
  const customerId = subscription.customer as string

  logger.webhook('Subscription updated', {
    subscriptionId: subscription.id,
    status: subscription.status,
    customerId,
  })

  // Try to find org subscription first
  const orgSub = await getSubscriptionByStripeId(subscription.id, supabase)

  if (orgSub) {
    // Update org subscription
    const seatCount = subscription.items.data[0]?.quantity || 1

    await updateOrgSubscription(orgSub.id, {
      status: subscription.status as any,
      seat_count: seatCount,
      amount_cents: subscription.items.data[0]?.price.unit_amount || 0,
      current_period_start: new Date(
        (subscription as any).current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      canceled_at: (subscription as any).canceled_at
        ? new Date((subscription as any).canceled_at * 1000).toISOString()
        : null,
    }, supabase)

    logger.billing('Organization subscription updated', {
      orgSubscriptionId: orgSub.id,
      status: subscription.status,
      seatCount,
    })
  } else {
    // Fallback: Update profile (legacy individual subscription)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!profile) {
      logger.error('No user found for Stripe customer during subscription update', new Error('User not found'), {
        customerId,
        subscriptionId: subscription.id,
      })
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: subscription.status,
        subscription_tier: subscription.metadata?.tier || 'professional',
        subscription_current_period_end: new Date(
          (subscription as any).current_period_end * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (error) {
      logger.error('Failed to update subscription in profile', error as Error, {
        userId: profile.id,
        customerId,
        status: subscription.status,
      })
    }
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = createAdminClient()
  const customerId = subscription.customer as string

  logger.webhook('Subscription deleted', {
    subscriptionId: subscription.id,
    customerId,
  })

  // Try org subscription first
  const orgSub = await getSubscriptionByStripeId(subscription.id, supabase)

  if (orgSub) {
    await updateOrgSubscription(orgSub.id, {
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    }, supabase)
    logger.billing('Organization subscription canceled', {
      orgSubscriptionId: orgSub.id,
    })
  } else {
    // Fallback: Update profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!profile) {
      logger.error('No user found for Stripe customer during subscription cancellation', new Error('User not found'), {
        customerId,
        subscriptionId: subscription.id,
      })
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'canceled',
        subscription_tier: 'free',
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (error) {
      logger.error('Failed to cancel subscription in profile', error as Error, {
        userId: profile.id,
        customerId,
      })
    }
  }
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  logger.billing('Invoice paid', {
    invoiceId: invoice.id,
    customerId,
    amount: invoice.amount_paid,
  })

  // Find org subscription by customer
  const supabase = createAdminClient()
  const { data: orgSub } = await supabase
    .from('organization_subscriptions')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (orgSub && (invoice as any).subscription) {
    // Record invoice for audit trail
    await recordInvoice(orgSub.id, {
      stripe_invoice_id: invoice.id,
      stripe_charge_id: (invoice as any).charge as string,
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      currency: invoice.currency.toUpperCase(),
      tax_amount: (invoice as any).tax || 0,
      tax_breakdown: (invoice as any).total_tax_amounts?.map((tax: any) => ({
        type: tax.tax_rate ? 'rate' : 'amount',
        rate: 0, // Would need to fetch tax rate details
        amount: tax.amount,
      })),
      status: invoice.status as any,
      invoice_date: new Date(invoice.created * 1000).toISOString(),
      due_date: (invoice as any).due_date
        ? new Date((invoice as any).due_date * 1000).toISOString()
        : null,
      paid_at: (invoice as any).status_transitions?.paid_at
        ? new Date((invoice as any).status_transitions.paid_at * 1000).toISOString()
        : null,
      invoice_pdf_url: (invoice as any).invoice_pdf || null,
    }, supabase)

    logger.billing('Invoice recorded for organization', {
      invoiceId: invoice.id,
      orgSubscriptionId: orgSub.id,
    })
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  logger.billing('Invoice payment failed', {
    invoiceId: invoice.id,
    customerId,
    attemptCount: invoice.attempt_count,
  })

  // Could send payment failure notification email here
}
