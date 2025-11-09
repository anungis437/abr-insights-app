const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://nuywgvbkgdvngrysqdul.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXdndmJrZ2R2bmdyeXNxZHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2MTQ0OSwiZXhwIjoyMDc3OTM3NDQ5fQ.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

async function checkCourses() {
  const targetSlugs = [
    'decolonizing-practice',
    'intersectionality-frameworks',
    'white-supremacy-culture',
    'trauma-informed-care',
    'building-antiracist-organizations'
  ]
  
  console.log('Checking Phase 4 remaining courses:\n')
  
  for (const slug of targetSlugs) {
    const { data: course } = await supabase
      .from('courses')
      .select('id, title, slug')
      .eq('slug', slug)
      .single()
    
    if (!course) {
      console.log(`❌ ${slug}: NOT FOUND`)
      continue
    }
    
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', course.id)
    
    console.log(`${lessons?.length > 0 ? '✅' : '⏸️'} ${course.title}`)
    console.log(`   Slug: ${course.slug}`)
    console.log(`   Lessons: ${lessons?.length || 0}`)
    console.log()
  }
}

checkCourses()
  .catch(error => console.error('Error:', error))
