import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function applyMigration() {
  console.log('🔧 Applying database migration...\n')

  // Read the SQL file
  const sqlPath = join(process.cwd(), 'create_tables.sql')
  const sql = readFileSync(sqlPath, 'utf-8')

  console.log('📖 Read SQL file:', sqlPath)
  console.log(`   Size: ${sql.length} bytes\n`)

  // Split into individual statements
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 10 && !s.startsWith('--'))

  console.log(`📝 Found ${statements.length} SQL statements\n`)

  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    const preview = stmt.substring(0, 60).replace(/\n/g, ' ')

    try {
      // Use raw SQL execution via Supabase admin API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ query: stmt + ';' }),
      })

      if (response.ok) {
        console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`)
        successCount++
      } else {
        const error = await response.text()

        // Check if it's an "already exists" error
        if (error.includes('already exists') || error.includes('duplicate')) {
          console.log(`⚠️  [${i + 1}/${statements.length}] Already exists (skipping)`)
          skipCount++
        } else {
          console.error(`❌ [${i + 1}/${statements.length}] Error: ${error.substring(0, 100)}`)
          errorCount++
        }
      }
    } catch (err: any) {
      console.error(`❌ [${i + 1}/${statements.length}] Exception: ${err.message}`)
      errorCount++
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Migration Summary:')
  console.log(`   ✅ Successful: ${successCount}`)
  console.log(`   ⚠️  Skipped: ${skipCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log('='.repeat(60) + '\n')

  // Verify tables exist
  console.log('🔍 Verifying tables...\n')

  const tables = ['ingestion_jobs', 'tribunal_cases_raw', 'ingestion_errors']
  let allExist = true

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(0)

      if (error) {
        console.log(`❌ Table '${table}': NOT FOUND`)
        allExist = false
      } else {
        console.log(`✅ Table '${table}': EXISTS`)
      }
    } catch (err) {
      console.log(`❌ Table '${table}': ERROR checking`)
      allExist = false
    }
  }

  console.log('')

  if (allExist) {
    console.log('🎉 SUCCESS! All tables created.\n')
    console.log('Next step - Run storage integration test:')
    console.log(
      '  npx tsx --env-file=.env.local ingestion\\src\\debug\\test-storage-integration.ts\n'
    )
    return true
  } else {
    console.log('⚠️  Some tables are missing. You may need to apply the SQL manually.\n')
    console.log('Go to: https://app.supabase.com/project/nuywgvbkgdvngrysqdul/sql/new')
    console.log('Copy SQL from: create_tables.sql\n')
    return false
  }
}

applyMigration()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((err) => {
    console.error('\n❌ Fatal error:', err.message)
    process.exit(1)
  })
