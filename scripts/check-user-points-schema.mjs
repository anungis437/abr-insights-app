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

console.log('🔍 Checking user_points table structure...\n')

// Try to get one row to see the columns
const { data, error } = await supabase
  .from('user_points')
  .select('*')
  .limit(1)

if (error) {
  console.log('❌ Error:', error.message)
} else {
  console.log('✅ Table exists with columns:', data.length > 0 ? Object.keys(data[0]).join(', ') : 'No data yet')
  if (data.length > 0) {
    console.log('\nSample row:', JSON.stringify(data[0], null, 2))
  }
}

// Check what the code expects
console.log('\n📋 Code expects these columns:')
console.log('   - user_id')
console.log('   - total_points')
console.log('   - course_points')
console.log('   - engagement_points')
console.log('   - achievement_points  ← MISSING')
console.log('   - bonus_points')
