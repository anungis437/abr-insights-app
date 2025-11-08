import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkGamificationTables() {
  console.log('🔍 Checking gamification tables...\n')

  // Check user_points table
  const { data: pointsData, error: pointsError } = await supabase
    .from('user_points')
    .select('*')
    .limit(1)

  if (pointsError) {
    console.error('❌ user_points table error:', pointsError.message)
    console.error('   Code:', pointsError.code)
  } else {
    console.log('✅ user_points table exists')
    console.log('   Columns:', pointsData ? Object.keys(pointsData[0] || {}).join(', ') : 'No data')
  }

  // Check user_streaks table
  const { data: streaksData, error: streaksError } = await supabase
    .from('user_streaks')
    .select('*')
    .limit(1)

  if (streaksError) {
    console.error('\n❌ user_streaks table error:', streaksError.message)
    console.error('   Code:', streaksError.code)
  } else {
    console.log('\n✅ user_streaks table exists')
    console.log('   Columns:', streaksData ? Object.keys(streaksData[0] || {}).join(', ') : 'No data')
  }

  // Check point_transactions table
  const { data: transactionsData, error: transactionsError } = await supabase
    .from('point_transactions')
    .select('*')
    .limit(1)

  if (transactionsError) {
    console.error('\n❌ point_transactions table error:', transactionsError.message)
    console.error('   Code:', transactionsError.code)
  } else {
    console.log('\n✅ point_transactions table exists')
    console.log('   Columns:', transactionsData ? Object.keys(transactionsData[0] || {}).join(', ') : 'No data')
  }

  // Try the gamification service
  console.log('\n📝 Testing gamification service...\n')
  
  try {
    const { gamificationService } = await import('@/lib/services/gamification')
    
    // Get test user
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const testUser = users.find(u => u.email === 'learner@abr-insights.com')
    
    if (!testUser) {
      console.error('❌ Test user not found')
      return
    }

    console.log(`Testing with user: ${testUser.email} (${testUser.id})\n`)

    // Try to award points
    const result = await gamificationService.awardPoints(
      testUser.id,
      10,
      'daily_login',
      undefined,
      'Test daily login',
      { test: true }
    )

    console.log('✅ Award points succeeded:', result)

    // Try to update streak
    const streakResult = await gamificationService.updateUserStreak(
      testUser.id,
      'daily_login',
      new Date().toISOString()
    )

    console.log('✅ Update streak succeeded:', streakResult)

  } catch (error: any) {
    console.error('❌ Gamification service error:', error.message)
    console.error('   Stack:', error.stack)
  }
}

checkGamificationTables().catch(console.error)
