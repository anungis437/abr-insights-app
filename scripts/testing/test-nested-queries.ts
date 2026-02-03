import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testFailingQueries() {
  const userId = 'e2baace7-c036-4700-b112-ce17e8c1ed84'

  // Test 1: user_points SELECT
  console.log('\n1. Testing user_points SELECT...')
  const { data: up, error: upError } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', userId)
  if (upError) console.log('Error:', upError.message, upError.hint, upError.details)
  else console.log('Success:', up)

  // Test 2: enrollments with nested courses
  console.log('\n2. Testing enrollments with nested courses...')
  const { data: en, error: enError } = await supabase
    .from('enrollments')
    .select('course:courses(id,title,modules:course_modules(lessons(id,title,skill_tags)))')
    .eq('user_id', userId)
  if (enError)
    console.log('Error:', enError.message, '\nHint:', enError.hint, '\nDetails:', enError.details)
  else console.log('Success:', en)

  // Test 3: Simple enrollments query
  console.log('\n3. Testing simple enrollments query...')
  const { data: en2, error: en2Error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', userId)
  if (en2Error) console.log('Error:', en2Error.message)
  else console.log('Success:', en2)

  // Test 4: lesson_progress with nested lessons
  console.log('\n4. Testing lesson_progress with nested lessons...')
  const { data: lp, error: lpError } = await supabase
    .from('lesson_progress')
    .select('lesson:lessons(ce_credits,category,completed_at)')
    .eq('user_id', userId)
    .eq('status', 'completed')
  if (lpError)
    console.log('Error:', lpError.message, '\nHint:', lpError.hint, '\nDetails:', lpError.details)
  else console.log('Success:', lp)

  // Test 5: Check lessons table columns
  console.log('\n5. Testing lessons table...')
  const { data: lessons, error: lessonsError } = await supabase.from('lessons').select('*').limit(1)
  if (lessonsError) console.log('Error:', lessonsError.message)
  else if (lessons?.[0]) console.log('Lesson columns:', Object.keys(lessons[0]).join(', '))
  else console.log('No lessons found')
}

testFailingQueries()
