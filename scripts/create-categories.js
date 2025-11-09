const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  '***REMOVED***',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.***REMOVED***.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

const newCategories = [
  {
    name: 'Sector-Specific Practice',
    slug: 'sector-specific',
    description: 'Deep dives into sector-specific challenges: legal, tech, finance, nonprofit, media, policy',
    sort_order: 7
  },
  {
    name: 'Advanced Topics',
    slug: 'advanced-topics',
    description: 'Complex intersections: mental health, decolonization, intersectionality, organizational change',
    sort_order: 8
  }
]

console.log('=== CREATING COURSE CATEGORIES ===\n')

async function createCategories() {
  for (const category of newCategories) {
    // Check if category already exists
    const { data: existing } = await supabase
      .from('content_categories')
      .select('id')
      .eq('slug', category.slug)
      .single()
    
    if (existing) {
      console.log(`⏭️  Category already exists: ${category.name}`)
      continue
    }
    
    const { data, error } = await supabase
      .from('content_categories')
      .insert({
        name: category.name,
        slug: category.slug,
        description: category.description,
        sort_order: category.sort_order
      })
      .select()
      .single()
    
    if (error) {
      console.error(`❌ Error creating ${category.name}:`, error)
    } else {
      console.log(`✅ Created: ${category.name}`)
      console.log(`   Slug: ${category.slug}`)
    }
  }
  
  console.log('\n✅ Category creation complete!')
}

createCategories()
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
