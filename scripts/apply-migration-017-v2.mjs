/**
 * Apply Migration 017: Courses Enhancement Phase 1
 * Uses Supabase client with service role key
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get Supabase credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Missing Supabase credentials');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('Applying Migration 017: Courses Enhancement Phase 1');
console.log('====================================================');
console.log(`Supabase URL: ${SUPABASE_URL}\n`);

// Read migration file
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '017_courses_enhancement_phase1.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log(`Migration file: ${migrationSQL.length} characters`);
console.log('Tables: 10 new tables + enhanced lessons table\n');

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('Executing SQL migration...\n');

    // Split migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/));

    let successCount = 0;
    let tableCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Track progress
      if (statement.includes('CREATE TABLE')) {
        const match = statement.match(/CREATE TABLE[^(]+?(\w+)\s*\(/);
        if (match) {
          tableCount++;
          console.log(`  [${i + 1}/${statements.length}] Creating table: ${match[1]}`);
        }
      } else if (statement.includes('ALTER TABLE')) {
        const match = statement.match(/ALTER TABLE\s+(\w+)/);
        if (match) {
          console.log(`  [${i + 1}/${statements.length}] Altering table: ${match[1]}`);
        }
      } else if (statement.includes('CREATE INDEX')) {
        // Silent - too many indexes
      } else if (statement.includes('CREATE TRIGGER')) {
        const match = statement.match(/CREATE TRIGGER\s+(\w+)/);
        if (match) {
          console.log(`  [${i + 1}/${statements.length}] Creating trigger: ${match[1]}`);
        }
      } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
        const match = statement.match(/CREATE OR REPLACE FUNCTION\s+(\w+)/);
        if (match) {
          console.log(`  [${i + 1}/${statements.length}] Creating function: ${match[1]}`);
        }
      }

      // Execute statement using REST API
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: statement })
      });

      // If exec doesn't work, try direct query
      if (response.status === 404) {
        // Use pg_stat_statements or try different approach
        const { error } = await supabase.rpc('query', { sql: statement });
        
        if (error && !error.message.includes('already exists')) {
          console.error(`\nError at statement ${i + 1}:`);
          console.error(error.message);
          console.error('Statement:', statement.substring(0, 200) + '...');
          
          // Don't fail on "already exists" errors
          if (!statement.includes('IF NOT EXISTS')) {
            throw error;
          }
        }
      } else if (!response.ok && response.status !== 409) {
        const error = await response.text();
        console.error(`\nError at statement ${i + 1}:`);
        console.error(error);
        console.error('Statement:', statement.substring(0, 200) + '...');
        
        // Continue on "already exists" errors
        if (!error.includes('already exists')) {
          throw new Error(error);
        }
      }

      successCount++;
    }

    console.log(`\n✓ Migration completed! (${successCount}/${statements.length} statements)`);
    console.log(`✓ Created/modified ${tableCount} tables\n`);

    // Verify tables
    console.log('Verifying tables...');
    const tablesToCheck = [
      'course_modules', 'course_versions', 'learning_paths',
      'course_reviews', 'course_discussions', 'enrollments',
      'lesson_progress', 'quiz_attempts', 'learning_path_enrollments'
    ];

    for (const tableName of tablesToCheck) {
      const { error } = await supabase.from(tableName).select('id').limit(1);
      if (error) {
        console.log(`  ✗ ${tableName}: ${error.message}`);
      } else {
        console.log(`  ✓ ${tableName}`);
      }
    }

    console.log('\nNext steps:');
    console.log('1. Apply migration 018 for RLS policies');
    console.log('2. Test the new tables');
    console.log('3. Create service layer functions');
    console.log('4. Build UI components\n');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Migration failed:');
    console.error(error.message);
    if (error.details) console.error('Details:', error.details);
    if (error.hint) console.error('Hint:', error.hint);
    process.exit(1);
  }
}

applyMigration();
