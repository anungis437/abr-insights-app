/**
 * Apply All Database Migrations
 * This script applies migrations programmatically using Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface MigrationResult {
  file: string;
  success: boolean;
  error?: string;
  skipped?: boolean;
}

async function applyMigrations() {
  console.log('🚀 ABR Insights - Database Migration Script\n');
  console.log('==========================================\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('✅ Environment variables loaded');
  console.log(`   Supabase URL: ${supabaseUrl}\n`);

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Define migration order
  const migrationGroups: Record<string, string[]> = {
    'Core Schema': [
      '001_initial_schema.sql',
      '002_create_courses_table.sql',
      '003_create_lessons_table.sql',
      '004_create_user_progress_table.sql',
    ],
    'RBAC Setup': [
      '014_add_role_to_profiles.sql',
      '015_profiles_rbac_policies.sql',
      '016_rbac_test_accounts.sql',
    ],
    'Advanced Features': [
      '20250115000001_lesson_notes.sql',
      '20250115000002_watch_history.sql',
      '20250115000003_quiz_system.sql',
      '20250115000004_certificates.sql',
      '20250115000005_ce_credit_tracking.sql',
      '20250115000006_skills_validation.sql',
      '20250115000007_course_workflow.sql',
      '20250115000008_instructor_portal.sql',
      '20250115000009_gamification_achievements.sql',
    ],
    'Enterprise Features': [
      '20250116000001_enterprise_sso_auth.sql',
      '20250116000002_advanced_rbac.sql',
      '20250116000003_audit_logs_enhancement.sql',
      '20250116000004_ingestion_pipeline.sql',
      '20250116000005_migrate_gamification_schema.sql',
      '20250116000006_gamification_social.sql',
      '20250116000007_comprehensive_demo_seed.sql',
    ],
    'ML Features': [
      '20250108000001_enable_pgvector.sql',
      '20250108000002_create_embeddings_tables.sql',
      '20250108000003_create_similarity_functions.sql',
      '20250108000004_create_outcome_prediction.sql',
    ],
  };

  const results: MigrationResult[] = [];
  let totalMigrations = 0;
  let appliedMigrations = 0;
  let skippedMigrations = 0;
  let failedMigrations = 0;

  const migrationsDir = join(process.cwd(), 'supabase', 'migrations');

  for (const [groupName, migrations] of Object.entries(migrationGroups)) {
    console.log(`📦 Migration Group: ${groupName}`);
    console.log(`   Files: ${migrations.length}\n`);

    for (const migrationFile of migrations) {
      totalMigrations++;
      const migrationPath = join(migrationsDir, migrationFile);

      try {
        // Check if file exists
        const sql = readFileSync(migrationPath, 'utf-8');

        console.log(`   🔄 Applying: ${migrationFile}`);

        // Execute SQL directly
        const { error } = await supabase.rpc('exec', { sql });

        if (error) {
          // Check if error is benign (already exists)
          if (
            error.message?.includes('already exists') ||
            error.message?.includes('duplicate')
          ) {
            console.log(
              `   ⚠️  Already exists (safe to continue): ${migrationFile}`
            );
            results.push({
              file: migrationFile,
              success: true,
              skipped: true,
            });
            skippedMigrations++;
          } else {
            console.error(`   ❌ Failed: ${error.message}`);
            results.push({
              file: migrationFile,
              success: false,
              error: error.message,
            });
            failedMigrations++;
          }
        } else {
          console.log(`   ✅ Applied successfully`);
          results.push({
            file: migrationFile,
            success: true,
          });
          appliedMigrations++;
        }
      } catch (err: any) {
        if (err.code === 'ENOENT') {
          console.log(`   ⚠️  Skipping: ${migrationFile} (file not found)`);
          results.push({
            file: migrationFile,
            success: false,
            skipped: true,
          });
          skippedMigrations++;
        } else {
          console.error(`   ❌ Error: ${err.message}`);
          results.push({
            file: migrationFile,
            success: false,
            error: err.message,
          });
          failedMigrations++;
        }
      }

      // Small delay between migrations
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log('');
  }

  // Summary
  console.log('==========================================');
  console.log('📊 Migration Summary');
  console.log('==========================================');
  console.log(`   Total migrations: ${totalMigrations}`);
  console.log(`   ✅ Applied: ${appliedMigrations}`);
  console.log(`   ⚠️  Skipped: ${skippedMigrations}`);
  console.log(`   ❌ Failed: ${failedMigrations}\n`);

  if (failedMigrations > 0) {
    console.log('⚠️  Some migrations failed. Details:\n');
    results
      .filter((r) => !r.success && !r.skipped)
      .forEach((r) => {
        console.log(`   • ${r.file}`);
        console.log(`     ${r.error}\n`);
      });

    console.log('💡 You may need to apply them manually via Supabase Dashboard:');
    console.log('   https://supabase.com/dashboard → SQL Editor\n');
  } else {
    console.log('✨ All migrations applied successfully!\n');
    console.log('🎉 Next Steps:');
    console.log('   1. Test login with: super_admin@abr-insights.com / TestPass123!');
    console.log('   2. Navigate to: http://localhost:3000/admin/ml');
    console.log(
      '   3. Generate embeddings: npx tsx --env-file=.env.local scripts/generate-initial-embeddings.ts\n'
    );
  }

  process.exit(failedMigrations > 0 ? 1 : 0);
}

applyMigrations().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
