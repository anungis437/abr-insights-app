/**
 * Course 2: Canadian Human Rights Law Fundamentals
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing credentials - set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

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
      slug: slug,
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

async function populateHumanRightsLaw() {
  console.log('\n📚 Course 2: Canadian Human Rights Law Fundamentals')

  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', 'canadian-human-rights-law')
    .single()
  if (!course) {
    console.log('❌ Course not found')
    return
  }

  // Module 1: Constitutional Framework
  const m1 = await createModule(course.id, {
    title: 'Constitutional Framework and Charter Rights',
    description:
      'Understanding the Canadian Charter of Rights and Freedoms and constitutional protections.',
    sort_order: 1,
  })

  await createLesson(course.id, m1.id, {
    title: 'The Canadian Charter of Rights and Freedoms',
    slug: 'canadian-charter',
    description: 'Overview of Charter rights, particularly Section 15 equality rights.',
    content_type: 'video',
    content_url: 'https://example.com/videos/charter-rights.mp4',
    video_duration_seconds: 840,
    module_number: 1,
    lesson_number: 1,
    sort_order: 1,
    is_preview: true,
  })

  await createLesson(course.id, m1.id, {
    title: 'Section 15: Equality Rights Explained',
    slug: 'section-15-equality',
    description: 'Deep dive into equality rights and protection from discrimination.',
    content_type: 'article',
    article_body: `# Section 15: Equality Rights

## The Text

**Section 15(1)** of the Canadian Charter states:

> "Every individual is equal before and under the law and has the right to the equal protection and equal benefit of the law without discrimination and, in particular, without discrimination based on race, national or ethnic origin, colour, religion, sex, age or mental or physical disability."

## Key Principles

### 1. Formal vs. Substantive Equality
- **Formal Equality**: Treating everyone the same
- **Substantive Equality**: Recognizing different needs and circumstances
- Courts have adopted substantive equality approach

### 2. Enumerated and Analogous Grounds
**Explicitly listed grounds:**
- Race
- National or ethnic origin
- Colour
- Religion
- Sex
- Age
- Mental or physical disability

**Analogous grounds** (added by courts):
- Sexual orientation
- Citizenship status
- Marital status
- Off-duty conduct

### 3. Adverse Effects Discrimination
Discrimination can occur even with neutral policies if they have disproportionate impact on protected groups.

## Landmark Cases

### Andrews v. Law Society of BC (1989)
- Established substantive equality approach
- Citizenship requirement for lawyers struck down
- Set framework for Section 15 analysis

### Law v. Canada (1999)
- Created three-part test for discrimination
- Must show differential treatment
- Based on enumerated/analogous ground
- Creates disadvantage or stereotyping

### R v. Kapp (2008)
- Simplified Section 15 analysis
- Focus on perpetuating disadvantage
- Recognized ameliorative programs

## Application to Anti-Black Racism

Section 15 protects against racial discrimination including:
- **Employment**: Hiring, promotion, termination decisions
- **Services**: Access to government services and programs
- **Education**: Streaming, discipline, accommodation
- **Justice**: Bail decisions, sentencing, police conduct

## Limitations

### Section 1: Reasonable Limits
Government can justify discrimination if:
1. Objective is pressing and substantial
2. Means are proportional to objective
3. Minimal impairment of rights
4. Benefits outweigh harms

### Examples of Justified Limits:
- Mandatory retirement ages for certain occupations
- Affirmative action programs
- Security screening procedures

## Practical Impact

**What Section 15 Does:**
✓ Prohibits government discrimination
✓ Requires equal treatment in laws
✓ Allows positive discrimination (affirmative action)
✓ Provides constitutional remedy

**What Section 15 Doesn't Do:**
✗ Apply to private relationships (use human rights codes instead)
✗ Guarantee equal outcomes
✗ Eliminate all disparities immediately
✗ Create positive obligations on government to provide services

## Reflection Questions

1. Why did courts move from formal to substantive equality?
2. How does Section 15 interact with human rights legislation?
3. What are the limits of constitutional protection against racism?`,
    module_number: 1,
    lesson_number: 2,
    sort_order: 2,
  })

  await createLesson(course.id, m1.id, {
    title: 'Constitutional Remedies and Litigation',
    slug: 'constitutional-remedies',
    description: 'Learn about Charter challenges and Section 24 remedies.',
    content_type: 'video',
    content_url: 'https://example.com/videos/constitutional-remedies.mp4',
    video_duration_seconds: 600,
    module_number: 1,
    lesson_number: 3,
    sort_order: 3,
  })

  console.log(`✅ Module 1: 3 lessons`)

  // Module 2: Federal Human Rights Framework
  const m2 = await createModule(course.id, {
    title: 'Federal Human Rights Framework',
    description: 'The Canadian Human Rights Act and federal protections.',
    sort_order: 2,
  })

  await createLesson(course.id, m2.id, {
    title: 'Canadian Human Rights Act Overview',
    slug: 'chra-overview',
    description: 'Understanding federal human rights protections and the CHRC.',
    content_type: 'video',
    content_url: 'https://example.com/videos/chra-overview.mp4',
    video_duration_seconds: 720,
    module_number: 2,
    lesson_number: 1,
    sort_order: 1,
  })

  await createLesson(course.id, m2.id, {
    title: 'Filing a Human Rights Complaint',
    slug: 'filing-complaint',
    description: 'Step-by-step process for filing complaints with the CHRC.',
    content_type: 'article',
    article_body: `# Filing a Federal Human Rights Complaint

## When to File with Canadian Human Rights Commission

The CHRC handles complaints related to:
- **Federal government** departments and agencies
- **Federally regulated industries**: banks, telecommunications, transportation, broadcasting
- **First Nations governments** (under CHRA)

## Grounds of Discrimination

Protected grounds under CHRA:
- Race, national or ethnic origin, colour
- Religion, age, sex (including pregnancy, childbirth)
- Sexual orientation, gender identity or expression
- Marital status, family status
- Genetic characteristics
- Disability, conviction for which pardon granted

## The Complaint Process

### Step 1: Initial Assessment (0-2 weeks)
- Contact CHRC to discuss your situation
- Determine if complaint falls under CHRC jurisdiction
- Get advice on documentation needed

### Step 2: File Complaint (Online or Paper)
**Information Required:**
- Your contact information
- Details of organization/person you're complaining about
- Discrimination ground (e.g., race)
- Area of discrimination (employment, services, etc.)
- Timeline of events
- Impact on you
- Resolution sought

**Time Limit**: Must file within 1 year of incident

### Step 3: Commission Review (3-6 months)
Commission decides whether to:
- **Accept**: Proceeds to investigation
- **Dismiss**: No reasonable basis, outside jurisdiction, or frivolous
- **Refer to Tribunal**: If evidence is clear

### Step 4: Investigation (6-12 months)
- Investigator gathers evidence from both parties
- Interviews witnesses
- Reviews documents
- Attempts conciliation/mediation

### Step 5: Report and Decision
Investigator recommends:
- **Dismiss**: Insufficient evidence
- **Settle**: Parties reach agreement
- **Refer to Tribunal**: Proceed to hearing

### Step 6: Canadian Human Rights Tribunal (if referred)
- Formal hearing (like court)
- Present evidence and witnesses
- Legal representation recommended
- Tribunal makes binding decision

## Possible Outcomes and Remedies

If complaint is substantiated:

**Compensation:**
- Lost wages and benefits
- Pain and suffering (up to $20,000)
- Willful/reckless discrimination (up to $20,000 additional)

**Systemic Remedies:**
- Policy changes
- Training programs
- Monitoring and compliance orders
- Reinstatement to employment

## Tips for Strong Complaints

### Documentation is Critical
- **Keep records**: Emails, texts, notes from conversations
- **Timeline**: Detailed chronology of events
- **Witnesses**: Names and contact info
- **Impact**: Medical records, therapy notes, financial losses

### Be Specific
- Describe exactly what happened
- Include dates, times, locations
- Name individuals involved
- Connect to protected ground

### Focus on Facts, Not Emotions
- Describe discriminatory conduct objectively
- Avoid inflammatory language
- Stick to relevant facts
- Show pattern if applicable

## Alternative Options

### Provincial Human Rights Commissions
If not federal jurisdiction:
- Each province has own human rights code
- Similar process but provincial scope
- May have different grounds or remedies

### Union Grievances
If unionized:
- File grievance through union
- May go to arbitration
- Faster than human rights process
- Limited to collective agreement violations

### Civil Lawsuit
- Can sue for damages in court
- Higher burden of proof
- More expensive and time-consuming
- No limit on damages

## Important Considerations

**Confidentiality**: CHRC process is confidential unless tribunal hearing

**Time**: Process can take 2-3 years from complaint to tribunal decision

**Representation**: You can represent yourself or hire a lawyer (legal aid may be available)

**Retaliation**: It's illegal to retaliate against someone for filing complaint

**No Guarantee**: Not all complaints succeed—evidence and legal test must be met

## Resources

- **CHRC Website**: chrc-ccdp.gc.ca
- **Phone**: 1-888-214-1090
- **Online Portal**: For filing and tracking complaints
- **Legal Clinics**: Free legal advice (income-based)

## Reflection Questions

1. What documentation would strengthen a discrimination complaint?
2. Why might someone choose tribunal over court, or vice versa?
3. What are the pros and cons of settling vs. proceeding to hearing?`,
    module_number: 2,
    lesson_number: 2,
    sort_order: 2,
  })

  await createLesson(course.id, m2.id, {
    title: 'Quiz: Federal Human Rights',
    slug: 'quiz-federal',
    description: 'Test your knowledge of federal human rights law.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'The Canadian Human Rights Act applies to:',
          options: [
            'All employers in Canada',
            'Only federal government and federally-regulated industries',
            'Only private companies',
            'Provincial governments',
          ],
          correct_answer: 1,
          explanation:
            'The CHRA applies to federal government departments/agencies and federally-regulated sectors like banks, telecom, and transportation. Provincial human rights codes cover other employers.',
        },
        {
          question: 'What is the time limit for filing a federal human rights complaint?',
          options: ['30 days', '6 months', '1 year', 'No time limit'],
          correct_answer: 2,
          explanation:
            'You must file a complaint within 1 year of the discriminatory incident, though exceptions may apply in certain circumstances.',
        },
        {
          question: 'Maximum compensation for pain and suffering in CHRC cases is:',
          options: ['$10,000', '$20,000', '$50,000', 'No limit'],
          correct_answer: 1,
          explanation:
            'The Canadian Human Rights Act sets a cap of $20,000 for pain and suffering, plus up to $20,000 additional for willful or reckless discrimination.',
        },
      ],
      passing_score: 75,
      time_limit_minutes: 10,
    },
    module_number: 2,
    lesson_number: 3,
    sort_order: 3,
  })

  console.log(`✅ Module 2: 3 lessons`)

  // Module 3: Provincial Human Rights
  const m3 = await createModule(course.id, {
    title: 'Provincial Human Rights Legislation',
    description: 'Overview of provincial human rights codes across Canada.',
    sort_order: 3,
  })

  await createLesson(course.id, m3.id, {
    title: 'Ontario Human Rights Code',
    slug: 'ontario-code',
    description: "In-depth look at Ontario's human rights protections.",
    content_type: 'video',
    content_url: 'https://example.com/videos/ontario-code.mp4',
    video_duration_seconds: 660,
    module_number: 3,
    lesson_number: 1,
    sort_order: 1,
  })

  await createLesson(course.id, m3.id, {
    title: 'Provincial Variations Across Canada',
    slug: 'provincial-variations',
    description: 'Compare human rights protections in different provinces.',
    content_type: 'article',
    article_body: `# Provincial Human Rights Codes: A Comparison

All provinces and territories have human rights legislation, but they vary in scope, grounds, and process.

## Common Features

All jurisdictions prohibit discrimination in:
- Employment
- Housing/Accommodation
- Services (goods, facilities)
- Contracts

Protected grounds universally include:
- Race, colour, ancestry
- Religion, creed
- Sex, pregnancy
- Disability
- Age

## Key Differences

### Protected Grounds

| Ground | Universal | Some Provinces |
|--------|-----------|----------------|
| Race | ✓ All | |
| Sexual orientation | ✓ All | |
| Gender identity | Most | SK, NWT recently added |
| Social condition | | QC, NWT, NU, YT |
| Political belief | | BC, QC, NB, PE, MB, YT |
| Source of income | | QC, MB, PE, NT, NU, SK |
| Criminal conviction | | QC, NWT, YT |

### Age Protections

- **Ontario**: 18+ (employment), no upper limit
- **BC**: 19+ (some exceptions at 18)
- **Alberta**: 18+
- **Quebec**: No minimum age

### Notable Provincial Distinctions

**Quebec Charter of Rights**
- Constitutional status in Quebec
- Broader than other provinces
- Includes social and economic rights
- Unique grounds: social condition, political convictions, civil status

**British Columbia**
- Strong focus on systemic discrimination
- Duty to prevent discrimination proactively
- Political belief protected

**Ontario**
- Most case law and precedents
- Social areas widely defined
- Creed includes non-religious beliefs
- Family status jurisprudence well-developed

## Complaint Processes

### Ontario (HRTO)
- Direct access to tribunal (no commission screening)
- Online filing
- Active mediation program
- Typically faster resolution

### BC (BC Human Rights Tribunal)
- Application filed directly with tribunal
- Pre-hearing conferences
- Early settlement focus

### Alberta (AHR Commission)
- Commission investigates first
- Settlement encouraged
- May dismiss without hearing
- Tribunal hearing if referred

### Quebec (Commission des droits de la personne)
- Commission investigates
- Can litigate on complainant's behalf
- Quebec Tribunal for final hearing

## Intersecting with Employment Law

### Unionized Workplaces
- Must pursue grievance through union
- Arbitration may address human rights
- Can't file human rights complaint if covered by collective agreement (in some provinces)

### Ontario Exception
- Can file at HRTO even if unionized
- But tribunal may defer to arbitration

## Strategic Considerations

**Choose Your Forum:**
- **Human Rights Tribunal**: No cost, remedial focus, systemic change possible
- **Court**: Higher damages possible, more expensive, longer process
- **Union Grievance**: Faster, but limited remedies

**Limitations Periods:**
- Most provinces: 1-2 years
- Clock starts from incident or when you knew/should have known
- Tribunal may extend in exceptional circumstances

## Resources by Province

**Ontario**: hrto.ca  
**BC**: bchrt.bc.ca  
**Alberta**: albertahumanrights.ab.ca  
**Quebec**: cdpdj.qc.ca  
**Manitoba**: manitobahumanrights.ca  
**Saskatchewan**: saskhuma nrights.ca  
**Nova Scotia**: humanrights.novascotia.ca  
**New Brunswick**: gnb.ca/hrc-cdp  
**Newfoundland**: thinkhumanrights.ca  
**PEI**: peihumanrights.ca

## Case Study: Comparing Approaches

**Scenario**: Black employee denied promotion based on race

**Ontario HRTO Approach:**
- Direct filing, no screening
- Mediation offered quickly
- Hearing within 12-18 months
- Remedies: compensation, promotion order, policy changes

**Alberta Approach:**
- Commission investigates
- Settlement attempted
- May dismiss if insufficient evidence
- Tribunal hearing only if referred
- Timeline: 18-24+ months

## Reflection Questions

1. Why might provincial codes differ in protected grounds?
2. What are advantages of direct-access tribunals vs. commission screening?
3. How does Quebec's unique approach reflect its legal tradition?`,
    module_number: 3,
    lesson_number: 2,
    sort_order: 2,
  })

  await createLesson(course.id, m3.id, {
    title: 'Final Assessment',
    slug: 'final-assessment',
    description: 'Comprehensive assessment of Canadian human rights law.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question:
            'Which document provides constitutional protection against discrimination by government?',
          options: [
            'Canadian Human Rights Act',
            'Charter of Rights and Freedoms',
            'Provincial human rights codes',
            'Employment Standards Act',
          ],
          correct_answer: 1,
          explanation:
            'The Charter of Rights and Freedoms (particularly Section 15) provides constitutional protection against government discrimination.',
        },
        {
          question: 'Substantive equality means:',
          options: [
            'Treating everyone exactly the same',
            'Recognizing different needs and circumstances to achieve true equality',
            'Equal outcomes for all groups',
            'Reverse discrimination',
          ],
          correct_answer: 1,
          explanation:
            'Substantive equality recognizes that treating everyone identically may perpetuate inequality. It focuses on eliminating disadvantage and accommodating differences.',
        },
        {
          question:
            'A federally-regulated bank employee experiencing racial discrimination should file a complaint with:',
          options: [
            'Provincial human rights tribunal',
            'Canadian Human Rights Commission',
            'Employment Standards branch',
            'Labour Board',
          ],
          correct_answer: 1,
          explanation:
            'Federal employees and those in federally-regulated industries fall under the Canadian Human Rights Act and should file with the CHRC.',
        },
        {
          question: 'In Ontario, a unionized employee experiencing discrimination:',
          options: [
            'Cannot file a human rights complaint',
            'Must pursue only through union grievance',
            'Can file at HRTO even if covered by collective agreement',
            'Must choose between grievance and HRTO',
          ],
          correct_answer: 2,
          explanation:
            'Ontario allows unionized employees to file at HRTO even if the issue is covered by their collective agreement, though the tribunal may defer to arbitration.',
        },
      ],
      passing_score: 80,
      time_limit_minutes: 20,
    },
    module_number: 3,
    lesson_number: 3,
    sort_order: 3,
  })

  console.log(`✅ Module 3: 3 lessons`)
  console.log(`✅ Course 2 complete: 3 modules, 9 lessons`)
}

async function main() {
  console.log('=== COURSE 2 POPULATION ===\n')
  try {
    await populateHumanRightsLaw()
    console.log('\n✅ Course 2 Complete!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
