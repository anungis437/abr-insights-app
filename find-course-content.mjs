import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function findContent() {
  console.log('\n=== Searching for Course Content ===\n')

  // Check lesson_content table
  console.log('1. Checking lesson_content table...')
  const { data: lessonContent, error: lcError } = await supabase.from('lesson_content').select('*')

  if (!lcError && lessonContent && lessonContent.length > 0) {
    console.log(`✅ Found ${lessonContent.length} entries in lesson_content`)
    console.log('Sample:', lessonContent[0])
  } else {
    console.log('❌ No content in lesson_content table')
    if (lcError) console.log('Error:', lcError.message)
  }

  // Check lessons table structure
  console.log('\n2. Checking lessons table structure...')
  const { data: lessons, error: lessonsError } = await supabase.from('lessons').select('*').limit(1)

  if (!lessonsError && lessons && lessons.length > 0) {
    console.log('✅ Lessons table columns:', Object.keys(lessons[0]))
    console.log('Sample lesson:', lessons[0])
  } else {
    console.log('❌ No lessons found')
  }

  // Check lesson_versions table
  console.log('\n3. Checking lesson_versions table...')
  const { data: versions, error: vError } = await supabase
    .from('lesson_versions')
    .select('*')
    .limit(5)

  if (!vError && versions && versions.length > 0) {
    console.log(`✅ Found ${versions.length} lesson versions`)
    versions.forEach((v, i) => {
      console.log(`\nVersion ${i + 1}:`)
      console.log('  Lesson ID:', v.lesson_id)
      console.log('  Content length:', v.content?.length || 0)
      console.log('  Created:', v.created_at)
    })
  } else {
    console.log('❌ No lesson versions found')
    if (vError) console.log('Error:', vError.message)
  }

  // Check course_versions table
  console.log('\n4. Checking course_versions table...')
  const { data: courseVersions, error: cvError } = await supabase
    .from('course_versions')
    .select('*')
    .limit(5)

  if (!cvError && courseVersions && courseVersions.length > 0) {
    console.log(`✅ Found ${courseVersions.length} course versions`)
    courseVersions.forEach((cv, i) => {
      console.log(`\nCourse Version ${i + 1}:`)
      console.log('  Course ID:', cv.course_id)
      console.log('  Version:', cv.version_number)
      console.log('  Created:', cv.created_at)
    })
  } else {
    console.log('❌ No course versions found')
    if (cvError) console.log('Error:', cvError.message)
  }

  // Get all table names to see what exists
  console.log('\n5. Checking all available tables...')
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .ilike('table_name', '%lesson%')

  if (!tablesError && tables) {
    console.log('\n📋 Tables with "lesson" in name:')
    tables.forEach((t) => console.log(`  - ${t.table_name}`))
  }
}

findContent()
