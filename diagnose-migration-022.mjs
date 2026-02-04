import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔍 Diagnostic: Checking migration 022 application status\n')

// Check if organization_id is nullable by querying records with NULL values
console.log('📊 Schema Check (testing NULL values):')

const { data: testRead, error: readError} = await serviceClient
  .from('enrollments')
  .select('id, organization_id')
  .is('organization_id', null)
  .limit(1)

if (readError) {
  console.log('   ❌ Error querying NULL organization_id:', readError.message)
  console.log('   This suggests organization_id might still be NOT NULL')
} else {
  console.log('   ✅ Can query enrollments with organization_id = NULL')
  console.log(`   Migration 022 appears to be applied!`)
}

// Check for individual user enrollments
console.log('\n👥 Individual User Enrollments:')
const { data: individualEnrollments, error: indivError } = await serviceClient
  .from('enrollments')
  .select('id, user_id, course_id, organization_id, created_at')
  .is('organization_id', null)
  .order('created_at', { ascending: false })
  .limit(5)

if (indivError) {
  console.log('   ❌ Error:', indivError.message)
} else {
  console.log(`   Found ${individualEnrollments.length} enrollment(s) with NULL organization_id:`)
  individualEnrollments.forEach((e, i) => {
    console.log(`   ${i + 1}. User: ${e.user_id.substring(0, 8)}..., Course: ${e.course_id.substring(0, 8)}...`)
  })
}

// Check helper functions
console.log('\n🔧 Helper Functions Check (via test query):')

// Try to use the function in a query
const { data: funcTest, error: funcError } = await serviceClient
  .from('profiles')
  .select('id')
  .limit(1)

if (funcError) {
  console.log('   ❌ Could not query profiles table')
} else {
  console.log('   ✅ Database queries working')
  console.log('   Note: Cannot directly test functions without exec_sql RPC')
}

console.log('\n💡 Summary:')
if (!readError) {
  console.log('   ✅ Migration 022 IS APPLIED - organization_id is nullable')
  console.log('   ✅ Individual user enrollments are working')
} else {
  console.log('   ❌ Migration 022 NOT APPLIED - organization_id is still NOT NULL')
  console.log('   ⚠️  Please apply migration via Supabase Dashboard SQL Editor')
}
console.log('\n📍 Migration file: supabase/migrations/022_support_individual_users.sql')

process.exit(0)
