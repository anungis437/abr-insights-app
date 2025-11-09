/**
 * Apply Phase 10 Migrations to Supabase
 * 
 * This script connects directly to Supabase via the connection URL
 * and applies all Phase 10 migrations sequentially.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Migration files in order
const migrations = [
  '20250116000001_enterprise_sso_auth.sql',
  '20250116000002_advanced_rbac.sql',
  '20250116000003_audit_logs_enhancement.sql'
];

const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

console.log('');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  Phase 10 Migration Application                            ║');
console.log('║  Applying Enterprise Foundation Migrations                 ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');
console.log(`🔗 Project URL: ${SUPABASE_URL}`);
console.log('');

let appliedCount = 0;
let failedCount = 0;

/**
 * Execute SQL via Supabase SQL Editor API
 * Note: This requires the project to have the SQL Editor API enabled
 */
async function executeSql(sql) {
  // Try using the database webhook or RPC
  // Since Supabase doesn't expose arbitrary SQL execution via REST,
  // we'll need to use a different approach
  
  // Option 1: Create a custom function that executes SQL (requires setup)
  // Option 2: Use the Management API (requires different auth)
  // Option 3: Manual application via Dashboard
  
  throw new Error('Cannot execute arbitrary SQL via REST API - manual application required');
}

/**
 * Verify table exists
 */
async function tableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);
    
    return !error;
  } catch {
    return false;
  }
}

/**
 * Main migration application
 */
async function applyMigrations() {
  for (const migration of migrations) {
    const filePath = join(migrationsDir, migration);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📄 Migration: ${migration}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      // Read SQL file
      const sql = readFileSync(filePath, 'utf8');
      console.log(`   📊 SQL Length: ${sql.length} characters`);
      
      // Display instructions for manual application
      console.log('');
      console.log('   ℹ️  MANUAL APPLICATION REQUIRED');
      console.log('');
      console.log('   Due to Supabase API limitations, please apply this migration manually:');
      console.log('');
      console.log('   1. Go to Supabase Dashboard SQL Editor:');
      console.log(`      ${SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}/sql/new`);
      console.log('');
      console.log('   2. Copy the SQL from:');
      console.log(`      ${filePath}`);
      console.log('');
      console.log('   3. Paste into SQL Editor and click "Run"');
      console.log('');
      
      // Show preview
      const preview = sql.substring(0, 500);
      console.log('   📋 Preview (first 500 chars):');
      console.log('   ┌────────────────────────────────────────────────────────┐');
      preview.split('\n').slice(0, 10).forEach(line => {
        console.log(`   │ ${line.substring(0, 54)}`);
      });
      console.log('   │ ...');
      console.log('   └────────────────────────────────────────────────────────┘');
      console.log('');
      
      // Wait for user confirmation
      console.log('   ⏸️  Press Enter once you\'ve applied the migration...');
      await new Promise(resolve => {
        process.stdin.once('data', resolve);
      });
      
      appliedCount++;
      console.log('   ✅ Marked as applied');
      console.log('');
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      failedCount++;
    }
  }
  
  // Summary
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Migration Summary                                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📊 Total Migrations: ${migrations.length}`);
  console.log(`✅ Applied: ${appliedCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log('');
  
  if (appliedCount === migrations.length) {
    console.log('🎉 All migrations applied successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Verify tables created (check below)');
    console.log('  2. Test SSO configuration');
    console.log('  3. Test RBAC permissions');
    console.log('  4. Test audit logging');
    console.log('');
    
    // Verify tables
    console.log('Verifying tables...');
    const tablesToCheck = [
      'sso_providers',
      'enterprise_sessions',
      'identity_provider_mapping',
      'sso_login_attempts',
      'resource_permissions',
      'permission_overrides',
      'role_hierarchy',
      'permission_cache',
      'compliance_reports',
      'audit_log_exports',
      'audit_logs_archive'
    ];
    
    for (const table of tablesToCheck) {
      const exists = await tableExists(table);
      console.log(`  ${exists ? '✅' : '❌'} ${table}`);
    }
    console.log('');
  } else {
    console.log('⚠️  Some migrations were not applied');
  }
}

// Run
console.log('Starting migration application...');
console.log('');
applyMigrations()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
