/**
 * Script to create Stripe products and prices
 * Run with: npx tsx --env-file=.env.local scripts/create-stripe-products.ts
 */

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

async function createProducts() {
  console.log('Creating Stripe products...\n')

  try {
    // 1. Professional Plan
    console.log('1. Creating Professional Plan...')
    const professionalProduct = await stripe.products.create({
      name: 'Professional Plan',
      description: 'Full access to all courses and features',
      metadata: {
        tier: 'professional',
      },
    })

    const professionalPrice = await stripe.prices.create({
      product: professionalProduct.id,
      unit_amount: 2999, // $29.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: 'professional',
      },
    })

    console.log(`✅ Professional Plan created`)
    console.log(`   Product ID: ${professionalProduct.id}`)
    console.log(`   Price ID: ${professionalPrice.id}`)
    console.log(`   Amount: $29.99/month\n`)

    // 2. Enterprise Plan
    console.log('2. Creating Enterprise Plan...')
    const enterpriseProduct = await stripe.products.create({
      name: 'Enterprise Plan',
      description: 'Advanced features for organizations',
      metadata: {
        tier: 'enterprise',
      },
    })

    const enterprisePrice = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 9999, // $99.99
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: 'enterprise',
      },
    })

    console.log(`✅ Enterprise Plan created`)
    console.log(`   Product ID: ${enterpriseProduct.id}`)
    console.log(`   Price ID: ${enterprisePrice.id}`)
    console.log(`   Amount: $99.99/month\n`)

    // Output for .env.local
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Add these to your .env.local file:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log(`STRIPE_PRICE_ID_PROFESSIONAL=${professionalPrice.id}`)
    console.log(`STRIPE_PRICE_ID_ENTERPRISE=${enterprisePrice.id}\n`)
  } catch (error) {
    console.error('Error creating products:', error)
    process.exit(1)
  }
}

createProducts()
