import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCourses() {
  console.log('\n=== Checking Course Completion Status ===\n')

  // Get all courses
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, title, slug, description, is_published')
    .order('title')

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`Total courses: ${courses.length}\n`)

  const results = []

  for (const course of courses) {
    // Get lessons for this course
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title')
      .eq('course_id', course.id)

    const lessonCount = lessons?.length || 0

    // Get lesson content
    let contentCount = 0
    if (lessonCount > 0) {
      const { data: content } = await supabase
        .from('lesson_content')
        .select('lesson_id, content')
        .in(
          'lesson_id',
          lessons.map((l) => l.id)
        )

      contentCount = content?.filter((c) => c.content && c.content.trim().length > 200).length || 0
    }

    const isComplete = lessonCount >= 3 && contentCount === lessonCount

    results.push({
      title: course.title,
      id: course.id,
      slug: course.slug,
      published: course.is_published,
      lessons: lessonCount,
      withContent: contentCount,
      complete: isComplete,
    })
  }

  const complete = results.filter((r) => r.complete)
  const incomplete = results.filter((r) => !r.complete)

  console.log('✅ COMPLETE COURSES (3+ lessons with full content):')
  console.log('==================================================')
  complete.forEach((c, i) => {
    console.log(`${i + 1}. ${c.title}`)
    console.log(`   Slug: ${c.slug}`)
    console.log(`   Published: ${c.published}`)
    console.log(`   Lessons: ${c.withContent}/${c.lessons} with content\n`)
  })

  console.log('\n❌ INCOMPLETE COURSES (should be removed):')
  console.log('==========================================')
  incomplete.forEach((c, i) => {
    console.log(`${i + 1}. ${c.title}`)
    console.log(`   ID: ${c.id}`)
    console.log(`   Slug: ${c.slug}`)
    console.log(`   Published: ${c.published}`)
    console.log(`   Lessons: ${c.withContent}/${c.lessons} with content\n`)
  })

  console.log(`\n📊 SUMMARY:`)
  console.log(`✅ Complete: ${complete.length}`)
  console.log(`❌ Incomplete: ${incomplete.length}`)

  return { complete, incomplete }
}

checkCourses()
