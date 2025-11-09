/**
 * Check which tables exist for dashboard analytics
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })

async function checkTables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('🔍 Checking dashboard tables...\n')

  const tables = [
    'enrollments',
    'course_enrollments',
    'lesson_progress',
    'watch_history',
    'lesson_notes',
    'user_points',
    'achievements',
    'user_achievements'
  ]

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ ${table.padEnd(25)} Error: ${error.message}`)
      } else {
        console.log(`✅ ${table.padEnd(25)} ${count ?? 0} rows`)
      }
    } catch (err) {
      console.log(`❌ ${table.padEnd(25)} Exception: ${err.message}`)
    }
  }

  console.log('\n✅ Table check complete')
}

checkTables().catch(console.error)
