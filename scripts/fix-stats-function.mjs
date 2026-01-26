#!/usr/bin/env node
import pkg from 'pg';
const { Client } = pkg;
import * as dotenv from 'dotenv';
import { readFile } from 'fs/promises';

dotenv.config({ path: '.env.local' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

try {
  console.log('Connecting to database...');
  await client.connect();
  console.log('✅ Connected\n');

  console.log('Applying updated stats function...');
  const sql = await readFile('supabase/migrations/012_tribunal_case_stats_rpc.sql', 'utf-8');
  await client.query(sql);
  console.log('✅ Function updated\n');

  console.log('Testing function...');
  const result = await client.query('SELECT get_tribunal_case_stats()');
  const stats = result.rows[0].get_tribunal_case_stats;

  console.log('📊 Stats Result:');
  console.log(`  Total Cases: ${stats.total_cases}`);
  console.log(`  ABR Cases: ${stats.abr_cases}`);
  console.log(`  Total Courses: ${stats.total_courses}`);
  console.log(`  Calculated At: ${stats.calculated_at}\n`);

  console.log('✅ Complete');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} finally {
  await client.end();
}
