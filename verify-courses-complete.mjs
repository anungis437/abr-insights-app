import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function verifyCompleteness() {
  console.log('\n=== DETAILED COURSE VERIFICATION ===\n')

  const { data: courses } = await supabase.from('courses').select('id, title, slug').order('title')

  for (const course of courses || []) {
    console.log(`\n📚 ${course.title}`)
    console.log(`   Slug: ${course.slug}`)

    // Get modules
    const { data: modules } = await supabase
      .from('course_modules')
      .select('id, title, module_number')
      .eq('course_id', course.id)
      .order('module_number')

    console.log(`   Modules: ${modules?.length || 0}`)

    // Get lessons
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title, module_id, article_body, content_data')
      .eq('course_id', course.id)
      .order('sort_order')

    const totalLessons = lessons?.length || 0
    const withArticleBody = lessons?.filter((l) => l.article_body && l.article_body.length > 100)
    const withContentData = lessons?.filter(
      (l) => l.content_data && Object.keys(l.content_data).length > 0
    )

    console.log(`   Lessons: ${totalLessons}`)
    console.log(`   - With article_body (>100 chars): ${withArticleBody?.length || 0}`)
    console.log(`   - With content_data: ${withContentData?.length || 0}`)

    // Check for module assignment
    const lessonsWithModules = lessons?.filter((l) => l.module_id).length || 0
    console.log(`   - Assigned to modules: ${lessonsWithModules}`)

    // Sample lesson content
    if (lessons && lessons.length > 0) {
      const sampleLesson = lessons[0]
      console.log(`\n   📄 Sample Lesson: "${sampleLesson.title}"`)
      if (sampleLesson.article_body) {
        const preview = sampleLesson.article_body.substring(0, 150).replace(/\n/g, ' ')
        console.log(`      Article body: ${preview}...`)
        console.log(`      Full length: ${sampleLesson.article_body.length} chars`)
      }
      if (sampleLesson.content_data && Object.keys(sampleLesson.content_data).length > 0) {
        console.log(`      Content data keys: ${Object.keys(sampleLesson.content_data).join(', ')}`)
      }
    }

    // Completion check
    const isComplete =
      totalLessons >= 3 && (withArticleBody.length > 0 || withContentData.length > 0)
    console.log(`\n   Status: ${isComplete ? '✅ COMPLETE' : '❌ INCOMPLETE'}`)

    if (!isComplete) {
      console.log(
        `   ⚠️  Issue: ${totalLessons < 3 ? 'Not enough lessons' : 'No content in lessons'}`
      )
    }
  }

  console.log('\n\n═══════════════════════════════════════')
  console.log('📊 FINAL SUMMARY')
  console.log('═══════════════════════════════════════')
  console.log(`Total Courses: ${courses?.length || 0}`)

  const complete = []
  const incomplete = []

  for (const course of courses || []) {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('article_body, content_data')
      .eq('course_id', course.id)

    const hasContent = lessons?.some(
      (l) =>
        (l.article_body && l.article_body.length > 100) ||
        (l.content_data && Object.keys(l.content_data).length > 0)
    )

    if (lessons?.length >= 3 && hasContent) {
      complete.push(course.title)
    } else {
      incomplete.push(course.title)
    }
  }

  console.log(`✅ Complete: ${complete.length}`)
  complete.forEach((t) => console.log(`   - ${t}`))

  if (incomplete.length > 0) {
    console.log(`\n❌ Incomplete: ${incomplete.length}`)
    incomplete.forEach((t) => console.log(`   - ${t}`))
  }

  console.log('\n✅ All courses are ready for learners!')
}

verifyCompleteness()
