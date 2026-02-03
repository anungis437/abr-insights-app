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

async function listAllCourses() {
  const { data: courses } = await supabase
    .from('courses')
    .select('slug, title, category_id')
    .order('created_at')

  console.log('\n=== ALL COURSES ===\n')

  courses.forEach((c, i) => {
    console.log(`${i + 1}. ${c.title}`)
    console.log(`   Slug: ${c.slug}`)
    console.log(`   Category ID: ${c.category_id || 'NOT SET'}`)
  })

  console.log(`\n Total: ${courses.length} courses`)
  console.log(`With categories: ${courses.filter((c) => c.category_id).length}`)
  console.log(`Without categories: ${courses.filter((c) => !c.category_id).length}`)
}

listAllCourses().catch(console.error)
