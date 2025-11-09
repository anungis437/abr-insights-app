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

// Course 25: Anti-Racism in Mental Health and Wellness
async function populateMentalHealthWellness() {
  console.log('\n📚 Course 25: Anti-Racism in Mental Health and Wellness')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'mental-health-wellness').single()
  if (!course) { console.log('❌ Course not found'); return }

  const m1 = await createModule(course.id, {
    title: 'Anti-Black Racism and Mental Health Impacts',
    description: 'Understand how racism creates and exacerbates mental health challenges.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction: Racism as Public Health Crisis',
    slug: 'intro-racism-mental-health',
    description: 'Understand racism as trauma and public health issue.',
    content_type: 'video', content_url: 'https://example.com/videos/intro-racism-mental-health.mp4',
    video_duration_seconds: 540, module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Racial Trauma and Its Manifestations',
    slug: 'racial-trauma-manifestations',
    description: 'Learn how racial trauma presents in Black communities.',
    content_type: 'video', content_url: 'https://example.com/videos/racial-trauma-manifestations.mp4',
    video_duration_seconds: 720, module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Intergenerational Trauma',
    slug: 'intergenerational-trauma',
    description: 'Understand how trauma passes across generations.',
    content_type: 'video', content_url: 'https://example.com/videos/intergenerational-trauma.mp4',
    video_duration_seconds: 660, module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'Weathering and Chronic Stress',
    slug: 'weathering-chronic-stress',
    description: 'Examine cumulative impact of racism on physical and mental health.',
    content_type: 'video', content_url: 'https://example.com/videos/weathering-chronic-stress.mp4',
    video_duration_seconds: 600, module_number: 1, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 1: 4 lessons')

  const m2 = await createModule(course.id, {
    title: 'Bias in Mental Health Diagnosis and Treatment',
    description: 'Examine racism in diagnostic practices and treatment approaches.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Diagnostic Bias and Misdiagnosis',
    slug: 'diagnostic-bias-misdiagnosis',
    description: 'Understand how Black patients are misdiagnosed.',
    content_type: 'video', content_url: 'https://example.com/videos/diagnostic-bias-misdiagnosis.mp4',
    video_duration_seconds: 720, module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Overdiagnosis of Severe Mental Illness',
    slug: 'overdiagnosis-severe-illness',
    description: 'Examine why Black patients are disproportionately diagnosed with schizophrenia.',
    content_type: 'video', content_url: 'https://example.com/videos/overdiagnosis-severe-illness.mp4',
    video_duration_seconds: 660, module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Treatment Disparities',
    slug: 'treatment-disparities',
    description: 'Understand inequitable access to therapy and evidence-based treatments.',
    content_type: 'video', content_url: 'https://example.com/videos/treatment-disparities.mp4',
    video_duration_seconds: 600, module_number: 2, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m2.id, {
    title: 'Coercion and Involuntary Treatment',
    slug: 'coercion-involuntary-treatment',
    description: 'Examine higher rates of involuntary hospitalization for Black patients.',
    content_type: 'video', content_url: 'https://example.com/videos/coercion-involuntary-treatment.mp4',
    video_duration_seconds: 540, module_number: 2, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 2: 4 lessons')

  const m3 = await createModule(course.id, {
    title: 'Barriers to Accessing Mental Health Services',
    description: 'Understand systemic barriers preventing Black communities from accessing care.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'The Mental Health "Pipeline Problem" Myth',
    slug: 'mental-health-pipeline-myth',
    description: 'Challenge narratives about Black representation in mental health professions.',
    content_type: 'video', content_url: 'https://example.com/videos/mental-health-pipeline-myth.mp4',
    video_duration_seconds: 660, module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Stigma and Cultural Mistrust',
    slug: 'stigma-cultural-mistrust',
    description: 'Understand historical reasons for mistrust of mental health systems.',
    content_type: 'video', content_url: 'https://example.com/videos/stigma-cultural-mistrust.mp4',
    video_duration_seconds: 720, module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Cost and Insurance Barriers',
    slug: 'cost-insurance-barriers',
    description: 'Examine financial barriers to accessing therapy and treatment.',
    content_type: 'video', content_url: 'https://example.com/videos/cost-insurance-barriers.mp4',
    video_duration_seconds: 600, module_number: 3, lesson_number: 3, sort_order: 3
  })
  console.log('✅ Module 3: 3 lessons')

  const m4 = await createModule(course.id, {
    title: 'Culturally Responsive and Anti-Racist Practice',
    description: 'Build culturally safe, anti-racist mental health services.',
    sort_order: 4
  })

  await createLesson(course.id, m4.id, {
    title: 'Cultural Humility vs Cultural Competence',
    slug: 'cultural-humility',
    description: 'Move beyond competence to ongoing learning and humility.',
    content_type: 'video', content_url: 'https://example.com/videos/cultural-humility.mp4',
    video_duration_seconds: 660, module_number: 4, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m4.id, {
    title: 'Addressing Racism in Therapy Rooms',
    slug: 'addressing-racism-therapy',
    description: 'Name and address racism when it arises in clinical practice.',
    content_type: 'video', content_url: 'https://example.com/videos/addressing-racism-therapy.mp4',
    video_duration_seconds: 720, module_number: 4, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m4.id, {
    title: 'Community-Based and Healing-Centered Approaches',
    slug: 'community-healing-approaches',
    description: 'Learn from Black-led mental health and wellness models.',
    content_type: 'video', content_url: 'https://example.com/videos/community-healing-approaches.mp4',
    video_duration_seconds: 600, module_number: 4, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m4.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-mental-health',
    description: 'Comprehensive assessment of anti-racist mental health knowledge.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is racial trauma?',
          options: [
            'Only happens with direct violence',
            'The cumulative psychological and emotional harm caused by experiences of racism, including discrimination, microaggressions, and systemic oppression',
            'Not a real clinical issue',
            'Only affects children'
          ],
          correct_answer: 1,
          explanation: 'Racial trauma (race-based traumatic stress) is real psychological harm caused by experiences of racism. It includes: direct discrimination, microaggressions, witnessing violence against Black people, systemic oppression, and fear for safety. Symptoms mirror PTSD: hypervigilance, anxiety, depression, intrusive thoughts. Racial trauma is cumulative—small incidents compound over time. It affects people across the lifespan and is intergenerational. Mental health providers must recognize racial trauma as legitimate clinical issue requiring trauma-informed, culturally responsive treatment—not dismiss it or pathologize natural responses to oppression.'
        },
        {
          question: 'How does diagnostic bias manifest in mental health?',
          options: [
            'Clinicians treat all patients equally',
            'Black patients are overdiagnosed with schizophrenia and severe mental illness while trauma, depression, and anxiety are underdiagnosed or dismissed',
            'Diagnosis is completely objective',
            'Only explicit racism causes misdiagnosis'
          ],
          correct_answer: 1,
          explanation: 'Research shows Black patients are disproportionately diagnosed with schizophrenia and bipolar disorder even when presenting with same symptoms as white patients diagnosed with depression or PTSD. This reflects: implicit bias (associating Blackness with danger/aggression), historical stereotypes (dangerous Black body trope), lack of cultural understanding (misinterpreting cultural expressions as pathology), and systemic racism in diagnostic criteria development. Consequences include: inappropriate medication, stigma, coercive treatment, and missed trauma/depression treatment. Addressing diagnostic bias requires examining implicit biases and cultural assumptions in assessment.'
        },
        {
          question: 'Why do Black communities face barriers accessing mental health services?',
          options: [
            'Only about individual choices',
            'Systemic barriers including cost, lack of Black therapists, cultural mistrust from historical abuse, stigma, and inadequate insurance coverage',
            'Services are equally accessible to all',
            'Black communities do not need mental health services'
          ],
          correct_answer: 1,
          explanation: 'Black communities face multiple barriers: Cost (therapy expensive, insurance inadequate), Lack of representation (few Black mental health providers, cultural mismatch with white therapists), Historical mistrust (legacy of medical abuse, forced sterilization, unethical research), Stigma (mental health stigmatized in many communities due to survival necessity of "strength"), Systemic failures (services in white neighborhoods, culturally inappropriate treatment models). These are not individual failures but systemic barriers. Addressing them requires: investing in Black mental health professionals, culturally responsive services, community-based models, and affordable/accessible care.'
        },
        {
          question: 'What is cultural humility in mental health practice?',
          options: [
            'Same as cultural competence',
            'Ongoing commitment to self-reflection, recognizing power imbalances, learning from clients as experts on their own culture, and addressing systemic inequities',
            'Learning facts about cultures',
            'Not necessary for good practice'
          ],
          correct_answer: 1,
          explanation: 'Cultural humility moves beyond "cultural competence" (implies mastery, checklist approach). It requires: Self-reflection on own biases and positionality, Recognizing power imbalances in therapist-client relationship, Centering client as expert on their own cultural experience, Ongoing learning and openness to being wrong, Addressing systemic inequities not just individual cultural differences. Cultural humility acknowledges you will never "master" someone else\'s culture—you commit to listening, learning, and interrogating power. For anti-racist practice, this means naming racism, examining white supremacy in therapy models, and challenging clinical assumptions rooted in white norms.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 15
    },
    module_number: 4, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 4: 4 lessons')
  console.log('✅ Course 25 complete: 4 modules, 15 lessons\n')
}

// Course 26: Decolonizing Anti-Racism Practice
async function populateDecolonizingPractice() {
  console.log('\n📚 Course 26: Decolonizing Anti-Racism Practice')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'decolonizing-practice').single()
  if (!course) { console.log('❌ Course not found'); return }

  const m1 = await createModule(course.id, {
    title: 'Settler Colonialism and Anti-Black Racism',
    description: 'Understand how colonialism and anti-Black racism are interconnected.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction: Decolonization and Anti-Racism',
    slug: 'intro-decolonization-antiracism',
    description: 'Understand connections between colonial and anti-Black oppression.',
    content_type: 'video', content_url: 'https://example.com/videos/intro-decolonization-antiracism.mp4',
    video_duration_seconds: 600, module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Settler Colonialism in Canada',
    slug: 'settler-colonialism-canada',
    description: 'Understand ongoing colonial dispossession of Indigenous peoples.',
    content_type: 'video', content_url: 'https://example.com/videos/settler-colonialism-canada.mp4',
    video_duration_seconds: 720, module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Anti-Blackness and Slavery in Colonial Canada',
    slug: 'antiblackness-slavery-colonial',
    description: 'Examine Black enslavement and anti-Blackness in Canadian colonialism.',
    content_type: 'video', content_url: 'https://example.com/videos/antiblackness-slavery-colonial.mp4',
    video_duration_seconds: 660, module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'White Supremacy as Colonial Project',
    slug: 'white-supremacy-colonial-project',
    description: 'Understand white supremacy as tool of colonial power.',
    content_type: 'video', content_url: 'https://example.com/videos/white-supremacy-colonial-project.mp4',
    video_duration_seconds: 600, module_number: 1, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 1: 4 lessons')

  const m2 = await createModule(course.id, {
    title: 'Indigenous and Black Solidarity',
    description: 'Learn from solidarity movements and shared struggles.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Historical Indigenous-Black Alliances',
    slug: 'historical-indigenous-black-alliances',
    description: 'Learn from historical solidarity and mutual aid.',
    content_type: 'video', content_url: 'https://example.com/videos/historical-indigenous-black-alliances.mp4',
    video_duration_seconds: 660, module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Anti-Blackness in Indigenous Communities',
    slug: 'antiblackness-indigenous-communities',
    description: 'Address anti-Black racism within Indigenous spaces.',
    content_type: 'video', content_url: 'https://example.com/videos/antiblackness-indigenous-communities.mp4',
    video_duration_seconds: 720, module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Black Indigenous Peoples',
    slug: 'black-indigenous-peoples',
    description: 'Center experiences of people who are both Black and Indigenous.',
    content_type: 'video', content_url: 'https://example.com/videos/black-indigenous-peoples.mp4',
    video_duration_seconds: 600, module_number: 2, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m2.id, {
    title: 'Building Authentic Solidarity',
    slug: 'building-authentic-solidarity',
    description: 'Practice solidarity that does not erase differences or oppressions.',
    content_type: 'video', content_url: 'https://example.com/videos/building-authentic-solidarity.mp4',
    video_duration_seconds: 540, module_number: 2, lesson_number: 4, sort_order: 4
  })
  console.log('✅ Module 2: 4 lessons')

  const m3 = await createModule(course.id, {
    title: 'Decolonial Approaches to Anti-Racism Work',
    description: 'Practice anti-racism that challenges colonial frameworks.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Challenging Eurocentric Knowledge Systems',
    slug: 'challenging-eurocentric-knowledge',
    description: 'Question whose knowledge is centered and valued.',
    content_type: 'video', content_url: 'https://example.com/videos/challenging-eurocentric-knowledge.mp4',
    video_duration_seconds: 660, module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Land, Sovereignty, and Anti-Racism',
    slug: 'land-sovereignty-antiracism',
    description: 'Understand connections between land justice and racial justice.',
    content_type: 'video', content_url: 'https://example.com/videos/land-sovereignty-antiracism.mp4',
    video_duration_seconds: 720, module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Decolonization is Not a Metaphor',
    slug: 'decolonization-not-metaphor',
    description: 'Understand literal decolonization vs metaphorical appropriation.',
    content_type: 'video', content_url: 'https://example.com/videos/decolonization-not-metaphor.mp4',
    video_duration_seconds: 600, module_number: 3, lesson_number: 3, sort_order: 3
  })
  console.log('✅ Module 3: 3 lessons')

  const m4 = await createModule(course.id, {
    title: 'Anti-Blackness in "Decolonization" Spaces',
    description: 'Address how decolonization discourse can exclude or harm Black people.',
    sort_order: 4
  })

  await createLesson(course.id, m4.id, {
    title: 'When "Decolonize" Erases Anti-Blackness',
    slug: 'decolonize-erases-antiblackness',
    description: 'Examine how decolonization framing can exclude Black struggles.',
    content_type: 'video', content_url: 'https://example.com/videos/decolonize-erases-antiblackness.mp4',
    video_duration_seconds: 660, module_number: 4, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m4.id, {
    title: 'Afro-pessimism and Its Critiques',
    slug: 'afropessimism-critiques',
    description: 'Engage with debates about Black positionality in decolonial thought.',
    content_type: 'video', content_url: 'https://example.com/videos/afropessimism-critiques.mp4',
    video_duration_seconds: 600, module_number: 4, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m4.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-decolonizing',
    description: 'Comprehensive assessment of decolonizing anti-racism knowledge.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'How are settler colonialism and anti-Black racism connected?',
          options: [
            'They are completely separate issues',
            'Both are systems of white supremacy—colonialism dispossesses Indigenous lands while anti-Blackness dehumanizes and exploits Black labor and bodies',
            'Only colonialism is about white supremacy',
            'Anti-Black racism has nothing to do with colonialism'
          ],
          correct_answer: 1,
          explanation: 'Settler colonialism and anti-Black racism are interconnected white supremacist systems. Colonialism: dispossesses Indigenous peoples from land, establishes white settler states, exploits resources. Anti-Black racism: enslaves and dehumanizes Black people, extracts labor, positions Black people as property not people. Both rely on white supremacy as justification. In Canadian context, Black enslavement helped build colonial economy while Indigenous dispossession created "Canada" as settler state. Understanding this connection is essential—you cannot address one without the other. Decolonial anti-racism recognizes shared roots in white supremacy while respecting distinct struggles.'
        },
        {
          question: 'What does "Decolonization is not a metaphor" mean?',
          options: [
            'Decolonization can mean anything',
            'Decolonization must be literal—returning land, sovereignty, and self-determination to Indigenous peoples—not just diversity or "decolonizing your mind"',
            'Metaphors are bad',
            'Decolonization is only about changing language'
          ],
          correct_answer: 1,
          explanation: 'This critical phrase from Tuck and Yang means: decolonization is literal repatriation of Indigenous land and sovereignty, not metaphor for diversity, inclusion, or personal "decolonizing." When institutions say "decolonize the curriculum" without addressing land theft or Indigenous governance, they appropriate and defang decolonization. True decolonization requires settlers giving up land, power, resources—uncomfortable unsettling of colonial order. For anti-racism work: do not co-opt "decolonize" to mean anti-racism or equity work. Respect specificity of Indigenous decolonial struggles while doing anti-Black racism work in solidarity—they are related but distinct.'
        },
        {
          question: 'What is anti-Blackness in Indigenous communities?',
          options: [
            'Does not exist',
            'Anti-Black racism that can exist within Indigenous communities, shaped by colonial white supremacy and requiring accountability and solidarity-building',
            'Only settlers can be anti-Black',
            'Discussing it divides movements'
          ],
          correct_answer: 1,
          explanation: 'Anti-Blackness can exist in Indigenous communities, shaped by: colonial imposition of anti-Black racism (residential schools taught white supremacy), divide-and-conquer tactics pitting communities against each other, proximity to whiteness as survival strategy, and internalized hierarchies from colonialism. Examples: excluding Black Indigenous people, repeating anti-Black stereotypes, accessing resources while Black people cannot. Acknowledging this is not attacking Indigenous people—it is recognizing colonialism\'s reach and building genuine solidarity. Black and Indigenous peoples must address anti-Blackness while respecting Indigenous sovereignty and working together against white supremacy. Solidarity requires accountability, not erasure.'
        },
        {
          question: 'How should Black people approach decolonization discourse?',
          options: [
            'Black people should not engage with decolonization',
            'Black people can support Indigenous decolonization while centering anti-Black racism, recognizing overlapping but distinct struggles under white supremacy',
            'Decolonization and anti-racism are the same thing',
            'Black people are settlers'
          ],
          correct_answer: 1,
          explanation: 'Black people\'s relationship to decolonization is complex. Most Black Canadians are not settlers (did not benefit from land theft, many descended from enslaved people or refugees fleeing oppression). Black people can support Indigenous land return and sovereignty while also addressing anti-Black racism—these are distinct but related struggles against white supremacy. Mistakes to avoid: conflating decolonization with anti-racism (they overlap but are not same), erasing Black presence when discussing decolonization, or claiming Black people are settlers equivalent to white colonizers. Approach: build solidarity recognizing distinct oppressions, center Indigenous voices on land/sovereignty, and continue anti-Black racism work without appropriating decolonization language.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 15
    },
    module_number: 4, lesson_number: 3, sort_order: 3
  })
  console.log('✅ Module 4: 3 lessons')
  console.log('✅ Course 26 complete: 4 modules, 14 lessons\n')
}

console.log('=== PHASE 4 PART 1 POPULATION ===\n')

async function runAll() {
  await populateMentalHealthWellness()
  await populateDecolonizingPractice()
}

runAll()
  .then(() => console.log('\n✅ PART 1 COMPLETE: 2 Phase 4 courses populated!'))
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
