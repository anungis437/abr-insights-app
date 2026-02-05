#!/usr/bin/env node
/**
 * Apply Migration: Increase case_number field length
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment
const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf8');
const SUPABASE_URL = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1];
const SERVICE_ROLE_KEY = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1];

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    // Use the REST API for raw SQL
  },
  db: {
    schema: 'public',
  }
});

async function applyMigration() {
  console.log('🔧 Applying migration: Increase case_number field length\n');

  const sql = `
    -- Increase case_number from VARCHAR(100) to VARCHAR(255)
    ALTER TABLE tribunal_cases_raw 
      ALTER COLUMN case_number TYPE VARCHAR(255);

    -- Also update the main tribunal_cases table
    ALTER TABLE tribunal_cases 
      ALTER COLUMN case_number TYPE VARCHAR(255);

    -- Add indexes if not exists
    CREATE INDEX IF NOT EXISTS idx_tribunal_cases_raw_case_number 
      ON tribunal_cases_raw(case_number);

    CREATE INDEX IF NOT EXISTS idx_tribunal_cases_case_number 
      ON tribunal_cases(case_number);
  `;

  try {
    // Execute via RPC or direct SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
    
    if (error) {
      // Try alternative method using Postgres REST API
      console.log('⚠️  RPC method unavailable, using direct query...\n');
      
      // Apply each statement separately
      const statements = [
        `ALTER TABLE tribunal_cases_raw ALTER COLUMN case_number TYPE VARCHAR(255)`,
        `ALTER TABLE tribunal_cases ALTER COLUMN case_number TYPE VARCHAR(255)`,
        `CREATE INDEX IF NOT EXISTS idx_tribunal_cases_raw_case_number ON tribunal_cases_raw(case_number)`,
        `CREATE INDEX IF NOT EXISTS idx_tribunal_cases_case_number ON tribunal_cases(case_number)`
      ];
      
      for (const stmt of statements) {
        console.log(`Executing: ${stmt.substring(0, 60)}...`);
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: stmt })
        });
        
        if (!response.ok) {
          console.log(`   ⚠️  Statement failed (may already be applied)`);
        } else {
          console.log(`   ✅ Success`);
        }
      }
    } else {
      console.log('✅ Migration applied successfully!');
    }
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.log('\n📋 Manual Application Instructions:');
    console.log('   1. Go to Supabase Dashboard → SQL Editor');
    console.log('   2. Run the SQL from: supabase/migrations/20260205000001_increase_case_number_length.sql');
    console.log('   3. Or run these commands:\n');
    console.log(sql);
  }
}

applyMigration();
