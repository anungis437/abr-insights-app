import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('ERROR: Missing environment variables')
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const migrations = [
  '001_initial_schema.sql',
  '002_create_courses_table.sql',
  '003_create_lessons_table.sql',
  '004_create_user_progress_table.sql',
  '005_create_tribunal_cases.sql',
  '006_create_quiz_system.sql',
  '007_create_certificates.sql',
  '008_create_achievements.sql',
  '009_create_rbac_tables.sql',
  '010_create_audit_logs.sql',
  '011_create_ml_tables.sql',
  '012_add_missing_columns.sql',
  '013_add_security_policies.sql',
  '014_add_role_to_profiles.sql',
  '015_profiles_rbac_policies.sql',
  '016_rbac_test_accounts.sql',
  '017_gamification_schema.sql',
  '018_social_features.sql',
  '019_advanced_analytics.sql',
  '20250108000001_enable_pgvector.sql',
  '20250108000002_create_embeddings_tables.sql',
  '20250108000003_create_similarity_functions.sql',
  '20250108000004_create_outcome_prediction.sql',
  '20250115000001_lesson_notes.sql',
  '20250115000002_watch_history.sql',
  '20250115000003_quiz_system.sql',
  '20250115000004_certificates.sql',
  '20250115000005_ce_credit_tracking.sql',
  '20250115000006_skills_validation.sql',
  '20250115000007_course_workflow.sql',
  '20250115000008_instructor_portal.sql',
  '20250115000009_gamification_achievements.sql',
  '20250116000001_enterprise_sso_auth.sql',
  '20250116000002_advanced_rbac.sql',
  '20250116000003_audit_logs_enhancement.sql',
  '20250116000004_ingestion_pipeline.sql',
  '20250116000005_migrate_gamification_schema.sql',
  '20250116000006_gamification_social.sql',
  '20250116000007_comprehensive_demo_seed.sql',
  '20250124_safe_ml_features.sql',
  '20250124_case_verdicts_fix.sql',
]

async function applyMigrations() {
  console.log('ABR Insights - Database Migration Script')
  console.log('========================================')
  console.log('')

  let applied = 0
  let failed = 0
  let skipped = 0

  for (const migrationFile of migrations) {
    const migrationPath = join('supabase', 'migrations', migrationFile)

    try {
      const sql = readFileSync(migrationPath, 'utf-8')

      console.log(`Applying: ${migrationFile}`)

      // Execute SQL via Supabase SQL Editor endpoint
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ query: sql }),
      })

      if (response.ok) {
        console.log(`  SUCCESS: ${migrationFile}`)
        applied++
      } else {
        const error = await response.text()

        // Check if it's an "already exists" error (acceptable)
        if (error.includes('already exists') || error.includes('duplicate')) {
          console.log(`  SKIPPED: ${migrationFile} (already exists)`)
          skipped++
        } else {
          console.log(`  FAILED: ${migrationFile}`)
          console.log(`  Error: ${error.substring(0, 200)}`)
          failed++
        }
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error: any) {
      console.log(`  ERROR: ${migrationFile} - ${error.message}`)
      failed++
    }
  }

  console.log('')
  console.log('========================================')
  console.log('Migration Summary')
  console.log('========================================')
  console.log(`Total migrations: ${migrations.length}`)
  console.log(`Applied: ${applied}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Failed: ${failed}`)
  console.log('')

  if (failed > 0) {
    console.log('Some migrations failed. Check errors above.')
    process.exit(1)
  } else {
    console.log('All migrations completed successfully!')
    console.log('')
    console.log('Next: Verify database with validation script')
  }
}

applyMigrations().catch(console.error)
