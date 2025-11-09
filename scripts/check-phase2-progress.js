const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://nuywgvbkgdvngrysqdul.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXdndmJrZ2R2bmdyeXNxZHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2MTQ0OSwiZXhwIjoyMDc3OTM3NDQ5fQ.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

const phase2Courses = [
  'indigenous-black-solidarity',
  'allyship-without-tokenism',
  'anti-racism-educators',
  'policing-justice-reform',
  'environmental-racism',
  'recruitment-retention'
]

async function checkPhase2Progress() {
  console.log('=== PHASE 2 PROGRESS CHECK ===\n')

  let totalModules = 0
  let totalLessons = 0

  for (const slug of phase2Courses) {
    const { data: course } = await supabase
      .from('courses')
      .select('id, title')
      .eq('slug', slug)
      .single()

    if (!course) {
      console.log(`❌ ${slug}: Course not found`)
      continue
    }

    const { data: modules } = await supabase
      .from('course_modules')
      .select('id')
      .eq('course_id', course.id)

    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', course.id)

    const moduleCount = modules?.length || 0
    const lessonCount = lessons?.length || 0

    totalModules += moduleCount
    totalLessons += lessonCount

    const status = moduleCount > 0 && lessonCount > 0 ? '✅' : '⏸️'
    console.log(`${status} ${course.title}`)
    console.log(`   Modules: ${moduleCount}, Lessons: ${lessonCount}\n`)
  }

  console.log('=== PHASE 2 SUMMARY ===')
  console.log(`Total Modules: ${totalModules}`)
  console.log(`Total Lessons: ${totalLessons}`)
  console.log(`\nAll Phase 2 courses: ${totalLessons > 0 ? '✅ COMPLETE' : '⏸️ IN PROGRESS'}`)
}

checkPhase2Progress()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
