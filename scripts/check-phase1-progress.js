const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://nuywgvbkgdvngrysqdul.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXdndmJrZ2R2bmdyeXNxZHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2MTQ0OSwiZXhwIjoyMDc3OTM3NDQ5fQ.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

async function checkProgress() {
  const phase1Courses = [
    'difficult-conversations-race',
    'black-canadian-history',
    'hr-advanced-anti-racism',
    'healthcare-anti-black-racism',
    'black-women-workplace',
    'racial-equity-audits'
  ]

  console.log('=== PHASE 1 PROGRESS CHECK ===\n')

  for (const slug of phase1Courses) {
    const { data: course } = await supabase.from('courses').select('id, title').eq('slug', slug).single()
    if (!course) {
      console.log(`❌ ${slug}: Course not found`)
      continue
    }

    const { count: moduleCount } = await supabase
      .from('course_modules')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', course.id)

    const { count: lessonCount } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', course.id)

    const status = moduleCount > 0 ? '✅' : '⏸️'
    console.log(`${status} ${course.title}`)
    console.log(`   Modules: ${moduleCount}, Lessons: ${lessonCount}\n`)
  }
}

checkProgress().catch(console.error)
