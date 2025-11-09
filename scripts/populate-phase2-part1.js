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

// Course 13: Indigenous and Black Solidarity
async function populateIndigenousBlackSolidarity() {
  console.log('\n📚 Course 13: Indigenous and Black Solidarity')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'indigenous-black-solidarity').single()
  if (!course) { console.log('❌ Course not found'); return }

  // Module 1: Shared Histories
  const m1 = await createModule(course.id, {
    title: 'Shared Histories of Colonialism and Resistance',
    description: 'Understand the interconnected histories of Indigenous genocide and Black enslavement in Canada, and how both communities resisted.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction: Why Solidarity Matters',
    slug: 'why-solidarity-matters',
    description: 'Understand the importance and potential of Indigenous-Black solidarity.',
    content_type: 'video',
    content_url: 'https://example.com/videos/why-solidarity-matters.mp4',
    video_duration_seconds: 480,
    module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Interconnected Systems of Oppression',
    slug: 'interconnected-oppression',
    description: 'Examine how colonialism, slavery, and white supremacy are linked.',
    content_type: 'video',
    content_url: 'https://example.com/videos/interconnected-oppression.mp4',
    video_duration_seconds: 720,
    module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Historical Examples of Indigenous-Black Solidarity',
    slug: 'historical-solidarity',
    description: 'Learn from Maroon communities, underground railroad cooperation, and shared resistance movements.',
    content_type: 'video',
    content_url: 'https://example.com/videos/historical-solidarity.mp4',
    video_duration_seconds: 660,
    module_number: 1, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 1: 3 lessons')

  // Module 2: Understanding Distinct Experiences
  const m2 = await createModule(course.id, {
    title: 'Honoring Distinct Experiences',
    description: 'Recognize what is shared and what is distinct between Indigenous and Black experiences to avoid erasure.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Land, Sovereignty, and Displacement',
    slug: 'land-sovereignty',
    description: 'Understand Indigenous relationship to land and sovereignty claims.',
    content_type: 'video',
    content_url: 'https://example.com/videos/land-sovereignty.mp4',
    video_duration_seconds: 600,
    module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Chattel Slavery and Diaspora',
    slug: 'slavery-diaspora',
    description: 'Understand Black experiences of forced migration, slavery, and diaspora.',
    content_type: 'video',
    content_url: 'https://example.com/videos/slavery-diaspora.mp4',
    video_duration_seconds: 600,
    module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Avoiding Appropriation and Erasure',
    slug: 'avoiding-appropriation',
    description: 'Learn how to honor both communities without erasing differences or appropriating struggles.',
    content_type: 'video',
    content_url: 'https://example.com/videos/avoiding-appropriation.mp4',
    video_duration_seconds: 660,
    module_number: 2, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m2.id, {
    title: 'Anti-Blackness in Indigenous Communities',
    slug: 'anti-blackness-indigenous',
    description: 'Address anti-Blackness within Indigenous spaces honestly.',
    content_type: 'video',
    content_url: 'https://example.com/videos/anti-blackness-indigenous.mp4',
    video_duration_seconds: 540,
    module_number: 2, lesson_number: 4, sort_order: 4
  })

  await createLesson(course.id, m2.id, {
    title: 'Anti-Indigeneity in Black Communities',
    slug: 'anti-indigeneity-black',
    description: 'Address anti-Indigenous attitudes within Black spaces honestly.',
    content_type: 'video',
    content_url: 'https://example.com/videos/anti-indigeneity-black.mp4',
    video_duration_seconds: 540,
    module_number: 2, lesson_number: 5, sort_order: 5
  })

  console.log('✅ Module 2: 5 lessons')

  // Module 3: Building Authentic Solidarity
  const m3 = await createModule(course.id, {
    title: 'Strategies for Authentic Solidarity',
    description: 'Learn practical approaches to building genuine, accountable relationships and coalitions.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Principles of Solidarity Work',
    slug: 'principles-solidarity',
    description: 'Establish foundational principles for cross-community organizing.',
    content_type: 'video',
    content_url: 'https://example.com/videos/principles-solidarity.mp4',
    video_duration_seconds: 600,
    module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Coalition Building Best Practices',
    slug: 'coalition-building',
    description: 'Learn from successful coalitions and common pitfalls to avoid.',
    content_type: 'video',
    content_url: 'https://example.com/videos/coalition-building.mp4',
    video_duration_seconds: 720,
    module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Case Studies: Successful Solidarity Movements',
    slug: 'case-studies-solidarity',
    description: 'Examine contemporary examples of Indigenous-Black solidarity in action.',
    content_type: 'video',
    content_url: 'https://example.com/videos/case-studies-solidarity.mp4',
    video_duration_seconds: 660,
    module_number: 3, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-solidarity',
    description: 'Comprehensive assessment of solidarity knowledge.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is the foundation of authentic Indigenous-Black solidarity?',
          options: [
            'Assuming both experiences are identical',
            'Recognizing shared oppression while honoring distinct experiences and avoiding appropriation',
            'Focusing only on what is shared',
            'Competing for resources and attention'
          ],
          correct_answer: 1,
          explanation: 'Authentic solidarity requires recognizing both commonalities (shared experiences of white supremacy, colonialism, resistance) and distinctions (Indigenous relationship to land and sovereignty vs. Black experiences of forced migration and diaspora). We must honor both without erasing differences or appropriating struggles that are not our own.'
        },
        {
          question: 'How are colonialism and slavery interconnected systems?',
          options: [
            'They are completely separate with no relationship',
            'Both are systems of white supremacy that relied on dehumanization, exploitation, and violence to extract value from racialized bodies and lands',
            'Only colonialism is a system of white supremacy',
            'They happened in different time periods'
          ],
          correct_answer: 1,
          explanation: 'Colonialism (theft of Indigenous lands, genocide, forced assimilation) and chattel slavery (theft of Black people, forced labor, commodification) are interconnected systems of white supremacy. Both relied on dehumanization, violence, and extraction. They operated simultaneously in Canada and reinforced each other—settler colonialism required displacing Indigenous peoples to create plantation economies that exploited enslaved Black labor.'
        },
        {
          question: 'What does it mean to avoid appropriation in solidarity work?',
          options: [
            'Never mention the other community\'s struggles',
            'Understand and speak to another community\'s struggles without claiming them as your own or using them for personal gain',
            'Only focus on your own community',
            'Copy the other community\'s strategies exactly'
          ],
          correct_answer: 1,
          explanation: 'Avoiding appropriation means we can learn from, support, and show solidarity with another community\'s struggles without claiming them as our own. For example, Black people should not claim Indigenous identity or speak over Indigenous voices on land and sovereignty. Indigenous people should not claim Black identity or speak over Black voices on slavery and diaspora. We stand with, not as, each other.'
        },
        {
          question: 'Why is it important to address anti-Blackness and anti-Indigeneity within our own communities?',
          options: [
            'It\'s not important—focus only on solidarity',
            'Authentic solidarity requires accountability; we cannot build genuine relationships while perpetuating harm against each other',
            'To prove we\'re better than the other community',
            'Only white people need to address racism'
          ],
          correct_answer: 1,
          explanation: 'Solidarity requires accountability. Anti-Blackness exists in some Indigenous communities (e.g., exclusion, stereotypes, colorism). Anti-Indigeneity exists in some Black communities (e.g., invisibilizing Indigenous peoples, benefiting from settlement). We must address these within our own communities, not to shame but to build authentic relationships based on mutual respect and support, not replication of colonial harm.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 15
    },
    module_number: 3, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 3: 4 lessons')
  console.log('✅ Course 13 complete: 3 modules, 12 lessons\n')
}

// Course 14: Allyship Without Tokenism
async function populateAllyshipWithoutTokenism() {
  console.log('\n📚 Course 14: Allyship Without Tokenism')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'allyship-without-tokenism').single()
  if (!course) { console.log('❌ Course not found'); return }

  // Module 1: Recognizing Performative Allyship
  const m1 = await createModule(course.id, {
    title: 'Recognizing Performative Allyship',
    description: 'Distinguish between performative and genuine allyship and understand why the difference matters.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'What is Performative Allyship?',
    slug: 'what-is-performative-allyship',
    description: 'Understand the characteristics and harms of performative allyship.',
    content_type: 'video',
    content_url: 'https://example.com/videos/what-is-performative-allyship.mp4',
    video_duration_seconds: 600,
    module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Tokenism: What It Is and Why It Hurts',
    slug: 'tokenism',
    description: 'Recognize tokenism in hiring, panels, marketing, and decision-making.',
    content_type: 'video',
    content_url: 'https://example.com/videos/tokenism.mp4',
    video_duration_seconds: 660,
    module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Optical Allyship and Corporate Virtue Signaling',
    slug: 'optical-allyship',
    description: 'Examine how organizations perform allyship for public relations without real change.',
    content_type: 'video',
    content_url: 'https://example.com/videos/optical-allyship.mp4',
    video_duration_seconds: 720,
    module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'Self-Examination: Are You Performing?',
    slug: 'self-examination-performing',
    description: 'Reflect on your own motivations and behaviors as an ally.',
    content_type: 'video',
    content_url: 'https://example.com/videos/self-examination-performing.mp4',
    video_duration_seconds: 540,
    module_number: 1, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 1: 4 lessons')

  // Module 2: Genuine Allyship in Practice
  const m2 = await createModule(course.id, {
    title: 'Genuine Allyship in Practice',
    description: 'Learn what genuine allyship looks like in action and how to practice it consistently.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Accountability Over Comfort',
    slug: 'accountability-over-comfort',
    description: 'Prioritize being accountable to Black communities over your own comfort.',
    content_type: 'video',
    content_url: 'https://example.com/videos/accountability-over-comfort.mp4',
    video_duration_seconds: 600,
    module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Using Privilege Strategically',
    slug: 'using-privilege',
    description: 'Learn to leverage privilege for anti-racist outcomes without centering yourself.',
    content_type: 'video',
    content_url: 'https://example.com/videos/using-privilege.mp4',
    video_duration_seconds: 660,
    module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Taking Risks and Accepting Consequences',
    slug: 'taking-risks',
    description: 'Understand that genuine allyship sometimes requires sacrifice and discomfort.',
    content_type: 'video',
    content_url: 'https://example.com/videos/taking-risks.mp4',
    video_duration_seconds: 540,
    module_number: 2, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m2.id, {
    title: 'Building Authentic Relationships',
    slug: 'authentic-relationships',
    description: 'Move beyond transactional allyship to genuine relationships and accountability.',
    content_type: 'video',
    content_url: 'https://example.com/videos/authentic-relationships.mp4',
    video_duration_seconds: 600,
    module_number: 2, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 2: 4 lessons')

  // Module 3: Sustaining Allyship
  const m3 = await createModule(course.id, {
    title: 'Sustaining Allyship Over Time',
    description: 'Develop practices for maintaining genuine allyship beyond initial enthusiasm.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'When You Make Mistakes',
    slug: 'when-mistakes',
    description: 'Learn to receive feedback, apologize meaningfully, and repair harm.',
    content_type: 'video',
    content_url: 'https://example.com/videos/when-mistakes.mp4',
    video_duration_seconds: 660,
    module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Sustaining Commitment Beyond Moments',
    slug: 'sustaining-commitment',
    description: 'Maintain anti-racist action beyond viral moments and trending topics.',
    content_type: 'video',
    content_url: 'https://example.com/videos/sustaining-commitment.mp4',
    video_duration_seconds: 600,
    module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-allyship',
    description: 'Comprehensive assessment of allyship principles.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is performative allyship?',
          options: [
            'Any public support for racial justice',
            'Actions taken primarily for personal benefit, social approval, or organizational image rather than genuine commitment to change',
            'Attending protests or posting on social media',
            'Making mistakes as an ally'
          ],
          correct_answer: 1,
          explanation: 'Performative allyship is action taken primarily for appearance, social credit, or personal benefit rather than genuine commitment to anti-racist change. It often centers the ally rather than those experiencing racism, stops at symbolic gestures without structural change, and disappears when no longer trending. Genuine allyship centers those harmed, takes risks, sustains over time, and prioritizes accountability over comfort.'
        },
        {
          question: 'What is tokenism?',
          options: [
            'Including any Black people in your organization',
            'Including minimal representation of Black people to appear diverse without addressing systemic barriers or sharing power',
            'Celebrating Black History Month',
            'Hiring based on qualifications'
          ],
          correct_answer: 1,
          explanation: 'Tokenism is minimal inclusion for appearance without structural change. Examples: the one Black person on panels, in marketing, or in leadership while systemic barriers remain; asking Black employees to represent all Black people; diversifying optics without diversifying power or decision-making. Tokenism harms by extracting labor, exposing people to hostile environments, and creating illusion of progress without actual equity.'
        },
        {
          question: 'What does it mean to use privilege strategically as an ally?',
          options: [
            'Remind everyone you have privilege',
            'Leverage access, credibility, and resources to advance anti-racist outcomes without centering yourself',
            'Feel guilty about privilege',
            'Give up all privilege'
          ],
          correct_answer: 1,
          explanation: 'Strategic use of privilege means leveraging your access, credibility, and resources for anti-racist outcomes. Examples: amplifying Black voices in rooms they\'re excluded from; using financial resources to fund Black-led organizations; interrupting racism in white spaces; taking professional risks to advocate for equity. Key: center those experiencing harm, not your allyship. Don\'t announce "I\'m using my privilege"—just do it.'
        },
        {
          question: 'When you make a mistake as an ally, what should you do?',
          options: [
            'Defend yourself and explain your intentions',
            'Listen to feedback, apologize without centering your feelings, and commit to changed behavior',
            'Give up on being an ally',
            'Explain why it wasn\'t really a mistake'
          ],
          correct_answer: 1,
          explanation: 'When you harm (and you will): Listen without defensiveness. Apologize specifically for the harm caused, not just for "offense taken." Don\'t center your guilt, intentions, or feelings. Don\'t demand reassurance or emotional labor. Commit to learning and changed behavior. Follow through. Making mistakes is inevitable; how you respond determines whether you\'re genuinely accountable or just performing allyship.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 15
    },
    module_number: 3, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 3: 3 lessons')
  console.log('✅ Course 14 complete: 3 modules, 11 lessons\n')
}

console.log('=== PHASE 2 PART 1 POPULATION ===\n')

async function runAll() {
  await populateIndigenousBlackSolidarity()
  await populateAllyshipWithoutTokenism()
}

runAll()
  .then(() => console.log('\n✅ PART 1 COMPLETE: 2 Phase 2 courses populated!'))
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
