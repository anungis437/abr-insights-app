const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  '***REMOVED***',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.***REMOVED***.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

async function verifyComplete() {
  console.log('=== COMPLETE ABR INSIGHTS COURSE LIBRARY VERIFICATION ===\n')

  // Get totals
  const { data: courses } = await supabase.from('courses').select('id, title, category_id')
  const { data: categories } = await supabase.from('content_categories').select('id, name')
  const { data: modules } = await supabase.from('course_modules').select('id')
  const { data: lessons } = await supabase.from('lessons').select('id')

  console.log('📊 LIBRARY TOTALS:')
  console.log(`   Courses: ${courses?.length || 0}`)
  console.log(`   Categories: ${categories?.length || 0}`)
  console.log(`   Modules: ${modules?.length || 0}`)
  console.log(`   Lessons: ${lessons?.length || 0}`)

  // Check all courses have categories
  const coursesWithoutCategories = courses?.filter((c) => !c.category_id) || []
  console.log(`\n✅ All courses have categories: ${coursesWithoutCategories.length === 0}`)

  if (coursesWithoutCategories.length > 0) {
    console.log('   Courses missing categories:')
    coursesWithoutCategories.forEach((c) => console.log(`   - ${c.title}`))
  }

  // Check for empty courses
  console.log('\n📚 COURSE POPULATION STATUS:')
  let emptyCourses = 0

  for (const course of courses || []) {
    const { data: courseLessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', course.id)

    if (!courseLessons || courseLessons.length === 0) {
      console.log(`   ⚠️ ${course.title}: 0 lessons`)
      emptyCourses++
    }
  }

  if (emptyCourses === 0) {
    console.log('   ✅ All courses populated!')
  } else {
    console.log(`   ⚠️ ${emptyCourses} courses need content`)
  }

  // Show categories with course counts
  console.log('\n🗂️ COURSES BY CATEGORY:')
  for (const category of categories || []) {
    const { data: catCourses } = await supabase
      .from('courses')
      .select('id')
      .eq('category_id', category.id)

    console.log(`   ${category.name}: ${catCourses?.length || 0} courses`)
  }

  // Phase 4 specific check
  console.log('\n🎯 PHASE 4 COURSES:')
  const phase4Slugs = [
    'mental-health-wellness',
    'decolonizing-practice',
    'intersectionality-frameworks',
    'white-supremacy-culture',
    'trauma-informed-care',
    'building-antiracist-organizations',
  ]

  let phase4Modules = 0
  let phase4Lessons = 0

  for (const slug of phase4Slugs) {
    const { data: course } = await supabase
      .from('courses')
      .select('id, title')
      .eq('slug', slug)
      .single()

    if (course) {
      const { data: courseModules } = await supabase
        .from('course_modules')
        .select('id')
        .eq('course_id', course.id)

      const { data: courseLessons } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', course.id)

      const modCount = courseModules?.length || 0
      const lessonCount = courseLessons?.length || 0

      phase4Modules += modCount
      phase4Lessons += lessonCount

      console.log(`   ${course.title}`)
      console.log(`      Modules: ${modCount} | Lessons: ${lessonCount}`)
    }
  }

  console.log(`\n   Phase 4 Totals: ${phase4Modules} modules, ${phase4Lessons} lessons`)

  console.log('\n=== ✅ VERIFICATION COMPLETE ===')
}

verifyComplete().catch((error) => console.error('Error:', error))
