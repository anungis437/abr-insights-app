#!/usr/bin/env node
import pkg from 'pg'
const { Client } = pkg
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFile } from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '.env.local') })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ Missing DATABASE_URL in .env.local')
  console.error('   This is required to run migrations.')
  process.exit(1)
}

// Create PostgreSQL client
const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
})

await client.connect()

console.log('🚀 Running Missing Migrations...\n')

// List of migrations to run based on missing tables
const migrationsToRun = [
  '003_content_tables.sql', // resources table
  '015_ai_training_system.sql', // ai_chat_sessions, ai_chat_messages
  '019_courses_gamification.sql', // leaderboard
  '20250115000003_quiz_system.sql', // quiz_sessions
  '20250115000005_ce_credit_tracking.sql', // ce_credits, ce_credit_claims
  '20250116000006_gamification_social.sql', // buddy_requests, user_activities, comments, reactions
  '20250116000004_ingestion_pipeline.sql', // ingestion_sources
  '20250116000001_enterprise_sso_auth.sql', // sso_connections
]

async function runMigration(filename) {
  try {
    console.log(`📄 Running ${filename}...`)

    const filePath = join(__dirname, 'supabase', 'migrations', filename)
    const sql = await readFile(filePath, 'utf-8')

    // Execute the entire SQL file at once
    await client.query(sql)

    console.log(`   ✅ Completed ${filename}\n`)
    return true
  } catch (err) {
    console.error(`   ❌ Failed: ${err.message}\n`)
    return false
  }
}

async function runAllMigrations() {
  let successCount = 0
  let failCount = 0

  for (const migration of migrationsToRun) {
    const success = await runMigration(migration)
    if (success) {
      successCount++
    } else {
      failCount++
    }
  }

  await client.end()

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(`✨ Migration Summary:`)
  console.log(`   ✅ Successful: ${successCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
  console.log(`   📊 Total: ${migrationsToRun.length}\n`)

  if (successCount > 0) {
    // Re-check missing tables
    console.log('🔍 Re-checking database schema...\n')
    const { execSync } = await import('child_process')
    try {
      execSync('node check-missing-migrations.mjs', { stdio: 'inherit' })
    } catch (err) {
      // Ignore errors from check script
    }
  }
}

runAllMigrations().catch(async (err) => {
  console.error('❌ Migration failed:', err)
  await client.end()
  process.exit(1)
})
