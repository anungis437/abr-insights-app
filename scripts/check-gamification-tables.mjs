import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(url, key)

console.log('🔍 Checking gamification tables...\n')

const tables = ['achievements', 'user_achievements', 'user_points', 'quiz_attempts']

for (const table of tables) {
  try {
    const { data, error } = await supabase.from(table).select('*').limit(1)
    
    if (error) {
      console.log(`❌ ${table}: ${error.message}`)
    } else {
      console.log(`✅ ${table}: exists (${data.length} rows sampled)`)
    }
  } catch (err) {
    console.log(`❌ ${table}: ${err.message}`)
  }
}
