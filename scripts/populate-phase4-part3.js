const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  '***REMOVED***',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.***REMOVED***.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
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

// Course 29: Trauma-Informed Anti-Racist Care
async function populateTraumaInformedCare() {
  console.log('\n📚 Course 29: Trauma-Informed Anti-Racist Care')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'trauma-informed-care').single()
  if (!course) { console.log('❌ Course not found'); return }

  const m1 = await createModule(course.id, {
    title: 'Understanding Racial Trauma',
    description: 'Learn about trauma caused by racism and its manifestations.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction: What is Racial Trauma?',
    slug: 'intro-racial-trauma',
    description: 'Understand race-based traumatic stress and its legitimacy.',
    content_type: 'video', content_url: 'https://example.com/videos/intro-racial-trauma.mp4',
    video_duration_seconds: 600, module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Individual and Collective Trauma',
    slug: 'individual-collective-trauma',
    description: 'Distinguish between personal experiences and community-wide trauma.',
    content_type: 'video', content_url: 'https://example.com/videos/individual-collective-trauma.mp4',
    video_duration_seconds: 720, module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Historical and Intergenerational Trauma',
    slug: 'historical-intergenerational',
    description: 'Understand trauma passed through generations.',
    content_type: 'video', content_url: 'https://example.com/videos/historical-intergenerational.mp4',
    video_duration_seconds: 660, module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'Symptoms and Manifestations',
    slug: 'symptoms-manifestations',
    description: 'Recognize how racial trauma presents physically and psychologically.',
    content_type: 'video', content_url: 'https://example.com/videos/symptoms-manifestations.mp4',
    video_duration_seconds: 600, module_number: 1, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 1: 4 lessons')

  const m2 = await createModule(course.id, {
    title: 'Trauma-Informed Principles in Anti-Racist Context',
    description: 'Apply trauma-informed care principles to address racial trauma.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Safety: Physical and Psychological',
    slug: 'safety-physical-psychological',
    description: 'Create environments where Black people feel safe.',
    content_type: 'video', content_url: 'https://example.com/videos/safety-physical-psychological.mp4',
    video_duration_seconds: 660, module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Trustworthiness and Transparency',
    slug: 'trustworthiness-transparency',
    description: 'Build trust through accountability and honesty about racism.',
    content_type: 'video', content_url: 'https://example.com/videos/trustworthiness-transparency.mp4',
    video_duration_seconds: 720, module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Choice, Collaboration, and Empowerment',
    slug: 'choice-collaboration-empowerment',
    description: 'Center Black agency and self-determination.',
    content_type: 'video', content_url: 'https://example.com/videos/choice-collaboration-empowerment.mp4',
    video_duration_seconds: 600, module_number: 2, lesson_number: 3, sort_order: 3
  })
  console.log('✅ Module 2: 3 lessons')

  const m3 = await createModule(course.id, {
    title: 'Preventing Re-traumatization',
    description: 'Avoid causing additional harm in systems and services.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Recognizing and Preventing Institutional Betrayal',
    slug: 'institutional-betrayal',
    description: 'Understand how institutions re-traumatize through broken trust.',
    content_type: 'video', content_url: 'https://example.com/videos/institutional-betrayal.mp4',
    video_duration_seconds: 660, module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Addressing Microaggressions and Daily Assaults',
    slug: 'microaggressions-daily-assaults',
    description: 'Interrupt the cumulative impact of "minor" racist incidents.',
    content_type: 'video', content_url: 'https://example.com/videos/microaggressions-daily-assaults.mp4',
    video_duration_seconds: 720, module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Healing Justice and Community Care',
    slug: 'healing-justice-community-care',
    description: 'Learn from Black-led healing and wellness models.',
    content_type: 'video', content_url: 'https://example.com/videos/healing-justice-community-care.mp4',
    video_duration_seconds: 600, module_number: 3, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-trauma',
    description: 'Comprehensive assessment of trauma-informed care knowledge.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is racial trauma?',
          options: [
            'Not a legitimate clinical issue',
            'Race-based traumatic stress from experiencing racism—including discrimination, violence, microaggressions, and systemic oppression—that causes psychological and physical harm',
            'Only happens with extreme violence',
            'Same as general trauma'
          ],
          correct_answer: 1,
          explanation: 'Racial trauma (race-based traumatic stress) is the psychological and physical harm caused by experiences of racism. It includes: direct discrimination and violence, witnessing violence against other Black people, microaggressions and daily assaults, systemic oppression and marginalization, fear for safety due to racism. Symptoms mirror PTSD: hypervigilance, anxiety, depression, anger, physical health impacts, intrusive thoughts. Racial trauma is cumulative—small incidents compound over time. It is intergenerational—passed through families and communities. It is legitimate clinical issue requiring trauma-informed, culturally responsive treatment—not pathologizing natural responses to oppression.'
        },
        {
          question: 'How do you apply trauma-informed principles in anti-racist context?',
          options: [
            'Trauma-informed care is enough without addressing racism',
            'Apply principles of safety, trustworthiness, choice, collaboration, and empowerment while naming and addressing racism as source of trauma',
            'Ignore race and focus only on trauma',
            'Trauma-informed care is only for clinical settings'
          ],
          correct_answer: 1,
          explanation: 'Trauma-informed care in anti-racist context requires: Safety—Create physical and psychological safety, recognize racism as safety threat, address racist policies and practices. Trustworthiness—Be transparent about institutional racism, acknowledge harm, build trust through accountability. Choice and collaboration—Center Black agency and self-determination, recognize resilience and resistance not just victimhood. Empowerment—Support Black leadership, validate experiences of racism, provide resources and tools. Cultural responsiveness—Understand cultural context of trauma, work with community healers, avoid pathologizing cultural coping. Critical difference: mainstream trauma-informed care often ignores racism as trauma source—anti-racist approach names and addresses racism directly.'
        },
        {
          question: 'What is re-traumatization and how can it be prevented?',
          options: [
            'Re-traumatization does not happen in helping professions',
            'Re-traumatization occurs when systems and services cause additional harm—prevent it by addressing racism, building trust, avoiding power-over dynamics, and centering safety',
            'Only about reminding people of past trauma',
            'Cannot be prevented'
          ],
          correct_answer: 1,
          explanation: 'Re-traumatization happens when systems/services meant to help cause additional harm. For Black people, this includes: Being disbelieved or dismissed when reporting racism, Facing racism from providers meant to help, Institutional betrayal (organization ignores or covers up harm), Coercive practices removing choice and autonomy, Microaggressions and stereotyping, Culturally inappropriate or harmful interventions. Preventing re-traumatization: Address systemic racism in your institution, Build accountability for racist harm, Create genuine safety not just physical but psychological, Respect Black people\'s autonomy and choices, Hire and support Black providers, Listen and believe when Black people name racism, Avoid power-over dynamics, Center healing and restoration not punishment.'
        },
        {
          question: 'What is vicarious trauma for anti-racism practitioners?',
          options: [
            'Not real—practitioners should just be tougher',
            'The emotional and psychological impact of repeatedly witnessing or addressing racism and trauma—requires self-care, supervision, and organizational support',
            'Only affects weak people',
            'Same for everyone regardless of race'
          ],
          correct_answer: 1,
          explanation: 'Vicarious trauma (secondary traumatic stress, compassion fatigue) affects people doing anti-racism work, especially Black practitioners: Repeatedly hearing/witnessing racist harm, Carrying others\' racial trauma, Working in racist institutions while addressing racism, Experiencing own racism while supporting others, Emotional labor of educating and managing white fragility. Symptoms: burnout, cynicism, hopelessness, anxiety, physical health issues, numbing. For Black practitioners: compounded by own experiences of racism, higher expectations and scrutiny, less institutional support. Addressing it requires: Organizational responsibility (not just individual self-care), Supervision and peer support, Rest and boundaries, Healing-centered approaches, Addressing root causes (institutional racism) not just symptoms. Self-care is not bubble baths—it is systemic change.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 15
    },
    module_number: 3, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 3: 4 lessons')
  console.log('✅ Course 29 complete: 3 modules, 11 lessons\n')
}

// Course 30: Building Anti-Racist Organizations from the Ground Up
async function populateBuildingOrganizations() {
  console.log('\n📚 Course 30: Building Anti-Racist Organizations')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'building-antiracist-organizations').single()
  if (!course) { console.log('❌ Course not found'); return }

  const m1 = await createModule(course.id, {
    title: 'Conducting Organizational Anti-Racism Audits',
    description: 'Assess your organization\'s current state and identify areas for change.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction: What is an Anti-Racist Organization?',
    slug: 'intro-antiracist-org',
    description: 'Define characteristics of truly anti-racist organizations.',
    content_type: 'video', content_url: 'https://example.com/videos/intro-antiracist-org.mp4',
    video_duration_seconds: 600, module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Data Collection and Analysis',
    slug: 'data-collection-analysis',
    description: 'Gather comprehensive data on representation, experiences, and outcomes.',
    content_type: 'video', content_url: 'https://example.com/videos/data-collection-analysis.mp4',
    video_duration_seconds: 720, module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Assessing Policies and Practices',
    slug: 'assessing-policies-practices',
    description: 'Review organizational policies for racist impacts.',
    content_type: 'video', content_url: 'https://example.com/videos/assessing-policies-practices.mp4',
    video_duration_seconds: 660, module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'Workplace Climate Assessment',
    slug: 'workplace-climate-assessment',
    description: 'Understand experiences of Black employees through surveys and listening.',
    content_type: 'video', content_url: 'https://example.com/videos/workplace-climate-assessment.mp4',
    video_duration_seconds: 600, module_number: 1, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 1: 4 lessons')

  const m2 = await createModule(course.id, {
    title: 'Strategic Planning for Anti-Racism',
    description: 'Develop comprehensive strategic plans with measurable goals.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Setting Meaningful Goals and Metrics',
    slug: 'setting-goals-metrics',
    description: 'Move beyond vague commitments to specific, measurable goals.',
    content_type: 'video', content_url: 'https://example.com/videos/setting-goals-metrics.mp4',
    video_duration_seconds: 660, module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Resource Allocation and Budget',
    slug: 'resource-allocation-budget',
    description: 'Commit financial resources proportional to anti-racism goals.',
    content_type: 'video', content_url: 'https://example.com/videos/resource-allocation-budget.mp4',
    video_duration_seconds: 720, module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Timeline and Phased Approach',
    slug: 'timeline-phased-approach',
    description: 'Create realistic timelines balancing urgency with sustainability.',
    content_type: 'video', content_url: 'https://example.com/videos/timeline-phased-approach.mp4',
    video_duration_seconds: 600, module_number: 2, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m2.id, {
    title: 'Centering Black Leadership',
    slug: 'centering-black-leadership',
    description: 'Ensure Black people lead anti-racism strategy not just advise.',
    content_type: 'video', content_url: 'https://example.com/videos/centering-black-leadership.mp4',
    video_duration_seconds: 660, module_number: 2, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 2: 4 lessons')

  const m3 = await createModule(course.id, {
    title: 'Building Accountability Structures',
    description: 'Create mechanisms to ensure follow-through and address harm.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Anti-Racism Committees and Working Groups',
    slug: 'committees-working-groups',
    description: 'Structure, power, and resources for anti-racism bodies.',
    content_type: 'video', content_url: 'https://example.com/videos/committees-working-groups.mp4',
    video_duration_seconds: 660, module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Reporting and Transparency',
    slug: 'reporting-transparency',
    description: 'Public reporting on progress, setbacks, and next steps.',
    content_type: 'video', content_url: 'https://example.com/videos/reporting-transparency.mp4',
    video_duration_seconds: 720, module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Consequences for Racist Harm',
    slug: 'consequences-racist-harm',
    description: 'Develop clear processes for addressing racism and misconduct.',
    content_type: 'video', content_url: 'https://example.com/videos/consequences-racist-harm.mp4',
    video_duration_seconds: 600, module_number: 3, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Accountability to Black Communities',
    slug: 'accountability-black-communities',
    description: 'Build relationships and accountability beyond your organization.',
    content_type: 'video', content_url: 'https://example.com/videos/accountability-black-communities.mp4',
    video_duration_seconds: 660, module_number: 3, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 3: 4 lessons')

  const m4 = await createModule(course.id, {
    title: 'Transforming HR and People Practices',
    description: 'Overhaul recruitment, hiring, retention, and advancement.',
    sort_order: 4
  })

  await createLesson(course.id, m4.id, {
    title: 'Anti-Racist Recruitment and Hiring',
    slug: 'antiracist-recruitment-hiring',
    description: 'Build authentic pipelines and equitable processes.',
    content_type: 'video', content_url: 'https://example.com/videos/antiracist-recruitment-hiring.mp4',
    video_duration_seconds: 660, module_number: 4, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m4.id, {
    title: 'Equitable Compensation and Benefits',
    slug: 'equitable-compensation-benefits',
    description: 'Address pay equity and benefits that support Black employees.',
    content_type: 'video', content_url: 'https://example.com/videos/equitable-compensation-benefits.mp4',
    video_duration_seconds: 720, module_number: 4, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m4.id, {
    title: 'Performance Management and Advancement',
    slug: 'performance-advancement',
    description: 'Create equitable evaluation and promotion processes.',
    content_type: 'video', content_url: 'https://example.com/videos/performance-advancement.mp4',
    video_duration_seconds: 600, module_number: 4, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m4.id, {
    title: 'Support Systems and Employee Resource Groups',
    slug: 'support-systems-ergs',
    description: 'Properly resource Black employee support with real power.',
    content_type: 'video', content_url: 'https://example.com/videos/support-systems-ergs.mp4',
    video_duration_seconds: 660, module_number: 4, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 4: 4 lessons')

  const m5 = await createModule(course.id, {
    title: 'Sustaining Anti-Racism Commitment',
    description: 'Move beyond performative moments to long-term transformation.',
    sort_order: 5
  })

  await createLesson(course.id, m5.id, {
    title: 'Beyond Performative Statements',
    slug: 'beyond-performative-statements',
    description: 'Match actions to words with sustained commitment.',
    content_type: 'video', content_url: 'https://example.com/videos/beyond-performative-statements.mp4',
    video_duration_seconds: 660, module_number: 5, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m5.id, {
    title: 'Leadership Accountability',
    slug: 'leadership-accountability',
    description: 'Hold executives and board accountable for anti-racism progress.',
    content_type: 'video', content_url: 'https://example.com/videos/leadership-accountability.mp4',
    video_duration_seconds: 720, module_number: 5, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m5.id, {
    title: 'Navigating Backlash and Resistance',
    slug: 'navigating-backlash-resistance',
    description: 'Maintain commitment when facing pushback.',
    content_type: 'video', content_url: 'https://example.com/videos/navigating-backlash-resistance.mp4',
    video_duration_seconds: 600, module_number: 5, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m5.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-building-orgs',
    description: 'Comprehensive assessment of building anti-racist organizations.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What makes an organization truly anti-racist?',
          options: [
            'Hiring diverse employees',
            'Systemic commitment to identifying and dismantling racism in policies, practices, culture, and outcomes with accountability and sustained action',
            'Diversity training once a year',
            'Saying "Black Lives Matter"'
          ],
          correct_answer: 1,
          explanation: 'Anti-racist organizations go beyond diversity and inclusion to actively dismantle systemic racism. Characteristics: Leadership commitment with accountability and consequences, Comprehensive audit of policies for racist impacts, Equitable representation at all levels especially leadership, Pay equity and wealth redistribution, Anti-racist culture not just diverse faces, Meaningful power-sharing and Black leadership, Accountability structures with transparency and reporting, Resource allocation proportional to goals, Addressing harm with consequences not excuses, Community accountability beyond organization. It is not performative statements or one-time trainings—it is sustained systemic transformation with resources, power-sharing, and accountability. Measurement includes outcomes not just intentions.'
        },
        {
          question: 'What should be included in an organizational anti-racism audit?',
          options: [
            'Just counting diverse employees',
            'Comprehensive assessment of demographics, policies, pay equity, workplace climate, promotion/retention, complaints/discipline, and community impact',
            'Only what looks good publicly',
            'Audits are not necessary'
          ],
          correct_answer: 1,
          explanation: 'Comprehensive anti-racism audit includes: Demographics—Representation at all levels, pay by race, promotions by race, retention/turnover. Policies—Review hiring, evaluation, discipline, benefits for racist impacts. Workplace climate—Survey Black employees on experiences, safety, belonging, barriers. Complaints and discipline—Analyze who reports, who is believed, who faces consequences. Community impact—Examine who organization serves, harms, excludes. Procurement—Who gets contracts, whose businesses supported. Board and leadership—Who holds power and makes decisions. The audit must be honest about current state not defensive. Share findings transparently with Black employees and communities. Use data to develop targeted action plan with measurable goals and timelines.'
        },
        {
          question: 'How do you create accountability for anti-racism commitments?',
          options: [
            'Trust that people will do the right thing',
            'Build structures with clear goals, regular reporting, consequences for inaction, Black leadership, and community accountability',
            'Accountability is not possible',
            'Just make public statements'
          ],
          correct_answer: 1,
          explanation: 'Accountability structures require: Clear measurable goals with specific timelines, Anti-racism committee with power and resources (not just advisory), Black leadership at decision-making levels, Regular public reporting on progress and setbacks, Consequences for leaders who fail to meet goals (tied to evaluation and compensation), Process for addressing racist harm with real consequences, Community accountability (not just internal), Budget allocation matching stated priorities, Transparency about challenges and failures not just wins. Accountability is not voluntary goodwill—it is built-in expectations with consequences. Leaders must be held responsible for anti-racism progress or lack thereof. Black employees and communities must have power to hold organization accountable, not just provide feedback.'
        },
        {
          question: 'How do you sustain anti-racism work beyond performative moments?',
          options: [
            'Post on social media',
            'Embed anti-racism in organizational DNA through policies, budget, leadership accountability, ongoing learning, and community relationships',
            'Wait for next racial justice movement moment',
            'Sustainability is impossible'
          ],
          correct_answer: 1,
          explanation: 'Sustaining anti-racism requires: Structural embedding—Anti-racism in mission, values, strategic plan, not separate "initiative." Budget commitment—Ongoing funding not one-time allocation, resourced positions not volunteer labor. Leadership accountability—Anti-racism tied to executive evaluations and board governance. Ongoing education—Not one training but continuous learning and development. Policy integration—Anti-racism lens applied to all decisions not siloed in HR/diversity. Black leadership—Not just advisors but decision-makers with power. Long-term planning—Multi-year commitment not reactive to current events. Community relationships—Sustained partnerships not transactional. Addressing backlash—Clear stance when facing pushback, not abandoning commitment. Celebrate progress while continuing work—Acknowledge wins without declaring victory. Anti-racism is not project with end date—it is fundamental organizational practice requiring sustained commitment.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 15
    },
    module_number: 5, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 5: 4 lessons')
  console.log('✅ Course 30 complete: 5 modules, 20 lessons\n')
}

console.log('=== PHASE 4 PART 3 POPULATION (FINAL) ===\n')

async function runAll() {
  await populateTraumaInformedCare()
  await populateBuildingOrganizations()
}

runAll()
  .then(() => console.log('\n✅ PART 3 COMPLETE: Final 2 Phase 4 courses populated!\n✅ ALL 30 COURSES COMPLETE!'))
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
