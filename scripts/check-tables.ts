import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const tables = [
  'cases',
  'course_enrollments',
  'user_points',
  'watch_history',
  'lesson_progress',
  'courses',
  'course_modules',
  'lessons',
  'profiles',
  'tribunal_cases_raw',
  'achievements',
  'user_achievements',
  'badges',
  'learning_paths',
]

async function checkTables() {
  console.log('🔍 Checking database tables...\n')

  const exists: string[] = []
  const missing: string[] = []

  for (const t of tables) {
    try {
      const { data, error, count } = await supabase
        .from(t)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`❌ ${t.padEnd(25)} - NOT FOUND: ${error.message.substring(0, 60)}`)
        missing.push(t)
      } else {
        console.log(`✅ ${t.padEnd(25)} - Exists (${count ?? 0} rows)`)
        exists.push(t)
      }
    } catch (e: any) {
      console.log(`❌ ${t.padEnd(25)} - ERROR: ${e.message.substring(0, 60)}`)
      missing.push(t)
    }
  }

  console.log(`\n📊 Summary: ${exists.length} exist, ${missing.length} missing`)
  if (missing.length > 0) {
    console.log('\n🔨 Missing tables:', missing.join(', '))
  }
}

checkTables()
