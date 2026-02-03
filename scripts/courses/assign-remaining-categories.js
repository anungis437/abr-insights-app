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

async function assignRemaining() {
  const { data: legalCat } = await supabase
    .from('content_categories')
    .select('id')
    .eq('slug', 'legal-framework')
    .single()
  const { data: advocacyCat } = await supabase
    .from('content_categories')
    .select('id')
    .eq('slug', 'allyship-advocacy')
    .single()

  const updates = [
    { slug: 'anti-racism-educators', category_id: legalCat.id, name: 'Anti-Racism for Educators' },
    { slug: 'environmental-racism', category_id: advocacyCat.id, name: 'Environmental Racism' },
    { slug: 'recruitment-retention', category_id: legalCat.id, name: 'Recruitment and Retention' },
  ]

  for (const u of updates) {
    await supabase.from('courses').update({ category_id: u.category_id }).eq('slug', u.slug)
    console.log(`✅ Updated: ${u.name}`)
  }

  console.log('\n✅ All courses now have categories!')
}

assignRemaining().catch(console.error)
