import { config } from 'dotenv'
import { resolve } from 'path'
import { Client } from 'pg'

config({ path: resolve(process.cwd(), '.env.local') })

const tables = [
  'cases',
  'course_enrollments',
  'user_points',
  'watch_history',
  'lesson_progress',
  'courses',
  'course_modules',
  'lessons',
  'profiles',
  'tribunal_cases_raw',
  'achievements',
  'user_achievements',
  'badges',
  'learning_paths',
]

async function checkTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    console.log('🔍 Checking database tables...\n')

    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `)

    console.log('📋 Existing tables:')
    result.rows.forEach(r => {
      console.log(`  ✅ ${r.tablename}`)
    })

    console.log(`\n📊 Total: ${result.rows.length} tables`)

    // Check if cases table exists
    const casesExists = result.rows.some((r: any) => r.tablename === 'cases')
    if (!casesExists) {
      console.log('\n⚠️  WARNING: "cases" table not found')
      console.log('   Evidence bundles migration requires "cases" table')
    }

  } finally {
    await client.end()
  }
}

checkTables()
