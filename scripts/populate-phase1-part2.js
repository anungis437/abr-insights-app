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

// Course 9: HR Professionals: Advanced Anti-Racism Practices
async function populateHRAdvanced() {
  console.log('\n📚 Course 9: HR Professionals: Advanced Anti-Racism Practices')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'hr-advanced-anti-racism').single()
  if (!course) { console.log('❌ Course not found'); return }

  // Module 1: Conducting Discrimination Investigations
  const m1 = await createModule(course.id, {
    title: 'Conducting Discrimination Investigations',
    description: 'Master the process of investigating workplace discrimination complaints with thoroughness and fairness.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction to HR Discrimination Investigations',
    slug: 'intro-discrimination-investigations',
    description: 'Understand your role and responsibilities when investigating discrimination complaints.',
    content_type: 'video',
    content_url: 'https://example.com/videos/intro-discrimination-investigations.mp4',
    video_duration_seconds: 540,
    module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Investigation Planning and Intake',
    slug: 'investigation-planning',
    description: 'Learn how to properly intake and scope a discrimination complaint.',
    content_type: 'video',
    content_url: 'https://example.com/videos/investigation-planning.mp4',
    video_duration_seconds: 600,
    module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Conducting Effective Interviews',
    slug: 'conducting-interviews',
    description: 'Master interview techniques for complainants, respondents, and witnesses.',
    content_type: 'video',
    content_url: 'https://example.com/videos/conducting-interviews.mp4',
    video_duration_seconds: 720,
    module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'Writing Investigation Reports',
    slug: 'writing-reports',
    description: 'Learn to document findings with clarity, objectivity, and legal defensibility.',
    content_type: 'video',
    content_url: 'https://example.com/videos/writing-reports.mp4',
    video_duration_seconds: 660,
    module_number: 1, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 1: 4 lessons')

  // Module 2: Employment Equity Act Compliance
  const m2 = await createModule(course.id, {
    title: 'Employment Equity Act Compliance',
    description: 'Understand and implement Employment Equity requirements for federally regulated organizations.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Understanding the Employment Equity Act',
    slug: 'understanding-eea',
    description: 'Learn the purpose, scope, and requirements of Canada\'s Employment Equity Act.',
    content_type: 'video',
    content_url: 'https://example.com/videos/understanding-eea.mp4',
    video_duration_seconds: 600,
    module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Workforce Analysis and Representation Goals',
    slug: 'workforce-analysis',
    description: 'Conduct workforce surveys and set representation goals for designated groups.',
    content_type: 'video',
    content_url: 'https://example.com/videos/workforce-analysis.mp4',
    video_duration_seconds: 720,
    module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Creating Employment Equity Plans',
    slug: 'equity-plans',
    description: 'Develop comprehensive plans to achieve employment equity.',
    content_type: 'video',
    content_url: 'https://example.com/videos/equity-plans.mp4',
    video_duration_seconds: 540,
    module_number: 2, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 2: 3 lessons')

  // Module 3: Bias-Resistant Talent Systems
  const m3 = await createModule(course.id, {
    title: 'Designing Bias-Resistant Talent Systems',
    description: 'Build hiring, promotion, and performance management systems that reduce bias and advance equity.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Bias in Hiring: Recognition and Mitigation',
    slug: 'bias-in-hiring',
    description: 'Identify common hiring biases and implement strategies to reduce them.',
    content_type: 'video',
    content_url: 'https://example.com/videos/bias-in-hiring.mp4',
    video_duration_seconds: 660,
    module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Structured Interviewing and Assessment',
    slug: 'structured-interviewing',
    description: 'Use structured methods to make fair, consistent hiring decisions.',
    content_type: 'video',
    content_url: 'https://example.com/videos/structured-interviewing.mp4',
    video_duration_seconds: 720,
    module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Equitable Performance Management',
    slug: 'equitable-performance',
    description: 'Design performance review systems that are fair across racial groups.',
    content_type: 'video',
    content_url: 'https://example.com/videos/equitable-performance.mp4',
    video_duration_seconds: 600,
    module_number: 3, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Promotion and Succession Planning',
    slug: 'promotion-succession',
    description: 'Ensure advancement opportunities are accessible to Black employees.',
    content_type: 'video',
    content_url: 'https://example.com/videos/promotion-succession.mp4',
    video_duration_seconds: 540,
    module_number: 3, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 3: 4 lessons')

  // Module 4: Equity Metrics and Accountability
  const m4 = await createModule(course.id, {
    title: 'Equity Metrics and Accountability',
    description: 'Establish measurement systems and accountability frameworks for anti-racism work.',
    sort_order: 4
  })

  await createLesson(course.id, m4.id, {
    title: 'What to Measure: Key Equity Metrics',
    slug: 'key-equity-metrics',
    description: 'Identify the most important metrics for tracking racial equity progress.',
    content_type: 'video',
    content_url: 'https://example.com/videos/key-equity-metrics.mp4',
    video_duration_seconds: 600,
    module_number: 4, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m4.id, {
    title: 'Race-Based Data Collection',
    slug: 'race-based-data',
    description: 'Collect demographic data ethically and effectively.',
    content_type: 'video',
    content_url: 'https://example.com/videos/race-based-data.mp4',
    video_duration_seconds: 540,
    module_number: 4, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m4.id, {
    title: 'Building Accountability Frameworks',
    slug: 'accountability-frameworks',
    description: 'Create systems that hold leaders accountable for equity outcomes.',
    content_type: 'video',
    content_url: 'https://example.com/videos/accountability-frameworks.mp4',
    video_duration_seconds: 660,
    module_number: 4, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m4.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-hr',
    description: 'Comprehensive assessment of HR anti-racism practices.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'When conducting a discrimination investigation, what is the most important principle?',
          options: [
            'Protect the organization from liability',
            'Maintain thoroughness, objectivity, and procedural fairness for all parties',
            'Resolve the complaint as quickly as possible',
            'Support the complainant no matter what'
          ],
          correct_answer: 1,
          explanation: 'While protecting the organization matters, the most important principle is conducting a fair, thorough, and objective investigation. This means treating all parties with respect, gathering all relevant evidence, and making findings based on facts, not assumptions. A well-conducted investigation protects everyone involved and reduces legal risk.'
        },
        {
          question: 'What is the purpose of the federal Employment Equity Act?',
          options: [
            'To give preferential treatment to visible minorities',
            'To achieve equality in the workplace by correcting disadvantages experienced by designated groups',
            'To meet quotas for hiring',
            'To discriminate against white men'
          ],
          correct_answer: 1,
          explanation: 'The EEA aims to achieve equality by identifying and removing barriers that disadvantage four designated groups (women, Indigenous peoples, persons with disabilities, and visible minorities, including Black Canadians). It requires proactive measures like representation goals, not quotas, to correct historical and systemic disadvantage.'
        },
        {
          question: 'Why is structured interviewing important for reducing bias?',
          options: [
            'It makes interviews faster',
            'It ensures all candidates are asked the same questions and evaluated using consistent criteria',
            'It eliminates the need for reference checks',
            'It guarantees you\'ll hire diverse candidates'
          ],
          correct_answer: 1,
          explanation: 'Structured interviewing reduces bias by ensuring consistency. When all candidates answer the same questions evaluated using predetermined criteria, hiring decisions are based on job-relevant factors rather than subjective impressions or rapport. Research shows structured interviews significantly reduce racial bias compared to unstructured conversations.'
        },
        {
          question: 'What is the most effective way to hold leaders accountable for equity?',
          options: [
            'Public shaming when they fail',
            'Tie equity outcomes to performance evaluations and compensation',
            'Send them to more training',
            'Hope they care enough to act'
          ],
          correct_answer: 1,
          explanation: 'Accountability requires consequences. When equity outcomes are part of how leaders are evaluated and compensated, they prioritize it. This might include metrics like representation in hiring/promotions, retention rates, employee feedback, and demonstrated leadership actions. Without accountability mechanisms, equity remains aspirational rather than actual.'
        }
      ],
      passing_score: 80,
      time_limit_minutes: 15
    },
    module_number: 4, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 4: 4 lessons')
  console.log('✅ Course 9 complete: 4 modules, 15 lessons\n')
}

// Course 10: Healthcare & Anti-Black Racism
async function populateHealthcareABR() {
  console.log('\n📚 Course 10: Healthcare & Anti-Black Racism')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'healthcare-anti-black-racism').single()
  if (!course) { console.log('❌ Course not found'); return }

  // Module 1: Understanding Bias in Healthcare
  const m1 = await createModule(course.id, {
    title: 'Understanding Racial Bias in Healthcare',
    description: 'Examine how anti-Black racism manifests in healthcare settings and impacts patient care.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction: Why Healthcare Equity Matters',
    slug: 'why-healthcare-equity-matters',
    description: 'Understand the scope and impact of anti-Black racism in healthcare.',
    content_type: 'video',
    content_url: 'https://example.com/videos/why-healthcare-equity-matters.mp4',
    video_duration_seconds: 480,
    module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Diagnostic Bias and Delayed Diagnosis',
    slug: 'diagnostic-bias',
    description: 'Learn how racial bias affects diagnostic accuracy and timing for Black patients.',
    content_type: 'video',
    content_url: 'https://example.com/videos/diagnostic-bias.mp4',
    video_duration_seconds: 720,
    module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Treatment Disparities',
    slug: 'treatment-disparities',
    description: 'Examine differences in treatment recommendations and interventions across racial groups.',
    content_type: 'video',
    content_url: 'https://example.com/videos/treatment-disparities.mp4',
    video_duration_seconds: 660,
    module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'The Pain Gap: Racial Bias in Pain Assessment',
    slug: 'pain-gap',
    description: 'Understand how false biological beliefs lead to undertreated pain in Black patients.',
    content_type: 'video',
    content_url: 'https://example.com/videos/pain-gap.mp4',
    video_duration_seconds: 600,
    module_number: 1, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 1: 4 lessons')

  // Module 2: Maternal Health Crisis
  const m2 = await createModule(course.id, {
    title: 'Black Maternal Health: A Canadian Crisis',
    description: 'Examine the alarming disparities in maternal health outcomes for Black women in Canada.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'The Data: Black Maternal Health Outcomes',
    slug: 'maternal-health-data',
    description: 'Review Canadian statistics on maternal morbidity and mortality for Black women.',
    content_type: 'video',
    content_url: 'https://example.com/videos/maternal-health-data.mp4',
    video_duration_seconds: 540,
    module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Why This Happens: Root Causes',
    slug: 'maternal-health-causes',
    description: 'Understand the systemic factors driving maternal health disparities.',
    content_type: 'video',
    content_url: 'https://example.com/videos/maternal-health-causes.mp4',
    video_duration_seconds: 660,
    module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Improving Maternal Care for Black Women',
    slug: 'improving-maternal-care',
    description: 'Learn evidence-based practices to improve outcomes.',
    content_type: 'video',
    content_url: 'https://example.com/videos/improving-maternal-care.mp4',
    video_duration_seconds: 600,
    module_number: 2, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 2: 3 lessons')

  // Module 3: Patient Communication Across Racial Difference
  const m3 = await createModule(course.id, {
    title: 'Effective Communication Across Racial Difference',
    description: 'Build skills for patient-centered communication that acknowledges and addresses racial dynamics.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Recognizing Communication Barriers',
    slug: 'communication-barriers',
    description: 'Identify how racial dynamics affect patient-provider communication.',
    content_type: 'video',
    content_url: 'https://example.com/videos/communication-barriers.mp4',
    video_duration_seconds: 540,
    module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Building Trust with Black Patients',
    slug: 'building-trust',
    description: 'Understand how historical and ongoing racism erodes trust and how to rebuild it.',
    content_type: 'video',
    content_url: 'https://example.com/videos/building-trust.mp4',
    video_duration_seconds: 660,
    module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Shared Decision-Making',
    slug: 'shared-decision-making',
    description: 'Practice collaborative approaches to treatment planning.',
    content_type: 'video',
    content_url: 'https://example.com/videos/shared-decision-making.mp4',
    video_duration_seconds: 600,
    module_number: 3, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 3: 3 lessons')

  // Module 4: Systemic Change in Healthcare
  const m4 = await createModule(course.id, {
    title: 'Advancing Systemic Change',
    description: 'Move beyond individual awareness to organizational and system-level transformation.',
    sort_order: 4
  })

  await createLesson(course.id, m4.id, {
    title: 'Addressing Systemic Barriers to Access',
    slug: 'systemic-barriers',
    description: 'Identify and remove organizational barriers to healthcare access for Black patients.',
    content_type: 'video',
    content_url: 'https://example.com/videos/systemic-barriers.mp4',
    video_duration_seconds: 660,
    module_number: 4, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m4.id, {
    title: 'Increasing Representation in Healthcare',
    slug: 'increasing-representation',
    description: 'Work toward a healthcare workforce that reflects the communities served.',
    content_type: 'video',
    content_url: 'https://example.com/videos/increasing-representation.mp4',
    video_duration_seconds: 600,
    module_number: 4, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m4.id, {
    title: 'Implementing Anti-Racist Clinical Practices',
    slug: 'anti-racist-practices',
    description: 'Embed anti-racism into clinical protocols, guidelines, and organizational culture.',
    content_type: 'video',
    content_url: 'https://example.com/videos/anti-racist-practices.mp4',
    video_duration_seconds: 720,
    module_number: 4, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m4.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-healthcare',
    description: 'Comprehensive assessment of healthcare anti-racism knowledge.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is the "pain gap" in healthcare?',
          options: [
            'The difference between what patients report and what doctors believe',
            'Systematic under-assessment and under-treatment of pain in Black patients due to false biological beliefs',
            'The time between requesting pain medication and receiving it',
            'Differences in pain tolerance across populations'
          ],
          correct_answer: 1,
          explanation: 'The "pain gap" refers to the well-documented phenomenon where Black patients\' pain is systematically under-assessed and under-treated compared to white patients. Research shows many healthcare providers hold false beliefs about biological differences (e.g., that Black people have thicker skin or higher pain tolerance), leading to inadequate pain management.'
        },
        {
          question: 'What do Canadian data show about Black maternal health outcomes?',
          options: [
            'No significant disparities exist in Canada',
            'Black women experience higher rates of severe maternal morbidity and mortality',
            'Black women receive better prenatal care than other groups',
            'Maternal health disparities are only a U.S. problem'
          ],
          correct_answer: 1,
          explanation: 'Canadian data show that Black women, particularly Black immigrants and refugees, experience significantly higher rates of severe maternal morbidity and complications compared to white women. Studies also indicate higher risks of preterm birth, low birth weight, and pregnancy-related complications even when controlling for socioeconomic factors.'
        },
        {
          question: 'Why is trust often lower between Black patients and healthcare providers?',
          options: [
            'Black patients are naturally distrustful',
            'Historical and ongoing experiences of discrimination, dismissal, and harm in healthcare settings',
            'Cultural differences in communication styles',
            'Lack of health literacy'
          ],
          correct_answer: 1,
          explanation: 'Lower trust is a rational response to both historical harms (forced sterilization, unethical experimentation) and ongoing experiences of discrimination, dismissal of symptoms, and differential treatment. When patients consistently report not being believed or receiving substandard care, trust erodes. This isn\'t about culture or literacy—it\'s about justified wariness based on experience.'
        },
        {
          question: 'What is the most effective approach to reducing healthcare disparities?',
          options: [
            'Cultural competency training alone',
            'Systemic changes in policies, protocols, workforce diversity, and accountability for outcomes',
            'Asking Black patients to be more assertive',
            'Providing translation services'
          ],
          correct_answer: 1,
          explanation: 'While individual education matters, sustainable change requires systemic approaches: collecting and analyzing race-based outcome data, revising clinical protocols to reduce bias, increasing workforce diversity at all levels, removing barriers to access, and creating accountability for equitable outcomes. Training alone, without structural change, has limited impact.'
        }
      ],
      passing_score: 80,
      time_limit_minutes: 15
    },
    module_number: 4, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 4: 4 lessons')
  console.log('✅ Course 10 complete: 4 modules, 14 lessons\n')
}

console.log('=== PHASE 1 PART 2 POPULATION ===\n')

async function runAll() {
  await populateHRAdvanced()
  await populateHealthcareABR()
}

runAll()
  .then(() => console.log('\n✅ PART 2 COMPLETE: 2 more courses populated!'))
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
