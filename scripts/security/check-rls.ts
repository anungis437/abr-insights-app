import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkRLS() {
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT schemaname, tablename, rowsecurity 
      FROM pg_tables 
      WHERE tablename = 'user_points';
    `,
  })

  if (error) {
    console.log('Error checking RLS:', error.message)

    // Try alternative query
    const { data: alt, error: altError } = await supabase.from('user_points').select('*').limit(1)

    console.log('\nDirect query test:')
    if (altError) {
      console.log('Error:', altError.message)
      console.log('Code:', altError.code)
      console.log('Details:', altError.details)
    } else {
      console.log('Success - table accessible')
    }
  } else {
    console.log('RLS Status:', data)
  }
}

checkRLS()
