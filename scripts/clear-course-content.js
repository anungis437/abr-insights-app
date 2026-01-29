const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  '***REMOVED***',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.***REMOVED***.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

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
