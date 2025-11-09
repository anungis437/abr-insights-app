import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use service role key to bypass RLS
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkSeedData() {
  console.log('📊 Checking Seed Data with Service Role Key (bypassing RLS)...\n')

  // Check auth.users
  const { data: authUsers, error: authError } = await supabase.rpc('get_auth_users_count')
  
  // Fallback: Check profiles directly
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, role', { count: 'exact' })
  
  console.log('👥 Profiles:', profiles?.length || 0, 'rows')
  if (profiles && profiles.length > 0) {
    console.log('   Sample profiles:')
    profiles.slice(0, 5).forEach(p => {
      console.log(`   - ${p.email} (${p.role})`)
    })
  }
  
  // Check enrollments
  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select('user_id, course_id, status, progress_percentage', { count: 'exact' })
  
  console.log('\n📚 Enrollments:', enrollments?.length || 0, 'rows')
  if (enrollments && enrollments.length > 0) {
    console.log('   Sample enrollments:')
    enrollments.slice(0, 5).forEach(e => {
      console.log(`   - Course ${e.course_id}: ${e.status} (${e.progress_percentage}%)`)
    })
  }
  
  // Check courses
  const { data: courses } = await supabase
    .from('courses')
    .select('title, slug, level')
  
  console.log('\n📖 Courses:', courses?.length || 0, 'rows')
  if (courses) {
    courses.forEach(c => {
      console.log(`   - ${c.title} (${c.slug}) - ${c.level}`)
    })
  }

  // Check user_achievements
  const { data: achievements } = await supabase
    .from('user_achievements')
    .select('user_id, achievement_id, points_awarded')
  
  console.log('\n🏆 User Achievements:', achievements?.length || 0, 'rows')
  
  // Check user_points
  const { data: points, error: pointsError } = await supabase
    .from('user_points')
    .select('user_id, current_balance, total_points_earned')
  
  console.log('💎 User Points:', points?.length || 0, 'rows')
  if (pointsError) {
    console.log('   Error:', pointsError.message)
  }
  if (points && points.length > 0) {
    points.forEach(p => {
      console.log(`   - User ${p.user_id.slice(0, 8)}...: ${p.current_balance} points (${p.total_points_earned} earned)`)
    })
  }

  if (profilesError) console.error('\n❌ Profiles error:', profilesError)
  if (enrollError) console.error('❌ Enrollments error:', enrollError)
}

checkSeedData().catch(console.error)
