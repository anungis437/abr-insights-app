import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔍 Checking RLS policies on enrollments table...\n')

const { data, error } = await supabase
  .from('enrollments')
  .select('*')
  .limit(0)

if (error) {
  console.log('❌ Error:', error)
} else {
  console.log('✅ Can query enrollments table')
}

// Use raw SQL to check policies
const { data: policies, error: policyError } = await supabase.rpc('exec_sql', {
  query: `
    SELECT 
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual::text as using_expression,
      with_check::text as with_check_expression
    FROM pg_policies 
    WHERE tablename = 'enrollments' 
    ORDER BY policyname;
  `,
})

if (policyError) {
  console.log('\n⚠️ Could not fetch policies (might need to create exec_sql function)')
  console.log('Error:', policyError)

  // Try alternative approach
  const { data: altData, error: altError } = await supabase
    .from('enrollments')
    .select('count')
    .limit(1)

  console.log('\nAlternative check:', altError ? altError : '✅ Table accessible')
} else {
  console.log('\n📋 Active RLS Policies on enrollments:')
  console.log(JSON.stringify(policies, null, 2))
}

// Check if RLS is enabled
const { data: rlsStatus, error: rlsError } = await supabase.rpc('exec_sql', {
  query: `
    SELECT 
      tablename,
      rowsecurity as rls_enabled
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'enrollments';
  `,
})

if (!rlsError && rlsStatus) {
  console.log('\n🔒 RLS Status:')
  console.log(JSON.stringify(rlsStatus, null, 2))
}

process.exit(0)
