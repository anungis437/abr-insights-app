import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deleteTestCourses() {
  console.log('\n🗑️  Deleting Test Courses...\n')
  
  // Get test courses
  const { data: testCourses } = await supabase
    .from('courses')
    .select('id, title, slug')
    .or('title.ilike.%test%,slug.ilike.%test%')
  
  console.log(`Found ${testCourses?.length || 0} test courses:\n`)
  testCourses?.forEach((c, i) => {
    console.log(`${i + 1}. ${c.title} (${c.slug})`)
  })
  
  console.log('\n🗑️  Deleting...\n')
  
  let deleted = 0
  for (const course of testCourses || []) {
    // Delete associated data
    await supabase.from('enrollments').delete().eq('course_id', course.id)
    const { data: lessons } = await supabase.from('lessons').select('id').eq('course_id', course.id)
    await supabase.from('lessons').delete().eq('course_id', course.id)
    await supabase.from('course_modules').delete().eq('course_id', course.id)
    
    // Delete course
    const { error } = await supabase.from('courses').delete().eq('id', course.id)
    
    if (error) {
      console.log(`❌ Failed: ${course.title} - ${error.message}`)
    } else {
      deleted++
      console.log(`✅ Deleted: ${course.title}`)
    }
  }
  
  console.log(`\n✅ Deleted ${deleted}/${testCourses?.length || 0} test courses`)
}

deleteTestCourses()
