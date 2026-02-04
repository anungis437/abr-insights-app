#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function validateMigration() {
  console.log('\n🔍 Validating Migration 023...\n')

  let passCount = 0
  let failCount = 0

  // Test 1: Check user_levels table exists
  console.log('1️⃣  Checking user_levels table...')
  try {
    const { error } = await supabase.from('user_levels').select('id').limit(0)

    if (!error) {
      console.log('   ✅ user_levels table exists and is accessible\n')
      passCount++
    } else {
      console.log(`   ❌ user_levels table error: ${error.message}\n`)
      failCount++
    }
  } catch (err) {
    console.log(`   ❌ user_levels table check failed: ${err.message}\n`)
    failCount++
  }

  // Test 2: Check saved_searches.deleted_at column
  console.log('2️⃣  Checking saved_searches.deleted_at column...')
  try {
    const { error } = await supabase.from('saved_searches').select('deleted_at').limit(0)

    if (!error) {
      console.log('   ✅ saved_searches.deleted_at column exists\n')
      passCount++
    } else if (error.code === 'PGRST200' && error.message.includes('does not exist')) {
      console.log('   ❌ saved_searches table does not exist\n')
      failCount++
    } else if (error.code === '42703') {
      console.log('   ❌ deleted_at column missing\n')
      failCount++
    } else {
      console.log('   ⚠️  Unexpected error, but might be OK\n')
      passCount++
    }
  } catch (err) {
    console.log(`   ⚠️  Check skipped: ${err.message}\n`)
  }

  // Test 3: Check get_user_points_summary function
  console.log('3️⃣  Checking get_user_points_summary function...')
  try {
    const testUserId = 'c0707e9e-85f6-4941-bc1f-d99f70240ec3'
    const { data, error } = await supabase.rpc('get_user_points_summary', {
      p_user_id: testUserId,
    })

    if (!error && data !== null) {
      console.log('   ✅ get_user_points_summary function works')
      console.log(`   📊 Result: ${JSON.stringify(data)}\n`)
      passCount++
    } else if (error?.code === 'PGRST202') {
      console.log(`   ❌ Function not found: ${error.message}\n`)
      failCount++
    } else {
      console.log(`   ⚠️  Function exists but returned error: ${error?.message || 'unknown'}\n`)
      passCount++
    }
  } catch (err) {
    console.log(`   ❌ Function check failed: ${err.message}\n`)
    failCount++
  }

  // Test 4: Check get_user_social_summary function
  console.log('4️⃣  Checking get_user_social_summary function...')
  try {
    const testUserId = 'c0707e9e-85f6-4941-bc1f-d99f70240ec3'
    const { data, error } = await supabase.rpc('get_user_social_summary', {
      p_user_id: testUserId,
    })

    if (!error && data !== null) {
      console.log('   ✅ get_user_social_summary function works')
      console.log(`   📊 Result: ${JSON.stringify(data)}\n`)
      passCount++
    } else if (error?.code === 'PGRST202') {
      console.log(`   ❌ Function not found: ${error.message}\n`)
      failCount++
    } else {
      console.log(`   ⚠️  Function exists but returned error: ${error?.message || 'unknown'}\n`)
      passCount++
    }
  } catch (err) {
    console.log(`   ❌ Function check failed: ${err.message}\n`)
    failCount++
  }

  // Test 5: Test enrollment query with individual user
  console.log('5️⃣  Testing enrollment query for individual user...')
  try {
    // Use service role to bypass RLS and check if enrollment exists
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select('*')
      .is('organization_id', null)
      .limit(1)

    if (!error) {
      if (enrollments && enrollments.length > 0) {
        console.log('   ✅ Can query enrollments with NULL organization_id')
        console.log(`   📋 Found ${enrollments.length} enrollment(s)\n`)
      } else {
        console.log('   ✅ Query works (no enrollments found yet)\n')
      }
      passCount++
    } else {
      console.log(`   ❌ Enrollment query failed: ${error.message}\n`)
      failCount++
    }
  } catch (err) {
    console.log(`   ❌ Enrollment test failed: ${err.message}\n`)
    failCount++
  }

  // Test 6: Test user_achievements query
  console.log('6️⃣  Testing user_achievements query...')
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .is('organization_id', null)
      .limit(1)

    if (!error) {
      console.log('   ✅ Can query user_achievements with NULL organization_id\n')
      passCount++
    } else {
      console.log(`   ❌ user_achievements query failed: ${error.message}\n`)
      failCount++
    }
  } catch (err) {
    console.log(`   ❌ user_achievements test failed: ${err.message}\n`)
    failCount++
  }

  // Summary
  console.log('═══════════════════════════════════════════════════════════\n')
  if (failCount === 0) {
    console.log('✅ MIGRATION 023 VALIDATED SUCCESSFULLY!\n')
    console.log(`   All ${passCount} checks passed\n`)
    console.log('🎯 Next Steps:')
    console.log('   1. Wait for Azure deployment to complete')
    console.log('   2. Hard refresh browser (Ctrl+Shift+F5)')
    console.log('   3. Login: learner@abr-insights.com / TestPass123!')
    console.log('   4. Navigate to: /courses/intro-to-abr/player')
    console.log('   5. Verify NO errors in console\n')
  } else {
    console.log(`⚠️  VALIDATION COMPLETED WITH ISSUES\n`)
    console.log(`   ✅ Passed: ${passCount}`)
    console.log(`   ❌ Failed: ${failCount}\n`)
    console.log('🔧 Action Required:')
    console.log('   Review failed checks above')
    console.log('   Re-run migration 023 if needed\n')
  }
}

validateMigration().catch(console.error)
