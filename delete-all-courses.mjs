import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function deleteAllCourses() {
  console.log('\n⚠️  WARNING: This will delete ALL courses from the database!')
  console.log('This action cannot be undone.\n')
  
  // Get all courses
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, slug')
  
  console.log(`Found ${courses?.length || 0} courses to delete:\n`)
  courses?.forEach((c, i) => {
    console.log(`${i + 1}. ${c.title} (${c.slug})`)
  })
  
  console.log('\n🗑️  Deleting all courses...\n')
  
  let deleted = 0
  for (const course of courses || []) {
    // Delete associated data first
    await supabase.from('enrollments').delete().eq('course_id', course.id)
    await supabase.from('lesson_content').delete().in(
      'lesson_id',
      (await supabase.from('lessons').select('id').eq('course_id', course.id)).data?.map(l => l.id) || []
    )
    await supabase.from('lessons').delete().eq('course_id', course.id)
    
    // Delete course
    const { error } = await supabase.from('courses').delete().eq('id', course.id)
    
    if (error) {
      console.log(`❌ Failed to delete: ${course.title}`)
      console.error(error)
    } else {
      deleted++
      console.log(`✅ Deleted: ${course.title}`)
    }
  }
  
  console.log(`\n✅ Deleted ${deleted}/${courses?.length || 0} courses`)
}

deleteAllCourses()
