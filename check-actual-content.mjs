import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkContent() {
  console.log('\n=== Checking Course Content in Lessons ===\n')

  // Get all courses with lessons
  const { data: courses } = await supabase
    .from('courses')
    .select(
      `
      id,
      title,
      slug,
      is_published
    `
    )
    .order('title')

  console.log(`Total courses: ${courses?.length || 0}\n`)

  const results = []

  for (const course of courses || []) {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title, article_body, content_data, content_type')
      .eq('course_id', course.id)

    const lessonCount = lessons?.length || 0
    const withArticleBody =
      lessons?.filter((l) => l.article_body && l.article_body.length > 200).length || 0
    const withContentData =
      lessons?.filter((l) => l.content_data && Object.keys(l.content_data).length > 0).length || 0

    const isComplete = lessonCount >= 3 && (withArticleBody > 0 || withContentData > 0)

    results.push({
      title: course.title,
      id: course.id,
      slug: course.slug,
      published: course.is_published,
      lessons: lessonCount,
      withArticleBody,
      withContentData,
      complete: isComplete,
    })
  }

  const complete = results.filter((r) => r.complete)
  const withSomeContent = results.filter((r) => r.withArticleBody > 0 || r.withContentData > 0)
  const empty = results.filter((r) => r.withArticleBody === 0 && r.withContentData === 0)

  console.log('✅ COMPLETE COURSES (3+ lessons with content):')
  console.log('==============================================')
  complete.forEach((c, i) => {
    console.log(`${i + 1}. ${c.title}`)
    console.log(`   Slug: ${c.slug}`)
    console.log(`   Lessons: ${c.lessons} total`)
    console.log(
      `   Content: ${c.withArticleBody} with article_body, ${c.withContentData} with content_data\n`
    )
  })

  if (withSomeContent.length > 0) {
    console.log('\n📝 COURSES WITH PARTIAL CONTENT:')
    console.log('==================================')
    withSomeContent
      .filter((c) => !c.complete)
      .forEach((c, i) => {
        console.log(`${i + 1}. ${c.title}`)
        console.log(`   Slug: ${c.slug}`)
        console.log(`   Lessons: ${c.lessons} total`)
        console.log(
          `   Content: ${c.withArticleBody} with article_body, ${c.withContentData} with content_data\n`
        )
      })
  }

  console.log('\n❌ EMPTY COURSES (no content):')
  console.log('==============================')
  empty.forEach((c, i) => {
    console.log(`${i + 1}. ${c.title} (${c.slug}) - ${c.lessons} lessons but no content`)
  })

  console.log(`\n📊 SUMMARY:`)
  console.log(`✅ Complete courses: ${complete.length}`)
  console.log(`📝 Partial content: ${withSomeContent.length - complete.length}`)
  console.log(`❌ Empty courses: ${empty.length}`)
  console.log(`📦 Total: ${results.length}`)
}

checkContent()
