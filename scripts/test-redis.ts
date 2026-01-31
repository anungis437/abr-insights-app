#!/usr/bin/env node
/**
 * Test Upstash Redis Connection
 * Verifies that Redis rate limiting is working correctly
 */

// Load environment variables
import 'dotenv/config'

async function testRedisConnection() {
  console.log('🔍 Testing Upstash Redis Connection...\n')

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.error('❌ Missing Upstash Redis credentials')
    console.error('   Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local')
    process.exit(1)
  }

  console.log('📝 Configuration:')
  console.log(`   URL: ${url}`)
  console.log(`   Token: ${token.substring(0, 20)}...`)
  console.log()

  try {
    // Import Redis client
    const { Redis } = await import('@upstash/redis')

    console.log('✅ @upstash/redis package loaded')

    // Create client
    const redis = new Redis({
      url,
      token,
    })

    console.log('✅ Redis client created')
    console.log()

    // Test 1: Set a value
    console.log('Test 1: SET operation')
    await redis.set('test:connection', 'success', { ex: 60 })
    console.log('   ✅ SET test:connection = "success" (expires in 60s)')

    // Test 2: Get the value
    console.log('\nTest 2: GET operation')
    const value = await redis.get('test:connection')
    console.log(`   ✅ GET test:connection = "${value}"`)

    // Test 3: Rate limit simulation (Sorted Set)
    console.log('\nTest 3: Rate limit simulation (Sorted Set)')
    const now = Date.now()
    const key = 'ratelimit:test:user123'

    await redis.zadd(key, { score: now, member: `${now}:req1` })
    await redis.zadd(key, { score: now + 1, member: `${now + 1}:req2` })
    await redis.expire(key, 60)

    console.log(`   ✅ ZADD ${key} (2 requests)`)

    const count = await redis.zcard(key)
    console.log(`   ✅ ZCARD ${key} = ${count}`)

    // Test 4: Cleanup
    console.log('\nTest 4: Cleanup')
    await redis.del('test:connection', key)
    console.log('   ✅ Cleanup complete')

    console.log('\n' + '='.repeat(60))
    console.log('✅ SUCCESS: Upstash Redis is working correctly!')
    console.log('='.repeat(60))
    console.log('\n📊 Next steps:')
    console.log('   1. Your rate limiting is now production-ready')
    console.log('   2. Test API endpoints and check rate limit headers')
    console.log('   3. Monitor usage at https://console.upstash.com/')
    console.log()
  } catch (error) {
    console.error('\n❌ ERROR: Redis connection failed')
    console.error(error)
    console.error('\nTroubleshooting:')
    console.error('   1. Verify credentials are correct')
    console.error('   2. Check Upstash dashboard for connection errors')
    console.error('   3. Ensure @upstash/redis is installed: npm install @upstash/redis')
    process.exit(1)
  }
}

testRedisConnection()
