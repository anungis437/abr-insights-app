/**
 * Apply a single migration file to Supabase using SQL query
 *
 * Usage:
 *   node scripts/apply-migration.mjs 013_testimonials.sql
 *
 * Requirements:
 *   - Set SUPABASE_DB_PASSWORD in .env.local or environment
 *   - Uses direct PostgreSQL connection
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Database connection config - using direct connection (db.xxx.supabase.co)
const dbConfig = {
  host: 'db.nuywgvbkgdvngrysqdul.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
}

if (!process.env.SUPABASE_DB_PASSWORD) {
  console.error('❌ Error: SUPABASE_DB_PASSWORD environment variable required')
  console.error('   Add to .env.local: SUPABASE_DB_PASSWORD=your_password')
  process.exit(1)
}

const migrationFile = process.argv[2]

if (!migrationFile) {
  console.error('❌ Error: Please specify a migration file')
  console.error('   Usage: node scripts/apply-migration.mjs 013_testimonials.sql')
  process.exit(1)
}

async function applyMigration() {
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', migrationFile)

  let client

  try {
    // Read migration file
    console.log(`📄 Reading ${migrationFile}...`)
    const sql = readFileSync(migrationPath, 'utf-8')

    // Connect to database
    console.log('🔌 Connecting to Supabase...')
    client = new pg.Client(dbConfig)
    await client.connect()
    console.log('✅ Connected')

    // Execute migration
    console.log(`⚙️  Executing migration...`)
    await client.query(sql)

    console.log(`✅ ${migrationFile} applied successfully!`)
  } catch (err) {
    console.error(`❌ Error applying migration:`)
    console.error(err.message)
    if (err.position) {
      console.error(`   Position: ${err.position}`)
    }
    process.exit(1)
  } finally {
    if (client) {
      await client.end()
    }
  }
}

applyMigration()
