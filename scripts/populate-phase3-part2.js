const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://nuywgvbkgdvngrysqdul.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXdndmJrZ2R2bmdyeXNxZHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2MTQ0OSwiZXhwIjoyMDc3OTM3NDQ5fQ.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

async function createModule(courseId, moduleData) {
  const slug = moduleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const { data, error } = await supabase.from('course_modules').insert({
    course_id: courseId, title: moduleData.title, slug,
    description: moduleData.description,
    module_number: moduleData.sort_order, sort_order: moduleData.sort_order,
    is_published: true
  }).select().single()
  if (error) throw error
  return data
}

async function createLesson(courseId, moduleId, lessonData) {
  const { data, error } = await supabase.from('lessons').insert({
    course_id: courseId, module_id: moduleId,
    title: lessonData.title, slug: lessonData.slug,
    description: lessonData.description, content_type: lessonData.content_type,
    content_url: lessonData.content_url, content_data: lessonData.content_data,
    video_duration_seconds: lessonData.video_duration_seconds,
    module_number: lessonData.module_number, lesson_number: lessonData.lesson_number,
    sort_order: lessonData.sort_order, is_published: true,
    is_preview: lessonData.is_preview || false
  }).select().single()
  if (error) throw error
  return data
}

// Course 21: Financial Services and Economic Justice
async function populateFinanceEconomicJustice() {
  console.log('\n📚 Course 21: Financial Services and Economic Justice')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'finance-economic-justice').single()
  if (!course) { console.log('❌ Course not found'); return }

  const m1 = await createModule(course.id, {
    title: 'Banking Discrimination and Financial Exclusion',
    description: 'Examine anti-Black discrimination in banking access and services.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction: Anti-Black Racism in Financial Systems',
    slug: 'intro-finance-racism',
    description: 'Understand systemic racism in Canadian financial services.',
    content_type: 'video', content_url: 'https://example.com/videos/intro-finance-racism.mp4',
    video_duration_seconds: 540, module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Banking Deserts and Access Barriers',
    slug: 'banking-deserts',
    description: 'Examine how Black communities lack access to banking services.',
    content_type: 'video', content_url: 'https://example.com/videos/banking-deserts.mp4',
    video_duration_seconds: 660, module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Discriminatory Lending Practices',
    slug: 'discriminatory-lending',
    description: 'Understand bias in loan approval and interest rates.',
    content_type: 'video', content_url: 'https://example.com/videos/discriminatory-lending.mp4',
    video_duration_seconds: 720, module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'Predatory Lending and Payday Loans',
    slug: 'predatory-lending',
    description: 'Examine exploitation through predatory financial products.',
    content_type: 'video', content_url: 'https://example.com/videos/predatory-lending.mp4',
    video_duration_seconds: 600, module_number: 1, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 1: 4 lessons')

  const m2 = await createModule(course.id, {
    title: 'Credit and Debt Disparities',
    description: 'Understand racial disparities in credit access and debt burden.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Credit Scoring Bias',
    slug: 'credit-scoring-bias-finance',
    description: 'Examine how credit systems discriminate against Black borrowers.',
    content_type: 'video', content_url: 'https://example.com/videos/credit-scoring-bias-finance.mp4',
    video_duration_seconds: 660, module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Student Debt Disparities',
    slug: 'student-debt-disparities',
    description: 'Understand why Black students graduate with more debt.',
    content_type: 'video', content_url: 'https://example.com/videos/student-debt-disparities.mp4',
    video_duration_seconds: 600, module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Consumer Debt and Collections',
    slug: 'consumer-debt-collections',
    description: 'Examine disproportionate debt collection targeting Black communities.',
    content_type: 'video', content_url: 'https://example.com/videos/consumer-debt-collections.mp4',
    video_duration_seconds: 540, module_number: 2, lesson_number: 3, sort_order: 3
  })
  console.log('✅ Module 2: 3 lessons')

  const m3 = await createModule(course.id, {
    title: 'Housing and Homeownership Barriers',
    description: 'Examine systemic barriers to Black homeownership and wealth building.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Mortgage Discrimination',
    slug: 'mortgage-discrimination',
    description: 'Understand bias in mortgage approval and rates.',
    content_type: 'video', content_url: 'https://example.com/videos/mortgage-discrimination.mp4',
    video_duration_seconds: 720, module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Property Appraisal Bias',
    slug: 'property-appraisal-bias',
    description: 'Examine how appraisers undervalue Black-owned homes.',
    content_type: 'video', content_url: 'https://example.com/videos/property-appraisal-bias.mp4',
    video_duration_seconds: 660, module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Gentrification and Displacement',
    slug: 'gentrification-displacement',
    description: 'Understand how development displaces Black communities.',
    content_type: 'video', content_url: 'https://example.com/videos/gentrification-displacement.mp4',
    video_duration_seconds: 600, module_number: 3, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'The Racial Wealth Gap',
    slug: 'racial-wealth-gap',
    description: 'Examine causes and consequences of wealth inequality.',
    content_type: 'video', content_url: 'https://example.com/videos/racial-wealth-gap.mp4',
    video_duration_seconds: 720, module_number: 3, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 3: 4 lessons')

  const m4 = await createModule(course.id, {
    title: 'Financial Justice and Economic Equity',
    description: 'Strategies for addressing financial discrimination and building wealth.',
    sort_order: 4
  })

  await createLesson(course.id, m4.id, {
    title: 'Community Development Financial Institutions',
    slug: 'community-development-finance',
    description: 'Learn from Black-led financial institutions and alternatives.',
    content_type: 'video', content_url: 'https://example.com/videos/community-development-finance.mp4',
    video_duration_seconds: 660, module_number: 4, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m4.id, {
    title: 'Policy Solutions for Financial Equity',
    slug: 'policy-financial-equity',
    description: 'Advocate for policies that address financial discrimination.',
    content_type: 'video', content_url: 'https://example.com/videos/policy-financial-equity.mp4',
    video_duration_seconds: 600, module_number: 4, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m4.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-finance',
    description: 'Comprehensive assessment of financial justice knowledge.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What are banking deserts?',
          options: [
            'Areas with too many banks',
            'Geographic areas, often Black neighborhoods, where residents lack access to banking services and face barriers to financial inclusion',
            'Only a problem in rural areas',
            'Not a real issue in Canada'
          ],
          correct_answer: 1,
          explanation: 'Banking deserts are areas where residents lack access to bank branches and ATMs, forcing reliance on predatory alternatives like payday lenders and check-cashing stores with exorbitant fees. Black neighborhoods are disproportionately banking deserts due to redlining legacy, bank branch closures, and discriminatory business decisions. Without banking access, residents pay more for financial services, cannot build credit or savings, and face barriers to loans and homeownership—perpetuating wealth inequality.'
        },
        {
          question: 'How does mortgage discrimination affect Black homeownership?',
          options: [
            'It does not affect homeownership',
            'Black applicants are denied mortgages at higher rates than white applicants with similar financial profiles and receive higher interest rates when approved',
            'Banks treat all applicants equally',
            'Only income matters for mortgage approval'
          ],
          correct_answer: 1,
          explanation: 'Studies show Black mortgage applicants are denied at significantly higher rates than white applicants with similar credit scores, income, and debt-to-income ratios. When approved, Black borrowers often receive higher interest rates, costing thousands more over loan lifetime. This reflects both explicit bias (discriminatory lending practices) and systemic factors (lower appraisals of Black neighborhoods, exclusion from informal networks providing better rates). Mortgage discrimination is a primary driver of the racial wealth gap.'
        },
        {
          question: 'What is property appraisal bias?',
          options: [
            'Appraisers are completely objective',
            'Homes in Black neighborhoods and Black-owned homes are systematically undervalued compared to comparable white-owned homes',
            'Property values are determined only by square footage',
            'Appraisal bias does not exist'
          ],
          correct_answer: 1,
          explanation: 'Research shows homes in Black neighborhoods are systematically undervalued by tens of thousands of dollars compared to similar homes in white neighborhoods. Black homeowners report appraisals increasing when they remove family photos, have white friends "stand in" as owners, or hide indicators of Black occupancy. This appraisal bias reduces Black wealth (home equity), makes refinancing harder, and perpetuates neighborhood disinvestment. It reflects both individual appraiser bias and systemic undervaluation of Black communities.'
        },
        {
          question: 'What are Community Development Financial Institutions (CDFIs)?',
          options: [
            'Predatory lenders',
            'Black-led or mission-driven financial institutions that provide banking, lending, and financial services in underserved communities',
            'Government welfare programs',
            'Only exist in the United States'
          ],
          correct_answer: 1,
          explanation: 'CDFIs are financial institutions (credit unions, community banks, loan funds) that prioritize serving communities excluded from mainstream banking. Many are Black-led and focus on Black communities. They provide affordable loans, banking access, financial education, and business capital without exploitative terms. CDFIs challenge the banking desert problem by bringing services where mainstream banks refuse to operate. They demonstrate that serving Black communities is viable—mainstream banks choose not to. Supporting CDFIs is one strategy for financial justice.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 15
    },
    module_number: 4, lesson_number: 3, sort_order: 3
  })
  console.log('✅ Module 4: 3 lessons')
  console.log('✅ Course 21 complete: 4 modules, 14 lessons\n')
}

// Course 22: Nonprofit Leadership and Community Advocacy
async function populateNonprofitAdvocacy() {
  console.log('\n📚 Course 22: Nonprofit Leadership and Community Advocacy')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'nonprofit-advocacy').single()
  if (!course) { console.log('❌ Course not found'); return }

  const m1 = await createModule(course.id, {
    title: 'Power Dynamics in Nonprofit Work',
    description: 'Understand how power operates in social sector organizations.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction: Anti-Racism in Nonprofit Sector',
    slug: 'intro-nonprofit-antiracism',
    description: 'Examine anti-Black racism in nonprofit and advocacy work.',
    content_type: 'video', content_url: 'https://example.com/videos/intro-nonprofit-antiracism.mp4',
    video_duration_seconds: 540, module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'White Saviorism and Paternalism',
    slug: 'white-saviorism-paternalism',
    description: 'Recognize harmful savior narratives in social change work.',
    content_type: 'video', content_url: 'https://example.com/videos/white-saviorism-paternalism.mp4',
    video_duration_seconds: 720, module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'The Nonprofit Industrial Complex',
    slug: 'nonprofit-industrial-complex',
    description: 'Understand how nonprofit structures can limit radical change.',
    content_type: 'video', content_url: 'https://example.com/videos/nonprofit-industrial-complex.mp4',
    video_duration_seconds: 660, module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'Power, Privilege, and Positionality',
    slug: 'power-privilege-positionality',
    description: 'Examine your own position in nonprofit power structures.',
    content_type: 'video', content_url: 'https://example.com/videos/power-privilege-positionality.mp4',
    video_duration_seconds: 600, module_number: 1, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 1: 4 lessons')

  const m2 = await createModule(course.id, {
    title: 'Centering Black Community Leadership',
    description: 'Move from doing "for" to supporting community-led initiatives.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Nothing About Us Without Us',
    slug: 'nothing-about-us-without-us',
    description: 'Center Black community voices in decisions affecting them.',
    content_type: 'video', content_url: 'https://example.com/videos/nothing-about-us-without-us.mp4',
    video_duration_seconds: 660, module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Supporting vs Leading: Knowing Your Role',
    slug: 'supporting-vs-leading',
    description: 'Understand when to lead, support, or step back.',
    content_type: 'video', content_url: 'https://example.com/videos/supporting-vs-leading.mp4',
    video_duration_seconds: 720, module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Authentic Community Partnerships',
    slug: 'authentic-partnerships',
    description: 'Build partnerships based on shared power, not extraction.',
    content_type: 'video', content_url: 'https://example.com/videos/authentic-partnerships.mp4',
    video_duration_seconds: 600, module_number: 2, lesson_number: 3, sort_order: 3
  })
  console.log('✅ Module 2: 3 lessons')

  const m3 = await createModule(course.id, {
    title: 'Funding Equity and Resource Distribution',
    description: 'Address inequities in philanthropic funding and resource access.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Funding Inequities: The Data',
    slug: 'funding-inequities-data',
    description: 'Understand how Black-led organizations receive less funding.',
    content_type: 'video', content_url: 'https://example.com/videos/funding-inequities-data.mp4',
    video_duration_seconds: 660, module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Trust-Based Philanthropy',
    slug: 'trust-based-philanthropy',
    description: 'Move from restrictive to trust-based funding practices.',
    content_type: 'video', content_url: 'https://example.com/videos/trust-based-philanthropy.mp4',
    video_duration_seconds: 720, module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Participatory Grantmaking',
    slug: 'participatory-grantmaking',
    description: 'Share decision-making power with communities receiving funding.',
    content_type: 'video', content_url: 'https://example.com/videos/participatory-grantmaking.mp4',
    video_duration_seconds: 600, module_number: 3, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-nonprofit',
    description: 'Comprehensive assessment of nonprofit anti-racism knowledge.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is white saviorism in nonprofit work?',
          options: [
            'Helping people is always good',
            'The harmful pattern where white people position themselves as rescuers of Black communities, centering their own goodness rather than community self-determination',
            'Any white person working in nonprofits',
            'Only happens internationally'
          ],
          correct_answer: 1,
          explanation: 'White saviorism is the harmful pattern where white people (individuals or organizations) position themselves as rescuers of Black/racialized communities while centering their own benevolence, moral superiority, and comfort. It assumes communities need saving rather than resources and power. White saviorism perpetuates paternalism (we know what\'s best for you), extraction (using community stories for fundraising), and maintains power imbalances. Anti-racist work requires stepping back, supporting Black leadership, sharing power—not claiming credit for "saving" anyone.'
        },
        {
          question: 'What does "Nothing About Us Without Us" mean?',
          options: [
            'Black people should handle all Black issues alone',
            'Decisions, programs, and policies affecting Black communities must center Black voices, leadership, and self-determination—not be made for them',
            'Everyone should be included in all decisions',
            'Only Black people can work on anti-racism'
          ],
          correct_answer: 1,
          explanation: '"Nothing About Us Without Us" means Black communities must lead decisions affecting them. Too often, white-led organizations design programs "for" Black communities without meaningful input, then wonder why initiatives fail. This perpetuates harm by: ignoring community expertise, imposing outside solutions, extracting stories/data without benefit, and maintaining power with funders/decision-makers. Authentic partnership requires: centering Black leadership, sharing decision-making power, resourcing community-led solutions, and being accountable to those most impacted—not doing things "for" them.'
        },
        {
          question: 'What do data show about philanthropic funding?',
          options: [
            'Funding is distributed equitably',
            'Black-led organizations receive significantly less funding than white-led organizations, often with more restrictions and less unrestricted support',
            'Black organizations receive too much funding',
            'Race does not affect funding decisions'
          ],
          correct_answer: 1,
          explanation: 'Data consistently show Black-led organizations receive far less philanthropic funding (often <2% of foundation grants), are more likely to receive small/restricted grants vs large/unrestricted gifts, face more burdensome reporting requirements, and have less access to funder networks. This reflects systemic racism in philanthropy: biased perceptions of credibility, risk aversion, homogeneous funder networks, and preference for white-led "neutral" organizations over Black-led community organizations. Funding inequity perpetuates power imbalances and under-resources those closest to problems.'
        },
        {
          question: 'What is trust-based philanthropy?',
          options: [
            'Trusting organizations will waste money',
            'Funding practices that provide unrestricted support, reduce burdens, share power, and trust community organizations as experts',
            'Not requiring any accountability',
            'Only for large established organizations'
          ],
          correct_answer: 1,
          explanation: 'Trust-based philanthropy shifts from extractive, controlling funding to practices that trust community organizations: providing unrestricted/general operating support (not just project funding), multi-year commitments (not one-year grants), streamlined applications/reporting (not 50-page proposals), participatory decision-making, and building relationships beyond transactions. It recognizes organizations closest to communities are experts—not problems to be managed. Trust-based approaches resource Black-led organizations equitably and acknowledge that restrictive funding perpetuates white institutional control.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 15
    },
    module_number: 3, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 3: 4 lessons')
  console.log('✅ Course 22 complete: 3 modules, 11 lessons\n')
}

console.log('=== PHASE 3 PART 2 POPULATION ===\n')

async function runAll() {
  await populateFinanceEconomicJustice()
  await populateNonprofitAdvocacy()
}

runAll()
  .then(() => console.log('\n✅ PART 2 COMPLETE: 2 more Phase 3 courses populated!'))
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
