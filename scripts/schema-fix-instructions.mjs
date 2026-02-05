#!/usr/bin/env node
/**
 * Apply Schema Fix via Supabase Client
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load Supabase URL
const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf8');
const SUPABASE_URL = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1];
const SERVICE_ROLE_KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1];

if (!SUPABASE_URL) {
  console.error('❌ Missing SUPABASE_URL');
  process.exit(1);
}

// Extract connection details from Supabase URL
const projectRef = SUPABASE_URL.match(/https:\/\/(.+?)\.supabase\.co/)?.[1];

console.log('🔧 Database Schema Fix\n');
console.log('To apply the migration, you have two options:\n');

console.log('OPTION 1: Via Supabase Dashboard (Recommended)');
console.log('   1. Go to: https://supabase.com/dashboard/project/' + projectRef);
console.log('   2. Click "SQL Editor" in the left sidebar');
console.log('   3. Create a new query and paste:\n');

console.log('   ALTER TABLE tribunal_cases_raw ALTER COLUMN case_number TYPE VARCHAR(255);');
console.log('   ALTER TABLE tribunal_cases ALTER COLUMN case_number TYPE VARCHAR(255);');
console.log('   CREATE INDEX IF NOT EXISTS idx_tribunal_cases_raw_case_number ON tribunal_cases_raw(case_number);');
console.log('   CREATE INDEX IF NOT EXISTS idx_tribunal_cases_case_number ON tribunal_cases(case_number);\n');

console.log('   4. Click "Run" (or press Ctrl+Enter)\n');

console.log('OPTION 2: Via psql command line');
console.log('   If you have database connection string, run:');
console.log('   psql "your_connection_string" -f supabase/migrations/20260205000001_increase_case_number_length.sql\n');

console.log('✅ After applying, run: node scripts/validate-database-content.mjs');
