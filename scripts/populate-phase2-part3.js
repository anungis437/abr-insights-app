const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  '***REMOVED***',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.***REMOVED***.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

async function createModule(courseId, moduleData) {
  const slug = moduleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const { data, error } = await supabase.from('course_modules').insert({
    course_id: courseId,
    title: moduleData.title,
    slug,
    description: moduleData.description,
    module_number: moduleData.sort_order,
    sort_order: moduleData.sort_order,
    is_published: true
  }).select().single()
  if (error) throw error
  return data
}

async function createLesson(courseId, moduleId, lessonData) {
  const { data, error } = await supabase.from('lessons').insert({
    course_id: courseId,
    module_id: moduleId,
    title: lessonData.title,
    slug: lessonData.slug,
    description: lessonData.description,
    content_type: lessonData.content_type,
    content_url: lessonData.content_url,
    content_data: lessonData.content_data,
    article_body: lessonData.article_body,
    video_duration_seconds: lessonData.video_duration_seconds,
    module_number: lessonData.module_number,
    lesson_number: lessonData.lesson_number,
    sort_order: lessonData.sort_order,
    is_published: true,
    is_preview: lessonData.is_preview || false
  }).select().single()
  if (error) throw error
  return data
}

// Course 17: Environmental Racism in Canada
async function populateEnvironmentalRacism() {
  console.log('\n📚 Course 17: Environmental Racism in Canada')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'environmental-racism').single()
  if (!course) { console.log('❌ Course not found'); return }

  // Module 1: Understanding Environmental Racism
  const m1 = await createModule(course.id, {
    title: 'Defining Environmental Racism and Environmental Justice',
    description: 'Understand how environmental harms disproportionately impact Black and racialized communities.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction: What is Environmental Racism?',
    slug: 'what-is-environmental-racism',
    description: 'Define environmental racism and understand its scope in Canada.',
    content_type: 'video',
    content_url: 'https://example.com/videos/what-is-environmental-racism.mp4',
    video_duration_seconds: 600,
    module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Case Studies: Africville, Nova Scotia',
    slug: 'africville-case-study',
    description: 'Learn about the destruction of Africville and environmental racism in Nova Scotia.',
    content_type: 'video',
    content_url: 'https://example.com/videos/africville-case-study.mp4',
    video_duration_seconds: 720,
    module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Case Studies: North Preston and Residential Proximity',
    slug: 'north-preston-case-study',
    description: 'Examine landfills, sewage treatment, and industrial facilities near Black communities.',
    content_type: 'video',
    content_url: 'https://example.com/videos/north-preston-case-study.mp4',
    video_duration_seconds: 660,
    module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'Intersections with Indigenous Environmental Justice',
    slug: 'indigenous-environmental-justice',
    description: 'Understand connections between Black and Indigenous environmental struggles.',
    content_type: 'video',
    content_url: 'https://example.com/videos/indigenous-environmental-justice.mp4',
    video_duration_seconds: 600,
    module_number: 1, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 1: 4 lessons')

  // Module 2: Health and Community Impacts
  const m2 = await createModule(course.id, {
    title: 'Health Impacts of Environmental Racism',
    description: 'Examine the disproportionate health burdens on Black communities.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Air Quality and Respiratory Health',
    slug: 'air-quality-health',
    description: 'Understand how poor air quality disproportionately affects Black neighborhoods.',
    content_type: 'video',
    content_url: 'https://example.com/videos/air-quality-health.mp4',
    video_duration_seconds: 600,
    module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Water Contamination and Access',
    slug: 'water-contamination',
    description: 'Examine water quality issues in Black and racialized communities.',
    content_type: 'video',
    content_url: 'https://example.com/videos/water-contamination.mp4',
    video_duration_seconds: 660,
    module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Toxic Exposure and Cancer Clusters',
    slug: 'toxic-exposure',
    description: 'Understand proximity to industrial pollution and health outcomes.',
    content_type: 'video',
    content_url: 'https://example.com/videos/toxic-exposure.mp4',
    video_duration_seconds: 540,
    module_number: 2, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m2.id, {
    title: 'Climate Change and Vulnerable Communities',
    slug: 'climate-change-vulnerability',
    description: 'Explore how climate change disproportionately harms Black communities.',
    content_type: 'video',
    content_url: 'https://example.com/videos/climate-change-vulnerability.mp4',
    video_duration_seconds: 600,
    module_number: 2, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 2: 4 lessons')

  // Module 3: Organizing and Solutions
  const m3 = await createModule(course.id, {
    title: 'Community Organizing for Environmental Justice',
    description: 'Learn from Black-led environmental justice movements and strategies.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Black-Led Environmental Justice Movements',
    slug: 'black-led-movements',
    description: 'Learn from community organizers fighting environmental racism.',
    content_type: 'video',
    content_url: 'https://example.com/videos/black-led-movements.mp4',
    video_duration_seconds: 660,
    module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Policy Solutions and Accountability',
    slug: 'policy-solutions',
    description: 'Explore policy changes needed to address environmental racism.',
    content_type: 'video',
    content_url: 'https://example.com/videos/policy-solutions.mp4',
    video_duration_seconds: 720,
    module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-environmental',
    description: 'Comprehensive assessment of environmental racism knowledge.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is environmental racism?',
          options: [
            'Racism that happens outdoors',
            'The disproportionate exposure of Black and racialized communities to environmental hazards like pollution, toxins, and contaminated land/water',
            'Individual prejudice about environmental issues',
            'A term only used in the United States'
          ],
          correct_answer: 1,
          explanation: 'Environmental racism is the systemic pattern where Black, Indigenous, and racialized communities are disproportionately exposed to environmental hazards: landfills, industrial facilities, contaminated sites, poor air/water quality, etc. This is not random—it results from discriminatory zoning, housing policies, and land use decisions that locate environmental harms near communities with less political power. Africville (Halifax) is a Canadian example: a thriving Black community destroyed and used for sewage, dump sites, and industrial facilities.'
        },
        {
          question: 'What happened in Africville, Nova Scotia?',
          options: [
            'A Black community prospered with city support',
            'A thriving Black community was systematically destroyed through environmental racism, refused basic services, then demolished to make way for industrial development',
            'Nothing significant',
            'The community voluntarily relocated'
          ],
          correct_answer: 1,
          explanation: 'Africville was a thriving Black community in Halifax founded in the 1840s. The city systematically refused basic services (water, sewage, paved roads) while locating environmental hazards there: infectious disease hospital, city dump, slaughterhouse, etc. In the 1960s, residents were forcibly relocated and homes demolished—supposedly for "urban renewal" but really to make way for industrial development. Africville is a stark example of environmental racism: a Black community deliberately subjected to environmental harms then destroyed.'
        },
        {
          question: 'How does environmental racism impact health?',
          options: [
            'It doesn\'t affect health',
            'Black communities near pollution face higher rates of asthma, cancer, respiratory disease, and other health problems',
            'Health impacts are the same for all communities',
            'Only affects mental health'
          ],
          correct_answer: 1,
          explanation: 'Environmental racism has severe health consequences. Black communities near industrial pollution, highways, and waste facilities face higher rates of asthma (especially children), cancer, cardiovascular disease, birth complications, and reduced life expectancy. Poor air quality, water contamination, and toxic exposure create health disparities. For example, Black children in polluted neighborhoods have asthma rates 2-3 times higher than white children. This is environmental injustice—communities harmed by decisions made without their consent.'
        },
        {
          question: 'What are solutions to environmental racism?',
          options: [
            'Tell individuals to recycle more',
            'Community-led organizing, policy changes mandating environmental equity assessments, holding polluters accountable, and investing in Black community health',
            'Ignore the problem',
            'Move Black communities away without addressing root causes'
          ],
          correct_answer: 1,
          explanation: 'Solutions require systemic change, not individual actions. This includes: community-led organizing for environmental justice, policy requiring environmental equity assessments before siting hazards, holding corporations accountable for pollution, investing in Black community health and infrastructure, meaningful community consultation with veto power, reparations for communities harmed (like Africville), and climate justice policies centering vulnerable communities. Black communities must lead solutions—not be told what\'s "best" for them.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 15
    },
    module_number: 3, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 3: 3 lessons')
  console.log('✅ Course 17 complete: 3 modules, 11 lessons\n')
}

// Course 18: Recruitment and Retention Best Practices
async function populateRecruitmentRetention() {
  console.log('\n📚 Course 18: Recruitment and Retention Best Practices')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'recruitment-retention').single()
  if (!course) { console.log('❌ Course not found'); return }

  // Module 1: Authentic Recruitment
  const m1 = await createModule(course.id, {
    title: 'Building Authentic Recruitment Pipelines',
    description: 'Move beyond performative diversity recruiting to genuine pipeline building.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction: Why Traditional Recruiting Fails',
    slug: 'why-recruiting-fails',
    description: 'Understand how traditional recruiting perpetuates exclusion.',
    content_type: 'video',
    content_url: 'https://example.com/videos/why-recruiting-fails.mp4',
    video_duration_seconds: 540,
    module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Building Relationships, Not Transactions',
    slug: 'building-relationships',
    description: 'Create ongoing relationships with Black communities and institutions.',
    content_type: 'video',
    content_url: 'https://example.com/videos/building-relationships.mp4',
    video_duration_seconds: 720,
    module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Examining Biased Job Descriptions',
    slug: 'biased-job-descriptions',
    description: 'Identify and remove coded language and unnecessary barriers in job postings.',
    content_type: 'video',
    content_url: 'https://example.com/videos/biased-job-descriptions.mp4',
    video_duration_seconds: 660,
    module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'Expanding Where You Look',
    slug: 'expanding-recruiting-channels',
    description: 'Move beyond traditional networks that exclude Black candidates.',
    content_type: 'video',
    content_url: 'https://example.com/videos/expanding-recruiting-channels.mp4',
    video_duration_seconds: 600,
    module_number: 1, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 1: 4 lessons')

  // Module 2: Inclusive Interviewing and Selection
  const m2 = await createModule(course.id, {
    title: 'Equitable Interviewing and Selection Processes',
    description: 'Design selection processes that assess merit without bias.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Bias in Interviews: Common Patterns',
    slug: 'bias-in-interviews',
    description: 'Recognize how bias shapes perception of Black candidates.',
    content_type: 'video',
    content_url: 'https://example.com/videos/bias-in-interviews.mp4',
    video_duration_seconds: 660,
    module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Structured Interviews and Blind Review',
    slug: 'structured-interviews',
    description: 'Implement processes that reduce subjective bias.',
    content_type: 'video',
    content_url: 'https://example.com/videos/structured-interviews.mp4',
    video_duration_seconds: 720,
    module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Assessing "Culture Fit" vs Culture Add',
    slug: 'culture-fit-vs-add',
    description: 'Move beyond homogeneous culture fit to value diverse perspectives.',
    content_type: 'video',
    content_url: 'https://example.com/videos/culture-fit-vs-add.mp4',
    video_duration_seconds: 600,
    module_number: 2, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m2.id, {
    title: 'Diverse Interview Panels',
    slug: 'diverse-panels',
    description: 'Ensure Black candidates see themselves reflected in your organization.',
    content_type: 'video',
    content_url: 'https://example.com/videos/diverse-panels.mp4',
    video_duration_seconds: 540,
    module_number: 2, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 2: 4 lessons')

  // Module 3: Equitable Onboarding
  const m3 = await createModule(course.id, {
    title: 'Creating Equitable Onboarding Experiences',
    description: 'Set Black employees up for success from day one.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Why Onboarding Matters for Equity',
    slug: 'why-onboarding-matters',
    description: 'Understand how onboarding can reinforce or disrupt inequity.',
    content_type: 'video',
    content_url: 'https://example.com/videos/why-onboarding-matters.mp4',
    video_duration_seconds: 540,
    module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Access to Networks and Sponsorship',
    slug: 'access-networks-sponsorship',
    description: 'Ensure Black employees have equal access to informal networks and sponsors.',
    content_type: 'video',
    content_url: 'https://example.com/videos/access-networks-sponsorship.mp4',
    video_duration_seconds: 660,
    module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Setting Clear Expectations and Support',
    slug: 'clear-expectations-support',
    description: 'Provide clarity, resources, and support for success.',
    content_type: 'video',
    content_url: 'https://example.com/videos/clear-expectations-support.mp4',
    video_duration_seconds: 600,
    module_number: 3, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 3: 3 lessons')

  // Module 4: Retention and Advancement
  const m4 = await createModule(course.id, {
    title: 'Addressing Systemic Barriers to Retention',
    description: 'Understand and address why Black employees leave—and create pathways to advancement.',
    sort_order: 4
  })

  await createLesson(course.id, m4.id, {
    title: 'Why Black Employees Leave',
    slug: 'why-employees-leave',
    description: 'Understand the systemic barriers driving Black employees out.',
    content_type: 'video',
    content_url: 'https://example.com/videos/why-employees-leave.mp4',
    video_duration_seconds: 720,
    module_number: 4, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m4.id, {
    title: 'Creating Psychologically Safe Environments',
    slug: 'psychological-safety',
    description: 'Build workplaces where Black employees can bring their full selves.',
    content_type: 'video',
    content_url: 'https://example.com/videos/psychological-safety.mp4',
    video_duration_seconds: 660,
    module_number: 4, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m4.id, {
    title: 'Equitable Performance Evaluation and Advancement',
    slug: 'equitable-evaluation',
    description: 'Address bias in performance reviews and promotion decisions.',
    content_type: 'video',
    content_url: 'https://example.com/videos/equitable-evaluation.mp4',
    video_duration_seconds: 600,
    module_number: 4, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m4.id, {
    title: 'Accountability for Retention Outcomes',
    slug: 'accountability-retention',
    description: 'Measure, track, and hold leadership accountable for retention.',
    content_type: 'video',
    content_url: 'https://example.com/videos/accountability-retention.mp4',
    video_duration_seconds: 540,
    module_number: 4, lesson_number: 4, sort_order: 4
  })

  await createLesson(course.id, m4.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-recruitment',
    description: 'Comprehensive assessment of recruitment and retention best practices.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is wrong with traditional recruitment approaches?',
          options: [
            'Nothing, they work fine',
            'They rely on homogeneous networks, biased job descriptions, and transactional relationships that exclude Black candidates',
            'They are too inclusive',
            'They only need minor tweaks'
          ],
          correct_answer: 1,
          explanation: 'Traditional recruiting perpetuates exclusion by: relying on homogeneous networks ("who do we know?"), using coded language in job descriptions (e.g., "culture fit," "polish"), requiring unnecessary credentials that screen out qualified candidates, taking transactional approaches (showing up only when hiring), and failing to examine bias in screening. To recruit Black talent authentically, build ongoing relationships with Black communities/institutions, remove barriers, expand networks, and demonstrate genuine commitment.'
        },
        {
          question: 'What is the problem with "culture fit"?',
          options: [
            'There is no problem with culture fit',
            'It is often code for "people like us" and screens out Black candidates who would bring valuable different perspectives',
            'It ensures team cohesion',
            'It helps with retention'
          ],
          correct_answer: 1,
          explanation: '"Culture fit" sounds neutral but is often code for hiring people similar to existing (often white) staff. It screens out Black candidates who don\'t match the dominant culture, reinforcing homogeneity. Research shows candidates who "fit" are often those who look, talk, and think like existing employees. Instead, prioritize "culture add"—hiring people who bring different perspectives, challenge assumptions, and expand your culture. Diversity strengthens teams; homogeneity creates blind spots.'
        },
        {
          question: 'Why do Black employees leave organizations?',
          options: [
            'They are not committed',
            'Due to systemic barriers: microaggressions, exclusion from networks, biased evaluations, lack of advancement, hostile environments, and emotional exhaustion',
            'Better pay elsewhere',
            'Personal reasons unrelated to workplace'
          ],
          correct_answer: 1,
          explanation: 'Black employees leave due to hostile work environments: constant microaggressions, being the "only one," exclusion from informal networks/opportunities, biased performance evaluations, glass ceilings blocking advancement, lack of psychological safety, emotional labor of educating colleagues, and watching organizations fail to act on stated DEI commitments. The issue is not individual "fit"—it\'s systemic barriers. Exit interviews often reveal patterns organizations ignore. Retention requires addressing root causes, not surface-level perks.'
        },
        {
          question: 'What does equitable onboarding require?',
          options: [
            'The same onboarding for everyone',
            'Intentional access to networks, clear expectations, sponsorship, resources, and addressing barriers Black employees face',
            'A welcome email and desk',
            'Diversity training on day one'
          ],
          correct_answer: 1,
          explanation: 'Equitable onboarding requires more than generic orientation. Black employees need: intentional access to informal networks (not just formal org charts), sponsors (not just mentors) who advocate for them, clear expectations and success metrics, resources and support, education for existing staff on inclusive behaviors, and acknowledgment of barriers they may face. Don\'t assume everyone has equal access—white employees benefit from homogeneous networks. Equitable onboarding proactively creates access and support.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 15
    },
    module_number: 4, lesson_number: 5, sort_order: 5
  })

  console.log('✅ Module 4: 5 lessons')
  console.log('✅ Course 18 complete: 4 modules, 16 lessons\n')
}

console.log('=== PHASE 2 PART 3 POPULATION ===\n')

async function runAll() {
  await populateEnvironmentalRacism()
  await populateRecruitmentRetention()
}

runAll()
  .then(() => console.log('\n✅ PART 3 COMPLETE: Final 2 Phase 2 courses populated! Phase 2 is now 100% complete!'))
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
