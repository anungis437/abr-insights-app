import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkSchemas() {
  console.log('Checking watch_history...');
  const { data: wh, error: whError } = await supabase
    .from('watch_history')
    .select('*')
    .limit(0);
  
  if (whError) {
    console.log('watch_history error:', whError.message, whError.hint);
  } else {
    console.log('watch_history: OK');
  }

  console.log('\nChecking lesson_progress...');
  const { data: lp, error: lpError } = await supabase
    .from('lesson_progress')
    .select('*')
    .limit(0);
  
  if (lpError) {
    console.log('lesson_progress error:', lpError.message, lpError.hint);
  } else {
    console.log('lesson_progress: OK');
  }

  console.log('\nChecking user_points...');
  const { data: up, error: upError } = await supabase
    .from('user_points')
    .select('*')
    .limit(0);
  
  if (upError) {
    console.log('user_points error:', upError.message, upError.hint);
  } else {
    console.log('user_points: OK');
  }

  // Test the actual query from dashboard that was failing
  console.log('\nTesting actual failing query...');
  const { data: testQuery, error: testError } = await supabase
    .from('watch_history')
    .select('id,session_start,duration_seconds,completed,lesson:lessons(id,title,course_module:course_modules(course:courses(title)))')
    .eq('user_id', 'e2baace7-c036-4700-b112-ce17e8c1ed84')
    .order('session_start', { ascending: false })
    .limit(3);
  
  if (testError) {
    console.log('Query error:', testError.message);
    console.log('Hint:', testError.hint);
    console.log('Details:', testError.details);
  } else {
    console.log('Query successful!');
  }
}

checkSchemas();
