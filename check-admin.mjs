import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const { data, error } = await supabase
  .from('profiles')
  .select('id, email, role')
  .eq('email', 'admin@abrinsights.ca')

if (error) {
  console.error('Error:', error)
} else if (data && data.length > 0) {
  console.log('Admin profile exists:')
  console.log('  ID:', data[0].id)
  console.log('  Email:', data[0].email)
  console.log('  Role:', data[0].role)
} else {
  console.log('No admin profile found')
}
