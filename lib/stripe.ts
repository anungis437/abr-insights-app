/**
 * Stripe Configuration
 * Server-side Stripe instance
 */

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
})

/**
 * Stripe Price IDs for subscription tiers
 */
export const STRIPE_PRICES = {
  FREE: process.env.STRIPE_PRICE_ID_FREE || '',
  PROFESSIONAL: process.env.STRIPE_PRICE_ID_PROFESSIONAL || '',
  ENTERPRISE: process.env.STRIPE_PRICE_ID_ENTERPRISE || '',
} as const

/**
 * Get Stripe customer by Supabase user ID
 */
export async function getOrCreateStripeCustomer(userId: string, email: string) {
  // Search for existing customer
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (customers.data.length > 0) {
    return customers.data[0]
  }

  // Create new customer
  return await stripe.customers.create({
    email,
    metadata: {
      supabase_user_id: userId,
    },
  })
}
