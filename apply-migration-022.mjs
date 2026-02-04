import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read environment variables
const envContent = readFileSync('.env.local', 'utf8')
const getEnvVar = (key) => {
  const match = envContent.match(new RegExp(`${key}=(.+)`))
  return match ? match[1].trim() : null
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
const supabaseKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration022() {
  console.log('🚀 Applying Migration 022: Support Individual Users\n')

  try {
    const migrationPath = join(__dirname, 'supabase', 'migrations', '022_support_individual_users.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')

    console.log('📝 Migration: Make organization_id nullable for individual users\n')

    // Split into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/))

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Skip DO blocks and comments
      if (statement.toLowerCase().startsWith('do $$') || 
          statement.toLowerCase().includes('raise notice')) {
        console.log(`⏭️  Skipping informational block ${i + 1}/${statements.length}`)
        skipCount++
        continue
      }

      try {
        // Execute via RPC if available, otherwise log for manual execution
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
        
        if (error) {
          // If already exists, it's ok
          if (error.message?.includes('already exists')) {
            console.log(`✓ Statement ${i + 1}/${statements.length} already applied`)
            successCount++
          } else {
            console.error(`❌ Statement ${i + 1}/${statements.length} failed:`, error.message)
            errorCount++
          }
        } else {
          console.log(`✅ Statement ${i + 1}/${statements.length} applied successfully`)
          successCount++
        }
      } catch (err) {
        console.error(`❌ Statement ${i + 1}/${statements.length} error:`, err.message)
        errorCount++
      }
    }

    console.log(`\n📊 Migration Summary:`)
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ⏭️  Skipped: ${skipCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)

    if (errorCount > 0) {
      console.log(`\n⚠️  Some statements failed. Checking if core changes were applied...`)
    }

    // Verify the critical changes
    console.log(`\n🔍 Verifying critical changes...\n`)

    const tables = ['enrollments', 'user_achievements', 'ai_usage_logs']
    let allNullable = true

    for (const table of tables) {
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', table)
        .eq('column_name', 'organization_id')
        .single()

      if (error || !data) {
        console.log(`   ❌ ${table}.organization_id - could not verify`)
        allNullable = false
      } else if (data.is_nullable === 'YES') {
        console.log(`   ✅ ${table}.organization_id is nullable`)
      } else {
        console.log(`   ❌ ${table}.organization_id is NOT nullable`)
        allNullable = false
      }
    }

    if (allNullable) {
      console.log(`\n🎉 Migration 022 completed successfully!`)
      console.log(`\n🎯 Individual users can now:`)
      console.log(`   - Enroll in courses without an organization`)
      console.log(`   - Earn achievements as individuals`)
      console.log(`   - Access AI features without organization membership`)
    } else {
      console.log(`\n⚠️  Migration partially completed. Manual intervention may be needed.`)
      console.log(`\n💡 To complete manually:`)
      console.log(`   1. Go to Supabase Dashboard → SQL Editor`)
      console.log(`   2. Execute: supabase/migrations/022_support_individual_users.sql`)
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  }
}

applyMigration022()
