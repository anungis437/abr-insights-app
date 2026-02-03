#!/usr/bin/env node
import pkg from 'pg'
const { Client } = pkg
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '.env.local') })

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

console.log('🔍 Checking user_points table structure...\n')

try {
  // Get column information
  const result = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'user_points'
    ORDER BY ordinal_position;
  `)

  console.log('✅ Columns in user_points table:')
  result.rows.forEach((row) => {
    const check = [
      'total_points',
      'course_points',
      'engagement_points',
      'achievement_points',
      'bonus_points',
    ].includes(row.column_name)
      ? '✅'
      : '  '
    console.log(`   ${check} ${row.column_name} (${row.data_type})`)
  })
} catch (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
} finally {
  await client.end()
}
