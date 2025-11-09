const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://nuywgvbkgdvngrysqdul.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXdndmJrZ2R2bmdyeXNxZHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2MTQ0OSwiZXhwIjoyMDc3OTM3NDQ5fQ.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

async function checkCategories() {
  const { data, error } = await supabase.from('content_categories').select('*')
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log(`\nFound ${data.length} categories:\n`)
  data.forEach(c => {
    console.log(`  - ${c.name} (${c.slug})`)
    console.log(`    Type: ${c.content_type || 'N/A'}`)
  })
}

checkCategories().catch(console.error)
