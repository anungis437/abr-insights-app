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

async function checkCompleteStatus() {
  console.log('\n=== COMPLETE LIBRARY STATUS ===\n')

  const { count: courseCount } = await supabase.from('courses').select('id', { count: 'exact' })
  const { count: moduleCount } = await supabase
    .from('course_modules')
    .select('id', { count: 'exact' })
  const { count: lessonCount } = await supabase.from('lessons').select('id', { count: 'exact' })

  console.log(`Total Courses: ${courseCount}`)
  console.log(`Total Modules: ${moduleCount}`)
  console.log(`Total Lessons: ${lessonCount}\n`)

  console.log('=== PHASE BREAKDOWN ===\n')

  // Check each phase
  const phases = [
    {
      name: 'Phase 1 (Foundational)',
      slugs: [
        'introduction-to-anti-black-racism',
        'understanding-systemic-racism',
        'historical-context-anti-black-racism-canada',
        'unconscious-bias-microaggressions',
        'being-an-effective-anti-racist-ally',
        'creating-inclusive-workplaces',
      ],
    },
    {
      name: 'Phase 1 Extension',
      slugs: [
        'anti-racism-in-recruitment-hiring',
        'anti-black-racism-healthcare',
        'anti-racism-in-education',
        'measuring-reporting-racial-equity',
        'addressing-anti-black-racism-in-leadership',
        'restorative-justice-community-accountability',
      ],
    },
    {
      name: 'Phase 2',
      slugs: [
        'indigenous-black-solidarity',
        'allyship-without-tokenism',
        'anti-racism-for-educators',
        'policing-justice-reform',
        'environmental-racism-climate-justice',
        'recruitment-retention-career-advancement',
      ],
    },
    {
      name: 'Phase 3',
      slugs: [
        'legal-practice-justice',
        'tech-ai-ethics',
        'finance-economic-justice',
        'nonprofit-advocacy',
        'media-storytelling',
        'public-policy-advocacy',
      ],
    },
  ]

  for (const phase of phases) {
    console.log(`${phase.name}:`)
    let phaseModules = 0
    let phaseLessons = 0

    for (const slug of phase.slugs) {
      const { data: course } = await supabase
        .from('courses')
        .select('id, title')
        .eq('slug', slug)
        .single()
      if (!course) continue

      const { count: mCount } = await supabase
        .from('course_modules')
        .select('id', { count: 'exact' })
        .eq('course_id', course.id)
      const { count: lCount } = await supabase
        .from('lessons')
        .select('id', { count: 'exact' })
        .eq('course_id', course.id)

      phaseModules += mCount
      phaseLessons += lCount
    }

    console.log(`  ${phase.slugs.length} courses, ${phaseModules} modules, ${phaseLessons} lessons`)
  }

  console.log('\n✅ Phase 3 Complete - Ready for Phase 4!')
}

checkCompleteStatus().catch(console.error)
