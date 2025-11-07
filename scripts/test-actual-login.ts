import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testLogin() {
  console.log('🔐 Testing login with super_admin@abr-insights.com...\n')
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'super_admin@abr-insights.com',
    password: 'TestPass123!'
  })
  
  if (error) {
    console.log('❌ Login Error:', error.message)
    console.log('   Status:', error.status)
    console.log('   Code:', error.code)
  } else if (data.user) {
    console.log('✅ Login Successful!')
    console.log('   User ID:', data.user.id)
    console.log('   Email:', data.user.email)
    console.log('   Email Confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No')
    
    // Test fetching profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role, first_name, last_name')
      .eq('id', data.user.id)
      .single()
    
    if (profileError) {
      console.log('\n❌ Profile Fetch Error:', profileError.message)
    } else {
      console.log('\n✅ Profile Fetched Successfully!')
      console.log('   Name:', profile.first_name, profile.last_name)
      console.log('   Role:', profile.role)
    }
    
    // Sign out
    await supabase.auth.signOut()
    console.log('\n✅ Signed out successfully')
  }
}

testLogin().catch(console.error)
