const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://nuywgvbkgdvngrysqdul.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXdndmJrZ2R2bmdyeXNxZHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2MTQ0OSwiZXhwIjoyMDc3OTM3NDQ5fQ.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

async function getCategoryId(slug) {
  const { data } = await supabase.from('content_categories').select('id').eq('slug', slug).single()
  return data?.id
}

const courseCategories = {
  // Phase 1 - Foundational (ABR Fundamentals)
  'abr-fundamentals': [
    'introduction-to-anti-black-racism',
    'understanding-systemic-racism',
    'historical-context-anti-black-racism-canada',
    'unconscious-bias-microaggressions',
    'being-an-effective-anti-racist-ally',
    'creating-inclusive-workplaces'
  ],
  
  // Phase 1 Extension - Mix of categories
  'workplace-equity': [
    'anti-racism-in-recruitment-hiring',
    'recruitment-retention-career-advancement'
  ],
  'data-reporting': [
    'measuring-reporting-racial-equity'
  ],
  'leadership': [
    'addressing-anti-black-racism-in-leadership'
  ],
  'legal-framework': [
    'anti-black-racism-healthcare',
    'anti-racism-in-education',
    'restorative-justice-community-accountability'
  ],
  
  // Phase 2
  'allyship-advocacy': [
    'indigenous-black-solidarity',
    'allyship-without-tokenism',
    'anti-racism-for-educators',
    'policing-justice-reform',
    'environmental-racism-climate-justice'
  ],
  
  // Phase 3 - Sector-Specific
  'sector-specific': [
    'legal-practice-justice',
    'tech-ai-ethics',
    'finance-economic-justice',
    'nonprofit-advocacy',
    'media-storytelling',
    'public-policy-advocacy'
  ]
}

console.log('=== ASSIGNING CATEGORIES TO EXISTING COURSES ===\n')

async function assignCategories() {
  const categoryIds = {}
  
  // Get all category IDs
  for (const slug of Object.keys(courseCategories)) {
    categoryIds[slug] = await getCategoryId(slug)
  }
  
  let updated = 0
  let skipped = 0
  
  for (const [categorySlug, courseSlugs] of Object.entries(courseCategories)) {
    const categoryId = categoryIds[categorySlug]
    
    for (const courseSlug of courseSlugs) {
      const { data: course } = await supabase
        .from('courses')
        .select('id, title, category_id')
        .eq('slug', courseSlug)
        .single()
      
      if (!course) {
        console.log(`⚠️  Course not found: ${courseSlug}`)
        continue
      }
      
      if (course.category_id) {
        console.log(`⏭️  Already has category: ${course.title}`)
        skipped++
        continue
      }
      
      const { error } = await supabase
        .from('courses')
        .update({ category_id: categoryId })
        .eq('id', course.id)
      
      if (error) {
        console.error(`❌ Error updating ${course.title}:`, error)
      } else {
        console.log(`✅ Updated: ${course.title} → ${categorySlug}`)
        updated++
      }
    }
  }
  
  console.log(`\n✅ Category assignment complete!`)
  console.log(`   Updated: ${updated} courses`)
  console.log(`   Skipped: ${skipped} courses (already had categories)`)
}

assignCategories()
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
