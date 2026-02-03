import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testQueries() {
  const userId = 'e2baace7-c036-4700-b112-ce17e8c1ed84'

  // Test 1: user_points basic select
  console.log('\n1. Testing user_points SELECT...')
  const { data: up1, error: upError1 } = await supabase
    .from('user_points')
    .select('*')
    .eq('user_id', userId)
  console.log(upError1 ? `Error: ${upError1.message}` : `Success: ${JSON.stringify(up1)}`)

  // Test 2: watch_history with duration_seconds,completed
  console.log('\n2. Testing watch_history with duration_seconds,completed...')
  const { data: wh1, error: whError1 } = await supabase
    .from('watch_history')
    .select('duration_seconds,completed')
    .eq('user_id', userId)
  console.log(whError1 ? `Error: ${whError1.message}` : `Success: ${wh1?.length} rows`)

  // Test 3: lesson_progress with lesson_id,completed
  console.log('\n3. Testing lesson_progress with lesson_id,completed...')
  const { data: lp1, error: lpError1 } = await supabase
    .from('lesson_progress')
    .select('lesson_id,completed')
    .eq('user_id', userId)
  console.log(lpError1 ? `Error: ${lpError1.message}` : `Success: ${lp1?.length} rows`)

  // Test 4: enrollments with nested query
  console.log('\n4. Testing enrollments with nested course query...')
  const { data: en1, error: enError1 } = await supabase
    .from('enrollments')
    .select('course:courses(id,title)')
    .eq('user_id', userId)
  console.log(enError1 ? `Error: ${enError1.message}` : `Success: ${en1?.length} rows`)

  // Test 5: Check actual columns in watch_history
  console.log('\n5. Testing watch_history all columns...')
  const { data: wh2, error: whError2 } = await supabase
    .from('watch_history')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
  console.log(
    whError2
      ? `Error: ${whError2.message}`
      : `Columns: ${wh2?.[0] ? Object.keys(wh2[0]).join(', ') : 'no data'}`
  )

  // Test 6: Check actual columns in lesson_progress
  console.log('\n6. Testing lesson_progress all columns...')
  const { data: lp2, error: lpError2 } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
  console.log(
    lpError2
      ? `Error: ${lpError2.message}`
      : `Columns: ${lp2?.[0] ? Object.keys(lp2[0]).join(', ') : 'no data'}`
  )

  // Test 7: Check actual columns in user_points
  console.log('\n7. Testing user_points all columns...')
  const { data: up2, error: upError2 } = await supabase.from('user_points').select('*').limit(1)
  console.log(
    upError2
      ? `Error: ${upError2.message}`
      : `Columns: ${up2?.[0] ? Object.keys(up2[0]).join(', ') : 'no data'}`
  )
}

testQueries()
