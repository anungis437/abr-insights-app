/**
 * Test Stripe Integration
 * Verify Stripe is properly configured
 */

import Stripe from 'stripe'

async function testStripe() {
  console.log('Testing Stripe Integration...\n')

  // Check environment variables
  console.log('1. Checking environment variables...')
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_PRICE_ID_PROFESSIONAL',
    'STRIPE_PRICE_ID_ENTERPRISE',
  ]

  const missing = requiredVars.filter(v => !process.env[v])
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '))
    process.exit(1)
  }
  console.log('✅ All environment variables set\n')

  // Initialize Stripe
  console.log('2. Initializing Stripe client...')
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
  })
  console.log('✅ Stripe client initialized\n')

  // Test API connection
  console.log('3. Testing API connection...')
  try {
    const account = await stripe.accounts.retrieve()
    console.log('✅ Connected to Stripe account:', account.business_profile?.name || account.email)
    console.log('   Account ID:', account.id)
    console.log('   Country:', account.country, '\n')
  } catch (error) {
    console.error('❌ Failed to connect to Stripe:', error)
    process.exit(1)
  }

  // Verify products
  console.log('4. Verifying products...')
  try {
    const professionalPrice = await stripe.prices.retrieve(
      process.env.STRIPE_PRICE_ID_PROFESSIONAL!
    )
    console.log('✅ Professional Plan:', professionalPrice.nickname || 'Unnamed')
    console.log(`   Price: $${(professionalPrice.unit_amount! / 100).toFixed(2)}/${professionalPrice.recurring?.interval}`)

    const enterprisePrice = await stripe.prices.retrieve(
      process.env.STRIPE_PRICE_ID_ENTERPRISE!
    )
    console.log('✅ Enterprise Plan:', enterprisePrice.nickname || 'Unnamed')
    console.log(`   Price: $${(enterprisePrice.unit_amount! / 100).toFixed(2)}/${enterprisePrice.recurring?.interval}\n`)
  } catch (error) {
    console.error('❌ Failed to retrieve products:', error)
    process.exit(1)
  }

  // Test webhook secret
  console.log('5. Checking webhook secret...')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  if (webhookSecret.startsWith('whsec_')) {
    console.log('✅ Webhook secret format valid\n')
  } else {
    console.error('❌ Invalid webhook secret format')
    process.exit(1)
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ All Stripe integration tests passed!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('Next Steps:')
  console.log('1. Start webhook listener: stripe listen --forward-to localhost:3001/api/webhooks/stripe')
  console.log('2. Start dev server: pnpm run dev')
  console.log('3. Test checkout: Visit /pricing and click subscribe')
  console.log('4. Use test card: 4242 4242 4242 4242\n')
}

testStripe()
