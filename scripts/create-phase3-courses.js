const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://nuywgvbkgdvngrysqdul.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXdndmJrZ2R2bmdyeXNxZHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2MTQ0OSwiZXhwIjoyMDc3OTM3NDQ5fQ.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

const phase3Courses = [
  {
    title: 'Anti-Racism in Legal Practice and the Justice System',
    slug: 'legal-practice-justice',
    description: 'Examine anti-Black racism in Canadian legal systems, from courtrooms to law schools. Learn strategies for equitable legal practice and access to justice.',
    level: 'advanced',
    estimated_duration_minutes: 240,
    learning_objectives: [
      'Understand anti-Black racism in Canadian legal education and legal profession',
      'Recognize bias in judicial decision-making and sentencing',
      'Address barriers to legal representation and access to justice',
      'Implement anti-racist practices in legal work',
      'Advocate for systemic reform in justice systems'
    ],
    prerequisites: ['introduction-to-anti-black-racism', 'policing-justice-reform'],
    is_published: true,
    is_featured: true
  },
  {
    title: 'Technology, AI, and Algorithmic Justice',
    slug: 'tech-ai-ethics',
    description: 'Explore anti-Black bias in technology, algorithms, and AI systems. Learn to identify, challenge, and prevent algorithmic discrimination.',
    level: 'advanced',
    estimated_duration_minutes: 240,
    learning_objectives: [
      'Identify anti-Black bias in algorithms, AI, and technology systems',
      'Understand data bias, training data issues, and algorithmic discrimination',
      'Examine tech industry diversity and inclusion failures',
      'Implement ethical AI and tech development practices',
      'Advocate for algorithmic accountability and tech justice'
    ],
    prerequisites: ['introduction-to-anti-black-racism'],
    is_published: true,
    is_featured: true
  },
  {
    title: 'Financial Services and Economic Justice',
    slug: 'finance-economic-justice',
    description: 'Examine anti-Black racism in banking, lending, credit, and wealth-building. Learn to recognize and address financial discrimination.',
    level: 'advanced',
    estimated_duration_minutes: 240,
    learning_objectives: [
      'Understand anti-Black discrimination in banking and financial services',
      'Recognize predatory lending and credit discrimination patterns',
      'Examine wealth gap causes and consequences',
      'Identify barriers to homeownership and asset building',
      'Advocate for financial justice and equitable economic policies'
    ],
    prerequisites: ['introduction-to-anti-black-racism'],
    is_published: true,
    is_featured: true
  },
  {
    title: 'Nonprofit Leadership and Community Advocacy',
    slug: 'nonprofit-advocacy',
    description: 'Navigate power dynamics in nonprofit work. Learn to center Black community leadership and build authentic partnerships.',
    level: 'intermediate',
    estimated_duration_minutes: 180,
    learning_objectives: [
      'Understand power dynamics in nonprofit and advocacy work',
      'Recognize white saviorism and paternalism in social sector',
      'Center Black community leadership and self-determination',
      'Build authentic partnerships based on shared power',
      'Address funding inequities and resource distribution'
    ],
    prerequisites: ['introduction-to-anti-black-racism', 'being-an-effective-anti-racist-ally'],
    is_published: true,
    is_featured: false
  },
  {
    title: 'Media Representation and Ethical Storytelling',
    slug: 'media-storytelling',
    description: 'Examine anti-Black bias in media representation. Learn ethical practices for journalists, content creators, and communications professionals.',
    level: 'intermediate',
    estimated_duration_minutes: 210,
    learning_objectives: [
      'Recognize anti-Black bias in media coverage and representation',
      'Understand harmful stereotypes and deficit narratives',
      'Practice ethical storytelling that centers Black voices',
      'Address newsroom diversity and inclusion barriers',
      'Challenge media\'s role in perpetuating anti-Black racism'
    ],
    prerequisites: ['introduction-to-anti-black-racism'],
    is_published: true,
    is_featured: true
  },
  {
    title: 'Public Policy and Legislative Advocacy',
    slug: 'public-policy-advocacy',
    description: 'Analyze public policy through an anti-racist lens. Learn to advocate for policies that advance racial equity and challenge systemic racism.',
    level: 'advanced',
    estimated_duration_minutes: 240,
    learning_objectives: [
      'Analyze public policy for racial equity impacts',
      'Understand how policies perpetuate or challenge anti-Black racism',
      'Engage in evidence-based policy advocacy',
      'Navigate policy-making processes and power structures',
      'Build coalitions for policy change'
    ],
    prerequisites: ['introduction-to-anti-black-racism', 'measuring-reporting-racial-equity'],
    is_published: true,
    is_featured: true
  }
]

async function createPhase3Courses() {
  console.log('=== CREATING PHASE 3 COURSES ===\n')

  for (const course of phase3Courses) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert(course)
        .select()
        .single()

      if (error) throw error

      console.log(`✅ Created: ${data.title}`)
      console.log(`   Slug: ${data.slug}`)
      console.log(`   Level: ${data.level} | Duration: ${data.estimated_duration_minutes}min\n`)
    } catch (error) {
      console.error(`❌ Error creating ${course.title}:`, error.message)
    }
  }

  console.log('✅ Phase 3 course records created!')
}

createPhase3Courses()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
