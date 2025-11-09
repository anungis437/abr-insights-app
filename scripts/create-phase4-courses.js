const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  '***REMOVED***',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.***REMOVED***.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

// Get category ID first
async function getCategoryId(slug) {
  const { data } = await supabase.from('content_categories').select('id').eq('slug', slug).single()
  return data?.id
}

const phase4Courses = [
  {
    title: 'Anti-Racism in Mental Health and Wellness',
    slug: 'mental-health-wellness',
    description: 'Address anti-Black racism in mental health services, therapy, and wellness practices in Canada.',
    learning_objectives: [
      'Understand impact of anti-Black racism on mental health outcomes',
      'Recognize bias in diagnosis, treatment, and care delivery',
      'Examine barriers to accessing culturally responsive mental health services',
      'Learn trauma-informed, culturally safe approaches',
      'Address anti-Blackness in wellness and therapy professions'
    ],
    level: 'advanced',
    estimated_duration_minutes: 240,
    prerequisites: ['introduction-to-anti-black-racism'],
    is_published: true,
    is_featured: true
  },
  {
    title: 'Decolonizing Anti-Racism Practice',
    slug: 'decolonizing-practice',
    description: 'Understand connections between colonialism and anti-Black racism, centering Indigenous and Black solidarity.',
    learning_objectives: [
      'Understand settler colonialism and anti-Black racism connections',
      'Learn from Indigenous and Black solidarity movements',
      'Examine white supremacy as colonial project',
      'Practice decolonial approaches to anti-racism work',
      'Address anti-Blackness in "decolonization" spaces'
    ],
    level: 'advanced',
    estimated_duration_minutes: 210,
    prerequisites: ['introduction-to-anti-black-racism', 'indigenous-black-solidarity'],
    is_published: true,
    is_featured: true
  },
  {
    title: 'Intersectionality: Race, Gender, Class, and Disability',
    slug: 'intersectionality-frameworks',
    description: 'Understand how anti-Black racism intersects with other forms of oppression.',
    learning_objectives: [
      'Understand intersectionality theory and Black feminist origins',
      'Examine anti-Black misogynoir and violence against Black women',
      'Address ableism and racism in disability justice',
      'Understand class and anti-Black economic oppression',
      'Practice intersectional anti-racism approaches'
    ],
    level: 'advanced',
    estimated_duration_minutes: 240,
    prerequisites: ['introduction-to-anti-black-racism'],
    is_published: true,
    is_featured: true
  },
  {
    title: 'Dismantling White Supremacy Culture',
    slug: 'white-supremacy-culture',
    description: 'Identify and dismantle white supremacy culture characteristics in organizations and systems.',
    learning_objectives: [
      'Understand white supremacy culture framework',
      'Identify characteristics in organizations (perfectionism, urgency, individualism)',
      'Examine how white supremacy culture harms Black employees and communities',
      'Learn strategies to dismantle and build alternatives',
      'Address resistance and backlash to change'
    ],
    level: 'advanced',
    estimated_duration_minutes: 210,
    prerequisites: ['introduction-to-anti-black-racism', 'creating-inclusive-workplaces'],
    is_published: true,
    is_featured: false
  },
  {
    title: 'Trauma-Informed Anti-Racist Care',
    slug: 'trauma-informed-care',
    description: 'Integrate trauma-informed approaches with anti-racist practice in service delivery.',
    learning_objectives: [
      'Understand racial trauma and its manifestations',
      'Learn trauma-informed principles in anti-racist context',
      'Address re-traumatization in systems and services',
      'Examine vicarious trauma for anti-racism practitioners',
      'Build healing-centered approaches to change'
    ],
    level: 'intermediate',
    estimated_duration_minutes: 180,
    prerequisites: ['introduction-to-anti-black-racism'],
    is_published: true,
    is_featured: false
  },
  {
    title: 'Building Anti-Racist Organizations from the Ground Up',
    slug: 'building-antiracist-organizations',
    description: 'Comprehensive framework for transforming organizations into genuinely anti-racist institutions.',
    learning_objectives: [
      'Conduct organizational anti-racism audits',
      'Develop comprehensive anti-racism strategic plans',
      'Build accountability structures and metrics',
      'Transform hiring, retention, and advancement practices',
      'Sustain anti-racism work beyond initial commitments'
    ],
    level: 'advanced',
    estimated_duration_minutes: 270,
    prerequisites: ['introduction-to-anti-black-racism', 'addressing-anti-black-racism-in-leadership', 'measuring-reporting-racial-equity'],
    is_published: true,
    is_featured: true
  }
]

console.log('=== CREATING PHASE 4 COURSES ===\n')

async function createPhase4Courses() {
  const advancedCategoryId = await getCategoryId('advanced-topics')
  
  for (const courseData of phase4Courses) {
    const { data, error } = await supabase.from('courses').insert({
      ...courseData,
      category_id: advancedCategoryId,
      tags: ['phase-4', 'advanced'],
      is_published: true
    }).select().single()

    if (error) {
      console.error(`❌ Error creating ${courseData.title}:`, error)
    } else {
      console.log(`✅ Created: ${data.title}`)
      console.log(`   Slug: ${data.slug}`)
      console.log(`   Level: ${data.level} | Duration: ${data.estimated_duration_minutes}min\n`)
    }
  }

  console.log('✅ Phase 4 course records created!')
}

createPhase4Courses()
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
