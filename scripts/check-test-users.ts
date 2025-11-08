import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkTestUsers() {
  console.log('🔍 Checking test users in auth.users...\n')
  
  // Query using admin API to list users
  const { data: users, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 100
  })

  if (error) {
    console.error('❌ Error fetching users:', error)
    return
  }

  const testUsers = users.users.filter(u => u.email?.includes('@abr-insights.com'))
  
  console.log(`Found ${testUsers.length} test users:\n`)
  
  testUsers.forEach(user => {
    console.log(`📧 ${user.email}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Confirmed: ${user.email_confirmed_at ? '✅' : '❌'}`)
    console.log(`   Created: ${user.created_at}`)
    console.log(`   Last Sign In: ${user.last_sign_in_at || 'Never'}`)
    console.log('')
  })

  // Try to sign in with one of the test users
  console.log('\n🔐 Testing authentication with learner@abr-insights.com...')
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'learner@abr-insights.com',
    password: 'TestPass123!'
  })

  if (authError) {
    console.error('❌ Authentication failed:', authError.message)
    console.error('   Error code:', authError.status)
  } else {
    console.log('✅ Authentication successful!')
    console.log('   User ID:', authData.user?.id)
    console.log('   Email:', authData.user?.email)
  }
}

checkTestUsers().catch(console.error)
