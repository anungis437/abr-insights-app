import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Map role names to profile role slugs
const roleMapping = {
  'Super Admin': 'super_admin',
  'Instructor': 'educator',
  'Learner': 'learner',
  'Admin': 'org_admin',
  'Manager': 'compliance_officer',
  'Analyst': 'analyst',
  'Guest': 'guest'
}

async function syncProfileRoles() {
  console.log('Syncing profile roles with user_roles...\n')

  // Get all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, role')

  for (const profile of profiles) {
    // Get user's primary role from user_roles
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role_id, roles(name)')
      .eq('user_id', profile.id)
      .limit(1)
      .single()

    if (userRoles && userRoles.roles) {
      const roleName = userRoles.roles.name
      const profileRole = roleMapping[roleName] || 'learner'

      // Update profile if role doesn't match
      if (profile.role !== profileRole) {
        const { error } = await supabase
          .from('profiles')
          .update({ role: profileRole })
          .eq('id', profile.id)

        if (error) {
          console.error(`❌ Error updating ${profile.email}:`, error.message)
        } else {
          console.log(`✅ ${profile.email}: ${profile.role || 'null'} → ${profileRole}`)
        }
      } else {
        console.log(`✓ ${profile.email}: ${profileRole} (already correct)`)
      }
    } else {
      console.log(`⚠️  ${profile.email}: No role assignment found`)
    }
  }

  console.log('\nDone!')
}

syncProfileRoles()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })
