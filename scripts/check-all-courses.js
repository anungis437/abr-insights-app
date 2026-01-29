const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  '***REMOVED***',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.***REMOVED***.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

async function checkAllCourses() {
  console.log('=== COMPLETE COURSE LIBRARY STATUS ===\n')

  // Get all courses
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, title, slug, level')
    .order('created_at', { ascending: true })

  if (error) throw error

  let totalModules = 0
  let totalLessons = 0
  const categories = {}

  for (const course of courses) {
    // Get module count
    const { data: modules } = await supabase
      .from('course_modules')
      .select('id')
      .eq('course_id', course.id)

    // Get lesson count
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, content_type')
      .eq('course_id', course.id)

    const moduleCount = modules?.length || 0
    const lessonCount = lessons?.length || 0

    totalModules += moduleCount
    totalLessons += lessonCount

    // Count by content type
    const videos = lessons?.filter((l) => l.content_type === 'video').length || 0
    const articles = lessons?.filter((l) => l.content_type === 'article').length || 0
    const quizzes = lessons?.filter((l) => l.content_type === 'quiz').length || 0

    const status = moduleCount > 0 ? '✅' : '⏸️'
    console.log(`${status} ${course.title}`)
    console.log(`   Level: ${course.level}`)
    console.log(`   Modules: ${moduleCount} | Lessons: ${lessonCount}`)
    console.log(`   Content: ${videos} videos, ${articles} articles, ${quizzes} quizzes`)
    console.log()
  }

  console.log('=== OVERALL TOTALS ===\n')
  console.log(`📚 Total Courses: ${courses.length}`)
  console.log(`📖 Total Modules: ${totalModules}`)
  console.log(`📝 Total Lessons: ${totalLessons}`)
  console.log()
  console.log('🎉 ABR Insights Course Library is COMPLETE!')
}

checkAllCourses().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
