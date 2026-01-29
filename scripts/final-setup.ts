import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SUPER_ADMIN_ID = 'e2baace7-c036-4700-b112-ce17e8c1ed84'
const EDUCATOR_ID = 'b3eaf789-d170-4481-82ac-46daf5170191'
const LEARNER_ID = 'c050844e-ad9a-4961-a08e-d70b71f4fc13'
const ORG_ID = '00000000-0000-0000-0000-000000000001'

async function finalSetup() {
  console.log('🎯 Final Setup - Creating Working Test Data\n')

  // Get courses
  const { data: courses } = await supabase.from('courses').select('id, title').limit(3)

  if (!courses || courses.length === 0) {
    console.log('❌ No courses found')
    return
  }

  console.log(`✅ Found ${courses.length} courses\n`)

  // Get lessons
  const { data: lessons } = await supabase.from('lessons').select('id, title').limit(5)

  console.log('📝 Creating enrollments...')

  // Create enrollments with CORRECT schema
  for (const course of courses) {
    const { error } = await supabase.from('enrollments').upsert({
      user_id: LEARNER_ID,
      course_id: course.id,
      organization_id: ORG_ID,
      status: 'active',
      progress_percentage: Math.floor(Math.random() * 80) + 10,
      enrolled_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
    })

    if (error) {
      console.log(`   ⚠️  ${error.message}`)
    } else {
      console.log(`   ✅ ${course.title}`)
    }
  }

  // Educator enrollment
  await supabase.from('enrollments').upsert({
    user_id: EDUCATOR_ID,
    course_id: courses[0].id,
    organization_id: ORG_ID,
    status: 'active',
    progress_percentage: 85,
    enrolled_at: new Date().toISOString(),
  })
  console.log(`   ✅ Educator enrolled\n`)

  // Create lesson progress
  if (lessons && lessons.length > 0) {
    console.log('📚 Creating lesson progress...')
    for (const lesson of lessons.slice(0, 3)) {
      await supabase.from('lesson_progress').upsert({
        user_id: LEARNER_ID,
        lesson_id: lesson.id,
        status: 'completed',
        progress_percentage: 100,
        last_accessed_at: new Date().toISOString(),
      })
      console.log(`   ✅ ${lesson.title}`)
    }
  }

  console.log('\n✨ Setup Complete!\n')
  console.log('🌐 Login at: http://localhost:3002/auth/login')
  console.log('📧 Use: learner@abr-insights.com / TestPass123!\n')
}

finalSetup().catch(console.error)
