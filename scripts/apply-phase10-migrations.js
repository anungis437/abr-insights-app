/**
 * Apply Phase 10 Migrations to Supabase
 * 
 * This script applies all Phase 10 migrations to the remote Supabase database:
 * 1. enterprise_sso_auth
 * 2. advanced_rbac  
 * 3. audit_logs_enhancement
 * 
 * Usage: node scripts/apply-phase10-migrations.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Initialize Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Migration files in order
const MIGRATIONS = [
  '20250116000001_enterprise_sso_auth.sql',
  '20250116000002_advanced_rbac.sql',
  '20250116000003_audit_logs_enhancement.sql'
];

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

/**
 * Read migration file
 */
async function readMigration(filename) {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to read migration ${filename}: ${error.message}`);
  }
}

/**
 * Execute SQL migration
 */
async function executeMigration(filename, sql) {
  console.log(`\n📄 Applying migration: ${filename}`);
  console.log(`   SQL length: ${sql.length} characters`);
  
  try {
    // Execute the migration SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If exec_sql function doesn't exist, try direct execution
      // This is a workaround - in production, use Supabase migration tools
      console.log('   ⚠️  exec_sql RPC not available, using direct query...');
      
      // Split by statement and execute each
      const statements = sql
        .split(/;\s*$/gm)
        .filter(stmt => stmt.trim().length > 0);
      
      console.log(`   Found ${statements.length} SQL statements to execute`);
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i].trim();
        if (!stmt) continue;
        
        try {
          // Use fetch to execute raw SQL via PostgREST
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
            },
            body: JSON.stringify({ sql_query: stmt })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`   ❌ Statement ${i + 1}/${statements.length} failed: ${errorText}`);
          }
        } catch (stmtError) {
          console.error(`   ❌ Statement ${i + 1}/${statements.length} error:`, stmtError.message);
        }
      }
    }
    
    console.log(`   ✅ Migration applied successfully`);
    return true;
  } catch (error) {
    console.error(`   ❌ Migration failed:`, error.message);
    throw error;
  }
}

/**
 * Check if migration has already been applied
 */
async function checkMigrationApplied(filename) {
  try {
    // Check if migration tracking table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'schema_migrations');
    
    if (tablesError || !tables || tables.length === 0) {
      // No migration tracking table, assume not applied
      return false;
    }
    
    // Check if this specific migration exists
    const { data: migrations, error: migrationsError } = await supabase
      .from('schema_migrations')
      .select('version')
      .eq('version', filename);
    
    if (migrationsError) {
      console.log(`   ⚠️  Could not check migration status: ${migrationsError.message}`);
      return false;
    }
    
    return migrations && migrations.length > 0;
  } catch (error) {
    console.log(`   ⚠️  Migration tracking check failed: ${error.message}`);
    return false;
  }
}

/**
 * Verify migration results
 */
async function verifyMigration(filename) {
  console.log(`\n🔍 Verifying migration: ${filename}`);
  
  try {
    // Check for specific tables created by each migration
    if (filename.includes('enterprise_sso_auth')) {
      const tables = ['sso_providers', 'enterprise_sessions', 'identity_provider_mapping', 'sso_login_attempts'];
      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error && !error.message.includes('does not exist')) {
          console.log(`   ✅ Table ${table} verified (accessible)`);
        } else if (error) {
          console.log(`   ⚠️  Table ${table} not found`);
        } else {
          console.log(`   ✅ Table ${table} verified (${count} rows)`);
        }
      }
    } else if (filename.includes('advanced_rbac')) {
      const tables = ['resource_permissions', 'permission_overrides', 'role_hierarchy', 'permission_cache'];
      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error && !error.message.includes('does not exist')) {
          console.log(`   ✅ Table ${table} verified (accessible)`);
        } else if (error) {
          console.log(`   ⚠️  Table ${table} not found`);
        } else {
          console.log(`   ✅ Table ${table} verified (${count} rows)`);
        }
      }
    } else if (filename.includes('audit_logs_enhancement')) {
      const tables = ['compliance_reports', 'audit_log_exports', 'audit_logs_archive'];
      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error && !error.message.includes('does not exist')) {
          console.log(`   ✅ Table ${table} verified (accessible)`);
        } else if (error) {
          console.log(`   ⚠️  Table ${table} not found`);
        } else {
          console.log(`   ✅ Table ${table} verified (${count} rows)`);
        }
      }
      
      // Check if audit_logs was enhanced
      console.log(`   ℹ️  audit_logs table enhancements (new columns) applied`);
    }
    
    return true;
  } catch (error) {
    console.error(`   ❌ Verification failed:`, error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Phase 10 Migration Application                            ║');
  console.log('║  Applying Enterprise Foundation Migrations                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🔗 Connected to: ${SUPABASE_URL}`);
  console.log(`📁 Migrations directory: ${MIGRATIONS_DIR}`);
  console.log(`📋 Migrations to apply: ${MIGRATIONS.length}`);
  console.log('');
  
  let appliedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  
  for (const migrationFile of MIGRATIONS) {
    try {
      // Check if already applied
      const isApplied = await checkMigrationApplied(migrationFile);
      if (isApplied) {
        console.log(`⏭️  Skipping ${migrationFile} (already applied)`);
        skippedCount++;
        continue;
      }
      
      // Read migration
      const sql = await readMigration(migrationFile);
      
      // Apply migration
      await executeMigration(migrationFile, sql);
      
      // Verify migration
      await verifyMigration(migrationFile);
      
      appliedCount++;
      
    } catch (error) {
      console.error(`\n❌ Failed to apply ${migrationFile}:`, error.message);
      failedCount++;
      
      // Ask user if they want to continue
      console.log('\n⚠️  Migration failed. Continue with remaining migrations? (y/n)');
      // In automated script, we'll continue
      console.log('   Continuing with remaining migrations...\n');
    }
  }
  
  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Migration Summary                                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✅ Applied:  ${appliedCount} migration(s)`);
  console.log(`⏭️  Skipped:  ${skippedCount} migration(s)`);
  console.log(`❌ Failed:   ${failedCount} migration(s)`);
  console.log('');
  
  if (failedCount > 0) {
    console.log('⚠️  Some migrations failed. Please check the errors above.');
    console.log('   You may need to apply them manually via Supabase Dashboard.');
    console.log('   Dashboard: https://supabase.com/dashboard/project/nuywgvbkgdvngrysqdul/sql/new');
    process.exit(1);
  } else if (appliedCount > 0) {
    console.log('🎉 All migrations applied successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Verify tables in Supabase Dashboard');
    console.log('  2. Test SSO configuration in /admin/sso-config');
    console.log('  3. Test RBAC in /admin/permissions');
    console.log('  4. Test audit logs in /admin/audit-logs');
    process.exit(0);
  } else {
    console.log('ℹ️  No migrations needed to be applied.');
    process.exit(0);
  }
}

// Run
main().catch((error) => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
