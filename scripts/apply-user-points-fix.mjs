#!/usr/bin/env node
import pkg from 'pg'
const { Client } = pkg
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFile } from 'fs/promises'

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

console.log('🚀 Adding missing columns to user_points table...\n')

try {
  const filePath = join(
    __dirname,
    'supabase',
    'migrations',
    '20260113000003_fix_user_points_columns.sql'
  )
  const sql = await readFile(filePath, 'utf-8')

  await client.query(sql)
  console.log('✅ Successfully added missing columns to user_points table!')
} catch (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
} finally {
  await client.end()
}
