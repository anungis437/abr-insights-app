import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function deleteIncompleteCourse() {
  const courseSlug = 'effective-allyship'

  const { data: course } = await supabase
    .from('courses')
    .select('id, title')
    .eq('slug', courseSlug)
    .single()

  if (!course) {
    console.log('Course not found')
    return
  }

  console.log(`\n🗑️  Deleting: ${course.title}\n`)

  await supabase.from('enrollments').delete().eq('course_id', course.id)
  await supabase.from('lessons').delete().eq('course_id', course.id)
  await supabase.from('course_modules').delete().eq('course_id', course.id)
  await supabase.from('courses').delete().eq('id', course.id)

  console.log('✅ Deleted successfully')
}

deleteIncompleteCourse()
