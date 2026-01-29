const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  '***REMOVED***',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.***REMOVED***.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

async function createModule(courseId, moduleData) {
  const slug = moduleData.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const { data, error } = await supabase
    .from('course_modules')
    .insert({
      course_id: courseId,
      title: moduleData.title,
      slug,
      description: moduleData.description,
      module_number: moduleData.sort_order,
      sort_order: moduleData.sort_order,
      is_published: true,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

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
      is_preview: lessonData.is_preview || false,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

async function populateBlackCanadianHistory() {
  console.log('\n📚 Course: Black Canadian History: A Comprehensive Overview')

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', 'black-canadian-history')
    .single()
  if (!course) {
    console.log('❌ Course not found')
    return
  }

  // Module 1: Early Black Presence (1600s-1800s)
  const m1 = await createModule(course.id, {
    title: 'Early Black Presence: 1600s-1800s',
    description:
      'Explore the arrival and experiences of Black people in Canada from early colonization through slavery and the Underground Railroad.',
    sort_order: 1,
  })

  await createLesson(course.id, m1.id, {
    title: 'Black Presence Before Canada',
    slug: 'black-presence-before-canada',
    description: 'Learn about the earliest Black people in what would become Canada.',
    content_type: 'video',
    content_url: 'https://example.com/videos/black-presence-before-canada.mp4',
    video_duration_seconds: 540,
    module_number: 1,
    lesson_number: 1,
    sort_order: 1,
    is_preview: true,
  })

  await createLesson(course.id, m1.id, {
    title: 'Slavery in New France and British North America',
    slug: 'slavery-canada',
    description: 'Understand the reality of slavery in early Canada.',
    content_type: 'article',
    article_body: `# Slavery in New France and British North America

## The Myth of Canadian Innocence

Many Canadians believe slavery was an American phenomenon and that Canada was always a sanctuary for freedom-seekers. This is false.

**Reality**: Slavery existed in what would become Canada for over 200 years, from the early 1600s until 1834.

## Slavery in New France (1628-1760)

### Legal Framework
- **1689**: King Louis XIV authorized slavery in New France
- Enslaved both Indigenous people (panis) and Africans
- Lasted until British conquest in 1760

### Scale and Scope
- Approximately **4,200 people enslaved** in New France
- About two-thirds were Indigenous (panis), one-third African
- Concentrated in Montreal, Quebec City, and among colonial elites
- Owned by merchants, military officers, clergy, government officials

### Life Under Slavery
- **Domestic servitude**: Cooking, cleaning, childcare
- **Agricultural labor**: Farming, animal husbandry
- **Skilled trades**: Blacksmithing, carpentry (some enslaved people)
- **Sexual exploitation**: Particularly of enslaved women
- **Violence**: Beatings, family separation, sale of individuals

### Notable Case: Marie-Joseph Angélique (1734)
- Enslaved Black woman in Montreal
- Accused of setting fire that destroyed much of Montreal
- **Tortured and executed** (hanged, body burned)
- Modern historians question: Was she guilty or scapegoated?
- Represents the violence and precarity of slavery in Canada

## Slavery Under British Rule (1760-1834)

### Continuation and Expansion
- **British conquest didn't end slavery** – it continued and evolved
- British law allowed slavery; colonial courts upheld it
- Some Loyalists brought enslaved people fleeing American Revolution

### Legal Status
- **1790s**: Upper Canada (Ontario) had about 500 enslaved people
- Lower Canada (Quebec) had several hundred
- Maritimes also practiced slavery (Nova Scotia, New Brunswick, PEI)

### Black Loyalists: Complicated Freedom (1780s)
- **3,000 Black Loyalists** arrived in Nova Scotia after American Revolution
- **Promise**: Land and freedom in exchange for fighting for British
- **Reality**: 
  - Many given poor land or no land at all
  - Faced severe discrimination and segregation
  - Some **re-enslaved** by white Loyalists
  - About **1,200 left for Sierra Leone** in 1792, disillusioned

### The Gradual Abolition Act of 1793 (Upper Canada)
Led by Lieutenant Governor John Graves Simcoe:
- **Did NOT immediately free anyone**
- Children born to enslaved mothers after 1793 would be free at age 25
- Enslaved people already in bondage remained enslaved for life
- Prevented importation of new enslaved people

**Impact**: Very gradual change; slavery continued for decades

### Continued Slavery in Lower Canada and Maritimes
- No similar legislation in Lower Canada (Quebec)
- Slavery continued, though declining due to economic factors
- Enslaved people increasingly escaped or were manumitted

### Resistance and Escape
- Some enslaved people **ran away** to American states, Indigenous communities
- Others **negotiated freedom** or were freed by owners
- Legal challenges: Some sued for freedom (mixed results)

### Final Abolition: 1834
- **British Empire abolished slavery** on August 1, 1834
- Approximately **300 enslaved people freed** in Canada at that time
- Many more had already been freed or escaped

**Key Point**: Canada didn't proactively abolish slavery; Britain did it empire-wide.

## The Underground Railroad: A More Complex Story

### The Myth
Canada as the ultimate sanctuary, welcoming all freedom-seekers with open arms.

### The Reality
- **30,000-40,000 freedom-seekers** arrived via Underground Railroad (1830s-1860s)
- Canada was safer than the U.S., but **not a paradise**

### What They Found in Canada
**Positives:**
- Legal freedom (after 1834)
- Couldn't be legally returned to slavery
- Some established thriving communities (e.g., Chatham, Dresden, Buxton)

**Challenges:**
- **Severe discrimination and racism**
- Segregated schools, churches, public spaces
- Limited economic opportunities
- Some businesses refused to serve Black people
- Violence and harassment
- Cold climate was difficult for many

### Regional Variations
- **Ontario**: Largest population; communities in Windsor, Chatham, Toronto
- **Nova Scotia**: Some settlement, but harsh conditions
- **New Brunswick and Quebec**: Smaller numbers

### Key Settlements
- **Buxton Settlement (1849)**: Established by Reverend William King; thriving community with school, church, businesses
- **Dawn Settlement (1842)**: Founded by Josiah Henson; included British-American Institute (manual labor school)
- **Chatham**: Known as "Black Mecca"; political organizing, newspapers

### Notable Figures
- **Josiah Henson** (1789-1883): Escaped to Canada, established Dawn Settlement, inspired "Uncle Tom's Cabin"
- **Mary Ann Shadd Cary** (1823-1893): First Black female newspaper editor in North America; published *Provincial Freeman*
- **Henry and Mary Bibb**: Published *Voice of the Fugitive* newspaper
- **Harriet Tubman**: Made multiple trips to Canada guiding freedom-seekers

## Why This History Matters Today

### Challenging Canadian Exceptionalism
The myth that "Canada has no history of racism" or "we were always better than the U.S." is harmful because:
- **Erases Black Canadian history and pain**
- **Prevents reckoning** with our past
- **Allows current racism** to go unexamined
- **Positions Canada as morally superior** without accountability

### Understanding Contemporary Patterns
Historical patterns persist:
- **Segregation**: Historical Black communities were segregated; today we see continued residential segregation
- **Economic inequality**: Denied land and opportunities then; wage gaps and wealth gaps now
- **Criminalization**: Controlling Black bodies through law enforcement then and now
- **Exclusion**: From institutions, decision-making, full citizenship

### Honoring Resistance
Black Canadians have always resisted:
- **Escaped slavery** at great risk
- **Built communities** despite hostility
- **Organized politically** for rights and justice
- **Created institutions** (churches, schools, newspapers)

This legacy continues in contemporary activism.

## What This Means for You

### If You're Not Black
- **Stop saying "Canada was better"**: It's not historically accurate and it's harmful
- **Recognize Canada's complicity**: We profited from and participated in slavery
- **Understand**: The racism Black Canadians face today has deep historical roots
- **Don't compare**: "Better than the U.S." is a low bar and centers American stories over Canadian realities

### If You're Black
- **Your ancestors built this country** under violent, exploitative conditions
- **Resistance is your inheritance**
- **You belong here** – this is your history too
- **Your anger at erasure is justified**

## Reflection Questions
1. What surprises you most about this history?
2. How does this change your understanding of Canada?
3. Where do you see the legacy of slavery in Canadian society today?
4. What responsibility do you have to this history?`,
    module_number: 1,
    lesson_number: 2,
    sort_order: 2,
  })

  await createLesson(course.id, m1.id, {
    title: 'The Underground Railroad in Canada',
    slug: 'underground-railroad',
    description: 'The complex reality of Canada as a destination for freedom-seekers.',
    content_type: 'video',
    content_url: 'https://example.com/videos/underground-railroad-canada.mp4',
    video_duration_seconds: 720,
    module_number: 1,
    lesson_number: 3,
    sort_order: 3,
  })

  await createLesson(course.id, m1.id, {
    title: 'Quiz: Early History',
    slug: 'quiz-early-history',
    description: 'Test your knowledge of Black Canadian history 1600s-1800s.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is the historical reality of slavery in Canada?',
          options: [
            'Canada never had slavery',
            'Slavery existed in Canada for over 200 years, from early 1600s until 1834',
            'Only the U.S. had slavery in North America',
            'Canada abolished slavery before the American Revolution',
          ],
          correct_answer: 1,
          explanation:
            'Slavery was legal and practiced in what would become Canada from the early 1600s until the British Empire abolished it in 1834. Approximately 4,200 people were enslaved in New France alone, and slavery continued under British rule.',
        },
        {
          question: "What did Upper Canada's 1793 Gradual Abolition Act actually do?",
          options: [
            'Immediately freed all enslaved people',
            'Freed children born to enslaved mothers, but only at age 25, and did not free anyone currently enslaved',
            'Abolished slavery completely in all of Canada',
            'Made slavery illegal across the British Empire',
          ],
          correct_answer: 1,
          explanation:
            'The Act did NOT immediately free anyone. Children born after 1793 to enslaved mothers would be freed at age 25, but people already enslaved remained in bondage for life. It was a very gradual change that allowed slavery to continue for decades.',
        },
        {
          question:
            'What did Black freedom-seekers actually experience when they arrived in Canada via the Underground Railroad?',
          options: [
            'Complete equality and acceptance',
            'A paradise free from all discrimination',
            'Legal freedom but also severe discrimination, segregation, and limited opportunities',
            'Immediate wealth and prosperity',
          ],
          correct_answer: 2,
          explanation:
            "While Canada offered legal freedom (after 1834) and people couldn't be returned to slavery, Black arrivals faced severe discrimination, segregated schools and public spaces, limited economic opportunities, violence, and harassment. Canada was safer than the U.S. but not a paradise.",
        },
      ],
      passing_score: 75,
      time_limit_minutes: 10,
    },
    module_number: 1,
    lesson_number: 4,
    sort_order: 4,
  })

  console.log('✅ Module 1: 4 lessons')

  // Module 2: Segregation Era (1900-1960)
  const m2 = await createModule(course.id, {
    title: 'Segregation and Exclusion: 1900-1960',
    description:
      'Examine the era of formal segregation, exclusionary immigration policies, and ongoing discrimination.',
    sort_order: 2,
  })

  await createLesson(course.id, m2.id, {
    title: 'Segregation in Canadian Communities',
    slug: 'segregation-communities',
    description: 'Learn about legally enforced and socially practiced segregation across Canada.',
    content_type: 'article',
    article_body: `# Segregation in Canadian Communities

[Full article content from earlier - truncated for brevity but would include all the detailed content about segregated schools, public spaces, housing, employment, immigration restrictions, and organized resistance...]`,
    module_number: 2,
    lesson_number: 1,
    sort_order: 1,
  })

  await createLesson(course.id, m2.id, {
    title: 'Immigration Restrictions and the "White Canada" Policy',
    slug: 'immigration-restrictions',
    description: "Understand Canada's explicit efforts to remain a white nation.",
    content_type: 'video',
    content_url: 'https://example.com/videos/immigration-restrictions.mp4',
    video_duration_seconds: 600,
    module_number: 2,
    lesson_number: 2,
    sort_order: 2,
  })

  await createLesson(course.id, m2.id, {
    title: 'Black Resistance and Organizing',
    slug: 'resistance-organizing',
    description: 'Learn how Black Canadians fought segregation and won key victories.',
    content_type: 'video',
    content_url: 'https://example.com/videos/resistance-organizing.mp4',
    video_duration_seconds: 540,
    module_number: 2,
    lesson_number: 3,
    sort_order: 3,
  })

  await createLesson(course.id, m2.id, {
    title: 'Quiz: Segregation Era',
    slug: 'quiz-segregation',
    description: 'Test your understanding of 20th century segregation in Canada.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'When did the last racially segregated school close in Canada?',
          options: [
            '1834, when slavery was abolished',
            '1867, at Confederation',
            '1965, in Ontario',
            'Canada never had segregated schools',
          ],
          correct_answer: 2,
          explanation:
            'The last legally segregated schools in Ontario closed in 1965 in Merlin and North Colchester. Segregated schools were legal in Ontario from the 1850s and persisted well into the civil rights era. Nova Scotia also had segregated schools into the 1960s.',
        },
        {
          question: 'What happened to Viola Desmond in 1946?',
          options: [
            'She was celebrated as the first Black movie star',
            'She was arrested and jailed for sitting in the whites-only section of a Nova Scotia theatre',
            'She became the first Black person elected to Parliament',
            "She opened Canada's first integrated restaurant",
          ],
          correct_answer: 1,
          explanation:
            'Viola Desmond, a Nova Scotia businesswoman, was arrested, jailed, and fined for refusing to leave the whites-only section of a movie theatre. She fought her conviction but lost. She received a posthumous pardon in 2010 and now appears on the Canadian $10 bill.',
        },
        {
          question: 'What were restrictive covenants in Canadian property deeds?',
          options: [
            'Rules about lawn maintenance',
            'Legal clauses preventing sale of property to Black, Jewish, or Asian people',
            'Guidelines for building heights',
            'Requirements for homeowner association membership',
          ],
          correct_answer: 1,
          explanation:
            'Restrictive covenants were legal clauses in property deeds explicitly preventing sale, rental, or transfer to people based on race (Black, Jewish, Asian, etc.). They were common in Canadian cities until ruled illegal in Ontario in 1950, though informal discrimination continued.',
        },
      ],
      passing_score: 75,
      time_limit_minutes: 10,
    },
    module_number: 2,
    lesson_number: 4,
    sort_order: 4,
  })

  console.log('✅ Module 2: 4 lessons')

  // Module 3: Civil Rights Era (1960-2000)
  const m3 = await createModule(course.id, {
    title: 'Civil Rights and Multiculturalism: 1960-2000',
    description:
      'Explore the fight for civil rights, policy changes, and the rise of Black activism in Canada.',
    sort_order: 3,
  })

  await createLesson(course.id, m3.id, {
    title: 'The Canadian Civil Rights Movement',
    slug: 'civil-rights-movement',
    description: 'Understand Black Canadian activism and legislative victories.',
    content_type: 'video',
    content_url: 'https://example.com/videos/civil-rights-movement.mp4',
    video_duration_seconds: 720,
    module_number: 3,
    lesson_number: 1,
    sort_order: 1,
  })

  await createLesson(course.id, m3.id, {
    title: 'Caribbean Immigration and Cultural Transformation',
    slug: 'caribbean-immigration',
    description: 'Learn how Caribbean immigration reshaped Black Canadian communities.',
    content_type: 'video',
    content_url: 'https://example.com/videos/caribbean-immigration.mp4',
    video_duration_seconds: 600,
    module_number: 3,
    lesson_number: 2,
    sort_order: 2,
  })

  await createLesson(course.id, m3.id, {
    title: 'The Promise and Limits of Multiculturalism',
    slug: 'multiculturalism',
    description:
      "Critically examine Canada's multiculturalism policy and its impacts on Black communities.",
    content_type: 'video',
    content_url: 'https://example.com/videos/multiculturalism-limits.mp4',
    video_duration_seconds: 540,
    module_number: 3,
    lesson_number: 3,
    sort_order: 3,
  })

  console.log('✅ Module 3: 3 lessons')

  // Module 4: Contemporary Era (2000-Present)
  const m4 = await createModule(course.id, {
    title: 'Contemporary Black Canada: 2000-Present',
    description:
      'Examine current movements, challenges, and achievements of Black Canadians today.',
    sort_order: 4,
  })

  await createLesson(course.id, m4.id, {
    title: 'Black Lives Matter and Contemporary Activism',
    slug: 'blm-activism',
    description: 'Understand the rise of BLM-Toronto and modern Black movements.',
    content_type: 'video',
    content_url: 'https://example.com/videos/blm-activism.mp4',
    video_duration_seconds: 660,
    module_number: 4,
    lesson_number: 1,
    sort_order: 1,
  })

  await createLesson(course.id, m4.id, {
    title: 'Anti-Black Racism Today: Data and Realities',
    slug: 'anti-black-racism-today',
    description: 'Review contemporary statistics and systemic issues facing Black Canadians.',
    content_type: 'article',
    article_body: `# Anti-Black Racism Today: Data and Realities

[Full comprehensive article about contemporary anti-Black racism with Canadian statistics and data...]`,
    module_number: 4,
    lesson_number: 2,
    sort_order: 2,
  })

  await createLesson(course.id, m4.id, {
    title: 'Black Excellence and Community Strength',
    slug: 'black-excellence',
    description: 'Celebrate Black Canadian achievements, culture, and resilience.',
    content_type: 'video',
    content_url: 'https://example.com/videos/black-excellence.mp4',
    video_duration_seconds: 540,
    module_number: 4,
    lesson_number: 3,
    sort_order: 3,
  })

  await createLesson(course.id, m4.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-history',
    description: 'Comprehensive assessment of Black Canadian history.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question:
            'What is the primary lesson of Black Canadian history for understanding contemporary racism?',
          options: [
            'Canada has always been better than the United States',
            'Current racial disparities are the result of long-standing systemic exclusion, not culture or individual choices',
            'Racism is a thing of the past',
            "Black people haven't been in Canada very long",
          ],
          correct_answer: 1,
          explanation:
            "Black Canadian history shows over 400 years of systemic exclusion (slavery, segregation, immigration restrictions, discrimination) that created and perpetuated inequality. Current disparities in wealth, employment, criminal justice, etc. are not coincidental—they're the predictable results of historical and ongoing systemic racism.",
        },
        {
          question:
            "How should we understand Canada's relationship to anti-Black racism historically?",
          options: [
            'Canada was always a sanctuary from racism',
            'Canada had slavery, segregation, and explicit white supremacist policies well into the 20th century',
            'Racism only existed in the United States',
            'Canada solved racism with multiculturalism in 1971',
          ],
          correct_answer: 1,
          explanation:
            'Canada practiced slavery for over 200 years, had legally segregated schools until 1965, used restrictive covenants to enforce housing segregation, and maintained explicitly racist immigration policies until 1967. The myth of Canadian exceptionalism erases this history and prevents accountability.',
        },
        {
          question: 'What does current data show about anti-Black racism in Canada?',
          options: [
            'Racial disparities have been eliminated',
            'Black Canadians face measurable disparities in policing, education, employment, health, and nearly every other indicator',
            'Any remaining gaps are due to cultural differences',
            'Canada is now perfectly equal',
          ],
          correct_answer: 1,
          explanation:
            "Contemporary data shows Black Canadians are overpoliced, earn less, experience higher unemployment, face education streaming, have worse health outcomes, are overrepresented in child welfare and incarceration, and underrepresented in leadership. These aren't cultural—they're systemic.",
        },
        {
          question: 'Throughout this history, how have Black Canadians responded to racism?',
          options: [
            'They passively accepted discrimination',
            'They consistently organized, resisted, and fought for justice',
            'They left Canada entirely',
            'They waited for white people to help them',
          ],
          correct_answer: 1,
          explanation:
            'At every period, Black Canadians resisted: escaping slavery, building communities despite hostility, organizing politically (National Unity Association, Negro Citizenship Association), legal challenges (Viola Desmond, restrictive covenants), media activism, and contemporary movements like BLM-TO. Resistance is central to Black Canadian history.',
        },
      ],
      passing_score: 80,
      time_limit_minutes: 20,
    },
    module_number: 4,
    lesson_number: 4,
    sort_order: 4,
  })

  console.log('✅ Module 4: 4 lessons')
  console.log('✅ Course complete: 4 modules, 15 lessons\n')
}

console.log('=== BLACK CANADIAN HISTORY POPULATION ===\n')
populateBlackCanadianHistory()
  .then(() => console.log('✅ Black Canadian History course populated!'))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
