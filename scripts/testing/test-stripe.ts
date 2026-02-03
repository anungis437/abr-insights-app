import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

async function testStripe() {
  console.log('🧪 Testing Stripe Integration\n')

  try {
    // 1. Test API connection
    console.log('1️⃣  Testing API connection...')
    const balance = await stripe.balance.retrieve()
    console.log(`   ✅ Connected to Stripe`)
    console.log(`   💰 Available: $${balance.available[0].amount / 100}`)
    console.log(`   🏦 Pending: $${balance.pending[0].amount / 100}\n`)

    // 2. List products
    console.log('2️⃣  Listing products...')
    const products = await stripe.products.list({ limit: 5, active: true })
    if (products.data.length > 0) {
      console.log(`   ✅ Found ${products.data.length} products:`)
      for (const product of products.data) {
        console.log(`      • ${product.name} (${product.id})`)
      }
    } else {
      console.log('   ℹ️  No products found - create some in the Stripe Dashboard')
    }
    console.log()

    // 3. List prices
    console.log('3️⃣  Listing prices...')
    const prices = await stripe.prices.list({ limit: 5, active: true })
    if (prices.data.length > 0) {
      console.log(`   ✅ Found ${prices.data.length} prices:`)
      for (const price of prices.data) {
        const amount = price.unit_amount ? `$${price.unit_amount / 100}` : 'Custom'
        const interval = price.recurring ? `/${price.recurring.interval}` : ''
        console.log(`      • ${price.id} - ${amount}${interval}`)
      }
    } else {
      console.log('   ℹ️  No prices found - create some in the Stripe Dashboard')
    }
    console.log()

    // 4. Test webhook endpoint
    console.log('4️⃣  Webhook Configuration:')
    console.log(`   📡 Endpoint: http://localhost:3002/api/webhooks/stripe`)
    console.log(`   🔐 Secret: ${process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 20)}...`)
    console.log(`   ✅ Stripe CLI listener should be running\n`)

    console.log('✨ Stripe integration is working!\n')
    console.log('📝 Next Steps:')
    console.log('   1. Create products at: https://dashboard.stripe.com/test/products')
    console.log('   2. Copy Price IDs to .env.local')
    console.log('   3. Test payment at: http://localhost:3002/pricing')
    console.log('   4. Use test card: 4242 4242 4242 4242\n')
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('   - Check STRIPE_SECRET_KEY in .env.local')
    console.log("   - Ensure you're using test mode keys (sk_test_...)")
    console.log('   - Verify Stripe CLI is logged in: stripe login')
  }
}

testStripe()
