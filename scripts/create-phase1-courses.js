const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://nuywgvbkgdvngrysqdul.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXdndmJrZ2R2bmdyeXNxZHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2MTQ0OSwiZXhwIjoyMDc3OTM3NDQ5fQ.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

const phase1Courses = [
  {
    title: 'Difficult Conversations About Race',
    slug: 'difficult-conversations-race',
    description: 'Master frameworks and practical skills for navigating challenging racial conversations with confidence, empathy, and effectiveness in professional settings.',
    level: 'intermediate',
    estimated_duration_minutes: 180,
    learning_objectives: [
      'Apply proven conversation frameworks (LARA, REAL) to racial discussions',
      'Recognize and respond to defensiveness and resistance',
      'Practice active listening and empathetic communication',
      'Handle emotional reactions (yours and others) productively',
      'Create psychological safety for difficult conversations',
      'Debrief and recover after challenging exchanges'
    ],
    prerequisites: ['intro-to-abr'],
    thumbnail_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
    is_published: true
  },
  {
    title: 'Black Canadian History: A Comprehensive Overview',
    slug: 'black-canadian-history',
    description: 'Explore 400+ years of Black Canadian history from enslavement to present-day activism, uncovering stories often omitted from mainstream narratives.',
    level: 'beginner',
    estimated_duration_minutes: 240,
    learning_objectives: [
      'Trace Black presence in Canada from 1600s to present',
      'Understand key historical events and their lasting impacts',
      'Recognize contributions of Black Canadians across sectors',
      'Connect historical patterns to contemporary disparities',
      'Challenge myths of Canadian exceptionalism on race',
      'Locate regional variations in Black Canadian experiences'
    ],
    prerequisites: [],
    thumbnail_url: 'https://images.unsplash.com/photo-1457530378978-8bac673b8062?w=800',
    is_published: true
  },
  {
    title: 'HR Professionals: Advanced Anti-Racism Practices',
    slug: 'hr-advanced-anti-racism',
    description: 'Advanced training for HR professionals on conducting investigations, implementing Employment Equity, managing accommodations, and building anti-racist talent systems.',
    level: 'advanced',
    estimated_duration_minutes: 300,
    learning_objectives: [
      'Conduct thorough and fair discrimination investigations',
      'Implement Employment Equity Act requirements',
      'Design bias-resistant hiring and promotion systems',
      'Handle complex accommodation scenarios',
      'Build equity metrics and accountability frameworks',
      'Partner with legal counsel on human rights matters'
    ],
    prerequisites: ['intro-to-abr', 'canadian-human-rights-law'],
    thumbnail_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    is_published: true
  },
  {
    title: 'Healthcare & Anti-Black Racism',
    slug: 'healthcare-anti-black-racism',
    description: 'Essential training for healthcare professionals on recognizing and addressing anti-Black racism in diagnosis, treatment, pain management, and patient care.',
    level: 'intermediate',
    estimated_duration_minutes: 210,
    learning_objectives: [
      'Recognize diagnostic and treatment biases affecting Black patients',
      'Understand disparities in maternal health outcomes',
      'Address racial bias in pain assessment and management',
      'Improve patient communication across racial differences',
      'Identify systemic barriers to healthcare access',
      'Implement anti-racist practices in clinical settings'
    ],
    prerequisites: ['intro-to-abr'],
    thumbnail_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    is_published: true
  },
  {
    title: 'Intersectionality: Black Women in the Workplace',
    slug: 'black-women-workplace',
    description: 'Examine the unique challenges facing Black women at the intersection of racism and sexism, and learn strategies for creating truly inclusive workplaces.',
    level: 'intermediate',
    estimated_duration_minutes: 180,
    learning_objectives: [
      'Understand intersectionality theory and its workplace applications',
      'Recognize double-bind and controlling images affecting Black women',
      'Address hair discrimination and appearance policing',
      'Support Black women\'s leadership advancement',
      'Create spaces for Black women\'s voices and experiences',
      'Implement targeted equity strategies for Black women'
    ],
    prerequisites: ['intro-to-abr'],
    thumbnail_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
    is_published: true
  },
  {
    title: 'Conducting Racial Equity Audits',
    slug: 'racial-equity-audits',
    description: 'Learn systematic methodology for assessing organizational equity, collecting and analyzing data, and developing evidence-based action plans.',
    level: 'advanced',
    estimated_duration_minutes: 270,
    learning_objectives: [
      'Design comprehensive equity audit frameworks',
      'Collect demographic and qualitative data ethically',
      'Analyze disparities and identify root causes',
      'Engage stakeholders throughout the audit process',
      'Present findings with clarity and impact',
      'Develop actionable recommendations and implementation plans'
    ],
    prerequisites: ['data-driven-equity', 'leadership-equity'],
    thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    is_published: true
  }
]

async function createPhase1Courses() {
  console.log('=== CREATING PHASE 1 COURSES ===\n')

  // Get or create the ABR category
  let { data: categories } = await supabase
    .from('content_categories')
    .select('id, name, slug')

  if (!categories || categories.length === 0) {
    console.log('No categories found, creating Anti-Black Racism category...')
    const { data: newCat, error } = await supabase
      .from('content_categories')
      .insert({
        name: 'Anti-Black Racism Education',
        slug: 'anti-black-racism',
        description: 'Courses focused on understanding and addressing anti-Black racism',
        sort_order: 1
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating category:', error)
      return
    }
    categories = [newCat]
  }

  console.log('Available categories:')
  categories.forEach(cat => console.log(`  - ${cat.name} (${cat.id})`))
  
  // Use the first category or Anti-Black Racism category
  const abrCategory = categories.find(c => c.slug.includes('anti-black')) || categories[0]
  console.log(`\nUsing category: ${abrCategory.name}\n`)

  for (const course of phase1Courses) {
    console.log(`Creating: ${course.title}`)
    
    const { data, error } = await supabase
      .from('courses')
      .insert({
        ...course,
        category_id: abrCategory.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error(`  ❌ Error: ${error.message}`)
    } else {
      console.log(`  ✅ Created (${data.slug})`)
    }
  }

  console.log('\n✅ Phase 1 courses created!')
  console.log('\nNext steps:')
  console.log('  1. Run populate-phase1-part1.js (Difficult Conversations + Black History)')
  console.log('  2. Run populate-phase1-part2.js (HR Advanced + Healthcare)')
  console.log('  3. Run populate-phase1-part3.js (Black Women + Equity Audits)')
}

createPhase1Courses().catch(console.error)
