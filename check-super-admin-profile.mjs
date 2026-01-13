import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSuperAdminProfile() {
  console.log('Checking super admin profile...\n')

  // Get the auth user
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const superAdmin = authUsers.users.find(u => u.email === 'super_admin@abr-insights.com')
  
  if (!superAdmin) {
    console.log('Super admin user not found!')
    return
  }

  console.log('Auth User ID:', superAdmin.id)
  console.log('Email:', superAdmin.email)

  // Check profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', superAdmin.id)
    .single()

  if (profileError) {
    console.log('Profile Error:', profileError)
  } else {
    console.log('\nProfile Data:')
    console.log('  Full Name:', profile.full_name)
    console.log('  Role (from profile):', profile.role)
    console.log('  Avatar URL:', profile.avatar_url)
    console.log('  Organization ID:', profile.organization_id)
  }

  // Check user_roles
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*, roles(name)')
    .eq('user_id', superAdmin.id)

  if (rolesError) {
    console.log('Roles Error:', rolesError)
  } else {
    console.log('\nUser Roles:')
    roles.forEach(r => {
      console.log('  Role:', r.roles.name)
      console.log('  Organization ID:', r.organization_id)
      console.log('  Is Primary:', r.is_primary)
    })
  }
}

checkSuperAdminProfile()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })
