const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  '***REMOVED***',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.***REMOVED***.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

async function checkPhase3() {
  const slugs = [
    'legal-practice-justice',
    'tech-ai-ethics',
    'finance-economic-justice',
    'nonprofit-advocacy',
    'media-storytelling',
    'public-policy-advocacy'
  ]
  
  for (const slug of slugs) {
    const { data: course } = await supabase.from('courses').select('id, title').eq('slug', slug).single()
    if (!course) continue
    
    const { data: modules, count: moduleCount } = await supabase
      .from('course_modules')
      .select('id', { count: 'exact' })
      .eq('course_id', course.id)
    
    const { data: lessons, count: lessonCount } = await supabase
      .from('lessons')
      .select('id', { count: 'exact' })
      .eq('course_id', course.id)
    
    console.log(`${course.title}:`)
    console.log(`  Modules: ${moduleCount}, Lessons: ${lessonCount}`)
  }
}

checkPhase3().catch(console.error)
