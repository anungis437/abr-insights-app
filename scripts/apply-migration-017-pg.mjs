/**
 * Apply Migration 017: Courses Enhancement Phase 1
 * Uses direct PostgreSQL connection
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL not found in environment');
  console.error('Make sure .env.local contains DATABASE_URL');
  process.exit(1);
}

console.log('Applying Migration 017: Courses Enhancement Phase 1');
console.log('====================================================\n');

// Read migration file
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '017_courses_enhancement_phase1.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log(`Migration file: ${migrationSQL.length} characters`);
console.log('Tables: course_modules, enhanced lessons, course_versions, learning_paths,');
console.log('        course_reviews, course_discussions, enrollments, lesson_progress,');
console.log('        quiz_attempts, learning_path_enrollments\n');

async function applyMigration() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected!\n');

    console.log('Executing migration...');
    await client.query(migrationSQL);
    
    console.log('\n✓ Migration 017 applied successfully!\n');

    // Verify tables
    console.log('Verifying tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'course_modules', 'course_versions', 'learning_paths',
        'course_reviews', 'course_discussions', 'enrollments',
        'lesson_progress', 'quiz_attempts', 'learning_path_enrollments'
      )
      ORDER BY table_name
    `);

    console.log(`\nCreated ${result.rows.length} tables:`);
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    // Check lessons table enhancements
    const lessonColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'lessons'
      AND column_name IN (
        'module_id', 'transcript_en', 'transcript_fr', 
        'closed_captions_url', 'accessibility_notes', 
        'ce_credits', 'regulatory_body', 'completion_required', 'allow_download'
      )
      ORDER BY column_name
    `);

    console.log(`\nEnhanced lessons table with ${lessonColumns.rows.length} new columns:`);
    lessonColumns.rows.forEach(row => {
      console.log(`  ✓ ${row.column_name}`);
    });

    console.log('\nNext steps:');
    console.log('1. Apply migration 018 for RLS policies');
    console.log('2. Test the new tables');
    console.log('3. Create service layer functions');
    console.log('4. Build UI components\n');

  } catch (error) {
    console.error('\n✗ Migration failed:');
    console.error(`Error: ${error.message}`);
    if (error.position) {
      console.error(`Position: ${error.position}`);
    }
    if (error.detail) {
      console.error(`Detail: ${error.detail}`);
    }
    if (error.hint) {
      console.error(`Hint: ${error.hint}`);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
