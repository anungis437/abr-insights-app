import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkAuditLogsQuery() {
  console.log('\n=== Testing Audit Logs Query ===\n')
  
  // Test 1: Basic query
  console.log('1. Basic audit_logs query...')
  const { data: basicData, error: basicError } = await supabase
    .from('audit_logs')
    .select('*')
    .limit(5)
  
  if (basicError) {
    console.log('❌ Error:', basicError.message)
  } else {
    console.log(`✅ Found ${basicData?.length || 0} audit log entries`)
  }
  
  // Test 2: Query with profiles join
  console.log('\n2. Query with profiles(email) join...')
  const { data: joinData, error: joinError } = await supabase
    .from('audit_logs')
    .select('*, profiles(email)')
    .limit(5)
  
  if (joinError) {
    console.log('❌ Error:', joinError)
    console.log('   Message:', joinError.message)
    console.log('   Code:', joinError.code)
    console.log('   Details:', joinError.details)
  } else {
    console.log(`✅ Found ${joinData?.length || 0} entries with profile join`)
    if (joinData && joinData.length > 0) {
      console.log('   Sample:', joinData[0])
    }
  }
  
  // Test 3: Check if audit_logs has actor_id field
  console.log('\n3. Checking audit_logs schema...')
  const { data: schemaData, error: schemaError } = await supabase
    .from('audit_logs')
    .select('*')
    .limit(1)
  
  if (schemaData && schemaData.length > 0) {
    console.log('   Fields:', Object.keys(schemaData[0]))
  }
  
  // Test 4: Query with specific org_id
  console.log('\n4. Query with organization_id filter...')
  const { data: orgData, error: orgError } = await supabase
    .from('audit_logs')
    .select('*, profiles(email)')
    .eq('organization_id', '2e4d47bf-89c8-4090-a03d-4e2e78ee647d')
    .order('timestamp', { ascending: false })
    .limit(100)
  
  if (orgError) {
    console.log('❌ Error:', orgError.message)
    console.log('   Code:', orgError.code)
    console.log('   Hint:', orgError.hint)
  } else {
    console.log(`✅ Found ${orgData?.length || 0} entries for org`)
  }
}

checkAuditLogsQuery()
