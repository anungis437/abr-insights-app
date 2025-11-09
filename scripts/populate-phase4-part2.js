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

// Course 27: Intersectionality: Race, Gender, Class, and Disability
async function populateIntersectionality() {
  console.log('\n📚 Course 27: Intersectionality Frameworks')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'intersectionality-frameworks').single()
  if (!course) { console.log('❌ Course not found'); return }

  const m1 = await createModule(course.id, {
    title: 'Foundations of Intersectionality',
    description: 'Understand intersectionality theory and its Black feminist origins.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction: What is Intersectionality?',
    slug: 'intro-intersectionality',
    description: 'Learn Kimberlé Crenshaw\'s foundational theory.',
    content_type: 'video', content_url: 'https://example.com/videos/intro-intersectionality.mp4',
    video_duration_seconds: 600, module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Black Feminist Origins of Intersectionality',
    slug: 'black-feminist-origins',
    description: 'Understand Black feminist thought from Combahee River Collective to present.',
    content_type: 'video', content_url: 'https://example.com/videos/black-feminist-origins.mp4',
    video_duration_seconds: 720, module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Beyond "Adding Identities": Multiplicative Oppression',
    slug: 'multiplicative-oppression',
    description: 'Understand why oppression is not additive but multiplicative.',
    content_type: 'video', content_url: 'https://example.com/videos/multiplicative-oppression.mp4',
    video_duration_seconds: 660, module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'Appropriation and Depoliticization of Intersectionality',
    slug: 'appropriation-depoliticization',
    description: 'Examine how intersectionality gets co-opted and defanged.',
    content_type: 'video', content_url: 'https://example.com/videos/appropriation-depoliticization.mp4',
    video_duration_seconds: 600, module_number: 1, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 1: 4 lessons')

  const m2 = await createModule(course.id, {
    title: 'Misogynoir and Violence Against Black Women',
    description: 'Understand unique violence facing Black women and girls.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Defining Misogynoir',
    slug: 'defining-misogynoir',
    description: 'Learn Moya Bailey\'s concept of anti-Black misogyny.',
    content_type: 'video', content_url: 'https://example.com/videos/defining-misogynoir.mp4',
    video_duration_seconds: 660, module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Violence Against Black Women in Canada',
    slug: 'violence-black-women-canada',
    description: 'Examine intimate partner violence, sexual violence, and systemic violence.',
    content_type: 'video', content_url: 'https://example.com/videos/violence-black-women-canada.mp4',
    video_duration_seconds: 720, module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Criminalizing Black Motherhood',
    slug: 'criminalizing-black-motherhood',
    description: 'Understand child welfare surveillance and removal of Black children.',
    content_type: 'video', content_url: 'https://example.com/videos/criminalizing-black-motherhood.mp4',
    video_duration_seconds: 600, module_number: 2, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m2.id, {
    title: 'Black Women and Girls in Education',
    slug: 'black-women-girls-education',
    description: 'Examine adultification, discipline disparities, and pushout.',
    content_type: 'video', content_url: 'https://example.com/videos/black-women-girls-education.mp4',
    video_duration_seconds: 660, module_number: 2, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 2: 4 lessons')

  const m3 = await createModule(course.id, {
    title: 'Race, Class, and Economic Oppression',
    description: 'Understand how class intersects with anti-Black racism.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Wealth Gap and Economic Inequality',
    slug: 'wealth-gap-inequality',
    description: 'Examine racialized economic disparities in Canada.',
    content_type: 'video', content_url: 'https://example.com/videos/wealth-gap-inequality.mp4',
    video_duration_seconds: 660, module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Labor Exploitation and Precarious Work',
    slug: 'labor-exploitation-precarious',
    description: 'Understand how Black workers are overrepresented in low-wage, precarious jobs.',
    content_type: 'video', content_url: 'https://example.com/videos/labor-exploitation-precarious.mp4',
    video_duration_seconds: 720, module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Myth of the "Black Middle Class"',
    slug: 'myth-black-middle-class',
    description: 'Examine fragility of Black economic mobility.',
    content_type: 'video', content_url: 'https://example.com/videos/myth-black-middle-class.mp4',
    video_duration_seconds: 600, module_number: 3, lesson_number: 3, sort_order: 3
  })
  console.log('✅ Module 3: 3 lessons')

  const m4 = await createModule(course.id, {
    title: 'Disability Justice and Anti-Racism',
    description: 'Understand ableism and racism in disability communities.',
    sort_order: 4
  })

  await createLesson(course.id, m4.id, {
    title: 'Racism in Disability Justice Movements',
    slug: 'racism-disability-justice',
    description: 'Examine whiteness in disability advocacy and exclusion of Black disabled people.',
    content_type: 'video', content_url: 'https://example.com/videos/racism-disability-justice.mp4',
    video_duration_seconds: 660, module_number: 4, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m4.id, {
    title: 'Police Violence Against Black Disabled People',
    slug: 'police-violence-disabled',
    description: 'Understand deadly intersection of ableism and anti-Black racism in policing.',
    content_type: 'video', content_url: 'https://example.com/videos/police-violence-disabled.mp4',
    video_duration_seconds: 720, module_number: 4, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m4.id, {
    title: 'Barriers to Healthcare and Services',
    slug: 'barriers-healthcare-services',
    description: 'Examine compounded discrimination in accessing disability supports.',
    content_type: 'video', content_url: 'https://example.com/videos/barriers-healthcare-services.mp4',
    video_duration_seconds: 600, module_number: 4, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m4.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-intersectionality',
    description: 'Comprehensive assessment of intersectionality knowledge.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is intersectionality?',
          options: [
            'Just adding up different identities',
            'A framework from Black feminist thought showing how race, gender, class, and other systems of oppression interact and create unique experiences of discrimination',
            'Only about gender and race',
            'A buzzword with no real meaning'
          ],
          correct_answer: 1,
          explanation: 'Intersectionality, coined by Kimberlé Crenshaw, describes how systems of oppression (racism, sexism, classism, ableism, homophobia, transphobia) intersect and create unique experiences of marginalization. It is not additive (Black + woman = double oppression) but multiplicative (Black women face unique oppression called misogynoir that is neither just racism nor just sexism). Originated in Black feminist thought (Combahee River Collective, Audre Lorde, bell hooks) to address erasure of Black women in both anti-racist and feminist movements. Intersectionality requires examining structural power, not just individual identities, and centering most marginalized experiences.'
        },
        {
          question: 'What is misogynoir?',
          options: [
            'Same as regular misogyny',
            'Anti-Black misogyny—the unique hatred, stereotyping, and violence targeting Black women and girls specifically',
            'Not a real concept',
            'Only about interpersonal interactions'
          ],
          correct_answer: 1,
          explanation: 'Misogynoir (coined by Moya Bailey) is anti-Black misogyny—the specific hatred and violence targeting Black women and girls that is distinct from misogyny targeting white women or racism targeting Black men. Examples: hypersexualization and dehumanization of Black women, "angry Black woman" stereotype, higher rates of intimate partner violence and sexual assault, criminalizing Black motherhood, denial of pain and credibility in healthcare, pushout from schools, exclusion from beauty standards and femininity. Misogynoir is structural (in laws, policies, institutions) not just interpersonal. Addressing misogynoir requires centering Black women\'s experiences and safety, not just adding women to anti-racism or Black people to feminism.'
        },
        {
          question: 'How does class intersect with anti-Black racism?',
          options: [
            'Class does not matter if you face racism',
            'Black people face economic oppression through labor exploitation, wealth gap, precarious work, and denial of economic mobility—class does not erase racism and racism shapes class position',
            'Wealthy Black people face no racism',
            'Class and race are completely separate'
          ],
          correct_answer: 1,
          explanation: 'Class and race are intertwined. Black people in Canada: face wealth gap (lower median income, less homeownership, less intergenerational wealth), are overrepresented in low-wage precarious work, experience labor exploitation (from slavery to contemporary gig economy), face barriers to entrepreneurship and business ownership, and have fragile economic mobility easily disrupted by racism. Wealthy Black people still face racism (carding, discrimination in stores, workplace racism) AND face "Black tax" (expected to support extended family/community, less intergenerational wealth transfer). Working-class Black people face compounded oppression. Addressing economic justice requires tackling racist barriers to wealth-building and employment equity, not just "diversity."'
        },
        {
          question: 'What is the intersection of ableism and anti-Black racism?',
          options: [
            'Disabled Black people face same issues as white disabled people',
            'Black disabled people face compounded discrimination—more likely to be killed by police, excluded from disability justice movements, denied healthcare, and pathologized',
            'Ableism only affects white people',
            'Anti-racism automatically includes disability justice'
          ],
          correct_answer: 1,
          explanation: 'Black disabled people face unique oppression: Police violence (Black disabled people more likely to be killed during mental health crises or due to not responding to commands), Healthcare discrimination (pain dismissed, needs ignored, experimented on historically and contemporarily), Disability justice exclusion (white-dominated disability movements often ignore race, center white experiences), Pathologization (Black children overdiagnosed with behavioral disabilities, Black adults\' trauma misdiagnosed as mental illness), Barriers to services (poverty, systemic racism, lack of culturally appropriate supports). Addressing this requires: centering Black disabled voices, police abolition, healthcare reform, and building disability justice movements that do not replicate anti-Black racism.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 15
    },
    module_number: 4, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 4: 4 lessons')
  console.log('✅ Course 27 complete: 4 modules, 15 lessons\n')
}

// Course 28: Dismantling White Supremacy Culture
async function populateWhiteSupremacyCulture() {
  console.log('\n📚 Course 28: Dismantling White Supremacy Culture')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'white-supremacy-culture').single()
  if (!course) { console.log('❌ Course not found'); return }

  const m1 = await createModule(course.id, {
    title: 'Understanding White Supremacy Culture',
    description: 'Learn the characteristics of white supremacy culture in organizations.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction: White Supremacy Culture Framework',
    slug: 'intro-white-supremacy-culture',
    description: 'Understand Tema Okun\'s framework on organizational characteristics.',
    content_type: 'video', content_url: 'https://example.com/videos/intro-white-supremacy-culture.mp4',
    video_duration_seconds: 600, module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Perfectionism and Fear of Failure',
    slug: 'perfectionism-fear-failure',
    description: 'Examine how perfectionism culture harms Black employees.',
    content_type: 'video', content_url: 'https://example.com/videos/perfectionism-fear-failure.mp4',
    video_duration_seconds: 720, module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Sense of Urgency and Quantity Over Quality',
    slug: 'urgency-quantity',
    description: 'Understand how urgency culture prevents meaningful change.',
    content_type: 'video', content_url: 'https://example.com/videos/urgency-quantity.mp4',
    video_duration_seconds: 660, module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'Worship of the Written Word and Objectivity',
    slug: 'written-word-objectivity',
    description: 'Examine how "objectivity" upholds white ways of knowing.',
    content_type: 'video', content_url: 'https://example.com/videos/written-word-objectivity.mp4',
    video_duration_seconds: 600, module_number: 1, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 1: 4 lessons')

  const m2 = await createModule(course.id, {
    title: 'Organizational Characteristics Part 2',
    description: 'More white supremacy culture characteristics and their impacts.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Individualism and Right to Comfort',
    slug: 'individualism-right-comfort',
    description: 'Understand how individualism prevents collective accountability.',
    content_type: 'video', content_url: 'https://example.com/videos/individualism-right-comfort.mp4',
    video_duration_seconds: 660, module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Fear of Open Conflict and Power Hoarding',
    slug: 'fear-conflict-power-hoarding',
    description: 'Examine how conflict avoidance maintains white comfort and power.',
    content_type: 'video', content_url: 'https://example.com/videos/fear-conflict-power-hoarding.mp4',
    video_duration_seconds: 720, module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Paternalism and Defensiveness',
    slug: 'paternalism-defensiveness',
    description: 'Understand how defensiveness shuts down feedback and learning.',
    content_type: 'video', content_url: 'https://example.com/videos/paternalism-defensiveness.mp4',
    video_duration_seconds: 600, module_number: 2, lesson_number: 3, sort_order: 3
  })
  console.log('✅ Module 2: 3 lessons')

  const m3 = await createModule(course.id, {
    title: 'Impact on Black Employees and Communities',
    description: 'Examine the harm white supremacy culture causes.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Tokenism and Exploitation of Black Labor',
    slug: 'tokenism-exploitation',
    description: 'Understand how Black employees are tokenized and overworked.',
    content_type: 'video', content_url: 'https://example.com/videos/tokenism-exploitation.mp4',
    video_duration_seconds: 660, module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Gaslighting and Silencing',
    slug: 'gaslighting-silencing',
    description: 'Examine how Black employees are dismissed when naming racism.',
    content_type: 'video', content_url: 'https://example.com/videos/gaslighting-silencing.mp4',
    video_duration_seconds: 720, module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Mental Health Impacts and Burnout',
    slug: 'mental-health-burnout',
    description: 'Understand the psychological toll of working in white supremacist cultures.',
    content_type: 'video', content_url: 'https://example.com/videos/mental-health-burnout.mp4',
    video_duration_seconds: 600, module_number: 3, lesson_number: 3, sort_order: 3
  })
  console.log('✅ Module 3: 3 lessons')

  const m4 = await createModule(course.id, {
    title: 'Dismantling and Building Alternatives',
    description: 'Strategies to dismantle white supremacy culture and build anti-racist alternatives.',
    sort_order: 4
  })

  await createLesson(course.id, m4.id, {
    title: 'Naming and Interrupting White Supremacy Culture',
    slug: 'naming-interrupting',
    description: 'Learn how to identify and call out these patterns.',
    content_type: 'video', content_url: 'https://example.com/videos/naming-interrupting.mp4',
    video_duration_seconds: 660, module_number: 4, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m4.id, {
    title: 'Building Anti-Racist Organizational Culture',
    slug: 'building-antiracist-culture',
    description: 'Create alternatives rooted in collective care and accountability.',
    content_type: 'video', content_url: 'https://example.com/videos/building-antiracist-culture.mp4',
    video_duration_seconds: 720, module_number: 4, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m4.id, {
    title: 'Addressing Resistance and Backlash',
    slug: 'addressing-resistance-backlash',
    description: 'Navigate white fragility and organizational resistance to change.',
    content_type: 'video', content_url: 'https://example.com/videos/addressing-resistance-backlash.mp4',
    video_duration_seconds: 600, module_number: 4, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m4.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-white-supremacy',
    description: 'Comprehensive assessment of white supremacy culture knowledge.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is white supremacy culture in organizations?',
          options: [
            'Only about explicit white supremacist groups',
            'The ways that white dominant culture is embedded in organizational structures, norms, and practices—including perfectionism, urgency, individualism, and defensiveness',
            'Not a real thing in workplaces',
            'Only about individual racist people'
          ],
          correct_answer: 1,
          explanation: 'White supremacy culture refers to the characteristics and norms of white dominant culture that are embedded in organizational structures, practices, and values—often seen as "normal" or "professional" but actually uphold white ways of being and harm Black people and other racialized groups. Tema Okun identified characteristics including: perfectionism, sense of urgency, defensiveness, quantity over quality, worship of written word, paternalism, individualism, right to comfort, fear of open conflict, and power hoarding. These are not just individual behaviors but systemic norms that privilege whiteness, punish difference, and maintain power imbalances. Understanding this helps identify root causes of organizational racism beyond individual bias.'
        },
        {
          question: 'How does perfectionism function as white supremacy culture?',
          options: [
            'Perfectionism is just about high standards',
            'Perfectionism culture punishes mistakes harshly, allows no room for learning, holds Black employees to higher standards, and prioritizes image over substance',
            'Having high standards is good for everyone',
            'Black employees benefit from perfectionism'
          ],
          correct_answer: 1,
          explanation: 'Perfectionism in white supremacy culture: Little appreciation for work process or learning from mistakes (only perfect outcomes matter), Black employees held to higher standards while white employees\' mistakes excused, Fear of failure prevents innovation and risk-taking, Blame culture when things go wrong, Defensive when criticized or when mistakes pointed out. For Black employees this means: constant scrutiny and nitpicking, no grace for mistakes white colleagues receive, hypervisibility and higher standards, and exhaustion from needing to be "twice as good." Alternative: build learning culture, normalize mistakes as growth, apply consistent standards, appreciate process not just outcome, and give grace especially to those facing systemic barriers.'
        },
        {
          question: 'What is "sense of urgency" as white supremacy culture characteristic?',
          options: [
            'Working quickly is always good',
            'Urgency culture prioritizes speed over quality, prevents meaningful planning and relationships, and uses "urgency" to dismiss concerns about equity and inclusion',
            'Deadlines are white supremacy',
            'Black people do not value timeliness'
          ],
          correct_answer: 1,
          explanation: 'Sense of urgency as white supremacy culture: Creates artificial urgency that prevents thoughtful planning, Uses "we do not have time" to dismiss equity concerns, Sacrifices quality for speed, Prevents relationship-building and trust necessary for real change, Values quick action over sustainable transformation. Impact on Black employees: Equity work deprioritized as "too slow," Concerns dismissed as "slowing down progress," Burnout from constant urgency, Meaningful change prevented in favor of performative quick wins. Alternative: Differentiate between real and manufactured urgency, Build in time for relationship and trust, Recognize that meaningful change takes time, Slow down to do it right rather than fast to check box.'
        },
        {
          question: 'How can organizations dismantle white supremacy culture?',
          options: [
            'Just hire more diverse people',
            'Name and interrupt these patterns, build anti-racist alternatives rooted in collective care, center Black voices and leadership, and commit to sustained systemic change',
            'It cannot be changed',
            'Ignore it and it will go away'
          ],
          correct_answer: 1,
          explanation: 'Dismantling white supremacy culture requires: Naming it—Educate about these characteristics, make visible what was normalized, Call it out when it happens, Build awareness without shaming. Interrupt it—Challenge perfectionism, urgency, defensiveness when they arise, Support making mistakes and learning, Create space for conflict and discomfort, Share power and decision-making. Build alternatives—Develop anti-racist norms and practices, Center collective care and sustainability, Value diverse ways of being and knowing, Create accountability structures. Sustain it—Long-term commitment not one-time training, Center Black leadership and voices, Address resistance and backlash with clarity, Transform systems not just individuals. This is ongoing work requiring humility, accountability, and willingness to be uncomfortable.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 15
    },
    module_number: 4, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 4: 4 lessons')
  console.log('✅ Course 28 complete: 4 modules, 14 lessons\n')
}

console.log('=== PHASE 4 PART 2 POPULATION ===\n')

async function runAll() {
  await populateIntersectionality()
  await populateWhiteSupremacyCulture()
}

runAll()
  .then(() => console.log('\n✅ PART 2 COMPLETE: 2 more Phase 4 courses populated!'))
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
