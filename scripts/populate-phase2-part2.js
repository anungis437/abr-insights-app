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

// Course 15: Anti-Racism for Educators
async function populateAntiRacismEducators() {
  console.log('\n📚 Course 15: Anti-Racism for Educators')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'anti-racism-educators').single()
  if (!course) { console.log('❌ Course not found'); return }

  // Module 1: Curriculum Audit and Transformation
  const m1 = await createModule(course.id, {
    title: 'Anti-Racist Curriculum Audit and Transformation',
    description: 'Learn to critically examine curriculum for bias, erasure, and harm, then make transformative changes.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction: Why Anti-Racist Education Matters',
    slug: 'why-anti-racist-education',
    description: 'Understand the urgency and impact of anti-racist educational practices.',
    content_type: 'video',
    content_url: 'https://example.com/videos/why-anti-racist-education.mp4',
    video_duration_seconds: 540,
    module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Conducting a Curriculum Audit',
    slug: 'curriculum-audit',
    description: 'Use frameworks to identify bias, erasure, and harmful narratives in curriculum.',
    content_type: 'video',
    content_url: 'https://example.com/videos/curriculum-audit.mp4',
    video_duration_seconds: 720,
    module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Decolonizing Canadian History Curriculum',
    slug: 'decolonizing-history',
    description: 'Move beyond sanitized narratives to teach honest Canadian history.',
    content_type: 'video',
    content_url: 'https://example.com/videos/decolonizing-history.mp4',
    video_duration_seconds: 660,
    module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'Centering Black Voices and Contributions',
    slug: 'centering-black-voices',
    description: 'Go beyond tokenism to authentically center Black perspectives and contributions.',
    content_type: 'video',
    content_url: 'https://example.com/videos/centering-black-voices.mp4',
    video_duration_seconds: 600,
    module_number: 1, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 1: 4 lessons')

  // Module 2: Anti-Racist Classroom Practices
  const m2 = await createModule(course.id, {
    title: 'Creating Anti-Racist Classroom Environments',
    description: 'Implement daily practices that affirm Black students and interrupt racism.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Building Classroom Community Across Difference',
    slug: 'classroom-community',
    description: 'Create belonging for all students while addressing power and privilege.',
    content_type: 'video',
    content_url: 'https://example.com/videos/classroom-community.mp4',
    video_duration_seconds: 600,
    module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Addressing Racist Incidents in Real Time',
    slug: 'addressing-incidents',
    description: 'Respond effectively when racism occurs in your classroom.',
    content_type: 'video',
    content_url: 'https://example.com/videos/addressing-incidents.mp4',
    video_duration_seconds: 720,
    module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Culturally Sustaining Pedagogy',
    slug: 'culturally-sustaining-pedagogy',
    description: 'Move beyond cultural competence to practices that sustain and affirm Black students.',
    content_type: 'video',
    content_url: 'https://example.com/videos/culturally-sustaining-pedagogy.mp4',
    video_duration_seconds: 660,
    module_number: 2, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m2.id, {
    title: 'Examining Your Own Biases as an Educator',
    slug: 'examining-educator-biases',
    description: 'Reflect on how your own biases impact Black students.',
    content_type: 'video',
    content_url: 'https://example.com/videos/examining-educator-biases.mp4',
    video_duration_seconds: 540,
    module_number: 2, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 2: 4 lessons')

  // Module 3: Discipline and Behavior Management
  const m3 = await createModule(course.id, {
    title: 'Addressing Racial Discipline Disparities',
    description: 'Understand and disrupt the disproportionate discipline of Black students.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'The Data: Discipline Disparities in Canadian Schools',
    slug: 'discipline-disparities-data',
    description: 'Review Canadian data on suspensions, expulsions, and streaming.',
    content_type: 'video',
    content_url: 'https://example.com/videos/discipline-disparities-data.mp4',
    video_duration_seconds: 600,
    module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Implicit Bias in Behavior Interpretation',
    slug: 'bias-behavior-interpretation',
    description: 'Understand how bias shapes perception of Black students\' behavior.',
    content_type: 'video',
    content_url: 'https://example.com/videos/bias-behavior-interpretation.mp4',
    video_duration_seconds: 660,
    module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Restorative and Transformative Justice',
    slug: 'restorative-justice',
    description: 'Implement alternatives to punitive discipline that address harm and build community.',
    content_type: 'video',
    content_url: 'https://example.com/videos/restorative-justice.mp4',
    video_duration_seconds: 720,
    module_number: 3, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 3: 3 lessons')

  // Module 4: Family and Community Engagement
  const m4 = await createModule(course.id, {
    title: 'Engaging Black Families as Partners',
    description: 'Build authentic partnerships with Black families based on respect and shared power.',
    sort_order: 4
  })

  await createLesson(course.id, m4.id, {
    title: 'Understanding Barriers to Engagement',
    slug: 'barriers-engagement',
    description: 'Recognize how schools create barriers for Black families.',
    content_type: 'video',
    content_url: 'https://example.com/videos/barriers-engagement.mp4',
    video_duration_seconds: 600,
    module_number: 4, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m4.id, {
    title: 'Building Trust with Black Families',
    slug: 'building-trust-families',
    description: 'Move beyond deficit narratives to see families as assets and partners.',
    content_type: 'video',
    content_url: 'https://example.com/videos/building-trust-families.mp4',
    video_duration_seconds: 660,
    module_number: 4, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m4.id, {
    title: 'Community-Based Education Models',
    slug: 'community-education-models',
    description: 'Learn from Afrocentric schools and community-led education initiatives.',
    content_type: 'video',
    content_url: 'https://example.com/videos/community-education-models.mp4',
    video_duration_seconds: 600,
    module_number: 4, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m4.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-educators',
    description: 'Comprehensive assessment of anti-racist education practices.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What does it mean to decolonize curriculum?',
          options: [
            'Add a few lessons about Indigenous or Black people',
            'Critically examine whose knowledge is centered, whose is erased, and fundamentally restructure curriculum to challenge colonial narratives',
            'Remove all Canadian history',
            'Only teach about oppression'
          ],
          correct_answer: 1,
          explanation: 'Decolonizing curriculum means fundamentally examining and challenging whose knowledge, perspectives, and narratives are centered as "truth" and whose are marginalized or erased. It requires moving beyond additive approaches (adding a Black History Month lesson) to transformative change: centering Indigenous and Black voices, teaching honest history including genocide and slavery, examining power structures, and recognizing multiple ways of knowing beyond Eurocentric frameworks.'
        },
        {
          question: 'What do Canadian data show about discipline disparities?',
          options: [
            'Black students are disciplined at equal rates to white students',
            'Black students, particularly Black boys, are suspended and expelled at 2-3 times the rate of white students even when behaviors are similar',
            'Discipline disparities only exist in the United States',
            'Black students misbehave more than other students'
          ],
          correct_answer: 1,
          explanation: 'Canadian data consistently show Black students, particularly Black boys, are suspended and expelled at 2-3 times the rate of white students. Studies show they are disciplined more harshly for the same behaviors, are more likely to be labeled "defiant" or "aggressive," and face school-based police involvement at higher rates. This is not about behavior differences—it\'s about how Black students\' behavior is interpreted and responded to through biased lenses.'
        },
        {
          question: 'What is culturally sustaining pedagogy?',
          options: [
            'Celebrating cultural holidays',
            'Teaching practices that sustain and affirm students\' cultural identities, languages, and ways of knowing as assets',
            'Treating all students exactly the same',
            'Learning about different cultures'
          ],
          correct_answer: 1,
          explanation: 'Culturally sustaining pedagogy (Django Paris) goes beyond cultural competence to actively sustain and affirm students\' cultural identities, languages, histories, and ways of knowing. It positions culture as an asset, not a deficit. For Black students, this means affirming Black language practices, centering Black history and contributions, connecting curriculum to Black community experiences, and recognizing diverse Black identities. It\'s not additive—it\'s transformative.'
        },
        {
          question: 'How should educators engage Black families?',
          options: [
            'Only contact them when there are problems',
            'Recognize and dismantle deficit narratives, build trust, share power, and partner with families as educational experts on their children',
            'Assume they don\'t care about education',
            'Tell them what their children need to do differently'
          ],
          correct_answer: 1,
          explanation: 'Black families often face deficit narratives that blame them for systemic failures. Authentic engagement requires: examining your own biases, recognizing barriers schools create, building trust through consistent positive contact, seeing families as assets and experts on their children, sharing power in decision-making, and addressing systemic issues rather than focusing on "fixing" families. When schools fail Black students, examine the school—not the family.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 15
    },
    module_number: 4, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 4: 4 lessons')
  console.log('✅ Course 15 complete: 4 modules, 15 lessons\n')
}

// Course 16: Policing, Justice, and Community Safety
async function populatePolicingJustice() {
  console.log('\n📚 Course 16: Policing, Justice, and Community Safety')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'policing-justice-reform').single()
  if (!course) { console.log('❌ Course not found'); return }

  // Module 1: Anti-Black Racism in Policing
  const m1 = await createModule(course.id, {
    title: 'Understanding Anti-Black Racism in Canadian Policing',
    description: 'Examine the history and current reality of anti-Black policing in Canada.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction: Policing and Anti-Black Racism',
    slug: 'intro-policing-racism',
    description: 'Understand the scope of anti-Black racism in Canadian policing systems.',
    content_type: 'video',
    content_url: 'https://example.com/videos/intro-policing-racism.mp4',
    video_duration_seconds: 540,
    module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Carding and Street Checks',
    slug: 'carding-street-checks',
    description: 'Examine the practice, data, and impact of carding on Black communities.',
    content_type: 'video',
    content_url: 'https://example.com/videos/carding-street-checks.mp4',
    video_duration_seconds: 720,
    module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Police Violence Against Black Canadians',
    slug: 'police-violence',
    description: 'Review cases, data, and patterns of police violence targeting Black people.',
    content_type: 'video',
    content_url: 'https://example.com/videos/police-violence.mp4',
    video_duration_seconds: 660,
    module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'Use of Force and De-escalation Failures',
    slug: 'use-of-force',
    description: 'Understand racial disparities in use of force and deadly force.',
    content_type: 'video',
    content_url: 'https://example.com/videos/use-of-force.mp4',
    video_duration_seconds: 600,
    module_number: 1, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 1: 4 lessons')

  // Module 2: Criminal Justice System Disparities
  const m2 = await createModule(course.id, {
    title: 'Anti-Black Racism in the Justice System',
    description: 'Examine disparities in arrests, bail, sentencing, and incarceration.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Over-Policing and Over-Incarceration',
    slug: 'over-policing-incarceration',
    description: 'Understand patterns of over-surveillance and over-incarceration of Black people.',
    content_type: 'video',
    content_url: 'https://example.com/videos/over-policing-incarceration.mp4',
    video_duration_seconds: 660,
    module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Bail and Pre-Trial Detention',
    slug: 'bail-pretrial',
    description: 'Examine racial disparities in bail decisions and pre-trial detention.',
    content_type: 'video',
    content_url: 'https://example.com/videos/bail-pretrial.mp4',
    video_duration_seconds: 600,
    module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Sentencing Disparities',
    slug: 'sentencing-disparities',
    description: 'Understand how Black defendants receive harsher sentences for similar offenses.',
    content_type: 'video',
    content_url: 'https://example.com/videos/sentencing-disparities.mp4',
    video_duration_seconds: 540,
    module_number: 2, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m2.id, {
    title: 'Conditions in Canadian Prisons',
    slug: 'prison-conditions',
    description: 'Examine the experiences of Black people in federal and provincial institutions.',
    content_type: 'video',
    content_url: 'https://example.com/videos/prison-conditions.mp4',
    video_duration_seconds: 600,
    module_number: 2, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 2: 4 lessons')

  // Module 3: Alternatives to Policing
  const m3 = await createModule(course.id, {
    title: 'Community-Led Safety Alternatives',
    description: 'Explore models that prioritize community safety without relying on police.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'What is Community Safety?',
    slug: 'what-is-community-safety',
    description: 'Redefine safety from a community perspective rather than a policing perspective.',
    content_type: 'video',
    content_url: 'https://example.com/videos/what-is-community-safety.mp4',
    video_duration_seconds: 600,
    module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Community-Based Crisis Response',
    slug: 'community-crisis-response',
    description: 'Learn from models that send community responders instead of police for mental health, housing, and other crises.',
    content_type: 'video',
    content_url: 'https://example.com/videos/community-crisis-response.mp4',
    video_duration_seconds: 720,
    module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Restorative and Transformative Justice',
    slug: 'restorative-transformative-justice',
    description: 'Explore justice models that address harm and root causes rather than punishment.',
    content_type: 'video',
    content_url: 'https://example.com/videos/restorative-transformative-justice.mp4',
    video_duration_seconds: 660,
    module_number: 3, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 3: 3 lessons')

  // Module 4: Accountability and Change
  const m4 = await createModule(course.id, {
    title: 'Police Accountability and Systemic Change',
    description: 'Examine accountability mechanisms and strategies for transformative change.',
    sort_order: 4
  })

  await createLesson(course.id, m4.id, {
    title: 'Current Accountability Gaps',
    slug: 'accountability-gaps',
    description: 'Understand why current oversight mechanisms fail to create accountability.',
    content_type: 'video',
    content_url: 'https://example.com/videos/accountability-gaps.mp4',
    video_duration_seconds: 660,
    module_number: 4, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m4.id, {
    title: 'Community Oversight Models',
    slug: 'community-oversight',
    description: 'Learn about community-controlled oversight and accountability structures.',
    content_type: 'video',
    content_url: 'https://example.com/videos/community-oversight.mp4',
    video_duration_seconds: 600,
    module_number: 4, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m4.id, {
    title: 'Defunding and Reinvesting',
    slug: 'defunding-reinvesting',
    description: 'Understand the case for defunding police and reinvesting in community resources.',
    content_type: 'video',
    content_url: 'https://example.com/videos/defunding-reinvesting.mp4',
    video_duration_seconds: 720,
    module_number: 4, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m4.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-policing',
    description: 'Comprehensive assessment of policing and justice reform knowledge.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is carding (street checks)?',
          options: [
            'A normal police practice with no racial bias',
            'The practice of randomly stopping, questioning, and documenting people, disproportionately targeting Black people',
            'Only happens in the United States',
            'An effective crime prevention strategy'
          ],
          correct_answer: 1,
          explanation: 'Carding (street checks) is the practice of police randomly stopping, questioning, and documenting individuals not suspected of any crime. Toronto data showed Black people were 3 times more likely to be carded than white people. It created databases of tens of thousands of Black residents, many never charged with anything. Carding violates rights, erodes trust, and reinforces criminalization of Black communities. Many jurisdictions have restricted or banned the practice.'
        },
        {
          question: 'What do data show about police use of force against Black Canadians?',
          options: [
            'Police use force equally across all racial groups',
            'Black people are significantly overrepresented in police shootings and use of force incidents',
            'Police violence is not a problem in Canada',
            'Data is not collected on race and police violence'
          ],
          correct_answer: 1,
          explanation: 'Data show Black Canadians are vastly overrepresented in police shootings. In Toronto, Black people are 8.8% of population but 37% of people shot by police (20 times the rate). Similar patterns exist across Canada. Black people are also overrepresented in use of force reports, wellness checks gone deadly, and deaths in custody. This is not about behavior—it\'s about how police perceive and respond to Black people.'
        },
        {
          question: 'What are community-based alternatives to policing?',
          options: [
            'There are no alternatives to police',
            'Community-led responses to crises, needs, and harms that prioritize care, support, and addressing root causes rather than criminalization',
            'Just hiring more police officers',
            'Private security companies'
          ],
          correct_answer: 1,
          explanation: 'Community-based alternatives send trained community responders (not police) to mental health crises, housing issues, substance use, youth conflicts, etc. Examples include crisis intervention teams, mobile crisis units, street outreach workers, violence interruption programs, and restorative justice circles. These approaches prioritize care, de-escalation, connection to resources, and addressing root causes—resulting in better outcomes and lower costs than police responses.'
        },
        {
          question: 'What does "defund the police" mean?',
          options: [
            'Eliminate all law enforcement immediately',
            'Reduce bloated police budgets and reinvest in community resources (housing, mental health, education) that actually create safety',
            'Stop paying police officers',
            'Increase crime'
          ],
          correct_answer: 1,
          explanation: '"Defund the police" means reducing over-inflated police budgets (often 30-50% of municipal budgets) and reinvesting in community resources that address root causes of harm: affordable housing, mental health services, education, youth programs, addiction support. Police don\'t prevent crime—addressing poverty, trauma, and lack of resources does. Defunding recognizes police cannot solve social problems and redirects funds to what actually creates safety.'
        }
      ],
      passing_score: 80,
      time_limit_minutes: 15
    },
    module_number: 4, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 4: 4 lessons')
  console.log('✅ Course 16 complete: 4 modules, 15 lessons\n')
}

console.log('=== PHASE 2 PART 2 POPULATION ===\n')

async function runAll() {
  await populateAntiRacismEducators()
  await populatePolicingJustice()
}

runAll()
  .then(() => console.log('\n✅ PART 2 COMPLETE: 2 more Phase 2 courses populated!'))
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
