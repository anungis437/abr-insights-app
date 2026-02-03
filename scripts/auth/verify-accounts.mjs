import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceKey)

console.log('Checking with service role key...\n')

// Check auth users
const { data: users, error: userError } = await supabase.auth.admin.listUsers()
if (userError) {
  console.error('Error fetching users:', userError)
} else {
  console.log(`👥 Total auth users: ${users.users.length}\n`)
  users.users.forEach((u) => console.log(`  • ${u.email}`))
}

console.log('\n---\n')

// Check profiles
const { data: profiles, error: profileError } = await supabase
  .from('profiles')
  .select('email, first_name, last_name, status')

if (profileError) {
  console.error('Error fetching profiles:', profileError)
} else {
  console.log(`📋 Total profiles: ${profiles?.length || 0}\n`)
  if (profiles) {
    profiles.forEach((p) =>
      console.log(`  • ${p.email} - ${p.first_name} ${p.last_name} (${p.status})`)
    )
  }
}
