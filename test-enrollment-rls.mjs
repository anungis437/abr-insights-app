import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

// Create client with anon key (like frontend)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TEST_EMAIL = 'learner@abr-insights.com'
const TEST_PASSWORD = 'TestPass123!'

console.log('🔐 Testing enrollment read with user JWT...\n')

// Sign in as test user
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
})

if (authError) {
  console.log('❌ Login failed:', authError)
  process.exit(1)
}

console.log('✅ Logged in as:', authData.user.email)
console.log('   User ID:', authData.user.id)
console.log()

// Try to read enrollments (this should trigger the RLS policy)
const { data: enrollments, error } = await supabase
  .from('enrollments')
  .select('*')
  .eq('user_id', authData.user.id)

if (error) {
  console.log('❌ Failed to read enrollments:')
  console.log(JSON.stringify(error, null, 2))
} else {
  console.log('✅ Successfully read enrollments:')
  console.log(`   Found ${enrollments.length} enrollment(s)`)
  enrollments.forEach((e, i) => {
    console.log(`\n   Enrollment ${i + 1}:`)
    console.log(`   - ID: ${e.id}`)
    console.log(`   - Course ID: ${e.course_id}`)
    console.log(`   - Organization ID: ${e.organization_id || 'NULL (individual)'}`)
    console.log(`   - Status: ${e.status}`)
  })
}

// Sign out
await supabase.auth.signOut()

process.exit(0)
