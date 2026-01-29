import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function verifySeedData() {
  console.log('📊 Verifying Comprehensive Seed Data...\n')

  const tables = [
    'profiles',
    'courses',
    'lessons',
    'enrollments',
    'achievements',
    'user_achievements',
    'user_points',
    'tribunal_cases',
  ]

  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })

    if (error) {
      console.log(`❌ ${table}: Error - ${error.message}`)
    } else {
      const emoji = count! > 0 ? '✅' : '⚠️ '
      console.log(`${emoji} ${table}: ${count} rows`)
    }
  }

  console.log('\n🎯 Demo Data Status:')

  // Check test users
  const { data: testUsers } = await supabase
    .from('profiles')
    .select('email, full_name')
    .like('email', '%@abr-insights.com%')

  console.log(`   👥 Test Users: ${testUsers?.length || 0}`)

  // Check enrollments by user
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('user_id, status')
    .in('status', ['active', 'completed'])

  console.log(`   📚 Active/Completed Enrollments: ${enrollments?.length || 0}`)

  // Check courses by level
  const { data: courses } = await supabase.from('courses').select('level').eq('is_published', true)

  const levels = courses?.reduce((acc: any, c) => {
    acc[c.level] = (acc[c.level] || 0) + 1
    return acc
  }, {})

  console.log(`   📖 Published Courses by Level:`, levels)

  console.log('\n✨ Demo seed data verification complete!')
}

verifySeedData().catch(console.error)
