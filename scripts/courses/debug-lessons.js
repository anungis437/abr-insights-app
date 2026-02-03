const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing credentials - set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function checkLessonsTable() {
  console.log('Checking lessons table...\n')

  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('id, title, course_id, module_id')
    .limit(10)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`Found ${lessons.length} lessons`)
  if (lessons.length > 0) {
    console.log('\nSample lessons:')
    lessons.forEach((l) => console.log(`  - ${l.title}`))
  }
}

checkLessonsTable().catch(console.error)
