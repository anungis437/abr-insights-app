import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing credentials - need service role key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkMigrations() {
  try {
    // Check schema_migrations table
    const { data, error } = await supabase
      .from('schema_migrations')
      .select('version')
      .order('version', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error:', error)
      return
    }

    console.log('Recent migrations applied:')
    data.forEach((m) => console.log(`  ✓ ${m.version}`))

    // Check if test accounts migration is applied
    const hasTestAccounts = data.some((m) => m.version.includes('016_rbac_test_accounts'))
    console.log(
      `\nTest accounts migration (016): ${hasTestAccounts ? '✅ Applied' : '❌ Not applied'}`
    )
  } catch (err) {
    console.error('Error:', err)
  }
}

checkMigrations()
