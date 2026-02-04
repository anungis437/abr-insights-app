import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const USER_ID = 'c0707e9e-85f6-4941-bc1f-d99f70240ec3'
const COURSE_ID = 'f1663c19-96e6-4734-856e-78bd248e2563'

console.log('🔍 Checking enrollment for user:', USER_ID)
console.log('   Course:', COURSE_ID)
console.log()

// Check if enrollment exists
const { data: enrollment, error } = await supabase
  .from('enrollments')
  .select('*')
  .eq('user_id', USER_ID)
  .eq('course_id', COURSE_ID)
  .maybeSingle()

if (error) {
  console.log('❌ Error fetching enrollment:', error)
} else if (enrollment) {
  console.log('✅ Enrollment exists:')
  console.log(JSON.stringify(enrollment, null, 2))
  console.log()
  console.log('   organization_id:', enrollment.organization_id || 'NULL (individual user)')
} else {
  console.log('⚠️  No enrollment found')
}

// Check user profile
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('id, organization_id, email')
  .eq('id', USER_ID)
  .single()

if (profileError) {
  console.log('❌ Error fetching profile:', profileError)
} else {
  console.log('\n👤 User profile:')
  console.log(JSON.stringify(profile, null, 2))
  console.log('   organization_id:', profile.organization_id || 'NULL (individual user)')
}

// Check course
const { data: course, error: courseError } = await supabase
  .from('courses')
  .select('id, title, slug')
  .eq('id', COURSE_ID)
  .single()

if (courseError) {
  console.log('❌ Error fetching course:', courseError)
} else {
  console.log('\n📚 Course:')
  console.log(JSON.stringify(course, null, 2))
}

process.exit(0)
