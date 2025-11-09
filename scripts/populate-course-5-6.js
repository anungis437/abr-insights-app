const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://nuywgvbkgdvngrysqdul.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXdndmJrZ2R2bmdyeXNxZHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2MTQ0OSwiZXhwIjoyMDc3OTM3NDQ5fQ.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
)

async function createModule(courseId, moduleData) {
  const slug = moduleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const { data, error } = await supabase
    .from('course_modules')
    .insert({
      course_id: courseId,
      title: moduleData.title,
      slug,
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

async function populateCourse5() {
  console.log('\n📚 Course 5: Leadership for Racial Equity')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'leadership-equity').single()
  if (!course) { console.log('❌ Course not found'); return }

  // Module 1: Organizational Change
  const m1 = await createModule(course.id, {
    title: 'Leading Organizational Change for Racial Equity',
    description: 'Understanding how to drive systemic change within organizations.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'The Case for Racial Equity in Organizations',
    slug: 'case-for-racial-equity',
    description: 'Why racial equity is essential for organizational success.',
    content_type: 'video',
    content_url: 'https://example.com/videos/case-for-equity.mp4',
    video_duration_seconds: 780,
    module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Assessing Your Organization\'s Current State',
    slug: 'assessing-current-state',
    description: 'Tools and frameworks for conducting a racial equity audit.',
    content_type: 'article',
    article_body: `# Assessing Your Organization's Current State

## Why Assessment Matters
Before implementing change, you must understand your starting point. A comprehensive racial equity assessment reveals gaps, barriers, and opportunities.

## Key Assessment Areas

### 1. Workforce Demographics
- Representation at all levels (entry, mid-level, leadership, executive)
- Retention and turnover rates by race
- Promotion rates and time-to-promotion
- **Questions to ask**: Are Black employees represented proportionally? Where are the gaps?

### 2. Hiring Practices
- Applicant pool diversity
- Interview-to-hire ratios by race
- Job description language and requirements
- Recruitment channels and outreach
- **Red flags**: "Culture fit" criteria, unpaid internships, overly restrictive requirements

### 3. Compensation and Benefits
- Pay equity analysis by race and role
- Bonus and incentive distribution
- Benefits utilization patterns
- **Look for**: Unexplained pay gaps, benefits that exclude certain groups

### 4. Workplace Culture
- Employee engagement scores by race
- Exit interview data
- Reported incidents of discrimination
- Participation in ERGs and initiatives
- **Indicators**: Lower engagement among Black employees, disproportionate departures

### 5. Policies and Practices
- Performance evaluation systems
- Flexible work policies
- Dress code and appearance standards
- Disciplinary procedures
- **Examine**: Subjective criteria, unequal application, culturally biased standards

## Assessment Tools

### Quantitative Data
- HRIS data analysis
- Pay equity studies
- Turnover analysis
- Promotion tracking

### Qualitative Data
- Employee surveys (ensure anonymity)
- Focus groups with Black employees
- Exit interviews
- Cultural competency assessments

### External Benchmarking
- Industry standards
- Regional demographics
- Best-in-class organizations

## Conducting the Assessment

### Step 1: Secure Leadership Commitment
Ensure executives understand the importance and support the process.

### Step 2: Assemble the Right Team
Include HR, DEI leads, Black employees, and external consultants if needed.

### Step 3: Collect Data
Gather quantitative and qualitative information systematically.

### Step 4: Analyze Findings
Look for patterns, disparities, and root causes.

### Step 5: Share Results Transparently
Communicate findings honestly with the organization.

### Step 6: Develop Action Plan
Create specific, measurable goals based on assessment results.

## Common Pitfalls to Avoid
- **Defensiveness**: Don't dismiss findings as "not that bad"
- **Analysis paralysis**: Don't delay action while seeking perfect data
- **Siloing**: Don't limit assessment to HR; examine all business functions
- **Superficiality**: Go beyond surface metrics to understand root causes
- **Ignoring Black voices**: Center Black employees' lived experiences

## Reflection Questions
1. What existing data does your organization have about racial equity?
2. What are the biggest gaps in your current understanding?
3. Who needs to be involved in the assessment process?
4. How will you ensure findings lead to action rather than reports that sit on shelves?`,
    module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Change Management Principles',
    slug: 'change-management-principles',
    description: 'Applying change management frameworks to racial equity initiatives.',
    content_type: 'video',
    content_url: 'https://example.com/videos/change-management.mp4',
    video_duration_seconds: 660,
    module_number: 1, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 1: 3 lessons')

  // Module 2: Policy Development
  const m2 = await createModule(course.id, {
    title: 'Developing Anti-Racist Policies and Practices',
    description: 'Creating and implementing policies that advance racial equity.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Policy Review Through a Racial Equity Lens',
    slug: 'policy-review-equity-lens',
    description: 'How to evaluate existing policies for racial equity impact.',
    content_type: 'video',
    content_url: 'https://example.com/videos/policy-review.mp4',
    video_duration_seconds: 720,
    module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Writing Inclusive Policies',
    slug: 'writing-inclusive-policies',
    description: 'Best practices for drafting policies that promote equity.',
    content_type: 'article',
    article_body: `# Writing Inclusive Policies

## The Foundation: Equity vs. Equality
Inclusive policies recognize that equal treatment doesn't always lead to equitable outcomes. Effective policies acknowledge different starting points and remove barriers.

## Key Principles

### 1. Clarity and Accessibility
- Use plain language, not legal jargon
- Make policies available in multiple languages
- Ensure readability for all education levels
- **Example**: Instead of "utilize", say "use"

### 2. Specificity
- Define terms clearly (e.g., what counts as "discrimination"?)
- Provide concrete examples
- Outline clear processes and timelines
- **Bad**: "Discrimination will not be tolerated"
- **Good**: "Discrimination based on race includes [specific behaviors]. Employees can report incidents to [specific person] within [timeframe]."

### 3. Proactive Rather Than Reactive
- Don't just prohibit discrimination; actively promote equity
- Include affirmative measures, not just prohibitions
- **Example**: Not just "no discrimination in hiring" but "actively recruit from HBCUs and Black professional networks"

### 4. Accountability Mechanisms
- Assign clear responsibility
- Include enforcement procedures
- Specify consequences for violations
- Establish review and update cycles

## Common Policy Areas

### Recruitment and Hiring
**Inclusive elements**:
- Diverse interview panels required
- Structured interviews with standardized questions
- Removal of degree requirements where not essential
- Paid internships and apprenticeships
- Ban-the-box provisions
- Expanded recruitment to HBCUs and community organizations

### Compensation
**Inclusive elements**:
- Regular pay equity audits
- Transparent salary bands
- Standardized promotion criteria
- Prohibit salary history questions

### Performance Management
**Inclusive elements**:
- Multiple evaluators to reduce bias
- Clear, objective performance criteria
- Regular feedback, not just annual reviews
- Training for managers on bias in evaluations

### Professional Development
**Inclusive elements**:
- Equitable access to training and mentorship
- Sponsorship programs for Black employees
- Support for external professional development
- Leadership development pipelines

### Flexible Work
**Inclusive elements**:
- Available to all levels, not just executives
- Clear eligibility criteria
- No penalty for usage
- Accommodation for caregiving responsibilities

### Dress Code and Grooming
**Inclusive elements**:
- Allow natural Black hairstyles
- No restrictions on locs, braids, twists, afros
- Avoid culturally biased terms like "professional" appearance
- Focus on safety requirements only where relevant

## The Policy Development Process

### Step 1: Research and Consultation
- Review best practices
- Consult with Black employees and ERGs
- Examine legal requirements
- Analyze current gaps

### Step 2: Drafting
- Use inclusive language
- Include input from diverse stakeholders
- Have Black employees review for blind spots
- Consider unintended consequences

### Step 3: Review and Approval
- Legal review for compliance
- Leadership approval
- Union consultation if applicable

### Step 4: Communication and Training
- Clear rollout plan
- Training for all affected staff
- Accessible policy repository
- Regular reminders and reinforcement

### Step 5: Implementation and Monitoring
- Track compliance
- Collect feedback
- Measure outcomes
- Adjust as needed

## Red Flags in Policies

Watch out for:
- **Subjective criteria**: "Professional appearance," "culture fit," "leadership presence"
- **Gatekeeping**: Unnecessary degree requirements, unpaid internships
- **Unequal application**: Different standards for different groups
- **Lack of accountability**: No consequences for violations
- **Vague language**: "As appropriate," "when possible"

## Case Study: Dress Code Reform

**Before**: "Employees must maintain a professional appearance at all times. Extreme or distracting hairstyles are prohibited."

**Issues**: 
- "Professional" is culturally coded as white/Eurocentric
- "Extreme" or "distracting" are subjective
- Likely to be enforced discriminately against Black hairstyles

**After**: "Employees may wear any hairstyle they choose. For safety reasons, employees in [specific roles] must secure long hair while operating machinery."

**Impact**: 
- Clear, objective criteria
- No culturally biased language
- Safety requirements only where necessary

## Reflection Questions
1. What policies in your organization might have disparate impact on Black employees?
2. How can you involve Black employees in policy review and development?
3. What accountability mechanisms are needed to ensure policies are followed?
4. How often should policies be reviewed and updated?`,
    module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Implementation and Accountability',
    slug: 'implementation-accountability',
    description: 'Ensuring policies are enforced consistently and effectively.',
    content_type: 'video',
    content_url: 'https://example.com/videos/policy-implementation.mp4',
    video_duration_seconds: 600,
    module_number: 2, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m2.id, {
    title: 'Quiz: Policy Development',
    slug: 'quiz-policy-development',
    description: 'Test your understanding of inclusive policy development.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is the key difference between equality and equity in policy development?',
          options: [
            'Equality means everyone gets the same thing; equity means everyone gets what they need',
            'Equality is newer; equity is an older concept',
            'Equality applies to race; equity applies to gender',
            'They mean the same thing'
          ],
          correct_answer: 0,
          explanation: 'Equality treats everyone the same, which may not address different needs or barriers. Equity recognizes that people start from different places and provides what each person needs to achieve fair outcomes.'
        },
        {
          question: 'Which of the following is a red flag in a workplace policy?',
          options: [
            'Specific examples of prohibited conduct',
            'Clear reporting procedures with timelines',
            'Subjective language like "professional appearance" without definition',
            'Regular review and update schedule'
          ],
          correct_answer: 2,
          explanation: 'Subjective terms like "professional appearance" can be interpreted through cultural biases and enforced discriminately. Policies should use objective, clearly defined criteria.'
        },
        {
          question: 'Why should Black employees be involved in policy development?',
          options: [
            'It\'s legally required',
            'They can identify barriers and unintended consequences that others might miss',
            'To check for grammar and spelling errors',
            'So they can\'t complain later'
          ],
          correct_answer: 1,
          explanation: 'Black employees have lived experience with racism and can identify issues that others might overlook. Their input helps create more effective policies and demonstrates genuine commitment to equity.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 10
    },
    module_number: 2, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 2: 4 lessons')

  // Module 3: Building Inclusive Culture
  const m3 = await createModule(course.id, {
    title: 'Building and Sustaining an Inclusive Culture',
    description: 'Creating workplace environments where Black employees thrive.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'What Inclusive Culture Really Means',
    slug: 'what-inclusive-culture-means',
    description: 'Moving beyond diversity to true inclusion and belonging.',
    content_type: 'article',
    article_body: `# What Inclusive Culture Really Means

## Beyond "Diversity"
Many organizations focus on diversity—getting Black people in the door—without creating inclusive cultures where they can thrive. True inclusion means Black employees feel valued, respected, and able to bring their full selves to work.

## The Spectrum

### Diversity
**Definition**: Representation of different groups
**What it looks like**: Hiring Black employees
**Limitation**: Doesn't address whether they feel welcome or can succeed

### Inclusion
**Definition**: Actively involving and valuing all employees
**What it looks like**: Black employees participate fully in decisions and opportunities
**Limitation**: May still operate within dominant culture norms

### Belonging
**Definition**: Feeling accepted for who you are
**What it looks like**: Black employees don't have to code-switch or minimize their identity
**Goal**: This is what we're aiming for

### Equity
**Definition**: Fair access to opportunities and resources
**What it looks like**: Systems and policies that account for different starting points and barriers
**Critical**: Must accompany inclusion to create real change

## Characteristics of Inclusive Culture

### 1. Psychological Safety
Black employees can:
- Speak up without fear of retaliation
- Disagree with managers respectfully
- Report discrimination without career consequences
- Make mistakes without harsher judgment than white peers
- Express their authentic selves

### 2. Equitable Opportunities
- Promotions and development based on clear criteria, not "potential" or "fit"
- Access to high-visibility projects and sponsors
- Mentorship and networking opportunities
- Fair distribution of desirable assignments

### 3. Respect for Identity
- Black culture and communication styles are valued, not just tolerated
- Black hair is celebrated, not policed
- Cultural holidays and events are recognized
- No pressure to assimilate to white norms

### 4. Accountability
- Leadership takes racism seriously
- Swift response to incidents
- Consequences for discriminatory behavior
- Regular measurement and transparency

### 5. Shared Power
- Black employees in decision-making roles
- Input sought and valued on organizational direction
- Resources allocated to Black-led initiatives
- Authentic partnership, not tokenism

## What Inclusive Culture Is NOT

### X Not: "Celebrating" Black History Month
**Why it's insufficient**: One month of recognition doesn't address systemic barriers the other 11 months.
**Better**: Year-round commitment to equity in hiring, promotion, and pay.

### X Not: A Black employee in a senior role
**Why it's insufficient**: Tokenism without changing systems.
**Better**: Multiple Black leaders at all levels with genuine authority and support.

### X Not: Diversity training
**Why it's insufficient**: Training alone doesn't change culture without policy and accountability.
**Better**: Training plus systemic changes, measurement, and consequences.

### X Not: "Colorblind" approach
**Why it's insufficient**: Ignoring race means ignoring racism.
**Better**: Actively anti-racist culture that acknowledges and addresses racial dynamics.

### X Not: Relying on Black employees to fix racism
**Why it's insufficient**: Places burden on those already harmed.
**Better**: White leadership taking ownership of change.

## Building Blocks of Inclusive Culture

### Leadership Commitment
- Visible, vocal support from executives
- Personal accountability for equity goals
- Resources allocated to equity work
- Willingness to make hard decisions

### Clear Values and Expectations
- Anti-racism explicitly stated as organizational value
- Behavioral expectations defined
- Integration into performance evaluations
- Consistent messaging and modeling

### Systems and Structures
- Equity embedded in all policies and processes
- Regular audits and assessments
- Data-driven decision making
- Accountability mechanisms

### Employee Voice and Agency
- Black employees have platforms to be heard
- Feedback is acted upon, not just collected
- ERGs are resourced and influential
- Co-creation of solutions

### Continuous Learning
- Ongoing education on anti-racism
- Space for mistakes and growth
- Willingness to be uncomfortable
- Humility and openness to feedback

## Measuring Inclusive Culture

### Quantitative Indicators
- Representation across levels
- Retention and turnover rates
- Promotion rates
- Pay equity
- Employee engagement scores

### Qualitative Indicators
- Exit interview themes
- Stay interview insights
- Employee survey comments
- Participation in ERGs and initiatives
- Reported incidents and resolutions

### Behavioral Indicators
- Who speaks in meetings?
- Who gets interrupted?
- Whose ideas are credited?
- Who socializes with whom?
- Who gets development opportunities?

## The Journey
Building inclusive culture is ongoing work, not a destination. It requires:
- **Patience**: Culture change takes time
- **Persistence**: Setbacks will happen
- **Honesty**: Face hard truths
- **Courage**: Make unpopular decisions
- **Humility**: Listen and learn

## Reflection Questions
1. On the diversity-to-equity spectrum, where is your organization?
2. What would Black employees say about the culture?
3. What's one concrete step you could take this month to build more inclusive culture?
4. Who are your allies in this work?`,
    module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Supporting Black Employee Resource Groups',
    slug: 'supporting-black-ergs',
    description: 'How leadership can effectively support and empower Black ERGs.',
    content_type: 'video',
    content_url: 'https://example.com/videos/supporting-ergs.mp4',
    video_duration_seconds: 540,
    module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-leadership',
    description: 'Comprehensive assessment of leadership for racial equity concepts.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is the key limitation of focusing only on diversity without inclusion?',
          options: [
            'It costs too much money',
            'It brings in Black employees but doesn\'t create an environment where they can thrive',
            'It violates employment laws',
            'It takes too much time'
          ],
          correct_answer: 1,
          explanation: 'Diversity (representation) without inclusion means Black employees may be hired but face barriers to advancement, belonging, and success. True equity requires both diverse representation and inclusive culture.'
        },
        {
          question: 'Which approach demonstrates genuine leadership commitment to racial equity?',
          options: [
            'Sending a statement after a racial justice incident',
            'Hosting a lunch-and-learn during Black History Month',
            'Conducting a racial equity audit and transparently sharing results and action plans',
            'Hiring a Chief Diversity Officer'
          ],
          correct_answer: 2,
          explanation: 'Genuine commitment involves assessing current state, being transparent about findings, and taking concrete action. Statements and one-time events without systemic change are performative.'
        },
        {
          question: 'What is a key principle for writing inclusive policies?',
          options: [
            'Use legal jargon to ensure enforceability',
            'Keep policies vague to allow flexibility',
            'Use specific, objective criteria and avoid subjective terms like "culture fit"',
            'Focus only on what is prohibited, not what is encouraged'
          ],
          correct_answer: 2,
          explanation: 'Inclusive policies should use clear, specific, objective language that reduces bias. Subjective terms can be interpreted through cultural biases and enforced discriminately.'
        },
        {
          question: 'How can leaders measure whether culture is truly inclusive for Black employees?',
          options: [
            'Count the number of Black employees hired',
            'Track multiple metrics including retention, promotion, engagement, and qualitative feedback from Black employees',
            'Ask white employees if they see any problems',
            'Check if there have been any formal complaints'
          ],
          correct_answer: 1,
          explanation: 'Measuring inclusive culture requires multiple indicators: quantitative metrics (retention, promotion, pay equity), qualitative data (employee feedback, exit interviews), and behavioral observations. Hiring alone doesn\'t reflect inclusion.'
        }
      ],
      passing_score: 80,
      time_limit_minutes: 20
    },
    module_number: 3, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 3: 3 lessons')
  console.log('✅ Course 5 complete: 3 modules, 10 lessons\n')
}

async function populateCourse6() {
  console.log('📚 Course 6: Measuring and Reporting on Racial Equity')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'data-driven-equity').single()
  if (!course) { console.log('❌ Course not found'); return }

  // Module 1: Data Collection
  const m1 = await createModule(course.id, {
    title: 'Equity Data Collection and Ethics',
    description: 'Best practices for collecting and handling racial demographic data.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Why Measure? The Case for Equity Metrics',
    slug: 'why-measure-equity',
    description: 'Understanding the importance of data in advancing racial equity.',
    content_type: 'video',
    content_url: 'https://example.com/videos/why-measure.mp4',
    video_duration_seconds: 600,
    module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Collecting Demographic Data Ethically',
    slug: 'collecting-data-ethically',
    description: 'Best practices for collecting racial demographic information.',
    content_type: 'article',
    article_body: `# Collecting Demographic Data Ethically

## Why Collect Race Data?
Without data, you can't:
- Identify disparities
- Track progress
- Hold systems accountable
- Make evidence-based decisions
- Demonstrate commitment to equity

However, collecting race data raises legitimate concerns about privacy, misuse, and historical trauma. Ethical collection requires thoughtful approach.

## Guiding Principles

### 1. Purpose and Transparency
**What**: Clearly explain WHY you're collecting data and HOW it will be used.
**Example communication**:
"We're collecting demographic data to identify and address disparities in hiring, promotion, and retention. This information will be used in aggregate only to track trends and inform equity initiatives. Individual responses are confidential and will not be used in employment decisions."

### 2. Voluntary Participation
- Self-identification should be optional, not mandatory
- Include "prefer not to answer" option
- No negative consequences for declining
- **Exception**: Required reporting for government contractors (but explain this)

### 3. Appropriate Categories
- Use categories that reflect how people self-identify
- Allow multiple selections (many people are multiracial)
- Include specific options, not just "Black" or "African American"
  - Examples: Black - African, Black - Caribbean, Black - Canadian, etc.
- Avoid outdated or offensive terms
- Review and update categories regularly

### 4. Confidentiality and Security
- Aggregate data for reporting (never identify individuals)
- Secure storage with access controls
- Clear data retention and deletion policies
- Separate demographic data from personally identifiable information where possible

### 5. Community Input
- Consult with Black employees and ERGs on:
  - What questions to ask
  - How to ask them
  - How data will be used
  - How results will be shared
- Incorporate feedback into process

## What to Collect

### Essential Data Points
1. **Race/ethnicity** (self-identified, multiple selections allowed)
2. **Department/business unit**
3. **Level/grade**
4. **Job family/function**
5. **Hire date**
6. **Manager** (for analyzing promotion patterns)

### Additional Valuable Data
- Compensation
- Performance ratings
- Promotions and role changes
- Training and development participation
- Exit reasons (for those who leave)
- Disciplinary actions
- Bonuses and incentives

## When to Collect

### Initial Collection
- During onboarding (separate from application to avoid bias)
- Through voluntary self-identification campaign for existing employees
- Regular opportunities to update (people's identities may evolve)

### Ongoing Collection
- Track workforce changes in real-time
- Link to HR events (promotion, transfer, exit)
- Annual verification/update campaign

## How to Ask

### Poor Example
❌ "What is your race?"
- Abrupt, no context
- Sounds mandatory
- No explanation of use

### Better Example
✅ "Our organization is committed to racial equity and advancing opportunities for all employees. To identify and address disparities, we collect demographic information. This information is:
- **Voluntary**: You may choose not to answer
- **Confidential**: Used in aggregate only; will not be linked to individual employment decisions
- **Important**: Helps us track progress and hold ourselves accountable

How do you identify your race/ethnicity? (Select all that apply)
☐ Black or African Canadian
☐ Black - African
☐ Black - Caribbean
☐ [other options]
☐ Prefer not to answer"

## Building Trust

### Historical Context
Acknowledge that historically, collecting race data has been used to harm Black communities:
- Enslavement records
- Segregation enforcement
- Discriminatory policies
- Surveillance and profiling

### Building Trust Requires:
1. **Transparency**: Explain exactly how data will be used
2. **Accountability**: Share results and actions taken
3. **Consistency**: Regular reporting, not just one-time exercise
4. **Action**: Demonstrate that data leads to change
5. **Partnership**: Involve Black employees in process design

## Common Pitfalls

### X Collecting but not using data
If you collect data but never analyze or act on it, you erode trust and waste people's time.

### X Sharing individual-level data
Even anonymized data can sometimes be re-identified. Always aggregate.

### X Collecting only when required
Don't limit collection to legally mandated reporting. You need richer data to understand and address inequities.

### X Surprise data requests
Don't spring data collection on employees without context or warning.

### X Ignoring negative findings
If data reveals disparities, acknowledge them honestly and commit to action.

## Legal Considerations (Canada)

### Federal Sector
- Employment Equity Act requires designated employers to collect and report demographic data
- Includes race/ethnicity as a designated group

### Provincial Variation
- Requirements vary by province
- Generally permissible to collect for equity purposes
- Must comply with privacy legislation (PIPEDA, provincial equivalents)

### Key Legal Principles
- Collection must have a legitimate purpose
- Use must be limited to stated purpose
- Security safeguards required
- Individuals have right to access their data

## Case Study: Done Right

**Organization**: Mid-sized technology company
**Challenge**: Lack of Black representation in engineering roles

**Approach**:
1. **Engagement**: Consulted with Black ERG on data collection design
2. **Communication**: Explained purpose, use, and confidentiality in all-hands meeting and written materials
3. **Options**: Made self-ID voluntary with multiple selection options
4. **Analysis**: Conducted analysis of representation, hiring, promotion, retention
5. **Transparency**: Shared results with entire organization, including uncomfortable findings
6. **Action**: Developed specific initiatives based on data (e.g., targeted recruitment, promotion practices review)
7. **Follow-up**: Quarterly updates on progress against metrics

**Result**:
- 85% of employees completed self-ID
- Identified specific barriers in engineering hiring and promotion
- Increased Black engineering representation from 2% to 8% over 3 years
- Improved trust and engagement

## Reflection Questions
1. How does your organization currently collect demographic data?
2. What concerns might Black employees have about sharing this information?
3. How can you build trust through transparency and action?
4. What would you do if data revealed significant disparities?`,
    module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Data Privacy and Security',
    slug: 'data-privacy-security',
    description: 'Protecting employee data while enabling equity analysis.',
    content_type: 'video',
    content_url: 'https://example.com/videos/data-privacy.mp4',
    video_duration_seconds: 480,
    module_number: 1, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 1: 3 lessons')

  // Module 2: Equity Metrics
  const m2 = await createModule(course.id, {
    title: 'Key Equity Metrics and Analysis',
    description: 'Essential metrics for tracking racial equity progress.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Core Equity Metrics',
    slug: 'core-equity-metrics',
    description: 'The essential metrics every organization should track.',
    content_type: 'article',
    article_body: `# Core Equity Metrics

## The Essential Dashboard
To understand and address racial equity, track these core metrics for Black employees compared to overall workforce:

## 1. Representation Metrics

### Overall Representation
**What to measure**: Percentage of Black employees in total workforce
**Why it matters**: Basic indicator of diversity
**How to calculate**: (# Black employees / # total employees) × 100
**Target**: At minimum, reflect regional demographics; ideally exceed them to counteract historical exclusion

### Representation by Level
**What to measure**: Percentage of Black employees at each level (entry, mid, senior, executive, C-suite, board)
**Why it matters**: Reveals whether Black employees can advance or are concentrated at lower levels
**How to calculate**: For each level: (# Black employees at level / # total employees at level) × 100
**Red flag**: "Pyramid" pattern - higher representation at entry level that decreases at each level up

### Representation by Department/Function
**What to measure**: Percentage of Black employees in each business unit
**Why it matters**: Shows whether Black employees are clustered in certain areas or excluded from others
**Look for**: Under-representation in high-status or high-earning functions (e.g., engineering, leadership, strategy)

## 2. Hiring Metrics

### Applicant Pool Diversity
**What to measure**: Percentage of Black applicants compared to total applicants
**Why it matters**: Can't hire diverse workforce without diverse applicant pool
**Indicates**: Whether recruitment strategies reach Black candidates

### Interview Rates
**What to measure**: Percentage of Black applicants who advance to interviews
**Why it matters**: Reveals potential bias in resume screening
**Calculate**: (# Black applicants interviewed / # Black applicants) ÷ (# total applicants interviewed / # total applicants)
**Red flag**: Black applicants advance at lower rates than other applicants

### Offer Rates
**What to measure**: Percentage of Black interviewees who receive offers
**Why it matters**: Reveals potential bias in interview/selection process
**Calculate**: (# Black candidates offered / # Black candidates interviewed) ÷ (# total candidates offered / # total candidates interviewed)

### Acceptance Rates
**What to measure**: Percentage of Black candidates who accept offers
**Why it matters**: May indicate concerns about organizational culture
**If low**: Black candidates may have concerns about inclusion/belonging

### Time-to-Hire
**What to measure**: Average days from application to hire for Black vs. other candidates
**Why it matters**: Delays may cause loss of candidates to other opportunities
**Look for**: Disparities suggesting different treatment

## 3. Promotion Metrics

### Promotion Rates
**What to measure**: Percentage of Black employees promoted in a given period
**Why it matters**: Core indicator of equity in advancement
**Calculate**: (# Black employees promoted / # Black employees eligible) ÷ (# total employees promoted / # total employees eligible)
**Red flag**: Black employees promoted at lower rates despite equal or better performance

### Time-to-Promotion
**What to measure**: Average time in role before promotion for Black vs. other employees
**Why it matters**: Shows whether Black employees must "prove themselves" longer
**Look for**: Black employees taking longer to advance to same level

### Representation in High-Potential/Succession Plans
**What to measure**: Percentage of Black employees identified as high-potential or in succession plans
**Why it matters**: Shows who is being developed for leadership
**Often overlooked**: Many organizations don't track this but it's critical

## 4. Retention Metrics

### Turnover Rate
**What to measure**: Percentage of Black employees who leave in a given period
**Why it matters**: Core indicator of inclusion; high turnover is costly
**Calculate**: (# Black employees who left / average # Black employees) × 100
**Compare**: Black vs. overall turnover rates

### Voluntary vs. Involuntary
**What to measure**: Whether turnover is voluntary (employee chose to leave) or involuntary (termination)
**Why it matters**: Different implications for equity
**Red flag**: Higher involuntary turnover for Black employees may indicate bias in performance evaluation or discipline

### Tenure
**What to measure**: Average length of employment for Black vs. other employees
**Why it matters**: Shows whether Black employees are leaving earlier
**Look at**: Tenure by level (early exits of Black leaders particularly concerning)

### Exit Reasons
**What to measure**: Why Black employees are leaving (from exit interviews or surveys)
**Why it matters**: Reveals specific barriers or issues
**Common themes**: Lack of belonging, limited advancement, discrimination, better opportunities elsewhere

### Regrettable vs. Non-Regrettable
**What to measure**: Of those who left, how many were high performers the organization wanted to retain?
**Why it matters**: Loss of high-performing Black employees is particularly concerning
**If high**: Suggests talented Black employees don't see path forward

## 5. Compensation Metrics

### Pay Equity
**What to measure**: Average compensation for Black vs. other employees in same roles
**Why it matters**: Core indicator of equity; legal requirement in many jurisdictions
**How to analyze**: Compare pay for same role, level, location, tenure
**Red flag**: Unexplained gaps (after accounting for legitimate factors like experience)

### Bonus/Incentive Distribution
**What to measure**: Percentage of Black employees receiving bonuses and average bonus amounts
**Why it matters**: Bonuses/incentives can be significant part of compensation and more subjective
**Look for**: Lower participation rates or smaller bonuses for Black employees

### Starting Salary
**What to measure**: Average starting salary for new hires by race
**Why it matters**: Salary compression - entering at lower salary impacts lifetime earnings
**Be aware**: Asking about salary history perpetuates inequities

## 6. Performance Evaluation Metrics

### Performance Ratings Distribution
**What to measure**: Percentage of Black employees at each performance rating level
**Why it matters**: Shows whether Black employees are rated fairly
**Red flag**: Black employees disproportionately in lower rating categories despite no objective reason
**Also watch**: "Clustering" - Black employees over-represented in middle ratings, limiting access to top ratings needed for promotion

### Rating Changes
**What to measure**: How often Black employees' performance ratings improve, decline, or stay stable
**Why it matters**: Reveals patterns in how Black employees are perceived over time

## 7. Development Metrics

### Training Participation
**What to measure**: Percentage of Black employees participating in professional development
**Why it matters**: Development opportunities drive advancement
**Look for**: Equal access and participation rates

### Mentorship/Sponsorship
**What to measure**: Percentage of Black employees with mentors or sponsors
**Why it matters**: Informal relationships drive career advancement
**Often unmeasured**: But critical for equity

## 8. Engagement/Belonging Metrics

### Engagement Scores
**What to measure**: Employee engagement survey results by race
**Why it matters**: Shows how Black employees experience workplace
**Key questions**: 
- "I feel I belong here"
- "I can be my authentic self"
- "I'm treated fairly"
- "I see path for advancement"

### Inclusion Index
**What to measure**: Composite score of inclusion-related survey questions
**Why it matters**: Direct measurement of inclusive culture

## Analyzing the Data

### Look for Patterns
- **Disparities**: Where are outcomes different for Black vs. other employees?
- **Trends**: Are gaps widening or narrowing over time?
- **Intersections**: How do race and gender interact? (Black women often face unique barriers)

### Context Matters
- **Small numbers**: With small populations, percentages can be volatile
- **Regional demographics**: Compare to relevant labor market, not national averages
- **Industry benchmarks**: How do you compare to similar organizations?

### Root Cause Analysis
When you find disparities, ask why:
- **What policies or practices might contribute?**
- **Where in the process do gaps emerge?**
- **Who makes decisions at that point?**
- **What criteria are used?**

## Reflection Questions
1. Which of these metrics does your organization currently track?
2. Where do you predict you might find disparities?
3. What would you do if you found significant gaps in promotion rates?
4. How often should these metrics be reviewed?`,
    module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Analyzing and Interpreting Equity Data',
    slug: 'analyzing-interpreting-data',
    description: 'How to conduct meaningful analysis of equity metrics.',
    content_type: 'video',
    content_url: 'https://example.com/videos/analyzing-data.mp4',
    video_duration_seconds: 720,
    module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Quiz: Equity Metrics',
    slug: 'quiz-equity-metrics',
    description: 'Test your understanding of key equity metrics.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'Why is it important to track representation by level, not just overall?',
          options: [
            'It\'s required by law',
            'It reveals whether Black employees can advance or are concentrated at lower levels',
            'It makes the reports longer',
            'It\'s easier to calculate'
          ],
          correct_answer: 1,
          explanation: 'Overall representation can mask inequity. An organization might have good overall representation but if Black employees are concentrated at entry level and absent from leadership, that indicates barriers to advancement.'
        },
        {
          question: 'What does high voluntary turnover among Black employees typically indicate?',
          options: [
            'Black employees are less committed',
            'The organization is doing a good job of hiring',
            'Black employees may not feel included or see opportunities for advancement',
            'Salaries are too high'
          ],
          correct_answer: 2,
          explanation: 'High voluntary turnover among Black employees often signals issues with inclusion, belonging, advancement opportunities, or experiencing discrimination. It\'s a red flag that requires investigation.'
        },
        {
          question: 'When analyzing pay equity, why is it important to compare employees in the same role and level?',
          options: [
            'It\'s easier',
            'It\'s required by law',
            'To ensure you\'re comparing similar jobs and isolating any unexplained gaps',
            'To make the organization look better'
          ],
          correct_answer: 2,
          explanation: 'Pay equity analysis must compare like-to-like (same role, level, location, experience) to determine if there are unexplained gaps based on race. Comparing across different roles doesn\'t reveal pay discrimination.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 10
    },
    module_number: 2, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 2: 3 lessons')

  // Module 3: Reporting and Transparency
  const m3 = await createModule(course.id, {
    title: 'Reporting and Accountability',
    description: 'Communicating equity data and driving accountability.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Creating Effective Equity Reports',
    slug: 'creating-equity-reports',
    description: 'Best practices for equity reporting and data visualization.',
    content_type: 'video',
    content_url: 'https://example.com/videos/equity-reports.mp4',
    video_duration_seconds: 660,
    module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Transparency and Stakeholder Communication',
    slug: 'transparency-communication',
    description: 'Sharing equity data internally and externally.',
    content_type: 'article',
    article_body: `# Transparency and Stakeholder Communication

## Why Transparency Matters
Publishing equity data:
- **Builds trust** with employees and communities
- **Drives accountability** - public commitments are harder to abandon
- **Enables benchmarking** - helps entire industries improve
- **Attracts talent** - shows genuine commitment
- **Pressures inaction** - transparency makes it harder to ignore disparities

## What to Share

### Internally (Employees)

**Minimum**:
- Overall representation by race
- Representation by level
- Hiring and promotion rates by race
- Turnover rates by race
- Pay equity analysis results
- Progress against stated goals

**Better**:
- All the above plus:
- Qualitative data from surveys and focus groups
- Specific actions being taken to address gaps
- Timelines and accountability
- Budget allocated to equity initiatives

**Best**:
- All the above plus:
- Root cause analysis of disparities
- Failures and challenges, not just successes
- Regular updates (quarterly or semi-annual)
- Opportunities for employee feedback and involvement

### Externally (Public)

**Minimum**:
- Overall demographics
- Statement of commitment to equity
- Key initiatives

**Better**:
- All the above plus:
- Representation by level
- Year-over-year trends
- Specific, measurable goals with timelines
- Named executive responsible

**Best**:
- All the above plus:
- Full equity report with hiring, promotion, retention, pay data
- Progress against goals
- Honest assessment of challenges
- How you're using data to drive change

## How to Communicate

### Principles

#### 1. Honesty
Don't sugarcoat or make excuses. If data shows disparities, acknowledge them directly.

**Example - Poor**: "While we have room for improvement in representation at senior levels, we're proud of our overall diversity."

**Example - Better**: "Our data shows Black employees are significantly under-represented at senior levels—only 3% compared to 15% at entry level. This is unacceptable, and we're committed to addressing the barriers that prevent Black employees from advancing."

#### 2. Context
Help people understand what the numbers mean.

**Example**: "Black employees make up 8% of our workforce but only 2% of senior leadership. For context, Black people represent 4% of the Canadian population and 6% of the professional workforce in our region. This shows we're hiring Black talent but failing to promote them to leadership."

#### 3. Action Orientation
Don't just report problems—explain what you're doing about them.

**Example**: "To address low Black representation in engineering, we're:
1. Partnering with HBCUs for recruitment
2. Eliminating degree requirements for roles where not essential
3. Providing sponsorship for Black engineers in promotion pipeline
4. Reviewing performance evaluation practices for bias"

#### 4. Accountability
Name who is responsible and when progress will be reviewed.

**Example**: "Our Chief People Officer is accountable for achieving these goals. We'll publish progress updates quarterly and review results at every Board meeting."

#### 5. Accessibility
Make data understandable to all audiences.

- Use clear visualizations (charts, graphs)
- Avoid jargon and technical language
- Provide executive summary for those who won't read full report
- Make accessible to people with disabilities (alt text, screen reader compatible)

### Formats

#### Dashboard
- Real-time or regularly updated metrics
- Visual and easy to scan
- Accessible to all employees
- **Example**: Diversity dashboard on company intranet with key metrics, updated quarterly

#### Annual Report
- Comprehensive, detailed analysis
- Year-over-year trends
- Narrative explanation of findings and actions
- **Example**: Published diversity and inclusion report shared internally and externally

#### Town Halls
- Leadership presents key findings
- Opportunity for employee questions
- Shows commitment from top
- **Example**: CEO leads quarterly DEI town hall with data updates

#### Manager Toolkits
- Talking points for managers to discuss with teams
- FAQs
- Resources for deeper learning
- **Example**: Manager guide released with annual report to facilitate team discussions

## Handling Difficult Conversations

### When Data Shows Significant Disparities

**What NOT to do**:
- Blame previous leadership
- Make excuses ("pipeline problem," "meritocracy")
- Downplay significance
- Promise vague "do better" without specifics
- Get defensive when challenged

**What TO do**:
- Acknowledge the harm these disparities cause
- Take responsibility
- Commit to specific actions with timelines
- Invite input and feedback
- Follow through with visible action

**Example Script**:
"Our data shows significant disparities in how Black employees experience our organization. Black employees are promoted at half the rate of white employees and leave the company at twice the rate. This tells us we have serious problems with equity and inclusion that we must address.

This is unacceptable, and I take responsibility as a leader for allowing these conditions to persist. We're committed to changing this, and here's how: [specific actions].

We know this won't change overnight, but we're committed to transparency, accountability, and most importantly, action. We'll report on progress quarterly, and we need your help. If you have ideas or want to be involved, please reach out.

This is hard to hear, and I know for Black employees it may confirm experiences you've been telling us about. I'm sorry it took data to make us listen. We're listening now, and we're committed to change."

### When Employees Are Skeptical

**Understandable**: Black employees have often heard promises before without seeing change.

**Build credibility through**:
- Consistent, regular updates (not one-time report)
- Visible actions, not just words
- Investment of real resources (budget, time, people)
- Changes in who holds power (Black employees in decision-making roles)
- Consequences for inaction or discriminatory behavior

### When Leadership Resists Transparency

**Common objections**:
- "It will make us look bad"
- "Competitors will use it against us"
- "It could expose us to legal risk"
- "We need to fix problems before going public"

**Responses**:
- Lack of transparency also looks bad and erodes trust
- Leading organizations are moving toward transparency; being early mover shows leadership
- Transparency can actually reduce legal risk by showing good faith efforts
- You'll never be "ready" - transparency drives improvement, not vice versa
- The real risk is continuing inequity unchecked

## External Reporting

### Regulatory Requirements
- **Employment Equity Act** (federal contractors): Required reporting
- **Pay equity legislation**: Varies by province, but growing
- **ESG reporting**: Increasing investor pressure for diversity data

### Voluntary Reporting
Even without requirements, consider publishing:
- Annual diversity report
- EEO-1 type data (U.S. standard, could adapt for Canada)
- Progress updates on public commitments

### Stakeholder Expectations

**Investors** want:
- Diversity data, especially board and leadership
- Pay equity data
- Link between diversity and business outcomes
- Risk management related to discrimination

**Customers** want:
- Company values align with their own
- Evidence of commitment, not just statements
- Diverse representation, especially in leadership and customer-facing roles

**Employees and Candidates** want:
- Honest assessment of current state
- Clear path for improvement
- Evidence that leadership takes equity seriously
- Data about their specific demographic group

## Case Study: Transparency Done Right

**Organization**: Large financial services company
**Challenge**: Low Black representation, especially in leadership

**Approach**:
1. **Conducted comprehensive equity audit** (representation, hiring, promotion, pay, engagement)
2. **Shared results transparently**:
   - Full data published internally
   - Summary shared externally
   - CEO addressed all employees in town hall
   - Acknowledged specific failures
3. **Committed to specific goals**:
   - Double Black representation in leadership within 3 years
   - Achieve pay equity within 1 year
   - Reduce turnover gap to zero within 2 years
4. **Quarterly public updates** on progress
5. **Tied executive compensation** to diversity goals

**Results**:
- Increased trust scores among Black employees
- Applications from Black candidates increased 40%
- Made meaningful progress on representation goals
- Recognized as industry leader in diversity

## Reflection Questions
1. What equity data does your organization currently share? With whom?
2. What would it take for your organization to commit to full transparency?
3. If you published your data tomorrow, what would be the hardest numbers to share? Why?
4. How could transparency accelerate progress in your organization?`,
    module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-data',
    description: 'Comprehensive assessment of data and measurement concepts.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is the most important reason to collect demographic data?',
          options: [
            'It\'s required by law',
            'To identify disparities and track progress toward equity',
            'To fill out government forms',
            'To look good in marketing materials'
          ],
          correct_answer: 1,
          explanation: 'While some data collection may be legally required, the primary purpose should be to identify where disparities exist, track whether interventions are working, and hold the organization accountable for progress.'
        },
        {
          question: 'What is a key principle for collecting race data ethically?',
          options: [
            'Make it mandatory so you get complete data',
            'Collect as much detail as possible',
            'Be transparent about purpose and use, make it voluntary, and ensure confidentiality',
            'Only collect what\'s legally required'
          ],
          correct_answer: 2,
          explanation: 'Ethical data collection requires transparency about why you\'re collecting and how it will be used, voluntary participation with option to decline, and strong confidentiality protections. Building trust is essential.'
        },
        {
          question: 'Why is transparency about equity data important?',
          options: [
            'It\'s required by law',
            'It builds trust, drives accountability, and enables benchmarking',
            'It makes the organization look good',
            'It\'s easier than keeping it private'
          ],
          correct_answer: 1,
          explanation: 'Transparency builds trust with employees and stakeholders, creates accountability for progress, allows comparison with other organizations, and demonstrates genuine commitment beyond words.'
        },
        {
          question: 'When sharing data that shows significant disparities, what is the most important element to include?',
          options: [
            'Explanations for why the disparities exist',
            'Comparisons showing you\'re better than competitors',
            'Specific actions you\'re taking to address the disparities with timelines and accountability',
            'Apologies and statements of regret'
          ],
          correct_answer: 2,
          explanation: 'While context and acknowledgment matter, the most critical element is explaining what concrete actions you\'re taking to address disparities, with specific timelines and clear accountability. Data without action is meaningless.'
        }
      ],
      passing_score: 80,
      time_limit_minutes: 15
    },
    module_number: 3, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 3: 3 lessons')
  console.log('✅ Course 6 complete: 3 modules, 9 lessons\n')
}

console.log('=== COURSES 5 & 6 POPULATION ===\n')
Promise.all([populateCourse5(), populateCourse6()])
  .then(() => {
    console.log('✅ All courses complete!')
  })
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
