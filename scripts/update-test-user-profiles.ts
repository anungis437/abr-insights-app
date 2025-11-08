import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const roleMapping = {
  'super_admin@abr-insights.com': 'super_admin',
  'compliance@abr-insights.com': 'compliance_officer',
  'orgadmin@abr-insights.com': 'org_admin',
  'analyst@abr-insights.com': 'analyst',
  'investigator@abr-insights.com': 'investigator',
  'educator@abr-insights.com': 'educator',
  'learner@abr-insights.com': 'learner',
  'viewer@abr-insights.com': 'viewer',
  'guest@abr-insights.com': 'guest',
}

async function updateProfiles() {
  console.log('🔧 Updating test user profiles with roles...\n')

  // Get all test users
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 100
  })

  if (usersError) {
    console.error('❌ Error fetching users:', usersError)
    return
  }

  const testUsers = users.users.filter(u => u.email && u.email.includes('@abr-insights.com'))
  console.log(`Found ${testUsers.length} test users\n`)

  for (const user of testUsers) {
    const email = user.email!
    const role = roleMapping[email as keyof typeof roleMapping]
    
    if (!role) {
      console.log(`⏭️  ${email} - No role mapping found, skipping`)
      continue
    }

    // Extract name from metadata or email
    const fullName = user.user_metadata?.full_name || 
                     email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    
    const nameParts = fullName.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email,
          first_name: firstName,
          last_name: lastName,
          display_name: fullName,
          role,
          status: 'active',
          email_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error(`❌ ${email} - Update failed: ${updateError.message}`)
      } else {
        console.log(`✅ ${email} - Updated profile with role: ${role}`)
      }
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          display_name: fullName,
          role,
          status: 'active',
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        console.error(`❌ ${email} - Insert failed: ${insertError.message}`)
      } else {
        console.log(`✅ ${email} - Created profile with role: ${role}`)
      }
    }
  }

  console.log('\n✅ Profile update complete!')
  
  // Verify roles
  console.log('\n🔍 Verifying roles...\n')
  
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('email, role, first_name, last_name')
    .in('email', Object.keys(roleMapping))
    .order('email')

  if (profilesError) {
    console.error('❌ Error fetching profiles:', profilesError)
  } else {
    profiles?.forEach(profile => {
      console.log(`📧 ${profile.email}`)
      console.log(`   Name: ${profile.first_name} ${profile.last_name}`)
      console.log(`   Role: ${profile.role}`)
      console.log('')
    })
  }
}

updateProfiles().catch(console.error)
