import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const testAccounts = [
  {
    email: 'super_admin@abr-insights.com',
    role: 'super_admin',
    firstName: 'Super',
    lastName: 'Admin',
  },
  {
    email: 'compliance@abr-insights.com',
    role: 'compliance_officer',
    firstName: 'Compliance',
    lastName: 'Officer',
  },
  { email: 'orgadmin@abr-insights.com', role: 'org_admin', firstName: 'Org', lastName: 'Admin' },
  { email: 'analyst@abr-insights.com', role: 'analyst', firstName: 'Data', lastName: 'Analyst' },
  {
    email: 'investigator@abr-insights.com',
    role: 'investigator',
    firstName: 'Case',
    lastName: 'Investigator',
  },
  {
    email: 'educator@abr-insights.com',
    role: 'educator',
    firstName: 'Training',
    lastName: 'Educator',
  },
  { email: 'learner@abr-insights.com', role: 'learner', firstName: 'Active', lastName: 'Learner' },
  { email: 'viewer@abr-insights.com', role: 'viewer', firstName: 'Report', lastName: 'Viewer' },
  { email: 'guest@abr-insights.com', role: 'guest', firstName: 'Guest', lastName: 'User' },
]

async function fixAuthUsers() {
  console.log('🔧 Fixing Auth Schema Corruption\n')
  console.log('Step 1: Deleting corrupted auth users...')

  // Delete existing auth users via SQL (run fix-auth-schema.sql in Dashboard first)
  console.log('⚠️  Please run scripts/fix-auth-schema.sql in Supabase Dashboard SQL Editor first')
  console.log('   This will delete the corrupted auth.users entries\n')

  console.log('Step 2: Creating auth users properly via Auth API...\n')

  const results = []

  for (const account of testAccounts) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: account.email,
        password: 'TestPass123!',
        email_confirm: true,
        user_metadata: {
          first_name: account.firstName,
          last_name: account.lastName,
          role: account.role,
        },
      })

      if (error) {
        console.log(`❌ ${account.email}: ${error.message}`)
        results.push({ ...account, status: 'error', error: error.message })
      } else if (data.user) {
        console.log(`✅ ${account.email}: ${data.user.id}`)
        results.push({ ...account, status: 'success', newUuid: data.user.id })
      }
    } catch (err) {
      console.log(`❌ ${account.email}: ${err}`)
      results.push({ ...account, status: 'error', error: String(err) })
    }
  }

  console.log('\n📊 Summary:')
  const successful = results.filter((r) => r.status === 'success')
  console.log(`   ✅ Successful: ${successful.length}/${testAccounts.length}`)
  console.log(`   ❌ Failed: ${results.length - successful.length}/${testAccounts.length}`)

  if (successful.length > 0) {
    console.log('\n📝 Step 3: Update profiles table with new UUIDs')
    console.log('   Run the following SQL in Supabase Dashboard:\n')

    for (const result of successful) {
      if ('newUuid' in result && result.newUuid) {
        console.log(`UPDATE profiles SET id = '${result.newUuid}' WHERE email = '${result.email}';`)
      }
    }
  }

  return results
}

fixAuthUsers()
  .then(() => console.log('\n✅ Auth fix process complete'))
  .catch((err) => console.error('\n❌ Error:', err))
