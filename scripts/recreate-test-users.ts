import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const testAccounts = [
  { email: 'super_admin@abr-insights.com', role: 'super_admin', fullName: 'Super Admin' },
  { email: 'compliance@abr-insights.com', role: 'compliance_officer', fullName: 'Compliance Officer' },
  { email: 'orgadmin@abr-insights.com', role: 'org_admin', fullName: 'Organization Admin' },
  { email: 'analyst@abr-insights.com', role: 'analyst', fullName: 'Data Analyst' },
  { email: 'investigator@abr-insights.com', role: 'investigator', fullName: 'Case Investigator' },
  { email: 'educator@abr-insights.com', role: 'educator', fullName: 'Course Educator' },
  { email: 'learner@abr-insights.com', role: 'learner', fullName: 'Student Learner' },
  { email: 'viewer@abr-insights.com', role: 'viewer', fullName: 'Read Only Viewer' },
  { email: 'guest@abr-insights.com', role: 'guest', fullName: 'Guest User' },
]

const PASSWORD = 'TestPass123!'

async function recreateTestUsers() {
  console.log('🔧 Recreating test users using Supabase Admin API...\n')

  // Step 1: Delete existing test users (if any) using direct SQL
  console.log('🗑️  Removing manually inserted test users...')
  
  const { error: deleteError } = await supabase.rpc('exec', {
    sql: `
      DELETE FROM auth.identities WHERE user_id IN (
        SELECT id FROM auth.users WHERE email LIKE '%@abr-insights.com'
      );
      DELETE FROM auth.users WHERE email LIKE '%@abr-insights.com';
    `
  })

  if (deleteError) {
    console.log('⚠️  Could not delete via RPC (expected):', deleteError.message)
    console.log('   Continuing with user creation...\n')
  } else {
    console.log('✅ Deleted existing test users\n')
  }

  // Step 2: Create users using Supabase Admin API (proper way)
  console.log('👥 Creating test users via Admin API...\n')

  for (const account of testAccounts) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: account.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: account.fullName,
          role: account.role
        }
      })

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`ℹ️  ${account.email} - Already exists`)
        } else {
          console.error(`❌ ${account.email} - Error: ${error.message}`)
        }
      } else {
        console.log(`✅ ${account.email} - Created (ID: ${data.user?.id})`)
        
        // Step 3: Update profile with role
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: account.email,
              full_name: account.fullName,
              role: account.role,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            })

          if (profileError) {
            console.error(`   ⚠️  Profile creation failed: ${profileError.message}`)
          } else {
            console.log(`   ✅ Profile created with role: ${account.role}`)
          }
        }
      }
    } catch (err: any) {
      console.error(`❌ ${account.email} - Exception: ${err.message}`)
    }
  }

  console.log('\n✅ Test user recreation complete!')
  console.log(`\n🔐 All test accounts use password: ${PASSWORD}`)
  console.log('\n📝 Test Credentials:')
  testAccounts.forEach(acc => {
    console.log(`   ${acc.email} / ${PASSWORD}`)
  })
}

recreateTestUsers().catch(console.error)
