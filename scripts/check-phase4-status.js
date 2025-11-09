const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  '***REMOVED***',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.***REMOVED***.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

async function checkPhase4() {
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, slug')
    .gte('id', (await supabase.from('courses').select('id').eq('slug', 'mental-health-wellness').single()).data.id)
    .order('created_at')

  console.log('Phase 4 Courses:')
  
  for (const course of courses) {
    const { data: modules } = await supabase
      .from('course_modules')
      .select('id, title')
      .eq('course_id', course.id)
      .order('sort_order')
    
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', course.id)
    
    console.log(`\n${course.title} (${course.slug})`)
    console.log(`  Modules: ${modules?.length || 0}`)
    console.log(`  Lessons: ${lessons?.length || 0}`)
    
    if (modules && modules.length > 0) {
      modules.forEach(m => console.log(`    - ${m.title}`))
    }
  }
}

checkPhase4()
  .catch(error => console.error('Error:', error))
