/**
 * Apply Atomic Seat Allocation Migration
 * 
 * This script creates PostgreSQL RPC functions that provide atomic,
 * concurrency-safe seat allocation and deallocation using row-level locking.
 * 
 * Benefits:
 * - Prevents race conditions when multiple admins add members simultaneously
 * - Guarantees seat limits are enforced even under high concurrency
 * - Atomically updates all related tables in a single transaction
 * - Uses FOR UPDATE locks to ensure consistency
 * 
 * Usage:
 *   npx tsx scripts/apply-atomic-seat-migration.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import pg from 'pg'

const { Client } = pg

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

async function applyMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('Connecting to database...')
    await client.connect()
    console.log('✅ Connected\n')

    // Read migration file
    const migrationPath = resolve(
      process.cwd(),
      'supabase/migrations/20260131_atomic_seat_allocation.sql'
    )
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    console.log('Applying atomic seat allocation migration...')
    console.log('This will create:')
    console.log('  - add_member_with_seat_check() RPC function')
    console.log('  - remove_member_with_seat_release() RPC function')
    console.log('  - Row-level locking for concurrency safety\n')

    // Execute migration
    await client.query(migrationSQL)

    console.log('✅ Migration applied successfully\n')

    // Verify functions exist
    const { rows } = await client.query(`
      SELECT routine_name, routine_type
      FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_name IN ('add_member_with_seat_check', 'remove_member_with_seat_release')
      ORDER BY routine_name
    `)

    console.log('Verified RPC functions:')
    rows.forEach((row) => {
      console.log(`  ✅ ${row.routine_name} (${row.routine_type})`)
    })

    console.log('\n🎉 Atomic seat allocation is now active!')
    console.log('\nNext steps:')
    console.log('  1. Deploy updated app/admin/team/page.tsx')
    console.log('  2. Test concurrent member additions')
    console.log('  3. Monitor for seat enforcement accuracy')
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    if (error.detail) console.error('Detail:', error.detail)
    if (error.hint) console.error('Hint:', error.hint)
    process.exit(1)
  } finally {
    await client.end()
    console.log('\n✅ Database connection closed')
  }
}

applyMigration()
