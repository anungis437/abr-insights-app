/**
 * Courses 3 & 4: Microaggressions and Effective Allyship
 */

const { createClient } = require('@supabase/supabase-js')
const supabase = createClient('https://nuywgvbkgdvngrysqdul.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXdndmJrZ2R2bmdyeXNxZHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2MTQ0OSwiZXhwIjoyMDc3OTM3NDQ5fQ.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI')

async function createModule(courseId, data) {
  const { data: module, error } = await supabase.from('course_modules').insert({
    course_id: courseId, title: data.title, slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    description: data.description, module_number: data.sort_order, sort_order: data.sort_order, is_published: true
  }).select().single()
  if (error) throw error
  return module
}

async function createLesson(courseId, moduleId, data) {
  const { data: lesson, error } = await supabase.from('lessons').insert({
    course_id: courseId, module_id: moduleId, ...data, is_published: true
  }).select().single()
  if (error) throw error
  return lesson
}

// COURSE 3: Microaggressions
async function populateMicroaggressions() {
  console.log('\n📚 Course 3: Recognizing and Addressing Microaggressions')
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'microaggressions-workplace').single()
  if (!course) { console.log('❌ Not found'); return }

  const m1 = await createModule(course.id, { title: 'Understanding Microaggressions', description: 'What are microaggressions and why do they matter?', sort_order: 1 })
  
  await createLesson(course.id, m1.id, {
    title: 'What Are Microaggressions?', slug: 'what-are-microaggressions', description: 'Define microaggressions and understand their impact.',
    content_type: 'video', content_url: 'https://example.com/videos/microaggressions-intro.mp4', video_duration_seconds: 600,
    module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Types of Microaggressions', slug: 'types-microaggressions', description: 'Microassaults, microinsults, and microinvalidations explained.',
    content_type: 'article', article_body: `# Types of Microaggressions

## Three Categories

### 1. Microassaults
**Definition**: Explicit racial derogations—verbal or nonverbal attacks meant to hurt

**Examples:**
- Using racial slurs
- Displaying racist symbols (confederate flag, swastikas)
- Deliberately avoiding sitting next to Black person
- Purposely serving Black customers last
- "Accidentally" hitting send on racist email

**Key Feature**: Usually conscious and intentional, though perpetrator may claim otherwise

**Impact**: Most obvious and overtly hostile form

### 2. Microinsults
**Definition**: Communications that convey rudeness and insensitivity, demean a person's racial heritage

**Examples:**
- "You're so articulate!" (implies surprise that Black person speaks well)
- "Where are you really from?" (implies doesn't belong)
- "Can I touch your hair?" (treating as exotic object)
- Clutching purse when Black person approaches
- Following Black customers in stores
- Asking Black colleague to speak for entire race

**Key Feature**: Often unconscious, perpetrator unaware of hidden message

**Impact**: Subtle but cumulative psychological toll

### 3. Microinvalidations  
**Definition**: Communications that exclude, negate, or nullify Black people's thoughts, feelings, or experiential reality

**Examples:**
- "I don't see color" (denies lived experience of racism)
- "We all experience the same challenges" (minimizes unique barriers)
- "You're being too sensitive" (dismisses valid feelings)
- "That wasn't about race" (denies racial reality)
- "Why do you always bring up race?" (shuts down conversation)
- Not believing accounts of racial experiences

**Key Feature**: Denies or minimizes Black people's racial realities

**Impact**: Gaslighting effect, makes targets question their own perceptions

## Common Microaggression Themes

### Ascription of Intelligence
- Surprise at eloquence or competence
- Assumptions of lower intelligence
- Questions about qualifications
- Disbelief at academic/professional achievements

### Second-Class Citizen
- Poor service in stores/restaurants
- Being ignored or passed over
- Having credentials questioned
- Being mistaken for service staff

### Assumptions of Criminal Status
- Clutching belongings around Black people
- Security following in stores
- Being stopped by police more frequently
- Excessive ID checks

### Alien in One's Own Land
- "Where are you from?" (especially to Black Canadians)
- "Your English is so good!"
- Assumptions about immigration status
- Being told to "go back where you came from"

### Pathologizing Cultural Values
- Tone policing
- Criticism of natural hair as "unprofessional"
- Labeling assertiveness as "aggressive"
- Calling cultural expression "ghetto" or "hood"

### Environmental Microaggressions
- Lack of Black representation in:
  - Images, posters, marketing materials
  - Leadership and decision-making roles
  - Curriculum and teaching materials
  - Staff and faculty
- Products (lack of makeup shades, "flesh-colored" as beige)
- Named spaces (buildings honoring slave owners)

## Why "Micro" is Misleading

Despite the name, these are NOT minor:
- **Frequency**: Can occur multiple times daily
- **Cumulative**: Death by a thousand cuts
- **Exhausting**: Constant vigilance and decision-making (do I address this?)
- **Invalidating**: Especially when experiences are denied
- **Health Impact**: Linked to anxiety, depression, hypertension

## Better Term: Everyday Racism

Some scholars prefer "everyday racism" because:
- "Micro" minimizes significance
- "Everyday" captures frequency and normalization
- Focuses on impact rather than intent
- Recognizes systemic nature

## The Intent vs. Impact Trap

**Perpetrator**: "I didn't mean it that way!"  
**Reality**: Intent doesn't negate harm

**Why this defense fails:**
- The target still experiences harm
- It centers perpetrator's feelings
- It avoids accountability
- It prioritizes comfort over justice

**Better response**: "I understand. Help me understand the impact."

## Reflection Questions
1. Have you ever said or done something that might be a microaggression?
2. How might microaggressions affect someone's daily experience?
3. Why is it important to address even "small" incidents?`,
    module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'The Cumulative Impact', slug: 'cumulative-impact', description: 'Understanding the psychological toll of repeated microaggressions.',
    content_type: 'video', content_url: 'https://example.com/videos/cumulative-impact.mp4', video_duration_seconds: 540,
    module_number: 1, lesson_number: 3, sort_order: 3
  })

  console.log(`✅ Module 1: 3 lessons`)

  const m2 = await createModule(course.id, { title: 'Responding to Microaggressions', description: 'Strategies for targets, perpetrators, and bystanders.', sort_order: 2 })

  await createLesson(course.id, m2.id, {
    title: 'When You\'re the Target', slug: 'when-youre-target', description: 'Self-care and response strategies if you experience microaggressions.',
    content_type: 'video', content_url: 'https://example.com/videos/target-response.mp4', video_duration_seconds: 660,
    module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'When You\'re the Perpetrator', slug: 'when-youre-perpetrator', description: 'How to respond if someone points out your microaggression.',
    content_type: 'article', article_body: `# When You've Committed a Microaggression

## First: Breathe and Accept Reality

You will make mistakes. Everyone does. The question is: How will you respond?

## What NOT to Do

### ❌ Deny ("That's not what I meant")
- Centers your intent over their impact
- Dismisses their experience
- Prevents learning

### ❌ Defend ("I'm not racist, I have Black friends")
- Makes it about your identity, not your action
- Shuts down conversation
- Compounds the harm

### ❌ Deflect ("You're being too sensitive")
- Blames the target
- Gaslights their experience
- Avoids accountability

### ❌ Demand Absolution ("Tell me I'm not racist")
- Burdens the harmed person with your emotions
- Centers your feelings
- Seeks comfort rather than understanding

### ❌ Get Angry ("How dare you accuse me")
- Intimidates the person who spoke up
- Punishes honest feedback
- Ensures they won't tell you again

## What TO Do

### 1. Pause and Listen
- **Don't** immediately defend
- **Do** take a breath and really hear what they're saying
- **Remember**: This took courage for them to say

### 2. Acknowledge
- "Thank you for telling me"
- "I appreciate you taking the risk to let me know"
- No "but" afterward—just stop there

### 3. Apologize Sincerely
- "I'm sorry. That was hurtful and I should not have said/done that"
- **Don't** say "I'm sorry you felt that way" (not an apology)
- **Don't** explain your intent (they don't need to hear it)
- **Do** acknowledge the harm caused

### 4. Ask (Only If Appropriate)
- "Would you be willing to help me understand why that was harmful?"
- **Important**: They are NOT obligated to educate you
- If they say no, respect that boundary
- You can research on your own time

### 5. Commit to Change
- "I will work on not doing that again"
- "I'm going to educate myself on this"
- Actually follow through—actions matter more than words

### 6. Make It Right (If Possible)
- If in a meeting, acknowledge publicly: "I need to correct something I said..."
- If there are others present, don't let your mistake stand unchallenged
- Consider what repair looks like in this context

### 7. Move On Gracefully
- Don't dwell on YOUR feelings
- Don't fish for reassurance
- Just do better going forward

## Example Response

**Instead of**:  
"That's not what I meant! You know I'm not racist! I was just trying to give you a compliment. You're being really unfair right now."

**Try**:  
"You're right, and I'm sorry. That was inappropriate. Thank you for letting me know—I'm going to be more mindful."

## Processing Your Feelings

It's normal to feel:
- Embarrassed
- Defensive
- Anxious
- Ashamed
- Worried about being seen as racist

### These feelings are valid BUT
- They are YOUR responsibility to manage
- Don't make the harmed person comfort you
- Talk to another person (ideally not a Black colleague)
- Use a therapist, friend, journal
- Sit with the discomfort—it's how we learn

## Long-Term Growth

### Educate Yourself
- Read books by Black authors on racism
- Follow Black educators on social media
- Attend workshops and training
- Do the work—don't expect Black colleagues to teach you

### Pay Attention
- Notice patterns in your thoughts/speech
- What assumptions do you make?
- Who do you interrupt? Who do you credit?
- Whose expertise do you question?

### Speak Up
- When you see others commit microaggressions, intervene
- Don't just stop doing harm—actively prevent it
- Use your voice to amplify Black voices

## Remember

- **One incident doesn't define you**—how you respond does
- **Defensiveness prevents growth**—stay open
- **Mistakes are inevitable**—learning is a choice
- **Impact matters more than intent**
- **Being called out is a gift**—most people just avoid you

## Reflection Questions

1. What's your typical first reaction when someone corrects you? Why?
2. How can you prepare yourself to respond better in the moment?
3. What support systems can you put in place to process your feelings appropriately?`,
    module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Bystander Intervention', slug: 'bystander-intervention', description: 'How to intervene when you witness microaggressions.',
    content_type: 'video', content_url: 'https://example.com/videos/bystander-micro.mp4', video_duration_seconds: 600,
    module_number: 2, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m2.id, {
    title: 'Quiz: Microaggressions', slug: 'quiz-microaggressions', description: 'Test your understanding.',
    content_type: 'quiz', content_data: {
      questions: [
        { question: 'Which statement is a microaggression?', options: ['Black Lives Matter', 'I don\'t see color', 'Systemic racism exists', 'Let me educate myself'],
          correct_answer: 1, explanation: '"I don\'t see color" invalidates the lived experience of racism and suggests being Black is something to be overlooked rather than respected.' },
        { question: 'If someone says you committed a microaggression, the best first response is:', 
          options: ['Explain what you actually meant', 'Thank them and apologize', 'Ask them not to be so sensitive', 'Get defensive about your intent'],
          correct_answer: 1, explanation: 'Thank the person for telling you and apologize for the harm caused. Intent doesn\'t negate impact.' },
        { question: 'Microaggressions are called "micro" because:', 
          options: ['They are minor and don\'t really matter', 'They are small individual incidents that accumulate', 'Only micromanagers do them', 'They are easy to fix'],
          correct_answer: 1, explanation: 'The "micro" refers to individual incidents, but the cumulative effect is significant. Many prefer the term "everyday racism."' }
      ], passing_score: 75, time_limit_minutes: 10
    }, module_number: 2, lesson_number: 4, sort_order: 4
  })

  console.log(`✅ Module 2: 4 lessons`)
  console.log(`✅ Course 3 complete: 2 modules, 7 lessons`)
}

// COURSE 4: Effective Allyship
async function populateAllyship() {
  console.log('\n📚 Course 4: Being an Effective Anti-Racist Ally')
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'effective-allyship').single()
  if (!course) { console.log('❌ Not found'); return }

  const m1 = await createModule(course.id, { title: 'Understanding Allyship', description: 'What does it mean to be an anti-racist ally?', sort_order: 1 })

  await createLesson(course.id, m1.id, {
    title: 'What is Allyship?', slug: 'what-is-allyship', description: 'Defining allyship and understanding its responsibilities.',
    content_type: 'video', content_url: 'https://example.com/videos/allyship-intro.mp4', video_duration_seconds: 720,
    module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Ally vs. Accomplice vs. Co-Conspirator', slug: 'ally-accomplice-coconspirator', description: 'Understanding different levels of anti-racist action.',
    content_type: 'article', article_body: `# Ally, Accomplice, Co-Conspirator: Understanding the Spectrum

## The Evolution of Language

The term "ally" has become controversial in anti-racism work. Here's why, and what alternatives exist.

## Ally: The Starting Point

### Definition
Someone who:
- Supports Black people and anti-racism
- Speaks out against racism when they see it
- Educates themselves about racism
- Uses their privilege to amplify Black voices

### Limitations
- **Can be performative**: Ally as identity vs. action
- **Centers the helper**: "Look at me being anti-racist!"
- **Low risk**: Comfortable forms of support
- **Passive stance**: Waiting to be asked vs. taking initiative
- **Self-appointed**: "I'm an ally!" (allies don't name themselves; the community does)

### Example Actions
- Attending anti-racism workshops
- Sharing Black voices on social media
- Calling out racist jokes
- Reading anti-racism books

### The Problem
You don't GET to be an ally—it's not a badge you earn. It's an ongoing practice that others assess based on your actions.

## Accomplice: Raising the Stakes

### Definition
Someone who:
- Takes action even when it's uncomfortable
- Willing to take personal risks
- Works in solidarity with Black communities
- Gives up something—power, comfort, resources
- Follows the lead of Black organizers

### Key Difference
**Ally**: "I support you"  
**Accomplice**: "I'm with you, and I'm willing to sacrifice for this"

### Examples
- Using your position to block a racist policy (even if it costs you)
- Redistributing resources/power to Black colleagues
- Confronting racism in family even when relationships suffer
- Leveraging your privilege to shield Black colleagues from retaliation
- Putting your body on the line in direct action

### Higher Standard
- **Not self-appointed**: Black community recognizes your actions
- **Risk-taking**: Comfortable support isn't enough
- **Strategic**: Acting with purpose, not performatively
- **Sustainable**: Long-term commitment, not one-time action

## Co-Conspirator: Building Together

### Definition
Someone who:
- Works in authentic partnership with Black communities
- Shares risk and accountability equally
- Dismantles systems of oppression actively
- Operates with deep trust and relationship
- Committed to transformation, not reform

### Key Difference
**Accomplice**: Shows up in critical moments  
**Co-Conspirator**: Embedded in the work long-term, building together

### Examples
- Long-term partnerships with Black-led organizations
- Using institutional access to dismantle racist policies
- Redistributing decision-making power, not just resources
- Building collective power, not being a savior
- Showing up consistently, not just in crises

### Characteristics
- **Deep relationships**: Not transactional
- **Shared risk**: Not leading from safety
- **Accountable**: To Black communities, not ego
- **Strategic**: Understanding systems and leverage points
- **Humble**: Following Black leadership

## Comparing the Three

| Aspect | Ally | Accomplice | Co-Conspirator |
|--------|------|------------|----------------|
| **Risk Level** | Low | Medium-High | High |
| **Time Commitment** | Occasional | Regular | Ongoing |
| **Personal Cost** | Minimal | Moderate | Significant |
| **Visibility** | Often public | Can be private | Behind scenes |
| **Relationship** | Supportive | Solidaristic | Partnership |
| **Leadership** | Independent | Following | Co-creating |

## The Action Continuum

### Level 1: Awareness (Ally)
- Learning about racism
- Acknowledging privilege
- Listening to Black voices

### Level 2: Education (Ally)
- Self-education
- Educating others
- Sharing resources

### Level 3: Action (Ally/Accomplice)
- Speaking up
- Donating resources
- Attending protests

### Level 4: Risk (Accomplice)
- Personal sacrifice
- Using privilege strategically
- Confronting power

### Level 5: Partnership (Co-Conspirator)
- Long-term collaboration
- Shared accountability
- Systems change

## Important Principles

### 1. Actions Over Identity
Don't call yourself an ally/accomplice/co-conspirator. Just DO the work.

### 2. Follow Black Leadership
It's not about you being the hero. Follow, support, amplify.

### 3. Accept That You'll Make Mistakes
Perfect allyship doesn't exist. Show up imperfectly but consistently.

### 4. Check Your Motives
- Are you doing this to be seen as "good"?
- Or because dismantling racism is right?
- Center the goal, not your goodness

### 5. It's Not About Your Comfort
If you're always comfortable, you're not doing enough.

### 6. Build Relationships
This work happens in community, not in isolation.

### 7. Stay When It's Hard
Allyship isn't a trend. It's a lifetime commitment.

## Moving Forward

**Don't ask**: "Am I an ally?"  
**Do ask**: "Am I showing up? Am I taking risks? Am I following Black leadership?"

**Don't say**: "I'm an ally!"  
**Do say**: "I'm committed to anti-racism. Here's what I'm doing."

**Don't wait**: For permission, perfect understanding, comfort  
**Do start**: Imperfectly, consistently, humbly

## Reflection Questions

1. Where are you currently on the ally-accomplice-co-conspirator spectrum?
2. What would it take for you to move to the next level?
3. What risks are you willing to take? What's holding you back?
4. Who are you accountable to in this work?`,
    module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Understanding Privilege', slug: 'understanding-privilege', description: 'Examining your privilege and using it strategically.',
    content_type: 'video', content_url: 'https://example.com/videos/privilege.mp4', video_duration_seconds: 600,
    module_number: 1, lesson_number: 3, sort_order: 3
  })

  console.log(`✅ Module 1: 3 lessons`)

  const m2 = await createModule(course.id, { title: 'Allyship in Action', description: 'Practical strategies for effective allyship.', sort_order: 2 })

  await createLesson(course.id, m2.id, {
    title: 'Speaking Up and Speaking Out', slug: 'speaking-up', description: 'When and how to use your voice for anti-racism.',
    content_type: 'video', content_url: 'https://example.com/videos/speaking-up.mp4', video_duration_seconds: 660,
    module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Amplifying Black Voices', slug: 'amplifying-voices', description: 'Strategies to center Black voices and expertise.',
    content_type: 'article', article_body: `# Amplifying Black Voices

## Why Amplification Matters

Black voices are systematically:
- Silenced in meetings
- Credited less for ideas
- Interrupted more frequently
- Given less authority
- Excluded from decisions

Amplification is about using your privilege to ensure Black voices are heard, credited, and centered.

## Strategies

### 1. Cite and Credit
**In meetings:**
- "As [Black colleague] said earlier..."
- "Building on [Black colleague's] point..."
- "That's exactly what [Black colleague] proposed"

**In written work:**
- Cite Black scholars and authors
- Credit Black colleagues for their ideas
- Give public recognition

### 2. Create Space
- Actively invite Black colleagues to speak
- Notice who hasn't spoken and ask for their input
- In presentations, share the platform
- Defer to Black expertise on racism

### 3. Interrupt Interruptions
- "Let [them] finish"
- "I'd like to hear the rest of [their] thought"
- "[They] was still speaking"

### 4. Boost Social Media
- Share Black creators' original posts (not screenshots)
- Give credit and tags
- Don't add your commentary as more important
- Use your platform to direct followers to Black voices

### 5. Redistribute Resources
- Hire Black consultants and pay them well
- Buy from Black-owned businesses
- Donate to Black-led organizations
- Create opportunities for Black colleagues

### 6. Make Connections
- Introduce Black colleagues to your networks
- Recommend them for opportunities
- Nominate them for awards and recognition
- Open doors you have access to

### 7. Step Back
- Decline speaking opportunities and suggest Black speakers
- Give up panel seats to Black experts
- Don't accept all-white panels
- Know when not to be the voice

## What NOT to Do

### ❌ Centering Yourself
**Don't**: "Here's what I learned from my Black friend..."  
**Do**: "Here's what [Black scholar] teaches us..."

### ❌ Speaking For
**Don't**: Answer questions about Black experiences  
**Do**: "That's a great question for [Black colleague]"

### ❌ Parroting
**Don't**: Repeat Black people's ideas as your own  
**Do**: Explicitly credit them

### ❌ Tone Policing
**Don't**: Tell Black people how to express their anger  
**Do**: Listen to and validate their emotions

### ❌ White Saviorism
**Don't**: "Let me rescue Black people with my expertise"  
**Do**: "How can I support your existing work?"

## In Different Contexts

### In Meetings
- Notice speaking patterns
- Ensure Black colleagues are heard
- Give credit in real-time
- Follow up with decision-makers about Black colleagues' ideas

### In Hiring
- Advocate for Black candidates
- Challenge "culture fit" as code for homogeneity
- Question why pipeline is "lacking"
- Push for diverse interview panels

### In Social Settings
- Redirect racist conversations
- Educate fellow white people
- Don't expect Black people to explain racism
- Share resources and do the work

### Online
- Share Black creators generously
- Call out racism in comments
- Use hashtags that support movements
- Boost Black voices without adding your spin

## Measuring Impact

### Good Amplification Results In:
✓ Black colleagues gaining visibility
✓ Black experts being recognized
✓ Resources flowing to Black communities
✓ You becoming less central to conversations
✓ Black leadership increasing

### Poor "Amplification" Results In:
✗ You getting praised for being an ally
✗ Your voice still dominant
✗ Black people still doing emotional labor
✗ No actual transfer of power or resources
✗ Performative appearance of support

## Remember

- **It's not about you**: Your comfort, your learning, your growth
- **Follow, don't lead**: Black people are the experts on racism
- **Stay consistent**: Don't just show up when it's trending
- **Expect nothing**: No gold stars for basic decency
- **Keep learning**: You'll mess up—apologize and improve

## Reflection Questions

1. Whose voices dominate in your workplace? Whose are marginalized?
2. When was the last time you amplified a Black colleague? How?
3. What opportunities do you have access to that you could share?
4. Are you centering Black voices or centering your allyship?`,
    module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Final Assessment', slug: 'final-assessment', description: 'Comprehensive assessment of allyship principles.',
    content_type: 'quiz', content_data: {
      questions: [
        { question: 'The difference between an ally and an accomplice is:', 
          options: ['Nothing, they are the same', 'Accomplices take risks and give up comfort/power', 'Allies are better than accomplices', 'Accomplices only do illegal things'],
          correct_answer: 1, explanation: 'Accomplices go beyond comfortable support to take risks, make sacrifices, and work in solidarity with Black communities.' },
        { question: 'When amplifying Black voices, you should:', 
          options: ['Repeat their ideas as your own for more reach', 'Explicitly credit them and direct people to them', 'Add your own perspective to improve the message', 'Summarize so others understand better'],
          correct_answer: 1, explanation: 'Always explicitly credit Black voices and direct people to learn directly from them, not through you.' },
        { question: 'If you make a mistake in your allyship work, you should:', 
          options: ['Give up because you are not cut out for this', 'Apologize, learn, and continue the work', 'Explain your intent repeatedly', 'Stop so you don\'t cause more harm'],
          correct_answer: 1, explanation: 'Mistakes are inevitable. Acknowledge harm, learn from it, and continue doing better. Growth requires staying engaged even when it\'s hard.' }
      ], passing_score: 80, time_limit_minutes: 15
    }, module_number: 2, lesson_number: 3, sort_order: 3
  })

  console.log(`✅ Module 2: 3 lessons`)
  console.log(`✅ Course 4 complete: 2 modules, 6 lessons`)
}

async function main() {
  console.log('=== COURSES 3 & 4 POPULATION ===\n')
  try {
    await populateMicroaggressions()
    await populateAllyship()
    console.log('\n✅ Courses 3 & 4 Complete!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  }
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1) })
