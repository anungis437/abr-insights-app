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

// Course 23: Media Representation and Ethical Storytelling
async function populateMediaStorytelling() {
  console.log('\n📚 Course 23: Media Representation and Ethical Storytelling')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'media-storytelling').single()
  if (!course) { console.log('❌ Course not found'); return }

  const m1 = await createModule(course.id, {
    title: 'Anti-Black Bias in Media Representation',
    description: 'Examine how media perpetuates harmful stereotypes and narratives.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction: Media and Anti-Black Racism',
    slug: 'intro-media-racism',
    description: 'Understand media\'s role in shaping public perceptions of Black communities.',
    content_type: 'video', content_url: 'https://example.com/videos/intro-media-racism.mp4',
    video_duration_seconds: 540, module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Crime Coverage and Dehumanization',
    slug: 'crime-coverage-dehumanization',
    description: 'Examine how crime reporting perpetuates anti-Black stereotypes.',
    content_type: 'video', content_url: 'https://example.com/videos/crime-coverage-dehumanization.mp4',
    video_duration_seconds: 720, module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Deficit Narratives and Invisibility',
    slug: 'deficit-narratives-invisibility',
    description: 'Understand how media focuses on problems while ignoring contributions.',
    content_type: 'video', content_url: 'https://example.com/videos/deficit-narratives-invisibility.mp4',
    video_duration_seconds: 660, module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'Language Choices and Framing',
    slug: 'language-choices-framing',
    description: 'Examine how word choice perpetuates bias in reporting.',
    content_type: 'video', content_url: 'https://example.com/videos/language-choices-framing.mp4',
    video_duration_seconds: 600, module_number: 1, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 1: 4 lessons')

  const m2 = await createModule(course.id, {
    title: 'Ethical Journalism and Storytelling Practices',
    description: 'Learn principles for reporting that does not perpetuate harm.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Centering Black Voices and Expertise',
    slug: 'centering-black-voices-media',
    description: 'Move beyond tokenism to authentic representation.',
    content_type: 'video', content_url: 'https://example.com/videos/centering-black-voices-media.mp4',
    video_duration_seconds: 660, module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Avoiding Exploitative Storytelling',
    slug: 'avoiding-exploitative-storytelling',
    description: 'Report with dignity, not trauma porn.',
    content_type: 'video', content_url: 'https://example.com/videos/avoiding-exploitative-storytelling.mp4',
    video_duration_seconds: 720, module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Context and Root Causes, Not Just Incidents',
    slug: 'context-root-causes',
    description: 'Report systemic issues, not just individual events.',
    content_type: 'video', content_url: 'https://example.com/videos/context-root-causes.mp4',
    video_duration_seconds: 600, module_number: 2, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m2.id, {
    title: 'Fact-Checking Your Own Bias',
    slug: 'fact-checking-bias',
    description: 'Interrogate assumptions before publishing.',
    content_type: 'video', content_url: 'https://example.com/videos/fact-checking-bias.mp4',
    video_duration_seconds: 540, module_number: 2, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 2: 4 lessons')

  const m3 = await createModule(course.id, {
    title: 'Diversity and Inclusion in Media Institutions',
    description: 'Address systemic barriers in newsrooms and media organizations.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'The Whiteness of Canadian Newsrooms',
    slug: 'whiteness-canadian-newsrooms',
    description: 'Examine lack of Black journalists and editors in Canadian media.',
    content_type: 'video', content_url: 'https://example.com/videos/whiteness-canadian-newsrooms.mp4',
    video_duration_seconds: 660, module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Hiring, Retention, and Advancement',
    slug: 'hiring-retention-advancement-media',
    description: 'Move beyond "pipeline problem" narratives to address retention.',
    content_type: 'video', content_url: 'https://example.com/videos/hiring-retention-advancement-media.mp4',
    video_duration_seconds: 720, module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Editorial Decision-Making Power',
    slug: 'editorial-decision-making',
    description: 'Who decides what stories matter? Address power in newsrooms.',
    content_type: 'video', content_url: 'https://example.com/videos/editorial-decision-making.mp4',
    video_duration_seconds: 600, module_number: 3, lesson_number: 3, sort_order: 3
  })
  console.log('✅ Module 3: 3 lessons')

  const m4 = await createModule(course.id, {
    title: 'Media Accountability and Public Trust',
    description: 'Building accountability mechanisms and repairing harm.',
    sort_order: 4
  })

  await createLesson(course.id, m4.id, {
    title: 'Public Editors and Accountability Mechanisms',
    slug: 'accountability-mechanisms',
    description: 'Create systems for addressing harm in reporting.',
    content_type: 'video', content_url: 'https://example.com/videos/accountability-mechanisms.mp4',
    video_duration_seconds: 660, module_number: 4, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m4.id, {
    title: 'Corrections, Apologies, and Repair',
    slug: 'corrections-apologies-repair',
    description: 'Address past harm with meaningful action, not just words.',
    content_type: 'video', content_url: 'https://example.com/videos/corrections-apologies-repair.mp4',
    video_duration_seconds: 600, module_number: 4, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m4.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-media',
    description: 'Comprehensive assessment of ethical storytelling knowledge.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'How does crime coverage perpetuate anti-Black racism?',
          options: [
            'Crime reporting is always objective',
            'Media disproportionately associates Black people with crime, uses dehumanizing language, and omits context while over-reporting white perpetrators as anomalies',
            'Crime should not be reported',
            'All crime coverage is racist'
          ],
          correct_answer: 1,
          explanation: 'Studies show media disproportionately depicts Black people as criminals relative to actual crime data, uses dehumanizing language ("thug," "gang member") more often for Black suspects, publishes mugshots of Black accused more frequently, and frames Black crime as inherent while white crime is contextualized as anomaly. This perpetuates stereotypes linking Blackness with criminality, influences public perception and policy, and dehumanizes victims when they are Black. Ethical reporting requires: equal treatment, humanizing language, systemic context, and interrogating editorial choices.'
        },
        {
          question: 'What are deficit narratives in media?',
          options: [
            'Reporting on community challenges',
            'Media patterns that focus only on problems, pathology, and deficits in Black communities while ignoring contributions, resilience, and systemic causes',
            'Balanced reporting',
            'Only positive stories should be told'
          ],
          correct_answer: 1,
          explanation: 'Deficit narratives frame Black communities solely through problems—poverty, crime, broken families—without context, systemic analysis, or stories of achievement, culture, joy, and resistance. This creates false perception that issues are inherent to Blackness rather than products of racism. Ethical reporting requires: centering Black voices and expertise, reporting systemic causes not just symptoms, including stories of contribution/resilience, and avoiding trauma porn. Balance does not mean ignoring problems—it means contextualizing them within larger realities of community strength and systemic oppression.'
        },
        {
          question: 'Why does newsroom diversity matter?',
          options: [
            'For appearances only',
            'Diverse newsrooms including Black journalists shape what stories are covered, how they are framed, what sources are consulted, and what is considered newsworthy',
            'Only for reporting on Black communities',
            'Diversity does not affect journalism quality'
          ],
          correct_answer: 1,
          explanation: 'Homogeneous (white) newsrooms perpetuate bias through: what stories are deemed important, how issues are framed, which sources are considered credible, what language is used, and what is scrutinized vs accepted. Black journalists bring lived experience, community connections, and critical lens that challenges dominant narratives. However, diversity alone is insufficient—Black journalists must have decision-making power (not just hired to cover "Black issues"), supportive environments, and pathways to leadership. Newsroom diversity is about power: who decides what the public hears?'
        },
        {
          question: 'What does ethical accountability in media require?',
          options: [
            'Never admitting mistakes',
            'Systems for community feedback, transparent corrections processes, meaningful apologies, material repair for harm, and ongoing relationship with affected communities',
            'Only issuing corrections when sued',
            'Accountability is not necessary for media'
          ],
          correct_answer: 1,
          explanation: 'Ethical accountability goes beyond legal requirements to include: accessible mechanisms for community feedback (not just comment sections), transparent processes for investigating concerns, prominent corrections (not buried), meaningful apologies acknowledging specific harm, material repair (not just words), and ongoing accountability relationships with Black communities. One-off corrections are insufficient—accountability requires systemic change: examining patterns of harm, changing editorial practices, involving communities in decision-making, and demonstrating change over time. Media must earn trust through consistent action, not performative diversity statements.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 15
    },
    module_number: 4, lesson_number: 3, sort_order: 3
  })
  console.log('✅ Module 4: 3 lessons')
  console.log('✅ Course 23 complete: 4 modules, 14 lessons\n')
}

// Course 24: Public Policy and Legislative Advocacy
async function populatePublicPolicyAdvocacy() {
  console.log('\n📚 Course 24: Public Policy and Legislative Advocacy')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'public-policy-advocacy').single()
  if (!course) { console.log('❌ Course not found'); return }

  const m1 = await createModule(course.id, {
    title: 'Analyzing Policy Through a Racial Equity Lens',
    description: 'Develop skills to assess how policies perpetuate or address racism.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction: Policy and Racial Equity',
    slug: 'intro-policy-equity',
    description: 'Understand how policy shapes racial inequity in Canada.',
    content_type: 'video', content_url: 'https://example.com/videos/intro-policy-equity.mp4',
    video_duration_seconds: 540, module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Racial Equity Impact Assessments',
    slug: 'racial-equity-impact-assessments',
    description: 'Learn to conduct assessments examining policy impacts on Black communities.',
    content_type: 'video', content_url: 'https://example.com/videos/racial-equity-impact-assessments.mp4',
    video_duration_seconds: 720, module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Facially Neutral Policies with Racist Outcomes',
    slug: 'neutral-policies-racist-outcomes',
    description: 'Identify policies that do not mention race but harm Black communities.',
    content_type: 'video', content_url: 'https://example.com/videos/neutral-policies-racist-outcomes.mp4',
    video_duration_seconds: 660, module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'Disaggregating Data by Race',
    slug: 'disaggregating-data-race',
    description: 'Understand why race-based data is essential for equity policy.',
    content_type: 'video', content_url: 'https://example.com/videos/disaggregating-data-race.mp4',
    video_duration_seconds: 600, module_number: 1, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 1: 4 lessons')

  const m2 = await createModule(course.id, {
    title: 'Advocacy Strategies for Racial Equity',
    description: 'Build skills to influence policy decisions and systems.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Mapping Power: Who Makes Policy Decisions?',
    slug: 'mapping-power',
    description: 'Identify key decision-makers and influence points.',
    content_type: 'video', content_url: 'https://example.com/videos/mapping-power.mp4',
    video_duration_seconds: 660, module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Building Evidence-Based Cases for Change',
    slug: 'evidence-based-cases',
    description: 'Combine data, narrative, and community voice for advocacy.',
    content_type: 'video', content_url: 'https://example.com/videos/evidence-based-cases.mp4',
    video_duration_seconds: 720, module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Engaging Elected Officials and Bureaucrats',
    slug: 'engaging-officials',
    description: 'Effective strategies for working with policymakers.',
    content_type: 'video', content_url: 'https://example.com/videos/engaging-officials.mp4',
    video_duration_seconds: 600, module_number: 2, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m2.id, {
    title: 'Media Advocacy and Public Opinion',
    slug: 'media-advocacy',
    description: 'Use media strategically to build support for policy change.',
    content_type: 'video', content_url: 'https://example.com/videos/media-advocacy.mp4',
    video_duration_seconds: 540, module_number: 2, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 2: 4 lessons')

  const m3 = await createModule(course.id, {
    title: 'Coalition Building and Community Organizing',
    description: 'Mobilize collective power for policy change.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Building Cross-Sector Coalitions',
    slug: 'cross-sector-coalitions',
    description: 'Unite diverse organizations around shared policy goals.',
    content_type: 'video', content_url: 'https://example.com/videos/cross-sector-coalitions.mp4',
    video_duration_seconds: 660, module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Grassroots Organizing and Community Power',
    slug: 'grassroots-organizing',
    description: 'Build power from community up, not top-down.',
    content_type: 'video', content_url: 'https://example.com/videos/grassroots-organizing.mp4',
    video_duration_seconds: 720, module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Sustaining Movements Beyond Single Campaigns',
    slug: 'sustaining-movements',
    description: 'Build long-term power, not just win one policy fight.',
    content_type: 'video', content_url: 'https://example.com/videos/sustaining-movements.mp4',
    video_duration_seconds: 600, module_number: 3, lesson_number: 3, sort_order: 3
  })
  console.log('✅ Module 3: 3 lessons')

  const m4 = await createModule(course.id, {
    title: 'Policy Implementation and Accountability',
    description: 'Ensure policies are implemented equitably and hold systems accountable.',
    sort_order: 4
  })

  await createLesson(course.id, m4.id, {
    title: 'From Policy to Practice: Implementation Matters',
    slug: 'policy-implementation',
    description: 'Monitor how policies are actually implemented on the ground.',
    content_type: 'video', content_url: 'https://example.com/videos/policy-implementation.mp4',
    video_duration_seconds: 660, module_number: 4, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m4.id, {
    title: 'Accountability Mechanisms and Oversight',
    slug: 'accountability-oversight',
    description: 'Build systems to ensure ongoing compliance and equity outcomes.',
    content_type: 'video', content_url: 'https://example.com/videos/accountability-oversight.mp4',
    video_duration_seconds: 720, module_number: 4, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m4.id, {
    title: 'When Advocacy Fails: Next Steps',
    slug: 'when-advocacy-fails',
    description: 'Strategies when policy advocacy does not succeed.',
    content_type: 'video', content_url: 'https://example.com/videos/when-advocacy-fails.mp4',
    video_duration_seconds: 600, module_number: 4, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m4.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-policy',
    description: 'Comprehensive assessment of policy advocacy knowledge.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is a Racial Equity Impact Assessment (REIA)?',
          options: [
            'Only for policies that mention race',
            'A systematic examination of how proposed policies will affect racial equity, identifying disparate impacts before implementation',
            'Not necessary for policy-making',
            'Only retrospective analysis'
          ],
          correct_answer: 1,
          explanation: 'A Racial Equity Impact Assessment (REIA) is a systematic process conducted before policy implementation to: identify how policy will affect different racial groups, predict disparate impacts using data and community input, examine whether policy addresses or perpetuates inequity, and propose modifications to advance equity. REIAs are critical because facially neutral policies often have racist outcomes when historical context and current disparities are ignored. They require disaggregated data, community engagement, and commitment to modify/reject policies that harm Black communities—not just documenting harm.'
        },
        {
          question: 'What are facially neutral policies with racist outcomes?',
          options: [
            'Policies that do not mention race cannot be racist',
            'Policies that do not explicitly mention race but perpetuate racial inequity through disparate impacts, often due to historical context',
            'All neutral policies are fair',
            'Only explicitly racist policies cause harm'
          ],
          correct_answer: 1,
          explanation: 'Facially neutral policies do not mention race but perpetuate inequity due to historical context and current disparities. Examples: minimum sentencing laws (appear neutral but disproportionately incarcerate Black people due to biased policing), school funding based on property taxes (perpetuates segregation and under-resourcing in Black neighborhoods), credit score requirements (reflect historical discrimination in lending). These policies maintain systemic racism precisely because they ignore racial context. Colorblindness in policy is not neutral—it perpetuates existing inequity by refusing to address it.'
        },
        {
          question: 'Why is disaggregated race-based data essential for equity policy?',
          options: [
            'Collecting race data is divisive',
            'Without data showing how policies affect different racial groups, it is impossible to identify disparities, measure progress, or hold systems accountable',
            'Colorblind policies are better',
            'Data is not important for policy'
          ],
          correct_answer: 1,
          explanation: 'Race-based data is essential because: you cannot address what you do not measure, aggregate data hides disparities (averaging Black and white outcomes makes racism invisible), policy claims about equity cannot be verified without tracking outcomes by race, and systems cannot be held accountable without evidence. Arguments against collecting race data ("divisive," "creates division") perpetuate racism by making inequity invisible. Disaggregated data reveals disparate impacts and forces acknowledgment of systemic racism—that is why it is resisted. Evidence-based equity policy is impossible without race data.'
        },
        {
          question: 'What does effective policy implementation monitoring require?',
          options: [
            'Assuming policies work as intended',
            'Tracking outcomes by race, community feedback, enforcement data, ongoing adjustments, and accountability for failing to achieve equity goals',
            'Just passing the policy is enough',
            'Implementation does not matter'
          ],
          correct_answer: 1,
          explanation: 'Policy wins mean nothing if implementation fails or perpetuates inequity. Effective monitoring requires: disaggregated outcome data (are racial disparities closing?), community feedback from those most impacted, enforcement/compliance data (is policy being implemented?), identification of barriers and unintended consequences, ongoing adjustments based on evidence, and accountability consequences when systems fail to achieve equity. Too often, "equity policies" are passed but never funded, enforced, or monitored—allowing systems to claim progress without change. Advocates must stay engaged beyond policy passage to ensure real implementation and impact.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 15
    },
    module_number: 4, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 4: 4 lessons')
  console.log('✅ Course 24 complete: 4 modules, 15 lessons\n')
}

console.log('=== PHASE 3 PART 3 POPULATION ===\n')

async function runAll() {
  await populateMediaStorytelling()
  await populatePublicPolicyAdvocacy()
}

runAll()
  .then(() => console.log('\n✅ PART 3 COMPLETE: Final 2 Phase 3 courses populated!\n🎉 ALL 6 PHASE 3 COURSES NOW COMPLETE!'))
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
