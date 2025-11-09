const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://nuywgvbkgdvngrysqdul.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXdndmJrZ2R2bmdyeXNxZHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2MTQ0OSwiZXhwIjoyMDc3OTM3NDQ5fQ.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

async function assignRemaining() {
  const { data: legalCat } = await supabase.from('content_categories').select('id').eq('slug', 'legal-framework').single()
  const { data: advocacyCat } = await supabase.from('content_categories').select('id').eq('slug', 'allyship-advocacy').single()
  
  const updates = [
    { slug: 'anti-racism-educators', category_id: legalCat.id, name: 'Anti-Racism for Educators' },
    { slug: 'environmental-racism', category_id: advocacyCat.id, name: 'Environmental Racism' },
    { slug: 'recruitment-retention', category_id: legalCat.id, name: 'Recruitment and Retention' }
  ]
  
  for (const u of updates) {
    await supabase.from('courses').update({ category_id: u.category_id }).eq('slug', u.slug)
    console.log(`✅ Updated: ${u.name}`)
  }
  
  console.log('\n✅ All courses now have categories!')
}

assignRemaining().catch(console.error)
