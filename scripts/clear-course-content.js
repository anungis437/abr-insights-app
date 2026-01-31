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

async function clearCourseContent() {
  console.log('Clearing existing course content...')

  // Delete in correct order (children first)
  const { error: lessonsError } = await supabase
    .from('lessons')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  if (lessonsError) console.error('Lessons error:', lessonsError)
  else console.log('✓ Cleared lessons')

  const { error: modulesError } = await supabase
    .from('course_modules')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  if (modulesError) console.error('Modules error:', modulesError)
  else console.log('✓ Cleared modules')

  console.log('Done!\n')
}

clearCourseContent().then(() => process.exit(0))
