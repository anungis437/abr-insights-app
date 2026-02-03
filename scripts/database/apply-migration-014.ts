import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  console.log('\n🔧 Applying Migration 014: Add role to profiles\n')

  try {
    const migrationPath = path.join(
      __dirname,
      '../supabase/migrations/014_add_role_to_profiles.sql'
    )
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('📄 Reading migration file...')
    console.log(`   ${migrationPath}\n`)

    // Split into individual statements
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'))

    console.log(`📊 Found ${statements.length} SQL statements\n`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'

      // Skip comments and DO blocks (they need special handling)
      if (statement.startsWith('COMMENT') || statement.includes('DO $$')) {
        console.log(`⏭️  Skipping statement ${i + 1} (comment/notice)`)
        continue
      }

      console.log(`▶️  Executing statement ${i + 1}/${statements.length}...`)

      const { error } = await supabase.rpc('exec_sql', { sql_query: statement })

      if (error) {
        // Some errors are expected (e.g., constraint already exists)
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️  Already exists, skipping`)
        } else {
          console.error(`   ❌ Error: ${error.message}`)
          throw error
        }
      } else {
        console.log(`   ✅ Success`)
      }
    }

    console.log('\n✅ Migration 014 applied successfully!\n')

    // Verify the role field exists
    const { data, error: verifyError } = await supabase.from('profiles').select('role').limit(1)

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message)
    } else {
      console.log('✅ Verified: role field exists in profiles table\n')
    }
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message)
    console.error('\n⚠️  Manual migration required:')
    console.error('   1. Go to: https://app.supabase.com/project/nuywgvbkgdvngrysqdul/sql/new')
    console.error('   2. Copy contents of: supabase/migrations/014_add_role_to_profiles.sql')
    console.error('   3. Paste and click "Run"\n')
    process.exit(1)
  }
}

applyMigration()
