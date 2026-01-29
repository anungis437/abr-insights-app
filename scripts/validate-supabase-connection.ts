import { createClient } from '@supabase/supabase-js'
import pg from 'pg'

/**
 * Supabase Connection Validator
 * Tests both Supabase client connection and direct PostgreSQL connection
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const DATABASE_URL = process.env.DATABASE_URL || ''

async function validateSupabaseClient() {
  console.log('\n🔍 Testing Supabase Client Connection...')
  console.log('URL:', SUPABASE_URL)

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Test 1: Basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1)

    if (error) {
      console.error('❌ Supabase client error:', error.message)
      return false
    }

    console.log('✅ Supabase client connection successful')
    return true
  } catch (error) {
    console.error('❌ Supabase client exception:', error)
    return false
  }
}

async function validateServiceRole() {
  console.log('\n🔍 Testing Supabase Service Role...')

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Test admin access
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })

    if (error) {
      console.error('❌ Service role error:', error.message)
      return false
    }

    console.log('✅ Service role access confirmed')
    console.log(`   Found ${data?.users?.length || 0} users in first page`)
    return true
  } catch (error) {
    console.error('❌ Service role exception:', error)
    return false
  }
}

async function validatePostgresConnection() {
  console.log('\n🔍 Testing Direct PostgreSQL Connection...')

  if (!DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL not set, skipping PostgreSQL test')
    return false
  }

  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  try {
    await client.connect()
    console.log('✅ PostgreSQL connection established')

    // Test query
    const result = await client.query('SELECT version(), current_database(), current_user')
    console.log('   Database:', result.rows[0].current_database)
    console.log('   User:', result.rows[0].current_user)
    console.log('   PostgreSQL Version:', result.rows[0].version.split(',')[0])

    // Check extensions
    const extensions = await client.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname IN ('pgvector', 'pg_cron', 'pg_stat_statements')
      ORDER BY extname
    `)

    if (extensions.rows.length > 0) {
      console.log('   Extensions:')
      extensions.rows.forEach((ext: { extname: string; extversion: string }) => {
        console.log(`     - ${ext.extname} (v${ext.extversion})`)
      })
    }

    // Check table count
    const tables = await client.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
    console.log(`   Public tables: ${tables.rows[0].table_count}`)

    await client.end()
    return true
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error)
    await client.end().catch(() => {})
    return false
  }
}

async function validateDatabaseSchema() {
  console.log('\n🔍 Validating Database Schema...')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const criticalTables = [
    'profiles',
    'courses',
    'lessons',
    'progress',
    'tribunal_cases',
    'achievements',
    'user_achievements',
    'certificates',
    'course_embeddings',
    'case_embeddings',
  ]

  const results: { table: string; exists: boolean; count?: number }[] = []

  for (const table of criticalTables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        results.push({ table, exists: false })
        console.log(`   ❌ ${table}: ${error.message}`)
      } else {
        results.push({ table, exists: true, count: count || 0 })
        console.log(`   ✅ ${table}: ${count || 0} records`)
      }
    } catch (error) {
      results.push({ table, exists: false })
      console.log(`   ❌ ${table}: Exception`)
    }
  }

  const missingTables = results.filter((r) => !r.exists)
  if (missingTables.length > 0) {
    console.warn(`\n⚠️  Missing ${missingTables.length} critical tables`)
    return false
  }

  console.log('\n✅ All critical tables exist')
  return true
}

async function testAuthentication() {
  console.log('\n🔍 Testing Authentication System...')

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  try {
    // Test anonymous session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.log('   ℹ️  No active session (expected)')
    } else if (session) {
      console.log('   ✅ Active session found')
      console.log('   User:', session.user.email)
    } else {
      console.log('   ℹ️  No session (anonymous access)')
    }

    // Test auth configuration
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 5,
    })

    if (usersError) {
      console.error('   ❌ Cannot list users:', usersError.message)
      return false
    }

    console.log(`   ✅ Found ${users.users.length} users (showing first 5)`)

    if (users.users.length > 0) {
      const roles = await supabaseAdmin.from('profiles').select('role, count:id.count()').limit(10)

      if (!roles.error && roles.data) {
        console.log('   User roles distribution:')
        const roleMap = new Map()
        users.users.forEach((u) => {
          // We'd need to join with profiles for actual role counts
        })
      }
    }

    return true
  } catch (error) {
    console.error('   ❌ Auth test error:', error)
    return false
  }
}

async function validateStorageAccess() {
  console.log('\n🔍 Testing Storage Access...')

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error('   ❌ Storage error:', error.message)
      return false
    }

    console.log(`   ✅ Found ${buckets.length} storage buckets`)
    buckets.forEach((bucket) => {
      console.log(`      - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
    })

    return true
  } catch (error) {
    console.error('   ❌ Storage exception:', error)
    return false
  }
}

async function main() {
  console.log('🚀 Supabase Connection Validator')
  console.log('================================\n')

  // Validate environment variables
  const missing: string[] = []
  if (!SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!SUPABASE_SERVICE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:')
    missing.forEach((v) => console.error(`   - ${v}`))
    console.error('\nPlease set these in your .env.local file')
    process.exit(1)
  }

  console.log('✅ Environment variables loaded\n')

  const results = {
    supabaseClient: false,
    serviceRole: false,
    postgres: false,
    schema: false,
    auth: false,
    storage: false,
  }

  // Run all tests
  results.supabaseClient = await validateSupabaseClient()
  results.serviceRole = await validateServiceRole()
  results.postgres = await validatePostgresConnection()
  results.schema = await validateDatabaseSchema()
  results.auth = await testAuthentication()
  results.storage = await validateStorageAccess()

  // Summary
  console.log('\n================================')
  console.log('📊 Validation Summary')
  console.log('================================\n')

  const tests = Object.entries(results)
  const passed = tests.filter(([_, result]) => result).length
  const total = tests.length

  tests.forEach(([test, result]) => {
    const icon = result ? '✅' : '❌'
    const name = test.replace(/([A-Z])/g, ' $1').trim()
    console.log(`${icon} ${name.charAt(0).toUpperCase() + name.slice(1)}`)
  })

  console.log(`\n${passed}/${total} tests passed`)

  if (passed === total) {
    console.log('\n🎉 All connection tests passed! Your Supabase instance is ready.')
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
