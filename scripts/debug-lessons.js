const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  '***REMOVED***',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.***REMOVED***.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

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
