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

// Course 11: Intersectionality: Black Women in the Workplace
async function populateBlackWomenWorkplace() {
  console.log('\n📚 Course 11: Intersectionality: Black Women in the Workplace')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'black-women-workplace').single()
  if (!course) { console.log('❌ Course not found'); return }

  // Module 1: Understanding Intersectionality
  const m1 = await createModule(course.id, {
    title: 'Understanding Intersectionality',
    description: 'Learn the theory and practice of intersectionality and why it matters for Black women.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction to Intersectionality',
    slug: 'intro-intersectionality',
    description: 'Understand how race and gender intersect to shape unique experiences.',
    content_type: 'video',
    content_url: 'https://example.com/videos/intro-intersectionality.mp4',
    video_duration_seconds: 600,
    module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Kimberlé Crenshaw and Intersectional Theory',
    slug: 'crenshaw-theory',
    description: 'Learn the origins and framework of intersectionality from its creator.',
    content_type: 'video',
    content_url: 'https://example.com/videos/crenshaw-theory.mp4',
    video_duration_seconds: 660,
    module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Why "Add Gender and Stir" Doesn\'t Work',
    slug: 'why-add-gender-fails',
    description: 'Understand why Black women\'s experiences cannot be understood by simply combining race and gender analyses.',
    content_type: 'video',
    content_url: 'https://example.com/videos/why-add-gender-fails.mp4',
    video_duration_seconds: 540,
    module_number: 1, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 1: 3 lessons')

  // Module 2: Black Women's Workplace Realities
  const m2 = await createModule(course.id, {
    title: 'Black Women\'s Workplace Realities',
    description: 'Examine the unique challenges and barriers Black women face in Canadian workplaces.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'The Data: Black Women in the Canadian Workforce',
    slug: 'black-women-data',
    description: 'Review employment, pay, and advancement statistics for Black women in Canada.',
    content_type: 'video',
    content_url: 'https://example.com/videos/black-women-data.mp4',
    video_duration_seconds: 600,
    module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Stereotypes and Microaggressions',
    slug: 'stereotypes-microaggressions',
    description: 'Identify specific stereotypes targeting Black women (angry, strong, sassy, etc.) and their impacts.',
    content_type: 'video',
    content_url: 'https://example.com/videos/stereotypes-microaggressions.mp4',
    video_duration_seconds: 720,
    module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Black Women and Leadership',
    slug: 'black-women-leadership',
    description: 'Examine barriers to advancement and what authentic support looks like.',
    content_type: 'video',
    content_url: 'https://example.com/videos/black-women-leadership.mp4',
    video_duration_seconds: 660,
    module_number: 2, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m2.id, {
    title: 'Hair Discrimination and Professional Standards',
    slug: 'hair-discrimination',
    description: 'Understand how "professional appearance" policies target Black women and what needs to change.',
    content_type: 'video',
    content_url: 'https://example.com/videos/hair-discrimination.mp4',
    video_duration_seconds: 540,
    module_number: 2, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 2: 4 lessons')

  // Module 3: Creating Inclusive Environments
  const m3 = await createModule(course.id, {
    title: 'Creating Inclusive Environments for Black Women',
    description: 'Learn practical strategies for supporting Black women in your workplace.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'What Black Women Need (And What They Don\'t)',
    slug: 'what-black-women-need',
    description: 'Understand what genuine support and allyship look like.',
    content_type: 'video',
    content_url: 'https://example.com/videos/what-black-women-need.mp4',
    video_duration_seconds: 600,
    module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Interrupting Bias and Stereotypes',
    slug: 'interrupting-bias-stereotypes',
    description: 'Practice strategies for calling out harmful stereotypes and biases.',
    content_type: 'video',
    content_url: 'https://example.com/videos/interrupting-bias-stereotypes.mp4',
    video_duration_seconds: 660,
    module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Sponsorship and Advocacy',
    slug: 'sponsorship-advocacy',
    description: 'Move beyond mentorship to active sponsorship and career advancement.',
    content_type: 'video',
    content_url: 'https://example.com/videos/sponsorship-advocacy.mp4',
    video_duration_seconds: 540,
    module_number: 3, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-black-women',
    description: 'Comprehensive assessment of intersectionality and workplace inclusion.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is intersectionality?',
          options: [
            'A framework that recognizes overlapping identities create unique experiences that cannot be understood by examining each identity separately',
            'A way to rank different forms of oppression',
            'The belief that all forms of discrimination are the same',
            'A diversity training technique'
          ],
          correct_answer: 0,
          explanation: 'Intersectionality, coined by Kimberlé Crenshaw, recognizes that identities like race, gender, class, and sexuality overlap to create unique experiences of privilege and oppression. A Black woman\'s experience is not simply "racism + sexism"—the intersection creates distinct challenges that cannot be understood by looking at race or gender alone.'
        },
        {
          question: 'What does research show about Black women in Canadian workplaces?',
          options: [
            'Black women earn the same as white women when education is controlled',
            'Black women face a "double disadvantage" earning less than white women and Black men',
            'Black women are overrepresented in senior leadership',
            'Black women face fewer barriers than Black men'
          ],
          correct_answer: 1,
          explanation: 'Data consistently show Black women face compounded disadvantages. They earn less than both white women (facing racial disparities) and Black men (facing gender disparities), are underrepresented in leadership, experience higher unemployment, and report more discrimination and microaggressions. This is intersectionality in action—not just racism, not just sexism, but unique barriers at the intersection.'
        },
        {
          question: 'What is the "angry Black woman" stereotype and why does it matter?',
          options: [
            'An accurate description of how Black women behave',
            'A harmful stereotype that pathologizes Black women\'s legitimate expressions of emotion or assertiveness',
            'A compliment to Black women\'s strength',
            'Something that only affects Black women outside the workplace'
          ],
          correct_answer: 1,
          explanation: 'The "angry Black woman" stereotype falsely characterizes Black women as hostile, aggressive, or difficult. When Black women express normal assertiveness, disagreement, or justified frustration, they are more likely to be labeled "angry" or "difficult" than white women expressing the same behaviors. This stereotype is used to silence, dismiss, and penalize Black women in workplaces.'
        },
        {
          question: 'What is the difference between mentorship and sponsorship for Black women?',
          options: [
            'There is no difference—the terms are interchangeable',
            'Mentorship provides advice; sponsorship involves actively advocating for advancement and using your influence on their behalf',
            'Sponsorship is only for entry-level employees',
            'Mentorship is more valuable than sponsorship'
          ],
          correct_answer: 1,
          explanation: 'While mentorship (advice, guidance, support) is valuable, sponsorship is critical for advancement. A sponsor actively advocates for a Black woman in rooms where decisions are made, nominates her for opportunities, uses their influence to advance her career, and takes risks on her behalf. Black women are often over-mentored but under-sponsored—they receive advice but not the advocacy needed to break through barriers.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 15
    },
    module_number: 3, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 3: 4 lessons')
  console.log('✅ Course 11 complete: 3 modules, 11 lessons\n')
}

// Course 12: Conducting Racial Equity Audits
async function populateEquityAudits() {
  console.log('\n📚 Course 12: Conducting Racial Equity Audits')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'racial-equity-audits').single()
  if (!course) { console.log('❌ Course not found'); return }

  // Module 1: Introduction to Equity Audits
  const m1 = await createModule(course.id, {
    title: 'Introduction to Racial Equity Audits',
    description: 'Understand the purpose, scope, and value of conducting equity audits.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'What is a Racial Equity Audit?',
    slug: 'what-is-equity-audit',
    description: 'Define equity audits and understand their role in organizational change.',
    content_type: 'video',
    content_url: 'https://example.com/videos/what-is-equity-audit.mp4',
    video_duration_seconds: 540,
    module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'When and Why to Conduct an Audit',
    slug: 'when-why-audit',
    description: 'Identify the right timing and organizational readiness for an equity audit.',
    content_type: 'video',
    content_url: 'https://example.com/videos/when-why-audit.mp4',
    video_duration_seconds: 600,
    module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Building Internal Buy-In',
    slug: 'building-buy-in',
    description: 'Secure leadership support and staff engagement for the audit process.',
    content_type: 'video',
    content_url: 'https://example.com/videos/building-buy-in.mp4',
    video_duration_seconds: 660,
    module_number: 1, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 1: 3 lessons')

  // Module 2: Methodology and Data Collection
  const m2 = await createModule(course.id, {
    title: 'Audit Methodology and Data Collection',
    description: 'Learn systematic approaches to gathering and organizing equity audit data.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Designing Your Audit Framework',
    slug: 'designing-framework',
    description: 'Create a comprehensive framework covering all organizational systems.',
    content_type: 'video',
    content_url: 'https://example.com/videos/designing-framework.mp4',
    video_duration_seconds: 720,
    module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Quantitative Data Collection',
    slug: 'quantitative-data',
    description: 'Gather and analyze demographic and outcome data.',
    content_type: 'video',
    content_url: 'https://example.com/videos/quantitative-data.mp4',
    video_duration_seconds: 660,
    module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Qualitative Data Collection',
    slug: 'qualitative-data',
    description: 'Conduct interviews, focus groups, and surveys to understand lived experiences.',
    content_type: 'video',
    content_url: 'https://example.com/videos/qualitative-data.mp4',
    video_duration_seconds: 600,
    module_number: 2, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m2.id, {
    title: 'Policy and Practice Review',
    slug: 'policy-practice-review',
    description: 'Examine organizational policies, procedures, and practices for equity impacts.',
    content_type: 'video',
    content_url: 'https://example.com/videos/policy-practice-review.mp4',
    video_duration_seconds: 540,
    module_number: 2, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 2: 4 lessons')

  // Module 3: Analysis and Findings
  const m3 = await createModule(course.id, {
    title: 'Analyzing Data and Identifying Findings',
    description: 'Turn collected data into clear findings about racial disparities and their causes.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Identifying Patterns and Disparities',
    slug: 'identifying-patterns',
    description: 'Analyze data to surface meaningful patterns of inequity.',
    content_type: 'video',
    content_url: 'https://example.com/videos/identifying-patterns.mp4',
    video_duration_seconds: 660,
    module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Root Cause Analysis',
    slug: 'root-cause-analysis',
    description: 'Move beyond symptoms to identify underlying causes of disparities.',
    content_type: 'video',
    content_url: 'https://example.com/videos/root-cause-analysis.mp4',
    video_duration_seconds: 720,
    module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Prioritizing Findings',
    slug: 'prioritizing-findings',
    description: 'Determine which issues to address first based on impact and feasibility.',
    content_type: 'video',
    content_url: 'https://example.com/videos/prioritizing-findings.mp4',
    video_duration_seconds: 540,
    module_number: 3, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 3: 3 lessons')

  // Module 4: Reporting and Action Planning
  const m4 = await createModule(course.id, {
    title: 'Reporting Results and Creating Action Plans',
    description: 'Communicate findings effectively and develop actionable recommendations.',
    sort_order: 4
  })

  await createLesson(course.id, m4.id, {
    title: 'Writing the Equity Audit Report',
    slug: 'writing-report',
    description: 'Create clear, compelling reports that drive action.',
    content_type: 'video',
    content_url: 'https://example.com/videos/writing-report.mp4',
    video_duration_seconds: 600,
    module_number: 4, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m4.id, {
    title: 'Developing Recommendations',
    slug: 'developing-recommendations',
    description: 'Craft specific, actionable recommendations tied to root causes.',
    content_type: 'video',
    content_url: 'https://example.com/videos/developing-recommendations.mp4',
    video_duration_seconds: 660,
    module_number: 4, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m4.id, {
    title: 'Creating Implementation Plans',
    slug: 'implementation-plans',
    description: 'Turn recommendations into concrete action plans with timelines and accountability.',
    content_type: 'video',
    content_url: 'https://example.com/videos/implementation-plans.mp4',
    video_duration_seconds: 720,
    module_number: 4, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m4.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-equity-audits',
    description: 'Comprehensive assessment of equity audit knowledge and skills.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is the primary purpose of a racial equity audit?',
          options: [
            'To comply with legal requirements',
            'To systematically identify racial disparities and their root causes to inform action',
            'To prove the organization is not racist',
            'To satisfy employee demands'
          ],
          correct_answer: 1,
          explanation: 'A racial equity audit is a systematic examination of organizational policies, practices, and outcomes to identify racial disparities, understand their root causes, and develop evidence-based recommendations for change. The goal is action and improvement, not compliance or public relations. An audit should surface uncomfortable truths and drive meaningful transformation.'
        },
        {
          question: 'What types of data should a comprehensive equity audit include?',
          options: [
            'Only quantitative demographic data',
            'Only employee survey responses',
            'Quantitative data on demographics and outcomes, qualitative data from lived experiences, and policy/practice reviews',
            'Whatever data is easiest to collect'
          ],
          correct_answer: 2,
          explanation: 'Comprehensive audits require multiple data sources: quantitative data (demographics, hiring, promotions, pay, retention, discipline) show what disparities exist; qualitative data (interviews, focus groups, surveys) explain why and how people experience the organization; policy reviews identify formal and informal practices that create or perpetuate disparities. All three are necessary for complete understanding.'
        },
        {
          question: 'What is root cause analysis in an equity audit?',
          options: [
            'Identifying who is responsible for disparities',
            'Examining underlying systems, policies, and practices that create and maintain disparities rather than just documenting the disparities themselves',
            'Finding individual instances of discrimination',
            'Blaming leadership for problems'
          ],
          correct_answer: 1,
          explanation: 'Root cause analysis moves beyond describing disparities (e.g., "Black employees are promoted less") to understanding why (e.g., "Promotion decisions rely on informal networks and subjective assessments; Black employees lack access to senior sponsors; criteria emphasize cultural fit over skills"). This allows you to address causes rather than symptoms, leading to more effective interventions.'
        },
        {
          question: 'What makes an equity audit recommendation actionable?',
          options: [
            'It sounds good and uses the right language',
            'It is specific, tied to root causes, includes who will do what by when, and has clear success metrics',
            'It is easy to implement',
            'It makes everyone feel comfortable'
          ],
          correct_answer: 1,
          explanation: 'Actionable recommendations are specific (not vague like "improve culture"), address identified root causes, assign clear responsibility, include timelines, define success metrics, and identify needed resources. Vague recommendations like "increase diversity" or "provide more training" rarely lead to change. Effective recommendations name concrete actions with accountability.'
        }
      ],
      passing_score: 80,
      time_limit_minutes: 15
    },
    module_number: 4, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 4: 4 lessons')
  console.log('✅ Course 12 complete: 4 modules, 14 lessons\n')
}

console.log('=== PHASE 1 PART 3 POPULATION ===\n')

async function runAll() {
  await populateBlackWomenWorkplace()
  await populateEquityAudits()
}

runAll()
  .then(() => console.log('\n✅ PART 3 COMPLETE: Final 2 Phase 1 courses populated!\n🎉 ALL 6 PHASE 1 COURSES COMPLETE!'))
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
