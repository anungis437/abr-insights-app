#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Validating Supabase Connection...\n')

// Check environment variables
console.log('📋 Environment Variables:')
console.log(`  URL: ${supabaseUrl}`)
console.log(`  Key: ${supabaseKey?.substring(0, 20)}...`)
console.log(`  URL Valid: ${supabaseUrl?.includes('supabase.co') ? '✅' : '❌'}`)
console.log(`  Key Format: ${supabaseKey?.startsWith('eyJ') ? '✅' : '❌'}\n`)

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

// Test connection
console.log('🔌 Testing Connection...')

try {
  // Test 1: Check if we can reach Supabase
  const { data, error } = await supabase.from('profiles').select('count').limit(1)

  if (error) {
    if (error.code === '42P01') {
      console.log('⚠️  Connection successful but table "profiles" does not exist')
      console.log("   This is expected if migrations haven't been run yet.\n")
    } else {
      console.log('❌ Connection error:', error.message)
      console.log('   Error code:', error.code)
      console.log('   Error details:', error.details, '\n')
    }
  } else {
    console.log('✅ Connection successful!')
    console.log('   Table "profiles" exists and is accessible\n')
  }

  // Test 2: Check auth
  console.log('🔐 Testing Auth...')
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()

  if (authError) {
    console.log('⚠️  Auth check:', authError.message)
  } else {
    console.log('✅ Auth system is accessible')
    console.log(`   Current session: ${session ? 'Active' : 'None (expected for anon key)'}\n`)
  }

  // Test 3: List tables (if we have access)
  console.log('📊 Checking Database Schema...')
  const { data: tables, error: schemaError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .limit(10)

  if (schemaError) {
    console.log('⚠️  Cannot list tables:', schemaError.message)
  } else if (tables && tables.length > 0) {
    console.log('✅ Found tables:', tables.map((t) => t.table_name).join(', '))
  } else {
    console.log('⚠️  No tables found - migrations need to be run')
  }

  console.log('\n✨ Connection validation complete!')
  console.log('\n📝 Next Steps:')
  console.log("   1. If tables don't exist, run migrations in Supabase dashboard")
  console.log('   2. Go to: https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz/sql')
  console.log('   3. Run migration files from supabase/migrations/ in order\n')
} catch (err) {
  console.error('❌ Unexpected error:', err.message)
  console.error('   Stack:', err.stack)
  process.exit(1)
}
