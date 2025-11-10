/**
 * Course Content Population Script
 * Creates world-class educational content for all 6 ABR courses
 * Includes modules, lessons with videos, articles, and quizzes
 */

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://nuywgvbkgdvngrysqdul.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXdndmJrZ2R2bmdyeXNxZHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2MTQ0OSwiZXhwIjoyMDc3OTM3NDQ5fQ.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

// Helper to create module
async function createModule(courseId, moduleData) {
  const slug = moduleData.title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  
  const { data, error } = await supabase
    .from('course_modules')
    .insert({
      course_id: courseId,
      title: moduleData.title,
      slug: slug,
      description: moduleData.description,
      module_number: moduleData.sort_order,
      sort_order: moduleData.sort_order,
      is_published: true
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Helper to create lesson
async function createLesson(courseId, moduleId, lessonData) {
  const { data, error } = await supabase
    .from('lessons')
    .insert({
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
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Course 1: Introduction to Anti-Black Racism
async function populateIntroToABR() {
  console.log('\n📚 Populating: Introduction to Anti-Black Racism')
  
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', 'intro-to-abr')
    .single()

  if (!course) {
    console.log('❌ Course not found')
    return
  }

  // Module 1: Foundations
  const module1 = await createModule(course.id, {
    title: 'Understanding Anti-Black Racism: Foundations',
    description: 'Explore the historical context and fundamental concepts of anti-Black racism in Canada.',
    sort_order: 1
  })

  await createLesson(course.id, module1.id, {
    title: 'What is Anti-Black Racism?',
    slug: 'what-is-anti-black-racism',
    description: 'Define anti-Black racism and distinguish it from general racism and discrimination.',
    content_type: 'video',
    content_url: 'https://example.com/videos/abr-definition.mp4',
    video_duration_seconds: 720,
    module_number: 1,
    lesson_number: 1,
    sort_order: 1,
    is_preview: true
  })

  await createLesson(course.id, module1.id, {
    title: 'The Canadian Context: Historical Overview',
    slug: 'canadian-context-history',
    description: 'Examine the history of Black Canadians from enslavement to present day.',
    content_type: 'article',
    article_body: `# The Canadian Context: Historical Overview

## Introduction

While Canada often portrays itself as a haven from slavery and discrimination, the reality is far more complex. Anti-Black racism has deep historical roots in Canada, dating back to the 1600s.

## Slavery in Canada (1628-1834)

- **New France Era**: Slavery was legal in New France from 1628
- **British Colonial Period**: Continued under British rule after 1763
- **Scale**: Over 4,000 enslaved people documented in Canada
- **Abolition**: 1834, though informal practices persisted

## Key Historical Periods

### 1. Post-Abolition Era (1834-1900)
- Segregated schools, churches, and public facilities
- Exclusionary immigration policies
- Limited economic opportunities

### 2. Early 20th Century (1900-1960)
- **1911**: Immigration Act explicitly restricted Black immigration
- **Viola Desmond (1946)**: Challenged segregation in Nova Scotia
- **Restrictive covenants**: Prevented Black families from buying property

### 3. Civil Rights Era (1960-1980)
- **1960**: Canadian Bill of Rights introduced
- **1962**: Immigration reforms removed racial restrictions
- **1971**: Multiculturalism policy adopted

### 4. Contemporary Period (1980-Present)
- Ongoing systemic barriers in employment, education, housing
- Over-policing and carding practices
- Anti-Black racism in institutions

## Impact on Black Communities Today

The legacy of this history manifests in:
- **Economic disparities**: Lower median incomes, higher unemployment
- **Educational barriers**: Lower graduation rates, streaming
- **Health inequities**: Higher maternal mortality, mental health challenges
- **Justice system**: Over-representation in prisons
- **Housing**: Discrimination in rental and purchase markets

## Key Takeaway

Understanding this history is essential to recognizing that anti-Black racism in Canada is not imported or incidental—it is homegrown and systemic.

## Reflection Questions

1. What surprised you most about Canada's history with slavery and segregation?
2. How does this history connect to present-day inequities you've observed?
3. What role does Canadian mythology about being "better than the US" play in denying our own racism?`,
    module_number: 1,
    lesson_number: 2,
    sort_order: 2
  })

  await createLesson(course.id, module1.id, {
    title: 'Systemic vs. Individual Racism',
    slug: 'systemic-vs-individual',
    description: 'Learn to differentiate between individual prejudice and systemic discrimination.',
    content_type: 'video',
    content_url: 'https://example.com/videos/systemic-racism.mp4',
    video_duration_seconds: 540,
    module_number: 1,
    lesson_number: 3,
    sort_order: 3
  })

  await createLesson(course.id, module1.id, {
    title: 'Knowledge Check: Foundations',
    slug: 'quiz-foundations',
    description: 'Test your understanding of anti-Black racism fundamentals.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'Anti-Black racism refers to:',
          options: [
            'Any form of discrimination based on skin color',
            'Prejudice, attitudes, and stereotypes specifically directed at people of Black/African descent',
            'Historical events that happened only in the United States',
            'Individual acts of meanness'
          ],
          correct_answer: 1,
          explanation: 'Anti-Black racism is the specific prejudice, attitudes, beliefs, stereotyping, and discrimination directed at people of African descent, rooted in their unique history and experience.'
        },
        {
          question: 'Slavery in Canada was abolished in:',
          options: ['1776', '1807', '1834', '1865'],
          correct_answer: 2,
          explanation: 'Slavery was abolished throughout the British Empire, including Canada, in 1834. However, this was not the end of anti-Black discrimination.'
        },
        {
          question: 'Systemic racism differs from individual racism because it:',
          options: [
            'Is more harmful',
            'Is embedded in policies, practices, and institutions',
            'Only affects Black people',
            'Is easier to identify'
          ],
          correct_answer: 1,
          explanation: 'Systemic racism is embedded in the policies, practices, and procedures of institutions and systems, creating barriers for racialized groups regardless of individual intentions.'
        },
        {
          question: 'Which Canadian province had legally segregated schools until 1965?',
          options: ['Ontario', 'Quebec', 'Nova Scotia', 'British Columbia'],
          correct_answer: 2,
          explanation: 'Nova Scotia maintained legally segregated schools for Black students until 1965, demonstrating the persistence of formal discrimination in Canada.'
        },
        {
          question: 'The concept of "Canadian exceptionalism" regarding racism refers to:',
          options: [
            'Canada being exceptionally anti-racist',
            'The false belief that Canada does not have a history of racism',
            'Canada having better diversity policies than other countries',
            'Black excellence in Canada'
          ],
          correct_answer: 1,
          explanation: 'Canadian exceptionalism is the myth that Canada is inherently more tolerant than other countries (especially the US), which obscures our own history and present reality of anti-Black racism.'
        }
      ],
      passing_score: 80,
      time_limit_minutes: 15
    },
    module_number: 1,
    lesson_number: 4,
    sort_order: 4
  })

  console.log(`✅ Module 1: ${module1.title} - 4 lessons`)

  // Module 2: Contemporary Manifestations
  const module2 = await createModule(course.id, {
    title: 'Contemporary Manifestations of Anti-Black Racism',
    description: 'Identify how anti-Black racism appears in modern Canadian society.',
    sort_order: 2
  })

  await createLesson(course.id, module2.id, {
    title: 'Anti-Black Racism in Employment',
    slug: 'employment-discrimination',
    description: 'Examine barriers Black Canadians face in hiring, promotion, and workplace culture.',
    content_type: 'video',
    content_url: 'https://example.com/videos/employment-discrimination.mp4',
    video_duration_seconds: 660,
    module_number: 2,
    lesson_number: 1,
    sort_order: 1
  })

  await createLesson(course.id, module2.id, {
    title: 'Education System Disparities',
    slug: 'education-disparities',
    description: 'Understand streaming, suspensions, and other barriers in education.',
    content_type: 'article',
    article_body: `# Education System Disparities

## The Achievement Gap

Black students in Canada face significant disparities in educational outcomes compared to their peers, not due to ability but due to systemic barriers.

## Key Issues

### 1. Academic Streaming
- **Definition**: The practice of placing students in different educational tracks
- **Impact on Black Students**: 
  - Disproportionately placed in applied/basic streams
  - Limited access to advanced courses
  - Reduces university eligibility
- **Statistics**: Black students in Ontario are 3x more likely to be streamed into non-academic tracks

### 2. Discipline Disparities
- Black students face higher rates of:
  - Suspensions and expulsions
  - Zero-tolerance policy enforcement
  - Involvement with police in schools
- **Root Causes**: 
  - Unconscious bias in discipline decisions
  - Adultification of Black children
  - Cultural misunderstandings

### 3. Curriculum Gap
- Limited representation of Black history and contributions
- Eurocentric curriculum perspectives
- February as only time Black history is addressed
- Lack of critical examination of racism in Canada

### 4. Teacher Diversity and Training
- Under-representation of Black teachers
- Insufficient anti-racism training
- Cultural disconnect between teachers and Black students
- Low expectations based on stereotypes

### 5. Special Education Over-Identification
- Black students over-identified for:
  - Behavioral programs
  - Learning disabilities
  - Special education placement
- Under-identified for gifted programs

## Case Study: Toronto District School Board

**2017 TDSB Report Findings:**
- Black students had graduation rates 15% lower than average
- Black students were 3x more likely to be suspended
- Black parents reported feeling unwelcome in schools
- Only 4% of teachers identified as Black vs. 12% of students

## Impact on Life Outcomes

Educational streaming and discipline disparities lead to:
- **Economic**: Lower earning potential
- **Social**: Reduced social mobility
- **Psychological**: Lower self-esteem and aspirations
- **Criminal Justice**: School-to-prison pipeline

## Promising Practices

1. **Culturally Responsive Teaching**: Pedagogy that recognizes students' cultural references
2. **Restorative Justice**: Alternative to punitive discipline
3. **Inclusive Curriculum**: Integrating Black history year-round
4. **Parent Engagement**: Building trust with Black families
5. **Data Collection**: Disaggregated race-based data to identify disparities

## Reflection Questions

1. Have you witnessed streaming or discipline disparities in your educational experience?
2. How might unconscious bias influence teacher perceptions of Black students?
3. What steps can schools take to close these gaps?`,
    module_number: 2,
    lesson_number: 2,
    sort_order: 2
  })

  await createLesson(course.id, module2.id, {
    title: 'Policing and the Justice System',
    slug: 'policing-justice',
    description: 'Explore racial profiling, carding, and disproportionate incarceration.',
    content_type: 'video',
    content_url: 'https://example.com/videos/policing-justice.mp4',
    video_duration_seconds: 780,
    module_number: 2,
    lesson_number: 3,
    sort_order: 3
  })

  await createLesson(course.id, module2.id, {
    title: 'Knowledge Check: Contemporary Issues',
    slug: 'quiz-contemporary',
    description: 'Assess your understanding of current manifestations of anti-Black racism.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'Academic streaming disproportionately affects Black students by:',
          options: [
            'Providing specialized education',
            'Placing them in lower academic tracks, limiting opportunities',
            'Helping them graduate faster',
            'Giving them more teacher attention'
          ],
          correct_answer: 1,
          explanation: 'Streaming places Black students disproportionately in applied or basic level courses, limiting access to university and career opportunities despite ability.'
        },
        {
          question: 'The term "carding" refers to:',
          options: [
            'Checking identification at clubs',
            'Police randomly stopping and documenting individuals',
            'Credit card fraud',
            'School identification systems'
          ],
          correct_answer: 1,
          explanation: 'Carding (or street checks) is the practice of police arbitrarily stopping, questioning, and documenting individuals. Data shows Black people are disproportionately carded.'
        },
        {
          question: 'Black students in Ontario are approximately how many times more likely to be suspended than white students?',
          options: ['Same rate', '1.5 times', '3 times', '5 times'],
          correct_answer: 2,
          explanation: 'Research shows Black students in Ontario are approximately 3 times more likely to be suspended, even for similar behaviors, indicating bias in discipline.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 10
    },
    module_number: 2,
    lesson_number: 4,
    sort_order: 4
  })

  console.log(`✅ Module 2: ${module2.title} - 4 lessons`)

  // Module 3: Personal Reflection and Action
  const module3 = await createModule(course.id, {
    title: 'Personal Reflection and Taking Action',
    description: 'Examine your own biases and learn concrete steps to combat anti-Black racism.',
    sort_order: 3
  })

  await createLesson(course.id, module3.id, {
    title: 'Examining Your Own Biases',
    slug: 'examining-biases',
    description: 'Tools and strategies for identifying unconscious bias.',
    content_type: 'article',
    article_body: `# Examining Your Own Biases

## Understanding Unconscious Bias

We all have biases—mental shortcuts our brains make based on societal conditioning, media representation, and personal experience. Recognizing them is the first step to change.

## Common Anti-Black Biases

### 1. Competence Bias
- **Assumption**: Black people are less qualified or capable
- **Manifestation**: Questioning credentials, surprised by eloquence or intelligence
- **Example**: "You're so well-spoken" as a backhanded compliment

### 2. Threat Perception Bias
- **Assumption**: Black people (especially men) are dangerous or aggressive
- **Manifestation**: Clutching belongings, crossing the street, security following
- **Impact**: Creates hostile environment, emotional labor

### 3. Authority Bias
- **Assumption**: Black people don't belong in leadership or professional roles
- **Manifestation**: Mistaking Black professionals for service staff
- **Example**: Assuming the Black person at a meeting is junior staff

### 4. Respectability Politics
- **Assumption**: Black people must work twice as hard to be considered "acceptable"
- **Manifestation**: Policing Black hair, dress, language, or cultural expression
- **Impact**: Requires code-switching and cultural suppression

## Self-Examination Exercises

### Reflection Journal Prompts

1. **First Exposure**: What were your first exposures to Black people? (Media, neighbors, school?) What messages did you receive?

2. **Immediate Reactions**: When you see a Black person in public, what are your immediate, uncensored thoughts? Be honest with yourself.

3. **Media Consumption**: What percentage of your media (news, entertainment, social media) features Black creators and voices?

4. **Personal Relationships**: Do you have genuine friendships with Black people? Not colleagues or acquaintances, but close friends?

5. **Defensive Reactions**: When someone points out racism, what's your first reaction? Defensiveness? Denial? Curiosity?

### The IAT (Implicit Association Test)

Project Implicit offers free tests measuring unconscious biases:
- **Race IAT**: Measures automatic associations between race and concepts
- **Skin-tone IAT**: Examines bias between light and dark skin
- **Take it**: implicit.harvard.edu

### Behavioral Audit

Track your behavior for one week:
- Who do you make eye contact with on the street?
- Whose posts do you engage with on social media?
- Who do you interrupt in meetings?
- Whose ideas do you credit?
- Who do you assume is in charge?

## Moving from Awareness to Action

**Recognizing bias is not enough—we must actively work to change.**

### 1. Educate Yourself
- Read books by Black authors
- Follow Black activists and educators
- Learn Black Canadian history

### 2. Speak Up
- Challenge racist jokes and comments
- Correct misinformation
- Don't make Black colleagues do all the education

### 3. Amplify Black Voices
- Share Black creators' work
- Credit ideas to Black colleagues
- Support Black-owned businesses

### 4. Examine Systems
- Question who has power in your organization
- Advocate for policy changes
- Support anti-racism initiatives

### 5. Accept Discomfort
- Being called out is not an attack—it's an opportunity
- Center the harm caused, not your intentions
- Apologize, learn, and do better

## Important Reminders

- **Intent ≠ Impact**: Good intentions don't negate harmful impact
- **Not About Perfection**: You will make mistakes; how you respond matters
- **Ongoing Work**: Anti-racism is a lifelong commitment, not a destination
- **Listen to Black People**: Their lived experience is the expertise

## Reflection Questions

1. What biases did this lesson help you recognize in yourself?
2. What makes you most uncomfortable about examining your biases?
3. What's one concrete action you'll take this week to address your biases?`,
    module_number: 3,
    lesson_number: 1,
    sort_order: 1
  })

  await createLesson(course.id, module3.id, {
    title: 'Bystander Intervention Strategies',
    slug: 'bystander-intervention',
    description: 'Learn when and how to intervene when witnessing anti-Black racism.',
    content_type: 'video',
    content_url: 'https://example.com/videos/bystander-intervention.mp4',
    video_duration_seconds: 600,
    module_number: 3,
    lesson_number: 2,
    sort_order: 2
  })

  await createLesson(course.id, module3.id, {
    title: 'Creating Change in Your Sphere',
    slug: 'creating-change',
    description: 'Practical actions you can take in your workplace, community, and personal life.',
    content_type: 'video',
    content_url: 'https://example.com/videos/creating-change.mp4',
    video_duration_seconds: 540,
    module_number: 3,
    lesson_number: 3,
    sort_order: 3
  })

  await createLesson(course.id, module3.id, {
    title: 'Final Assessment',
    slug: 'final-assessment',
    description: 'Comprehensive assessment of course learning.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'Unconscious bias:',
          options: [
            'Only affects racist people',
            'Can be completely eliminated with training',
            'Exists in everyone and requires ongoing work to address',
            'Is not relevant to anti-Black racism'
          ],
          correct_answer: 2,
          explanation: 'Unconscious bias affects everyone due to societal conditioning. Recognizing and actively working to counter these biases is an ongoing process.'
        },
        {
          question: 'When witnessing anti-Black racism, the most important consideration is:',
          options: [
            'Your own comfort',
            'The safety and wishes of the person experiencing racism',
            'Not making a scene',
            'Proving you are not racist'
          ],
          correct_answer: 1,
          explanation: 'The safety and preferences of the person experiencing racism should guide your intervention. Sometimes direct intervention can escalate harm.'
        },
        {
          question: 'Which statement reflects accountability after making a racist mistake?',
          options: [
            '"I\'m not racist, I have Black friends"',
            '"I\'m sorry you felt that way"',
            '"I apologize for the harm I caused. I will educate myself and do better"',
            '"You\'re too sensitive"'
          ],
          correct_answer: 2,
          explanation: 'True accountability involves acknowledging harm without defensiveness, taking responsibility, and committing to change without burdening the harmed person with your education.'
        },
        {
          question: 'Anti-racism work is:',
          options: [
            'A one-time training',
            'Only for Black people to do',
            'A lifelong commitment requiring continuous learning and action',
            'Complete once you understand the issues'
          ],
          correct_answer: 2,
          explanation: 'Anti-racism is ongoing work that requires continuous learning, unlearning, and action. It is never "complete" because society and we ourselves are always evolving.'
        }
      ],
      passing_score: 85,
      time_limit_minutes: 20
    },
    module_number: 3,
    lesson_number: 4,
    sort_order: 4
  })

  console.log(`✅ Module 3: ${module3.title} - 4 lessons`)
  console.log(`✅ Course complete: 3 modules, 12 lessons`)
}

// Main execution
async function main() {
  console.log('=== COURSE CONTENT POPULATION (PART 1) ===')
  console.log('World-class educational content for ABR courses\n')

  try {
    await populateIntroToABR()
    
    console.log('\n✅ Part 1 Complete - Course 1 populated')
    console.log('Run the next script for remaining courses...')
  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err)
  process.exit(1)
})
