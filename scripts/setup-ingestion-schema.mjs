#!/usr/bin/env node
/**
 * Setup Ingestion Schema
 * 
 * This script checks if the required tables exist and creates them if needed.
 * 
 * Required tables:
 * - ingestion_jobs: Tracks ingestion job execution
 * - tribunal_cases_raw: Staging area for newly scraped cases
 * - cases (alias for tribunal_cases): Production cases table
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment from .env
const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf8');
const SUPABASE_URL = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1];
const SERVICE_ROLE_KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env');
  console.error('   Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTable(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('id')
    .limit(1);
  
  return !error || error.code !== 'PGRST204'; // PGRST204 = table not found
}

async function main() {
  console.log('🔍 Checking ingestion schema...\n');
  
  // Check each required table
  const tables = [
    { name: 'ingestion_jobs', description: 'Job tracking' },
    { name: 'tribunal_cases_raw', description: 'Staging area' },
    { name: 'tribunal_cases', description: 'Production cases' }
  ];
  
  const results = [];
  
  for (const table of tables) {
    const exists = await checkTable(table.name);
    results.push({ ...table, exists });
    
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${table.name.padEnd(25)} ${table.description}`);
  }
  
  console.log('');
  
  // Check if migration is needed
  const missingTables = results.filter(r => !r.exists);
  
  if (missingTables.length === 0) {
    console.log('✅ All required tables exist!');
    console.log('\nYou can now run ingestion:');
    console.log('  npm run ingest -- --source canlii_hrto --limit 25\n');
    return;
  }
  
  // Tables are missing
  console.log(`❌ Missing ${missingTables.length} table(s):\n`);
  missingTables.forEach(t => console.log(`   - ${t.name}`));
  
  console.log('\n📋 Migration Options:\n');
  console.log('Option 1: Apply migration file (recommended)');
  console.log('  File: supabase/migrations/20250116000004_ingestion_pipeline.sql');
  console.log('  Run in Supabase SQL Editor or CLI\n');
  
  console.log('Option 2: Use Supabase CLI');
  console.log('  npx supabase db push\n');
  
  console.log('Option 3: Apply via Supabase Dashboard');
  console.log('  1. Go to SQL Editor in Supabase dashboard');
  console.log('  2. Copy contents of 20250116000004_ingestion_pipeline.sql');
  console.log('  3. Execute the SQL\n');
  
  process.exit(1);
}

main().catch(console.error);
