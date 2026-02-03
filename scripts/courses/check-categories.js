const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing credentials - set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function checkCategories() {
  const { data, error } = await supabase.from('content_categories').select('*')

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`\nFound ${data.length} categories:\n`)
  data.forEach((c) => {
    console.log(`  - ${c.name} (${c.slug})`)
    console.log(`    Type: ${c.content_type || 'N/A'}`)
  })
}

checkCategories().catch(console.error)
