import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkTable() {
  console.log('\n=== Checking resource_permissions table ===\n')
  
  // Try to query the table
  const { data, error } = await supabase
    .from('resource_permissions')
    .select('*')
    .limit(1)
  
  if (error) {
    console.log('❌ resource_permissions table does NOT exist')
    console.log('Error:', error.message)
    console.log('Hint:', error.hint)
  } else {
    console.log('✅ resource_permissions table EXISTS')
    console.log('Sample data:', data)
  }
  
  // Check role_permissions instead
  console.log('\n=== Checking role_permissions table (alternative) ===\n')
  const { data: rpData, error: rpError } = await supabase
    .from('role_permissions')
    .select('*')
    .limit(3)
  
  if (rpError) {
    console.log('❌ role_permissions error:', rpError.message)
  } else {
    console.log('✅ role_permissions table exists')
    console.log(`Found ${rpData.length} rows (showing up to 3)`)
    console.log(JSON.stringify(rpData, null, 2))
  }
}

checkTable()
