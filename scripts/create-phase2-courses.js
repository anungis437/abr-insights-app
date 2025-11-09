const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://nuywgvbkgdvngrysqdul.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXdndmJrZ2R2bmdyeXNxZHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2MTQ0OSwiZXhwIjoyMDc3OTM3NDQ5fQ.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

const phase2Courses = [
  {
    title: 'Indigenous and Black Solidarity',
    slug: 'indigenous-black-solidarity',
    description: 'Explore shared histories, build authentic solidarity between Indigenous and Black communities, and learn coalition-building strategies that honor both distinct experiences and common struggles.',
    level: 'intermediate',
    estimated_duration_minutes: 180,
    learning_objectives: [
      'Understand shared histories of colonialism, slavery, and resistance',
      'Recognize both commonalities and distinct experiences of each community',
      'Avoid appropriation while building genuine solidarity',
      'Develop coalition-building strategies that center both communities',
      'Learn from successful solidarity movements in Canadian history'
    ],
    prerequisites: ['introduction-to-anti-black-racism'],
    is_published: true,
    is_featured: true
  },
  {
    title: 'Allyship Without Tokenism',
    slug: 'allyship-without-tokenism',
    description: 'Move beyond performative allyship to genuine anti-racist action. Learn to recognize tokenism, build authentic accountability relationships, and use privilege strategically without centering yourself.',
    level: 'intermediate',
    estimated_duration_minutes: 150,
    learning_objectives: [
      'Distinguish performative from genuine allyship',
      'Recognize and avoid tokenism in yourself and organizations',
      'Build authentic accountability relationships with Black colleagues',
      'Use privilege strategically without centering yourself',
      'Take risks and accept consequences for anti-racist action'
    ],
    prerequisites: ['being-an-effective-anti-racist-ally'],
    is_published: true,
    is_featured: true
  },
  {
    title: 'Anti-Racism for Educators',
    slug: 'anti-racism-educators',
    description: 'Transform educational practices to disrupt anti-Black racism. Audit curriculum, implement equitable classroom practices, address discipline disparities, and engage families as partners in creating liberatory learning environments.',
    level: 'intermediate',
    estimated_duration_minutes: 240,
    learning_objectives: [
      'Conduct anti-racist curriculum audits and make changes',
      'Implement classroom practices that affirm Black students',
      'Address racial discipline disparities with restorative approaches',
      'Engage Black families as partners, not problems',
      'Create liberatory learning environments for all students'
    ],
    prerequisites: ['introduction-to-anti-black-racism'],
    is_published: true,
    is_featured: true
  },
  {
    title: 'Policing, Justice, and Community Safety',
    slug: 'policing-justice-reform',
    description: 'Examine anti-Black racism in Canadian policing and criminal justice systems. Understand carding, police violence, over-incarceration, and explore alternatives that prioritize community safety and accountability.',
    level: 'advanced',
    estimated_duration_minutes: 240,
    learning_objectives: [
      'Understand the history and impact of carding and street checks',
      'Examine data on police violence against Black Canadians',
      'Analyze over-incarceration and conditions in Canadian prisons',
      'Explore community-led alternatives to policing',
      'Learn accountability models that prioritize community safety'
    ],
    prerequisites: ['black-canadian-history'],
    is_published: true,
    is_featured: true
  },
  {
    title: 'Environmental Racism in Canada',
    slug: 'environmental-racism',
    description: 'Understand how environmental racism disproportionately impacts Black and Indigenous communities through toxic exposure, climate impacts, and exclusion from decision-making. Learn organizing strategies for environmental justice.',
    level: 'intermediate',
    estimated_duration_minutes: 180,
    learning_objectives: [
      'Define environmental racism and understand its scope in Canada',
      'Examine case studies of Black communities facing environmental harms',
      'Understand health impacts of environmental racism',
      'Learn community organizing strategies for environmental justice',
      'Explore policy solutions and accountability mechanisms'
    ],
    prerequisites: ['introduction-to-anti-black-racism'],
    is_published: true,
    is_featured: false
  },
  {
    title: 'Recruitment and Retention Best Practices',
    slug: 'recruitment-retention',
    description: 'Build genuine pipelines for Black talent through authentic outreach, inclusive interviewing, equitable onboarding, and retention strategies that address systemic barriers rather than blame individuals for leaving.',
    level: 'advanced',
    estimated_duration_minutes: 240,
    learning_objectives: [
      'Develop authentic recruitment strategies beyond tokenism',
      'Implement inclusive interviewing and assessment practices',
      'Design equitable onboarding that sets Black employees up for success',
      'Address retention barriers through systemic change',
      'Create accountability for recruitment and retention outcomes'
    ],
    prerequisites: ['hr-advanced-anti-racism'],
    is_published: true,
    is_featured: true
  }
]

async function createPhase2Courses() {
  console.log('=== CREATING PHASE 2 COURSES ===\n')
  
  for (const course of phase2Courses) {
    const { data, error } = await supabase
      .from('courses')
      .insert(course)
      .select()
      .single()
    
    if (error) {
      console.log(`❌ Error creating ${course.title}:`, error.message)
    } else {
      console.log(`✅ Created: ${course.title}`)
      console.log(`   Slug: ${course.slug}`)
      console.log(`   Level: ${course.level} | Duration: ${course.estimated_duration}min`)
      console.log()
    }
  }
  
  console.log('✅ Phase 2 course records created!')
  console.log('\nNext: Populate courses with content using populate-phase2-part1.js, part2.js, etc.')
}

createPhase2Courses()
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
