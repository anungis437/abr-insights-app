const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://nuywgvbkgdvngrysqdul.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXdndmJrZ2R2bmdyeXNxZHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2MTQ0OSwiZXhwIjoyMDc3OTM3NDQ5fQ.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
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

// Course 19: Anti-Racism in Legal Practice and the Justice System
async function populateLegalPractice() {
  console.log('\n📚 Course 19: Anti-Racism in Legal Practice and the Justice System')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'legal-practice-justice').single()
  if (!course) { console.log('❌ Course not found'); return }

  // Module 1: Legal Education and the Legal Profession
  const m1 = await createModule(course.id, {
    title: 'Anti-Black Racism in Legal Education and the Profession',
    description: 'Examine barriers and bias in law schools, bar admission, and legal practice.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction: Anti-Racism in Legal Systems',
    slug: 'intro-anti-racism-legal',
    description: 'Understand the scope of anti-Black racism in Canadian legal systems.',
    content_type: 'video',
    content_url: 'https://example.com/videos/intro-anti-racism-legal.mp4',
    video_duration_seconds: 540,
    module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Barriers in Legal Education',
    slug: 'barriers-legal-education',
    description: 'Examine systemic barriers Black students face in law school admission and success.',
    content_type: 'video',
    content_url: 'https://example.com/videos/barriers-legal-education.mp4',
    video_duration_seconds: 720,
    module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'The "Pipeline Problem" Myth',
    slug: 'pipeline-problem-myth',
    description: 'Challenge deficit narratives about Black representation in legal profession.',
    content_type: 'video',
    content_url: 'https://example.com/videos/pipeline-problem-myth.mp4',
    video_duration_seconds: 660,
    module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'Bias in Law Firm Hiring and Advancement',
    slug: 'bias-firm-hiring',
    description: 'Recognize how bias shapes hiring, evaluation, and partnership decisions.',
    content_type: 'video',
    content_url: 'https://example.com/videos/bias-firm-hiring.mp4',
    video_duration_seconds: 600,
    module_number: 1, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 1: 4 lessons')

  // Module 2: Judicial Bias and Courtroom Discrimination
  const m2 = await createModule(course.id, {
    title: 'Bias in Judicial Decision-Making',
    description: 'Examine anti-Black bias in bail, sentencing, and judicial proceedings.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Implicit Bias in Judges and Juries',
    slug: 'judicial-implicit-bias',
    description: 'Understand how implicit bias affects judicial and jury decision-making.',
    content_type: 'video',
    content_url: 'https://example.com/videos/judicial-implicit-bias.mp4',
    video_duration_seconds: 660,
    module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Sentencing Disparities in Canadian Courts',
    slug: 'sentencing-disparities-courts',
    description: 'Review Canadian data on racial disparities in sentencing.',
    content_type: 'video',
    content_url: 'https://example.com/videos/sentencing-disparities-courts.mp4',
    video_duration_seconds: 720,
    module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Jury Selection and Challenges for Cause',
    slug: 'jury-selection-bias',
    description: 'Examine racial bias in jury composition and selection processes.',
    content_type: 'video',
    content_url: 'https://example.com/videos/jury-selection-bias.mp4',
    video_duration_seconds: 600,
    module_number: 2, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m2.id, {
    title: 'Victim Impact and Credibility Bias',
    slug: 'victim-credibility-bias',
    description: 'Understand how Black victims are treated differently in legal proceedings.',
    content_type: 'video',
    content_url: 'https://example.com/videos/victim-credibility-bias.mp4',
    video_duration_seconds: 540,
    module_number: 2, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 2: 4 lessons')

  // Module 3: Access to Justice
  const m3 = await createModule(course.id, {
    title: 'Barriers to Legal Representation and Access',
    description: 'Address systemic barriers preventing Black communities from accessing justice.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'The Cost of Justice: Financial Barriers',
    slug: 'cost-justice-barriers',
    description: 'Examine how legal costs create barriers to justice for Black communities.',
    content_type: 'video',
    content_url: 'https://example.com/videos/cost-justice-barriers.mp4',
    video_duration_seconds: 600,
    module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Legal Aid and Public Defense Inadequacy',
    slug: 'legal-aid-inadequacy',
    description: 'Understand failures in legal aid systems serving Black defendants.',
    content_type: 'video',
    content_url: 'https://example.com/videos/legal-aid-inadequacy.mp4',
    video_duration_seconds: 660,
    module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Community Legal Clinics and Alternatives',
    slug: 'community-legal-clinics',
    description: 'Learn from community-led models for legal access.',
    content_type: 'video',
    content_url: 'https://example.com/videos/community-legal-clinics.mp4',
    video_duration_seconds: 540,
    module_number: 3, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 3: 3 lessons')

  // Module 4: Anti-Racist Legal Practice
  const m4 = await createModule(course.id, {
    title: 'Implementing Anti-Racist Legal Practice',
    description: 'Strategies for lawyers to practice anti-racism in their work.',
    sort_order: 4
  })

  await createLesson(course.id, m4.id, {
    title: 'Client-Centered Representation',
    slug: 'client-centered-representation',
    description: 'Center Black clients\' voices, experiences, and self-determination.',
    content_type: 'video',
    content_url: 'https://example.com/videos/client-centered-representation.mp4',
    video_duration_seconds: 660,
    module_number: 4, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m4.id, {
    title: 'Challenging Bias in Legal Proceedings',
    slug: 'challenging-bias-proceedings',
    description: 'Strategies for identifying and challenging bias in court.',
    content_type: 'video',
    content_url: 'https://example.com/videos/challenging-bias-proceedings.mp4',
    video_duration_seconds: 720,
    module_number: 4, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m4.id, {
    title: 'Pro Bono and Impact Litigation',
    slug: 'pro-bono-impact-litigation',
    description: 'Use legal skills to advance racial justice through strategic litigation.',
    content_type: 'video',
    content_url: 'https://example.com/videos/pro-bono-impact-litigation.mp4',
    video_duration_seconds: 600,
    module_number: 4, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m4.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-legal',
    description: 'Comprehensive assessment of anti-racism in legal practice.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is the "pipeline problem" myth in legal profession?',
          options: [
            'There genuinely are not enough qualified Black candidates',
            'The claim that lack of Black lawyers is due to pipeline rather than systemic barriers in hiring, retention, and advancement',
            'Black students do not want to pursue law',
            'Law schools have done enough to address diversity'
          ],
          correct_answer: 1,
          explanation: 'The "pipeline problem" narrative blames lack of Black representation on insufficient candidates rather than examining systemic barriers. In reality, Black law graduates face bias in hiring (coded language, "culture fit" screening), biased performance evaluations, exclusion from informal networks, microaggressions, glass ceilings blocking partnership, and hostile environments driving them out. The issue is not pipeline—it\'s what happens after graduation. Focusing on pipeline allows firms to avoid accountability for retention and advancement failures.'
        },
        {
          question: 'What do Canadian data show about sentencing disparities?',
          options: [
            'Black and white defendants receive equal sentences',
            'Black defendants receive harsher sentences than white defendants for similar offenses, even controlling for criminal history',
            'Judges are completely objective',
            'Sentencing disparities only exist in the United States'
          ],
          correct_answer: 1,
          explanation: 'Canadian data show Black defendants receive harsher sentences than white defendants for similar offenses, even after controlling for criminal history and offense severity. Black defendants are more likely to be denied bail, receive custodial sentences rather than alternatives, and get longer prison terms. This reflects implicit bias in how judges perceive Black defendants (more dangerous, less remorseful, greater flight risk) and systemic racism in sentencing guidelines and judicial discretion.'
        },
        {
          question: 'What are barriers to legal representation for Black communities?',
          options: [
            'Black people do not want lawyers',
            'High costs, inadequate legal aid, mistrust of legal system, lack of culturally competent representation, and systemic barriers to access',
            'There are no barriers',
            'Only financial barriers matter'
          ],
          correct_answer: 1,
          explanation: 'Black communities face multiple barriers to legal representation: high legal costs (hourly rates exclude many), chronically underfunded legal aid systems, lack of lawyers who understand anti-Black racism, mistrust of legal systems that have historically harmed Black people, geographic barriers (legal deserts in Black neighborhoods), language and cultural barriers, and fear of system involvement. These barriers mean Black people often navigate legal issues without adequate representation, perpetuating injustice.'
        },
        {
          question: 'What does anti-racist legal practice require?',
          options: [
            'Treating all clients exactly the same',
            'Centering Black clients\' voices, challenging bias in proceedings, using legal skills for justice, and examining your own biases',
            'Avoiding discussion of race',
            'Following standard procedures without question'
          ],
          correct_answer: 1,
          explanation: 'Anti-racist legal practice requires: centering Black clients as experts on their own lives, actively identifying and challenging bias in legal proceedings (voir dire, sentencing submissions), using legal skills strategically for racial justice (pro bono, impact litigation, policy advocacy), building trust with Black communities, examining your own biases and how they shape legal strategy, and advocating for systemic change beyond individual cases. Treating everyone "the same" ignores how racism operates and perpetuates inequity.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 15
    },
    module_number: 4, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 4: 4 lessons')
  console.log('✅ Course 19 complete: 4 modules, 15 lessons\n')
}

// Course 20: Technology, AI, and Algorithmic Justice
async function populateTechAIEthics() {
  console.log('\n📚 Course 20: Technology, AI, and Algorithmic Justice')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'tech-ai-ethics').single()
  if (!course) { console.log('❌ Course not found'); return }

  // Module 1: Understanding Algorithmic Bias
  const m1 = await createModule(course.id, {
    title: 'Algorithmic Bias and Anti-Black Discrimination',
    description: 'Understand how algorithms perpetuate and amplify anti-Black racism.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Introduction: Technology is Not Neutral',
    slug: 'tech-not-neutral',
    description: 'Challenge the myth of neutral, objective technology.',
    content_type: 'video',
    content_url: 'https://example.com/videos/tech-not-neutral.mp4',
    video_duration_seconds: 600,
    module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'What is Algorithmic Bias?',
    slug: 'what-is-algorithmic-bias',
    description: 'Define algorithmic bias and understand how it operates.',
    content_type: 'video',
    content_url: 'https://example.com/videos/what-is-algorithmic-bias.mp4',
    video_duration_seconds: 720,
    module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Training Data and Historical Bias',
    slug: 'training-data-bias',
    description: 'Understand how biased historical data creates biased algorithms.',
    content_type: 'video',
    content_url: 'https://example.com/videos/training-data-bias.mp4',
    video_duration_seconds: 660,
    module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'Facial Recognition and Surveillance Technology',
    slug: 'facial-recognition-surveillance',
    description: 'Examine racial bias in facial recognition and surveillance systems.',
    content_type: 'video',
    content_url: 'https://example.com/videos/facial-recognition-surveillance.mp4',
    video_duration_seconds: 600,
    module_number: 1, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 1: 4 lessons')

  // Module 2: AI in High-Stakes Decisions
  const m2 = await createModule(course.id, {
    title: 'AI in Criminal Justice, Hiring, and Healthcare',
    description: 'Examine how biased algorithms affect life-changing decisions.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Predictive Policing and Risk Assessment',
    slug: 'predictive-policing-risk',
    description: 'Understand how algorithms perpetuate over-policing of Black communities.',
    content_type: 'video',
    content_url: 'https://example.com/videos/predictive-policing-risk.mp4',
    video_duration_seconds: 720,
    module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Algorithmic Hiring and Resume Screening',
    slug: 'algorithmic-hiring',
    description: 'Examine bias in AI-powered hiring tools that screen out Black candidates.',
    content_type: 'video',
    content_url: 'https://example.com/videos/algorithmic-hiring.mp4',
    video_duration_seconds: 660,
    module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Healthcare Algorithms and Diagnostic Bias',
    slug: 'healthcare-algorithmic-bias',
    description: 'Understand racial bias in medical algorithms and health tech.',
    content_type: 'video',
    content_url: 'https://example.com/videos/healthcare-algorithmic-bias.mp4',
    video_duration_seconds: 600,
    module_number: 2, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m2.id, {
    title: 'Credit Scoring and Financial Algorithms',
    slug: 'credit-scoring-bias',
    description: 'Examine how algorithms perpetuate financial discrimination.',
    content_type: 'video',
    content_url: 'https://example.com/videos/credit-scoring-bias.mp4',
    video_duration_seconds: 540,
    module_number: 2, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 2: 4 lessons')

  // Module 3: Tech Industry Practices
  const m3 = await createModule(course.id, {
    title: 'Anti-Black Racism in Tech Industry',
    description: 'Examine diversity failures and hostile culture in technology sector.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'The Myth of Meritocracy in Tech',
    slug: 'meritocracy-myth-tech',
    description: 'Challenge narratives that blame Black underrepresentation on merit.',
    content_type: 'video',
    content_url: 'https://example.com/videos/meritocracy-myth-tech.mp4',
    video_duration_seconds: 660,
    module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Hostile Work Environments in Tech',
    slug: 'hostile-tech-environments',
    description: 'Understand experiences of Black tech workers facing discrimination.',
    content_type: 'video',
    content_url: 'https://example.com/videos/hostile-tech-environments.mp4',
    video_duration_seconds: 720,
    module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'The Digital Divide and Access Inequality',
    slug: 'digital-divide',
    description: 'Examine how technology access gaps perpetuate racial inequality.',
    content_type: 'video',
    content_url: 'https://example.com/videos/digital-divide.mp4',
    video_duration_seconds: 600,
    module_number: 3, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 3: 3 lessons')

  // Module 4: Ethical Tech and Accountability
  const m4 = await createModule(course.id, {
    title: 'Building Ethical AI and Tech Accountability',
    description: 'Strategies for creating equitable technology and ensuring accountability.',
    sort_order: 4
  })

  await createLesson(course.id, m4.id, {
    title: 'Principles of Ethical AI Development',
    slug: 'ethical-ai-principles',
    description: 'Learn frameworks for developing AI that does not perpetuate racism.',
    content_type: 'video',
    content_url: 'https://example.com/videos/ethical-ai-principles.mp4',
    video_duration_seconds: 720,
    module_number: 4, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m4.id, {
    title: 'Algorithmic Impact Assessments',
    slug: 'algorithmic-impact-assessments',
    description: 'Implement processes to assess algorithmic bias before deployment.',
    content_type: 'video',
    content_url: 'https://example.com/videos/algorithmic-impact-assessments.mp4',
    video_duration_seconds: 660,
    module_number: 4, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m4.id, {
    title: 'Advocating for Tech Justice',
    slug: 'tech-justice-advocacy',
    description: 'Build movements for algorithmic accountability and tech regulation.',
    content_type: 'video',
    content_url: 'https://example.com/videos/tech-justice-advocacy.mp4',
    video_duration_seconds: 600,
    module_number: 4, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m4.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-tech',
    description: 'Comprehensive assessment of algorithmic justice knowledge.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'Why is technology not neutral?',
          options: [
            'Technology is completely objective and neutral',
            'Technology is designed by people with biases, trained on biased data, and deployed in biased systems—reflecting and amplifying existing inequalities',
            'Only certain technologies are biased',
            'Bias can be easily removed from technology'
          ],
          correct_answer: 1,
          explanation: 'Technology is not neutral because: it\'s designed by people (often homogeneous tech teams) whose biases shape design choices, it\'s trained on historical data reflecting societal racism, algorithms optimize for patterns that include discriminatory patterns, deployment contexts are inequitable, and tech lacks transparency/accountability. The "neutral tech" myth allows companies to disclaim responsibility. In reality, facial recognition misidentifies Black faces, hiring algorithms screen out Black candidates, and predictive policing targets Black neighborhoods—by design, not accident.'
        },
        {
          question: 'What is the problem with predictive policing algorithms?',
          options: [
            'They accurately predict crime',
            'They are trained on biased policing data and create feedback loops that over-police Black communities',
            'They reduce bias in policing',
            'They are only used in the United States'
          ],
          correct_answer: 1,
          explanation: 'Predictive policing algorithms are trained on historical arrest data—which reflects biased policing, not actual crime patterns. If police historically over-policed Black neighborhoods (they did), algorithms "predict" crime there and send more police, leading to more arrests, which "confirms" the prediction. This creates a feedback loop amplifying existing bias. Algorithms don\'t predict crime—they predict where police have been. They legitimize discriminatory policing under the guise of "objective" data, making racism harder to challenge.'
        },
        {
          question: 'How do hiring algorithms discriminate against Black candidates?',
          options: [
            'They do not discriminate',
            'They are trained on past hiring data reflecting bias, use proxies for race, and penalize candidates from Black neighborhoods or schools',
            'They increase diversity',
            'Human recruiters are more biased than algorithms'
          ],
          correct_answer: 1,
          explanation: 'Hiring algorithms perpetuate discrimination by: being trained on historical hiring data (which reflected bias against Black candidates), using proxies for race (names, zip codes, schools, speech patterns), penalizing resume gaps common in marginalized communities, optimizing for "culture fit" (code for homogeneity), and lacking transparency. Amazon\'s algorithm penalized resumes mentioning "women\'s" organizations. Similar patterns affect Black candidates. Algorithms don\'t eliminate bias—they scale and legitimize it under claims of "objectivity."'
        },
        {
          question: 'What do ethical AI practices require?',
          options: [
            'Just testing for accuracy',
            'Diverse development teams, bias audits, impact assessments, transparency, accountability mechanisms, and centering affected communities',
            'Faster processing speeds',
            'More data collection'
          ],
          correct_answer: 1,
          explanation: 'Ethical AI requires: diverse development teams (not just white/Asian men), rigorous bias audits across racial groups, algorithmic impact assessments before deployment, transparency about how algorithms work, accountability when harm occurs, participatory design centering affected communities, ongoing monitoring for disparate impacts, and willingness to NOT deploy when harm cannot be mitigated. "Moving fast and breaking things" breaks people. Ethical AI prioritizes justice over profit.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 15
    },
    module_number: 4, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 4: 4 lessons')
  console.log('✅ Course 20 complete: 4 modules, 15 lessons\n')
}

console.log('=== PHASE 3 PART 1 POPULATION ===\n')

async function runAll() {
  await populateLegalPractice()
  await populateTechAIEthics()
}

runAll()
  .then(() => console.log('\n✅ PART 1 COMPLETE: 2 Phase 3 courses populated!'))
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
