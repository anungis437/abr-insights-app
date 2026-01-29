import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkCourses() {
  try {
    console.log('Checking courses...\n')

    const { data, error, count } = await supabase
      .from('courses')
      .select('id, title, slug, is_published', { count: 'exact' })
      .is('deleted_at', null)
      .limit(10)

    if (error) {
      console.error('Error:', error)
      return
    }

    console.log(`Total: ${count} courses`)
    console.log(`\nCourses (showing up to 10):`)
    data.forEach((c) => {
      console.log(`  ${c.is_published ? '✓' : '✗'} ${c.title}`)
    })
  } catch (err) {
    console.error('Error:', err)
  }
}

checkCourses()
