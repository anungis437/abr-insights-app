import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testQueries() {
  console.log('🧪 Testing problematic queries...\n')

  const userId = 'e2baace7-c036-4700-b112-ce17e8c1ed84' // super_admin

  // Test 1: course_enrollments
  console.log('1. Testing course_enrollments...')
  const { data: enrollments, error: e1 } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('user_id', userId)
  console.log(
    e1 ? `   ❌ Error: ${e1.message}` : `   ✅ Success (${enrollments?.length ?? 0} rows)`
  )

  // Test 2: user_points
  console.log('\n2. Testing user_points...')
  const { data: points, error: e2 } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', userId)
  console.log(e2 ? `   ❌ Error: ${e2.message}` : `   ✅ Success (${points?.length ?? 0} rows)`)

  // Test 3: watch_history
  console.log('\n3. Testing watch_history...')
  const { data: history, error: e3 } = await supabase
    .from('watch_history')
    .select('duration_seconds,completed')
    .eq('user_id', userId)
  console.log(e3 ? `   ❌ Error: ${e3.message}` : `   ✅ Success (${history?.length ?? 0} rows)`)

  // Test 4: lesson_progress
  console.log('\n4. Testing lesson_progress...')
  const { data: progress, error: e4 } = await supabase
    .from('lesson_progress')
    .select('lesson_id,completed')
    .eq('user_id', userId)
  console.log(e4 ? `   ❌ Error: ${e4.message}` : `   ✅ Success (${progress?.length ?? 0} rows)`)

  // Test 5: courses
  console.log('\n5. Testing courses...')
  const { data: courses, error: e5 } = await supabase.from('courses').select('id,title').limit(5)
  console.log(e5 ? `   ❌ Error: ${e5.message}` : `   ✅ Success (${courses?.length ?? 0} rows)`)

  // Test 6: Check schema
  console.log('\n6. Checking user_points schema...')
  const { data: samplePoint, error: e6 } = await supabase
    .from('user_points')
    .select('*')
    .limit(1)
    .single()
  if (e6 && e6.code !== 'PGRST116') {
    console.log(`   ❌ Error: ${e6.message}`)
  } else if (!samplePoint) {
    console.log('   ℹ️  Table is empty - will create sample data')
  } else {
    console.log('   ✅ Schema:', Object.keys(samplePoint))
  }
}

testQueries().catch(console.error)
