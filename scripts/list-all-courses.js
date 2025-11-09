const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://nuywgvbkgdvngrysqdul.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXdndmJrZ2R2bmdyeXNxZHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2MTQ0OSwiZXhwIjoyMDc3OTM3NDQ5fQ.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

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
  console.log(`With categories: ${courses.filter(c => c.category_id).length}`)
  console.log(`Without categories: ${courses.filter(c => !c.category_id).length}`)
}

listAllCourses().catch(console.error)
