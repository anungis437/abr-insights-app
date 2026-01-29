#!/usr/bin/env node
import pkg from 'pg'
const { Client } = pkg
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readdir, readFile } from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '.env.local') })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ Missing DATABASE_URL in .env.local')
  process.exit(1)
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
})

await client.connect()
console.log('✅ Connected to database\n')

// Create schema_migrations table if it doesn't exist
await client.query(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT NOW()
  );
`)

console.log('🚀 Applying Database Migrations...\n')

// Get all migration files
const migrationsDir = join(__dirname, 'supabase', 'migrations')
const files = await readdir(migrationsDir)
const migrationFiles = files
  .filter((f) => f.endsWith('.sql'))
  .filter((f) => !f.includes('SKIP_'))
  .sort()

console.log(`Found ${migrationFiles.length} migration files\n`)

let applied = 0
let skipped = 0
let failed = 0

for (const filename of migrationFiles) {
  try {
    // Check if already applied
    const { rows } = await client.query(
      'SELECT version FROM schema_migrations WHERE version = $1',
      [filename]
    )

    if (rows.length > 0) {
      console.log(`⏭️  ${filename} - Already applied`)
      skipped++
      continue
    }

    console.log(`📄 Applying ${filename}...`)

    const filePath = join(migrationsDir, filename)
    const sql = await readFile(filePath, 'utf-8')

    // Execute migration in a transaction
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [filename])
    await client.query('COMMIT')

    console.log(`✅ ${filename} - Applied successfully\n`)
    applied++
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(`❌ ${filename} - Failed:`)
    console.error(`   ${error.message}\n`)
    failed++

    // Continue with other migrations
    continue
  }
}

console.log('\n' + '='.repeat(60))
console.log('📊 Migration Summary:')
console.log('='.repeat(60))
console.log(`✅ Applied: ${applied}`)
console.log(`⏭️  Skipped: ${skipped}`)
console.log(`❌ Failed: ${failed}`)
console.log(`📁 Total: ${migrationFiles.length}`)
console.log('='.repeat(60) + '\n')

await client.end()

if (failed === 0) {
  console.log('🎉 All migrations completed successfully!\n')
  process.exit(0)
} else {
  console.log('⚠️  Some migrations failed. Check errors above.\n')
  process.exit(1)
}
