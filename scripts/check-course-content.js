const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  '***REMOVED***',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.***REMOVED***.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

async function checkCourseContent() {
  console.log('\n=== COURSE CONTENT ANALYSIS ===\n')

  // Get all published courses
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, title, slug')
    .eq('is_published', true)
    .order('title')

  if (error) {
    console.error('Error fetching courses:', error)
    return
  }

  console.log(`Found ${courses.length} published courses:\n`)

  for (const course of courses) {
    // Get modules count
    const { data: modules } = await supabase
      .from('course_modules')
      .select('id, title, sort_order')
      .eq('course_id', course.id)
      .order('sort_order')

    // Get lessons count
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title, content_type, module_number, lesson_number')
      .eq('course_id', course.id)
      .order('module_number, lesson_number')

    console.log(`📚 ${course.title}`)
    console.log(`   Slug: ${course.slug}`)
    console.log(`   Modules: ${modules?.length || 0}`)
    console.log(`   Lessons: ${lessons?.length || 0}`)

    if (modules && modules.length > 0) {
      console.log(`   Module details:`)
      for (const module of modules) {
        const moduleLessons = lessons?.filter((l) => l.module_number === module.sort_order) || []
        console.log(`     - ${module.title} (${moduleLessons.length} lessons)`)
      }
    }

    if (lessons && lessons.length > 0) {
      console.log(
        `   Content types: ${[...new Set(lessons.map((l) => l.content_type))].join(', ')}`
      )
    } else {
      console.log(`   ⚠️  NO LESSONS - Course is empty!`)
    }
    console.log('')
  }
}

checkCourseContent()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
