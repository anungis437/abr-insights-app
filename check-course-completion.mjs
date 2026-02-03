import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCourses() {
  console.log('\n=== Checking Course Completion Status ===\n')
  
  // Get all courses with their lessons and content
  const { data: courses, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      slug,
      description,
      is_published,
      lessons:lessons(
        id,
        title,
        order_index
      )
    `)
    .order('title')
  
  if (error) {
    console.error('Error fetching courses:', error)
    return
  }
  
  console.log(`Total courses: ${courses.length}\n`)
  
  const completeCourses = []
  const incompleteCourses = []
  
  for (const course of courses) {
    const lessonCount = course.lessons?.length || 0
    
    // Get lesson content separately
    let lessonsWithContent = 0
    if (lessonCount > 0) {
      const { data: lessonData } = await supabase
        .from('lesson_content')
        .select('lesson_id, content')
        .in('lesson_id', course.lessons.map(l => l.id))
      
      lessonsWithContent = lessonData?.filter(l => l.content && l.content.trim().length > 100).length || 0
    }
    
    const isComplete = lessonCount > 0 && lessonsWithContent === lessonCount && lessonCount >= 3
    
    const status = {
      title: course.title,
      id: course.id,
      slug: course.slug,
      published: course.is_published,
      lessons: lessonCount,
      withContent: lessonsWithContent,
      complete: isComplete
    }
    
    if (isComplete) {
      completeCourses.push(status)
    } else {
      incompleteCourses.push(status)
    }
  }
  
  console.log('✅ COMPLETE COURSES (ready to keep):')
  console.log('=====================================')
  completeCourses.forEach((c, i) => {
    console.log(`${i + 1}. ${c.title}`)
    console.log(`   - ID: ${c.id}`)
    console.log(`   - Slug: ${c.slug}`)
    console.log(`   - Published: ${c.published}`)
    console.log(`   - Lessons: ${c.withContent}/${c.lessons} with content`)
    console.log('')
  })
  
  console.log('\n❌ INCOMPLETE COURSES (should be removed):')
  console.log('===========================================')
  incompleteCourses.forEach((c, i) => {
    console.log(`${i + 1}. ${c.title}`)
    console.log(`   - ID: ${c.id}`)
    console.log(`   - Slug: ${c.slug}`)
    console.log(`   - Published: ${c.published}`)
    console.log(`   - Lessons: ${c.withContent}/${c.lessons} with content`)
    console.log('')
  })
  
  console.log('\nSUMMARY:')
  console.log(`✅ Complete courses: ${completeCourses.length}`)
  console.log(`❌ Incomplete courses: ${incompleteCourses.length}`)
  
  if (incompleteCourses.length > 0) {
    console.log('\n⚠️  To remove incomplete courses, run:')
    console.log('   node remove-incomplete-courses.mjs')
  }
}

checkCourses()
