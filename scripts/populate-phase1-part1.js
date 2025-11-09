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

// Course 7: Difficult Conversations About Race
async function populateDifficultConversations() {
  console.log('\n📚 Course 7: Difficult Conversations About Race')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'difficult-conversations-race').single()
  if (!course) { console.log('❌ Course not found'); return }

  // Module 1: Preparation & Mindset
  const m1 = await createModule(course.id, {
    title: 'Preparing for Difficult Conversations',
    description: 'Build the foundation for successful racial conversations through self-awareness and psychological preparation.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Why These Conversations Matter',
    slug: 'why-conversations-matter',
    description: 'Understand the importance and impact of engaging in difficult racial conversations.',
    content_type: 'video',
    content_url: 'https://example.com/videos/why-conversations-matter.mp4',
    video_duration_seconds: 480,
    module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
  })

  await createLesson(course.id, m1.id, {
    title: 'Examining Your Own Reactions',
    slug: 'examining-reactions',
    description: 'Explore common defensive reactions and how to manage them.',
    content_type: 'article',
    article_body: `# Examining Your Own Reactions

## Why Self-Awareness Matters

Before engaging in difficult conversations about race, you must understand your own reactions and triggers. Defensiveness is a normal human response, but left unchecked, it derails conversations and causes harm.

## Common Defensive Reactions

### 1. Denial
**What it looks like**: "I don't see color," "Racism isn't a problem here," "That didn't happen"
**Why it happens**: Protecting your worldview from uncomfortable truths
**Impact**: Invalidates Black people's experiences and shuts down conversation
**Reality check**: If racism weren't a problem, we wouldn't need this conversation

### 2. Centering Yourself
**What it looks like**: "I have Black friends," "I grew up poor too," "Not all white people"
**Why it happens**: Discomfort with being implicated, desire to be seen as "one of the good ones"
**Impact**: Shifts focus from racism to your feelings, forces Black people to reassure you
**Reality check**: This conversation isn't about you being bad; it's about systems and impacts

### 3. Tone Policing
**What it looks like**: "You're being too aggressive," "If you weren't so angry, I'd listen," "Calm down"
**Why it happens**: Discomfort with Black people's justified anger
**Impact**: Prioritizes your comfort over justice, silences legitimate emotion
**Reality check**: Anger is a rational response to injustice; don't demand serenity from those being harmed

### 4. Intellectualizing
**What it looks like**: "Well, actually, the data shows...", "Let's look at this objectively," "Both sides..."
**Why it happens**: Trying to avoid emotional discomfort
**Impact**: Diminishes lived experience, positions you as "neutral arbiter" of someone else's reality
**Reality check**: Racism isn't an abstract debate—it's lived experience

### 5. Jumping to Solutions
**What it looks like**: "What should I do?", "But I already did X," "Here's how we fix it..."
**Why it happens**: Discomfort with sitting in the problem, desire to feel helpful
**Impact**: Shortcuts understanding, focuses on your action over listening
**Reality check**: Listen first; solutions come after understanding

### 6. Fragility/Tears
**What it looks like**: Crying, needing comfort, threatening to leave
**Why it happens**: Overwhelm, guilt, fear of being seen as bad
**Impact**: Reverses roles—now Black person must comfort you
**Reality check**: Your discomfort is survivable; manage your emotions so you can stay present

### 7. Changing the Subject
**What it looks like**: "But what about class?", "All lives matter," "Let's talk about something positive"
**Why it happens**: Avoiding discomfort, diluting the focus
**Impact**: Prevents depth, signals you're not willing to engage
**Reality check**: Other issues exist, but right now we're talking about anti-Black racism

## The Neuroscience of Defensiveness

When your worldview is challenged:
- **Amygdala activation**: Brain perceives threat
- **Cortisol release**: Stress response triggered
- **Reduced prefrontal cortex function**: Harder to think clearly, listen, regulate emotions
- **Result**: Fight, flight, or freeze

Understanding this helps you:
1. **Recognize** when you're activated
2. **Pause** before reacting
3. **Breathe** to reset your nervous system
4. **Choose** a more productive response

## Self-Regulation Techniques

### Before the Conversation
- **Ground yourself**: Deep breathing, feet on floor, present moment awareness
- **Set intention**: "I'm here to learn, not defend"
- **Accept discomfort**: "This will be uncomfortable, and that's okay"
- **Remember why**: "This matters more than my comfort"

### During the Conversation
- **Notice your body**: Jaw clenching? Shoulders tight? Heart racing? These are cues you're activated
- **Pause**: It's okay to say "Let me sit with that for a moment"
- **Breathe**: 4-count in, 4-count hold, 4-count out
- **Name it**: "I'm noticing I'm feeling defensive" (to yourself or aloud)

### When You're Triggered
1. **Acknowledge**: "I'm having a strong reaction"
2. **Don't act**: Wait before speaking
3. **Breathe**: Three deep breaths minimum
4. **Ask yourself**: "Is this about the conversation, or about me?"
5. **Choose**: What response serves the conversation, not just my comfort?

## Moving from Defensiveness to Openness

### Reframe Your Mindset

**Instead of**: "I'm a good person, so this doesn't apply to me"
**Try**: "Good people can still benefit from racism and cause harm"

**Instead of**: "I need to prove I'm not racist"
**Try**: "I need to understand how racism operates and how I'm implicated"

**Instead of**: "They're attacking me"
**Try**: "They're sharing important information about their experience"

**Instead of**: "I already know this"
**Try**: "There's always more to learn"

**Instead of**: "This is uncomfortable"
**Try**: "Discomfort is where growth happens"

## The Cost of Staying Defensive

When you prioritize your comfort:
- **Black people do extra labor** to manage your emotions
- **The conversation derails** from substance to reassurance
- **Nothing changes** because you didn't actually hear the message
- **Relationships erode** because Black people learn you're not safe
- **Racism continues** because you refused to examine your role

## The Gift of Openness

When you move through defensiveness:
- **You learn** what you didn't know before
- **Relationships deepen** through authentic connection
- **You become more effective** in anti-racism work
- **Black people can be authentic** instead of managing you
- **Real change becomes possible**

## Practical Exercise: Defense Audit

Over the next week, notice when you get defensive in conversations about race:
1. **What was said** that triggered you?
2. **What reaction** did you have (physically, emotionally, behaviorally)?
3. **What was the underlying fear** (being seen as bad, losing status, being wrong)?
4. **How did you respond**? Did it serve the conversation?
5. **What would you do differently** next time?

## Remember

- **Defensiveness is normal** – you're human
- **It's a skill** – you can get better at managing it
- **It's not about you being bad** – it's about systems and impact
- **Your discomfort is survivable** – and necessary for growth
- **The stakes are higher** for Black people than for your comfort

## Reflection Questions

1. Which defensive reaction do you recognize most in yourself?
2. What are your physical signs of being activated?
3. What would it take for you to prioritize learning over self-protection?
4. Who can you practice with before engaging in higher-stakes conversations?`,
    module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'Creating Psychological Safety',
    slug: 'psychological-safety',
    description: 'Learn how to establish conditions for productive dialogue.',
    content_type: 'video',
    content_url: 'https://example.com/videos/psychological-safety.mp4',
    video_duration_seconds: 540,
    module_number: 1, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m1.id, {
    title: 'Quiz: Preparation & Mindset',
    slug: 'quiz-preparation',
    description: 'Test your understanding of conversation preparation.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'Why is self-awareness important before difficult racial conversations?',
          options: [
            'So you can avoid the conversation entirely',
            'To recognize and manage your defensive reactions so they don\'t derail the conversation',
            'To prove you\'re not racist',
            'To prepare your arguments'
          ],
          correct_answer: 1,
          explanation: 'Self-awareness helps you recognize when you\'re becoming defensive so you can pause, breathe, and respond thoughtfully rather than reactively. This keeps the conversation productive.'
        },
        {
          question: 'What is "tone policing" and why is it problematic?',
          options: [
            'Enforcing workplace conduct policies',
            'Criticizing how someone expresses their experience (e.g., "you\'re too angry") instead of hearing the substance',
            'Speaking in a professional tone',
            'Politely correcting grammar'
          ],
          correct_answer: 1,
          explanation: 'Tone policing prioritizes the listener\'s comfort over justice. It silences legitimate anger and makes the conversation about how something is said rather than what is being said. Anger is a rational response to injustice.'
        },
        {
          question: 'When you feel defensive during a racial conversation, what should you do first?',
          options: [
            'Leave the conversation immediately',
            'Explain why you\'re not racist',
            'Pause, breathe, and notice your physical/emotional reactions before responding',
            'Change the subject to something more comfortable'
          ],
          correct_answer: 2,
          explanation: 'When activated, pause and breathe to reset your nervous system. Notice your reactions (tight jaw, racing heart, urge to defend). This creates space to respond thoughtfully rather than reactively.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 10
    },
    module_number: 1, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 1: 4 lessons')

  // Module 2: Conversation Frameworks
  const m2 = await createModule(course.id, {
    title: 'Proven Conversation Frameworks',
    description: 'Learn structured approaches for navigating difficult racial conversations effectively.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'The LARA Framework',
    slug: 'lara-framework',
    description: 'Listen, Affirm, Respond, Add information - a powerful active listening approach.',
    content_type: 'article',
    article_body: `# The LARA Framework

## What is LARA?

LARA is a conversation framework developed specifically for discussing politically and emotionally charged topics. It's particularly effective for racial conversations because it prioritizes understanding over agreement.

**LARA stands for:**
- **L**isten
- **A**ffirm
- **R**espond
- **A**dd information

## Why LARA Works

Traditional debate approaches:
- Position your view against theirs
- Look for weaknesses in their argument
- Try to "win" by proving them wrong
- Result: Defensiveness, entrenchment, no learning

LARA approach:
- Seeks to understand before being understood
- Validates emotions even when disagreeing with conclusions
- Creates space for productive exchange
- Result: Openness, learning, potential for movement

## The Four Steps in Detail

### Step 1: Listen (with curiosity, not judgment)

**What to do:**
- Give full attention (put phone away, make eye contact)
- Listen to understand, not to respond
- Notice emotions as well as content
- Don't interrupt or finish their sentences
- Ask clarifying questions

**What to avoid:**
- Planning your response while they're talking
- Interrupting with "but actually..."
- Dismissing their experience as invalid
- Looking for gotchas or inconsistencies

**Example questions:**
- "Can you tell me more about that?"
- "What was that experience like for you?"
- "Help me understand..."
- "What do you mean by [term]?"

**Why it matters:** Most people just want to be heard. Deep listening is rare and powerful.

### Step 2: Affirm (the person and their feelings)

**What to do:**
- Acknowledge their emotions are real and valid
- Recognize their experience, even if different from yours
- Show respect for them as a person
- Reflect back what you heard

**What to avoid:**
- "I understand" (unless you truly do)
- "Calm down" or other tone policing
- "You shouldn't feel that way"
- Dismissing or minimizing

**Example affirmations:**
- "I can hear how much this matters to you"
- "That sounds really frustrating/painful/exhausting"
- "Thank you for trusting me with this"
- "I appreciate you sharing your experience"
- "What you're saying makes sense given what you've experienced"

**Key distinction:** You're affirming their *feelings* and *experience*, not necessarily agreeing with their *conclusions* or *solutions*.

**Why it matters:** People need to feel heard before they can hear you. Affirmation creates that foundation.

### Step 3: Respond (to their emotional experience)

**What to do:**
- Name what you observe about their feelings
- Share your own emotional response (if helpful)
- Acknowledge impact even if intent was different
- Take responsibility for your role (if applicable)

**What to avoid:**
- "You're too sensitive"
- "I didn't mean it that way" (as a defense)
- Making it about your intentions rather than their impact
- Centering yourself

**Example responses:**
- "I can see this is really important to you"
- "I'm hearing that you feel [emotion]. Is that right?"
- "I'm realizing I hadn't considered that perspective"
- "I'm sorry my actions/words had that impact"

**Why it matters:** Emotional validation is often all someone needs to move forward in conversation.

### Step 4: Add Information (if appropriate)

**What to do:**
- Share your perspective as your own, not universal truth
- Provide relevant context or data if helpful
- Ask permission: "Would it be helpful if I shared my perspective?"
- Keep it brief and relevant

**What to avoid:**
- "Well, actually..." or "To be fair..."
- Talking more than listening
- Using this step to debate or prove them wrong
- Adding information that centers you

**Example additions:**
- "My experience has been different - I've seen [example]. I'm wondering what accounts for that difference?"
- "I learned recently that [fact/statistic]. Does that resonate with your experience?"
- "I'm still processing this, but what I'm thinking is..."

**Why it matters:** This is where actual exchange happens, but only if you've done steps 1-3 first.

## LARA in Action: Examples

### Scenario 1: Colleague shares experience of racism

**Without LARA** (defensive):
Colleague: "I'm tired of being the only Black person in every meeting and having my ideas ignored."
You: "I don't think anyone ignores you. Maybe you need to speak up more. And didn't we just hire another Black person in marketing?"

**Result:** Colleague feels invalidated, shuts down, doesn't trust you again.

**With LARA**:
- **Listen**: [Make eye contact, nod, don't interrupt]
- **Affirm**: "That sounds exhausting and frustrating."
- **Respond**: "I'm realizing I haven't noticed that pattern, which probably says something about my experience being different. Can you tell me more about when this happens?"
- **Add**: "I want to be more aware of this. Would it be helpful if I intentionally amplified your contributions in meetings?"

**Result:** Colleague feels heard, conversation deepens, you learn, relationship strengthens.

### Scenario 2: Family member says something racist

**Without LARA** (attacking):
Family: "I'm tired of hearing about Black Lives Matter. All lives matter."
You: "That's racist! You're part of the problem!"

**Result:** Family member becomes defensive, doubles down, conversation ends badly.

**With LARA**:
- **Listen**: "Tell me more about what frustrates you."
- **Affirm**: "I hear that you're frustrated and feel like your concerns aren't being heard."
- **Respond**: "I think we both want a society where everyone is valued."
- **Add**: "What I've learned is that 'Black Lives Matter' doesn't mean other lives don't—it's highlighting that Black lives are treated as if they matter less in many systems. It's more like a house is on fire so the fire department goes there, not to every house. Does that make sense?"

**Result:** Door stays open for continued conversation and potential learning.

### Scenario 3: Addressing microaggression

**Without LARA** (passive):
Colleague: "Wow, you're so articulate!"
You: [Say nothing, feel resentful]

**Result:** Behavior continues, you build resentment, colleague doesn't learn.

**With LARA to yourself first**:
- **Listen**: They probably meant it as a compliment
- **Affirm**: My feeling hurt is valid, even if intent was good
- **Respond**: I need to address this
- **Add**: Here's how...

**Then with colleague**:
You: "Hey, can I share something? When you say I'm 'articulate,' I know you mean it as a compliment, but it often lands differently for Black people. It can carry an assumption that we wouldn't normally be articulate. Would 'I really appreciate your perspective on this' work better?"

**Result:** Colleague learns, behavior changes, relationship strengthens.

## Common Challenges with LARA

### "But I Disagree!"
LARA doesn't require agreement. You can affirm feelings ("I hear this is frustrating for you") while maintaining a different view.

### "They're Factually Wrong!"
Facts matter, but timing matters more. If someone is emotional, they can't hear facts yet. LARA first, facts later.

### "This Feels Fake/Manipulative"
LARA isn't about manipulating—it's about genuinely trying to understand. If it feels fake, you're probably skipping the listening part.

### "What if They're Just Attacking Me?"
If someone is venting, LARA can help. If they're genuinely being abusive, you can set boundaries: "I want to hear you, and I need us to speak respectfully to each other."

## Practicing LARA

### Start Small
- Practice on lower-stakes conversations first
- Use with family, friends, colleagues on any topic
- Notice how it changes the dynamic

### Debrief
After using LARA:
- What worked?
- Where did you struggle?
- What would you do differently?

### Key Reminders
- **L is 80% of LARA** - really listen
- **You can't skip steps** - must listen and affirm before adding
- **It's not about winning** - it's about understanding
- **Practice makes better** - it will feel awkward at first

## Reflection Questions
1. When you disagree with someone, do you typically listen to understand or listen to respond?
2. Which step of LARA will be hardest for you? Why?
3. Think of a past conversation that went poorly. How might LARA have changed it?
4. Who can you practice LARA with in a low-stakes conversation this week?`,
    module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'The REAL Framework',
    slug: 'real-framework',
    description: 'Reflect, Engage, Acknowledge, Learn - for when you\'ve caused harm.',
    content_type: 'video',
    content_url: 'https://example.com/videos/real-framework.mp4',
    video_duration_seconds: 600,
    module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Asking Powerful Questions',
    slug: 'powerful-questions',
    description: 'Learn to ask questions that deepen understanding rather than debate.',
    content_type: 'video',
    content_url: 'https://example.com/videos/powerful-questions.mp4',
    video_duration_seconds: 480,
    module_number: 2, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 2: 3 lessons')

  // Module 3: Handling Resistance & Recovery
  const m3 = await createModule(course.id, {
    title: 'Handling Resistance and Recovering',
    description: 'Strategies for managing pushback and taking care of yourself after difficult conversations.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'Common Forms of Resistance',
    slug: 'forms-of-resistance',
    description: 'Recognize and respond to typical deflections and defensive patterns.',
    content_type: 'article',
    article_body: `# Common Forms of Resistance

## Why People Resist

Conversations about race trigger resistance because they challenge:
- **Worldview**: "I thought I was a good person"
- **Identity**: "I'm not racist"
- **Comfort**: "This is uncomfortable"
- **Power**: "I might have to give something up"

Resistance is normal. Your job isn't to eliminate it, but to recognize and work with it skillfully.

## The Resistance Patterns

### 1. "Not All..." / "But I..."
**What it sounds like:**
- "Not all white people..."
- "But I have Black friends..."
- "I grew up poor too..."

**What's happening:** Attempting to exempt themselves from the conversation

**Why it doesn't work:** Makes conversation about them being "one of the good ones" rather than about systemic racism

**How to respond:**
"I hear that you don't identify with what I'm describing. This isn't about all individuals being bad—it's about systems that advantage some groups and disadvantage others. Even 'good people' participate in and benefit from these systems."

### 2. "What About..." / "All Lives..."
**What it sounds like:**
- "What about class?"
- "All lives matter"
- "What about Black-on-Black crime?"

**What's happening:** Deflecting to avoid focusing on anti-Black racism

**Why it doesn't work:** Other issues exist, but right now we're talking about this issue

**How to respond:**
"Class/poverty/etc. definitely matter, and we can talk about those. Right now, we're talking specifically about anti-Black racism. Can we stay with that for now?"

### 3. Denial / "That Doesn't Happen Here"
**What it sounds like:**
- "I've never seen that"
- "Not in our organization"
- "That's not my experience"

**What's happening:** Refusing to acknowledge reality that differs from their experience

**Why it doesn't work:** Your lack of observation doesn't negate others' experiences

**How to respond:**
"Just because you haven't witnessed it doesn't mean it's not happening. Black people report experiencing [X]. What would it mean to take their word for it?"

### 4. Tone Policing
**What it sounds like:**
- "You're being too emotional"
- "If you calmed down, I'd listen"
- "Can't we discuss this civilly?"

**What's happening:** Prioritizing their comfort over justice; silencing legitimate anger

**Why it doesn't work:** Anger is a rational response to injustice

**How to respond:**
"I understand you're uncomfortable with strong emotion. But people have a right to be angry about injustice. Can you hear the substance of what's being said?"

### 5. Intellectualizing / "Devil's Advocate"
**What it sounds like:**
- "Let's look at this objectively"
- "Playing devil's advocate here..."
- "What does the data say?"

**What's happening:** Using logic to avoid emotional engagement; treating racism as abstract debate

**Why it doesn't work:** Racism isn't a debate topic—it's lived experience causing real harm

**How to respond:**
"Data and analysis matter, and so does lived experience. What would it take for you to trust what Black people are telling you about their experiences?"

### 6. Guilt / White Tears
**What it sounds like:**
- "I feel so bad"
- "I'm a terrible person"
- [Crying, needing comfort]

**What's happening:** Making conversation about their feelings; reversing emotional labor

**Why it doesn't work:** Now Black person must comfort them instead of being heard

**How to respond:**
"I understand this is hard to hear. Your discomfort is survivable. The question is: what are you going to do with what you're learning?"

### 7. "I Already Know This"
**What it sounds like:**
- "I've heard this before"
- "I already took a workshop"
- "I get it"

**What's happening:** Shutting down to avoid actual engagement

**Why it doesn't work:** If you really got it, racism would be solved

**How to respond:**
"Great—what are you doing with what you know? Where are you still learning?"

### 8. False Equivalence
**What it sounds like:**
- "I experienced discrimination for [non-racial identity]"
- "Everyone faces challenges"
- "My family immigrated and faced hardship"

**What's happening:** Equating their experience with anti-Black racism to minimize it

**Why it doesn't work:** Other forms of hardship exist, but anti-Black racism has specific history and manifestations

**How to respond:**
"Other forms of discrimination and hardship are real. Anti-Black racism has particular historical roots and current manifestations that require specific attention."

### 9. Jumping to Solutions
**What it sounds like:**
- "What should we do?"
- "Let me fix this"
- "I have an idea..."

**What's happening:** Avoiding discomfort of sitting in the problem; wanting to feel helpful

**Why it doesn't work:** Shortcuts understanding; often leads to ineffective or harmful "solutions"

**How to respond:**
"I appreciate that you want to take action. Before we jump to solutions, let's make sure we fully understand the problem."

### 10. Changing the Subject
**What it sounds like:**
- [Abrupt topic change]
- "On a lighter note..."
- "Let's talk about something positive"

**What's happening:** Escaping discomfort

**Why it doesn't work:** Important issues don't go away because we stop talking about them

**How to respond:**
"I notice we moved away from that topic. Was it getting too uncomfortable? What would it take to stay in the conversation?"

## Responding to Resistance: General Strategies

### Stay Curious
Instead of getting frustrated, get curious: "What's making this hard to hear?" Understanding the resistance helps you address it.

### Name It (Sometimes)
Sometimes directly naming the pattern helps:
"I notice when I share my experience, the response is 'but I...' That makes me feel like you're defending yourself rather than hearing me."

### Set Boundaries
You don't have to engage with bad faith resistance:
"I'm willing to have this conversation if you're genuinely trying to understand. If you're just arguing, I'm going to step away."

### Pick Your Battles
Not every moment of resistance needs to be addressed. Sometimes it's strategic to let something go and come back to it.

### Take Breaks
If you're exhausted, it's okay to pause:
"This is important and I'm at my limit for today. Can we continue this later?"

## When to Walk Away

Some conversations aren't productive:
- Person is committed to bad faith engagement
- Abuse or personal attacks
- Your safety (physical or psychological) is at risk
- You're too activated to continue productively
- Power dynamics make it impossible (e.g., with supervisor)

Walking away doesn't mean giving up—it means choosing where to invest your energy.

## For Black People: Self-Protection

If you're Black and engaging across racial difference:

### You Don't Owe Anyone Your Pain
- You're not obligated to educate
- You can share only what feels safe
- Your experiences aren't up for debate

### Set Limits
- "I'm willing to share my experience, but I need you to just listen without debating"
- "I can recommend resources, but I'm not going to teach you"
- "I need to step away now"

### Choose Your Moments
- Not every microaggression needs addressing
- Strategic engagement is different from avoidance
- Your wellbeing matters

### Have an Exit Plan
- "I need to take a call"
- "I'm going to step out for a moment"
- Bring an ally who can intervene

## For Non-Black People: Managing Resistance in Yourself

### Notice Your Patterns
Which forms of resistance do you recognize in yourself?

### Pause Before Responding
When you feel defensive:
1. Notice it
2. Breathe
3. Ask: "Is this reaction helping or hindering?"

### Recommit
Remind yourself why this conversation matters more than your comfort

### Process Later
Journal, talk to other non-Black people learning, see a therapist—don't process with Black people

## Reflection Questions
1. Which resistance patterns do you recognize in yourself or others?
2. When you encounter resistance, what's your typical reaction?
3. What would help you respond more skillfully?
4. Who can you practice with in lower-stakes conversations?`,
    module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Debrief and Recovery Practices',
    slug: 'debrief-recovery',
    description: 'Take care of yourself after emotionally difficult conversations.',
    content_type: 'video',
    content_url: 'https://example.com/videos/debrief-recovery.mp4',
    video_duration_seconds: 420,
    module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-conversations',
    description: 'Comprehensive assessment of conversation skills and frameworks.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'In the LARA framework, why must you Listen and Affirm before Adding information?',
          options: [
            'To be polite',
            'Because people need to feel heard before they can hear you',
            'To waste time',
            'It\'s just a suggestion, not required'
          ],
          correct_answer: 1,
          explanation: 'People are unable to process new information when they don\'t feel heard. Listening and affirming creates the psychological foundation for productive exchange. If you skip to adding information, they\'ll still be defending rather than listening.'
        },
        {
          question: 'What is "tone policing" and why is it a form of resistance?',
          options: [
            'Enforcing professional workplace standards',
            'Critiquing how someone expresses their experience to avoid hearing the substance',
            'Speaking in a calm tone',
            'Helping someone communicate better'
          ],
          correct_answer: 1,
          explanation: 'Tone policing prioritizes the listener\'s comfort over justice. It says "I\'ll only listen if you\'re calm" and silences legitimate anger. It\'s a form of resistance because it derails the conversation from content to delivery.'
        },
        {
          question: 'When someone says "Not all white people..." or "I have Black friends," what are they doing?',
          options: [
            'Adding helpful context',
            'Trying to exempt themselves from the conversation about systemic racism',
            'Demonstrating their anti-racism credentials',
            'Agreeing with the speaker'
          ],
          correct_answer: 1,
          explanation: 'This is a defensive move to position themselves as "one of the good ones" and thus not implicated in racism. It centers them and their identity rather than focusing on systemic issues and impacts. The conversation becomes about their feelings rather than racism.'
        },
        {
          question: 'What should you do when you feel defensive during a racial conversation?',
          options: [
            'Immediately defend yourself',
            'Leave the conversation',
            'Pause, breathe, notice your reaction, then choose a thoughtful response',
            'Cry to show you care'
          ],
          correct_answer: 2,
          explanation: 'Defensiveness is normal but doesn\'t have to dictate your response. Pausing allows you to reset your nervous system and respond thoughtfully rather than reactively. This keeps the conversation productive.'
        }
      ],
      passing_score: 80,
      time_limit_minutes: 15
    },
    module_number: 3, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 3: 3 lessons')
  console.log('✅ Course 7 complete: 3 modules, 10 lessons\n')
}

// Course 8: Black Canadian History
async function populateBlackCanadianHistory() {
  console.log('\n📚 Course 8: Black Canadian History: A Comprehensive Overview')
  
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'black-canadian-history').single()
  if (!course) { console.log('❌ Course not found'); return }

  // Module 1: Early Black Presence (1600s-1800s)
  const m1 = await createModule(course.id, {
    title: 'Early Black Presence: 1600s-1800s',
    description: 'Explore the arrival and experiences of Black people in Canada from early colonization through slavery and the Underground Railroad.',
    sort_order: 1
  })

  await createLesson(course.id, m1.id, {
    title: 'Black Presence Before Canada',
    slug: 'black-presence-before-canada',
    description: 'Learn about the earliest Black people in what would become Canada.',
    content_type: 'video',
    content_url: 'https://example.com/videos/black-presence-before-canada.mp4',
    video_duration_seconds: 540,
    module_number: 1, lesson_number: 1, sort_order: 1, is_preview: true
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

## Further Learning

### Key Historical Sites
- **Buxton National Historic Site** (Ontario)
- **Uncle Tom's Cabin Historic Site** (Dresden, Ontario)
- **Black Cultural Centre for Nova Scotia** (Dartmouth)
- **Canadian Museum for Human Rights** (Winnipeg)

### Recommended Reading
- *A History of Slavery in Canada* by Marcel Trudel
- *The Hanging of Angélique* by Afua Cooper
- *Black Canadians: History, Experiences, Social Conditions* by Leo Bertley
- *Africville* by Benjamin Pothier

## Reflection Questions
1. What surprises you most about this history?
2. How does this change your understanding of Canada?
3. Where do you see the legacy of slavery in Canadian society today?
4. What responsibility do you have to this history?`,
    module_number: 1, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m1.id, {
    title: 'The Underground Railroad in Canada',
    slug: 'underground-railroad',
    description: 'The complex reality of Canada as a destination for freedom-seekers.',
    content_type: 'video',
    content_url: 'https://example.com/videos/underground-railroad-canada.mp4',
    video_duration_seconds: 720,
    module_number: 1, lesson_number: 3, sort_order: 3
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
            'Canada abolished slavery before the American Revolution'
          ],
          correct_answer: 1,
          explanation: 'Slavery was legal and practiced in what would become Canada from the early 1600s until the British Empire abolished it in 1834. Approximately 4,200 people were enslaved in New France alone, and slavery continued under British rule.'
        },
        {
          question: 'What did Upper Canada\'s 1793 Gradual Abolition Act actually do?',
          options: [
            'Immediately freed all enslaved people',
            'Freed children born to enslaved mothers, but only at age 25, and did not free anyone currently enslaved',
            'Abolished slavery completely in all of Canada',
            'Made slavery illegal across the British Empire'
          ],
          correct_answer: 1,
          explanation: 'The Act did NOT immediately free anyone. Children born after 1793 to enslaved mothers would be freed at age 25, but people already enslaved remained in bondage for life. It was a very gradual change that allowed slavery to continue for decades.'
        },
        {
          question: 'What did Black freedom-seekers actually experience when they arrived in Canada via the Underground Railroad?',
          options: [
            'Complete equality and acceptance',
            'A paradise free from all discrimination',
            'Legal freedom but also severe discrimination, segregation, and limited opportunities',
            'Immediate wealth and prosperity'
          ],
          correct_answer: 2,
          explanation: 'While Canada offered legal freedom (after 1834) and people couldn\'t be returned to slavery, Black arrivals faced severe discrimination, segregated schools and public spaces, limited economic opportunities, violence, and harassment. Canada was safer than the U.S. but not a paradise.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 10
    },
    module_number: 1, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 1: 4 lessons')

  // Module 2: Segregation Era (1900-1960)
  const m2 = await createModule(course.id, {
    title: 'Segregation and Exclusion: 1900-1960',
    description: 'Examine the era of formal segregation, exclusionary immigration policies, and ongoing discrimination.',
    sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Segregation in Canadian Communities',
    slug: 'segregation-communities',
    description: 'Learn about legally enforced and socially practiced segregation across Canada.',
    content_type: 'article',
    article_body: `# Segregation in Canadian Communities

## The Myth vs. Reality

**Myth**: Canada never had segregation like the American South.

**Reality**: Canada had widespread, legally enforced and socially practiced segregation well into the 20th century.

## Segregated Schools

### Ontario
- **Separate schools for Black children** were legal from 1850s until 1960s
- Permitted if residents petitioned for them or if trustees deemed it "advisable"
- **Last segregated school closed in 1965** (Merlin and North Colchester, Ontario)

**Conditions:**
- Poorly funded compared to white schools
- Outdated materials and buildings
- Less qualified teachers (often paid less)
- Limited curriculum

**Notable case: Dresden, Ontario:**
- Segregated schools until 1960s
- Black students forced to travel further for inferior facilities
- Parents fought for integration for decades

### Nova Scotia (Africville and Beyond)
- **Segregated schools throughout Nova Scotia**
- Black children often walked miles past white schools to reach segregated facilities
- Some communities had no school access at all for Black children
- Continued into 1960s in some areas

**Africville:**
- Established 1840s, Black community in Halifax
- **City denied basic services**: No water, sewage, paved roads, garbage collection
- Forced to use segregated facilities
- **Destroyed by city 1964-1970** under guise of "urban renewal"
- Residents relocated, community demolished
- Finally apologized for in 2010

### Legal Framework
- **Ontario: Common Schools Act** amendments allowed segregation
- **Nova Scotia**: Education Act permitted separate schools
- Not struck down federally until later civil rights era

## Segregated Public Spaces

### Theatres and Entertainment
- **Movie theatres**: Black patrons restricted to balconies ("crow's nest")
- **Dance halls**: "Whites only" or specific "Black nights"
- **Skating rinks**: Separate sessions or complete exclusion

**Example: Dresden, Ontario (1940s-1950s)**
- Several businesses including theatres refused to serve Black customers
- "We reserve the right to refuse service"
- Led to activism including National Unity Association

### Restaurants and Hotels
- **"We don't serve Negroes"** signs were common
- Many establishments openly refused service
- Some restaurants forced Black patrons to eat in kitchen or back areas
- Hotels frequently turned away Black travelers

**Famous Case: Viola Desmond (1946)**
- Nova Scotia businesswoman
- Refused to leave whites-only section of movie theatre
- **Arrested, jailed, fined**
- Fought conviction (lost appeals)
- **Posthumous pardon in 2010** – Canada's first
- Now on Canadian $10 bill (as of 2018)

### Swimming Pools and Beaches
- Many pools excluded Black swimmers entirely
- Others designated specific days/times for Black use (then drained and cleaned)
- Beaches sometimes segregated

**Rationale given**: Racist myths about Black people being "unclean" or "diseased"

### Barbershops and Beauty Salons
- Many refused service to Black customers
- Forced development of Black-owned businesses

## Housing Segregation

### Restrictive Covenants
- **Legal clauses in property deeds** preventing sale to Black, Jewish, Asian people
- Common in major cities: Toronto, Vancouver, Montreal, Halifax
- Enforced by homeowner associations

**Example language**:
"Land shall never be sold, assigned, transferred, leased, rented, or in any manner whatsoever alienated to any person of the Jewish, Hebrew, Semitic, Negro or coloured race or blood."

**Timeline:**
- Common 1930s-1950s
- Not ruled illegal until 1950 in Ontario (Re: Drummond Wren case)
- Continued informally through redlining and discrimination

### Redlining and Mortgage Discrimination
- **Banks refused mortgages** in predominantly Black neighborhoods
- Insurers refused coverage
- Result: Black communities couldn't build wealth through homeownership

### Forced Removals
- **Africville** (Halifax): Demolished 1964-1970
- **Hogan's Alley** (Vancouver): Black community destroyed for development
- **Railway Porters' neighborhood** (Montreal): Displaced by urban renewal

## Employment Discrimination

### Occupational Segregation
- **Railway porters**: One of few jobs open to Black men
  - Hard labor, low pay, no tips originally
  - Led to formation of **Brotherhood of Sleeping Car Porters** (1939 in Canada)
  - Important site of organizing
- **Domestic work**: Primary option for Black women
  - Low wages, long hours, live-in arrangements
  - Little legal protection

### Workplace Exclusion
- **Professional barriers**: Medical schools, law schools, teaching colleges often excluded or limited Black students
- **Unions**: Many excluded Black workers or relegated them to separate locals
- **Skilled trades**: Apprenticeships often unavailable
- **Government jobs**: Federal and provincial civil service largely closed

**Impact**: Economic marginalization, limited wealth accumulation

## Immigration Restrictions: Keeping Canada White

### Explicit Racial Exclusion (1910s-1960s)
Canada's immigration policy aimed to keep the country white.

**1910-1911: Order-in-Council**
- Prohibited Black immigration (not always enforced uniformly, but chilled immigration)
- Explicitly stated Black people were "unsuitable to the climate and requirements of Canada"

**1919: Immigration Act**
- Gave Cabinet power to exclude based on race, nationality, ethnicity
- Used to restrict Black immigration, particularly from the Caribbean

**1923: Chinese Immigration Act**
- Completely banned Chinese immigration (though not Black, shows broader exclusionary policy)

**1952: Immigration Act**
- Maintained racial preferences
- Prioritized British, American, European immigrants
- Black and Asian immigration restricted

**Not fully removed until 1967** with points-based system

### Caribbean Immigration
- **Before 1960s**: Very restricted
- **Domestic Scheme (1955)**: Brought Caribbean women as domestic workers
  - Required to work as domestics for 1 year before bringing family
  - Lower status work visa
  - Exploitative conditions

**Large-scale Caribbean immigration didn't begin until late 1960s** after policy changes.

## Organized Resistance

Black Canadians fought back:

### Legal Challenges
- **Fred Christie v. York Corporation (1939)**: Black man refused service at tavern; Supreme Court said discrimination was legal (bad precedent)
- **Viola Desmond (1946)**: Criminal conviction for sitting in whites-only section
- **Re: Drummond Wren (1950)**: Successfully challenged restrictive covenant in Ontario
- **Dresden cases (1950s)**: Led to Fair Accommodation Practices Act

### Legislation Won Through Activism
- **Ontario Fair Accommodation Practices Act (1954)**: Prohibited discrimination in public spaces
- **Ontario Fair Employment Practices Act (1951)**: Prohibited discrimination in employment
- Other provinces followed slowly

### Organizations
- **National Unity Association**: Fought discrimination in Dresden, Ontario
- **Negro Citizenship Association**: Toronto-based activism
- **Brotherhood of Sleeping Car Porters**: Labor organizing
- **Black churches**: Central to community organizing and mutual aid

### Media
- **The Clarion** (Toronto, 1946-1949): Black newspaper
- Other publications documented discrimination and advocated for change

## Why This Era Matters

### Foundation for Current Inequality
The segregation era created:
- **Wealth gaps**: Denied homeownership, good jobs, business opportunities
- **Educational inequality**: Inferior schooling limited opportunities
- **Geographic segregation**: Still visible in Toronto, Halifax, Montreal neighborhoods
- **Institutional exclusion**: Patterns of underrepresentation continue

### Collective Memory
- Black Canadians remember this history (it's recent – grandparents lived it)
- White Canadians often unaware or minimize it
- **Gaslighting**: "That wasn't really segregation" or "It wasn't as bad as the U.S."

### Contemporary Parallels
- **Carding/street checks**: Controlling Black bodies in public space
- **Residential patterns**: Continued segregation (Jane-Finch, Regent Park in Toronto; North End Halifax)
- **School streaming**: Disproportionate placement of Black students in non-academic tracks
- **Employment discrimination**: Studies show bias in hiring

## What This Means for You

### If You're Not Black
- **This was legal, recent, and widespread** – not isolated incidents
- **Stop comparing to the U.S.** – Canada had its own system of racial apartheid
- **Recognize**: Current Black-white gaps are not "cultural" but results of systemic exclusion
- **Understand**: When Black Canadians talk about systemic racism, it's built on this concrete history

### If You're Black
- **Your grandparents or great-grandparents** likely experienced this directly
- **This history explains** many current patterns
- **Resistance is your heritage** – Black Canadians always fought back
- **You're not imagining it** – racism is built into Canadian institutions

## Reflection Questions
1. Were you taught about this history in school? Why or why not?
2. How does this change your understanding of contemporary racial inequality in Canada?
3. What parallels do you see between past segregation and current patterns?
4. What would meaningful reckoning with this history look like?`,
    module_number: 2, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m2.id, {
    title: 'Immigration Restrictions and the "White Canada" Policy',
    slug: 'immigration-restrictions',
    description: 'Understand Canada\'s explicit efforts to remain a white nation.',
    content_type: 'video',
    content_url: 'https://example.com/videos/immigration-restrictions.mp4',
    video_duration_seconds: 600,
    module_number: 2, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m2.id, {
    title: 'Black Resistance and Organizing',
    slug: 'resistance-organizing',
    description: 'Learn how Black Canadians fought segregation and won key victories.',
    content_type: 'video',
    content_url: 'https://example.com/videos/resistance-organizing.mp4',
    video_duration_seconds: 540,
    module_number: 2, lesson_number: 3, sort_order: 3
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
            'Canada never had segregated schools'
          ],
          correct_answer: 2,
          explanation: 'The last legally segregated schools in Ontario closed in 1965 in Merlin and North Colchester. Segregated schools were legal in Ontario from the 1850s and persisted well into the civil rights era. Nova Scotia also had segregated schools into the 1960s.'
        },
        {
          question: 'What happened to Viola Desmond in 1946?',
          options: [
            'She was celebrated as the first Black movie star',
            'She was arrested and jailed for sitting in the whites-only section of a Nova Scotia theatre',
            'She became the first Black person elected to Parliament',
            'She opened Canada\'s first integrated restaurant'
          ],
          correct_answer: 1,
          explanation: 'Viola Desmond, a Nova Scotia businesswoman, was arrested, jailed, and fined for refusing to leave the whites-only section of a movie theatre. She fought her conviction but lost. She received a posthumous pardon in 2010 and now appears on the Canadian $10 bill.'
        },
        {
          question: 'What were restrictive covenants in Canadian property deeds?',
          options: [
            'Rules about lawn maintenance',
            'Legal clauses preventing sale of property to Black, Jewish, or Asian people',
            'Guidelines for building heights',
            'Requirements for homeowner association membership'
          ],
          correct_answer: 1,
          explanation: 'Restrictive covenants were legal clauses in property deeds explicitly preventing sale, rental, or transfer to people based on race (Black, Jewish, Asian, etc.). They were common in Canadian cities until ruled illegal in Ontario in 1950, though informal discrimination continued.'
        }
      ],
      passing_score: 75,
      time_limit_minutes: 10
    },
    module_number: 2, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 2: 4 lessons')

  // Module 3: Civil Rights Era (1960-2000)
  const m3 = await createModule(course.id, {
    title: 'Civil Rights and Multiculturalism: 1960-2000',
    description: 'Explore the fight for civil rights, policy changes, and the rise of Black activism in Canada.',
    sort_order: 3
  })

  await createLesson(course.id, m3.id, {
    title: 'The Canadian Civil Rights Movement',
    slug: 'civil-rights-movement',
    description: 'Understand Black Canadian activism and legislative victories.',
    content_type: 'video',
    content_url: 'https://example.com/videos/civil-rights-movement.mp4',
    video_duration_seconds: 720,
    module_number: 3, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m3.id, {
    title: 'Caribbean Immigration and Cultural Transformation',
    slug: 'caribbean-immigration',
    description: 'Learn how Caribbean immigration reshaped Black Canadian communities.',
    content_type: 'video',
    content_url: 'https://example.com/videos/caribbean-immigration.mp4',
    video_duration_seconds: 600,
    module_number: 3, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m3.id, {
    title: 'The Promise and Limits of Multiculturalism',
    slug: 'multiculturalism',
    description: 'Critically examine Canada\'s multiculturalism policy and its impacts on Black communities.',
    content_type: 'video',
    content_url: 'https://example.com/videos/multiculturalism-limits.mp4',
    video_duration_seconds: 540,
    module_number: 3, lesson_number: 3, sort_order: 3
  })

  console.log('✅ Module 3: 3 lessons')

  // Module 4: Contemporary Era (2000-Present)
  const m4 = await createModule(course.id, {
    title: 'Contemporary Black Canada: 2000-Present',
    description: 'Examine current movements, challenges, and achievements of Black Canadians today.',
    sort_order: 4
  })

  await createLesson(course.id, m4.id, {
    title: 'Black Lives Matter and Contemporary Activism',
    slug: 'blm-activism',
    description: 'Understand the rise of BLM-Toronto and modern Black movements.',
    content_type: 'video',
    content_url: 'https://example.com/videos/blm-activism.mp4',
    video_duration_seconds: 660,
    module_number: 4, lesson_number: 1, sort_order: 1
  })

  await createLesson(course.id, m4.id, {
    title: 'Anti-Black Racism Today: Data and Realities',
    slug: 'anti-black-racism-today',
    description: 'Review contemporary statistics and systemic issues facing Black Canadians.',
    content_type: 'article',
    article_body: `# Anti-Black Racism Today: Data and Realities

## Overview

Despite legal equality and multiculturalism policy, Black Canadians face persistent, measurable disparities across nearly every indicator of wellbeing. This is not about culture or individual choices—it's about systemic racism with deep historical roots.

## Criminal Justice System

### Policing
**Overrepicing:**
- Black people are **3 times more likely to be carded/street checked** than white people (Toronto data)
- Toronto Police Service data (2013-2017): Black people were **20 times more likely to be shot** by police than white people
- Black people represent **8.8% of Toronto's population** but **37% of people shot by police** (2020 data)

**Use of Force:**
- Black people more likely to experience police violence during routine interactions
- Studies show implicit bias affects split-second decisions

**Case Examples:**
- **Jermaine Carby** (2014): Killed by Peel police during traffic stop
- **Andrew Loku** (2015): Killed by Toronto police, mental health crisis
- **Regis Korchinski-Paquet** (2020): Fell from balcony during police interaction
- **Chantal Moore** (2020): Killed during wellness check in New Brunswick

### Incarceration
- Black people are **overrepresented in federal prisons** relative to population
- Black inmates more likely to be placed in maximum security
- Black women's incarceration rate increasing faster than any other group
- **School-to-prison pipeline**: Black students suspended/expelled at higher rates, increasing justice involvement

### Youth Justice
- Black youth overrepresented in youth criminal justice system
- More likely to be charged than diverted
- Harsher sentences for same offenses as white youth

**Impact**: Trauma, family separation, economic devastation, community destabilization

## Education

### Academic Outcomes
- Black students **suspended at 2-3 times the rate** of white students (varies by region)
- Black students **overrepresented in applied/essential streams**, underrepresented in academic
- **Lower high school graduation rates** in some jurisdictions
- **Lower university enrollment** relative to population

### Streaming and Labeling
- Teachers' implicit bias affects recommendations for academic vs. applied streams
- Black students disproportionately labeled as having behavioral problems
- Special education overrepresentation (in some categories)

### School Climate
- Black students report feeling **less safe**, **less belonging** at school
- Microaggressions from teachers and peers
- **Eurocentric curriculum**: Little Black Canadian history or Black achievement
- **Dress codes** disproportionately targeting Black students (hair, clothing)

### Representation
- Very few Black teachers, principals, administrators
- Black parents report being ignored or dismissed by schools

**Impact**: Achievement gaps, reduced opportunities, negative self-concept, pushout from education

## Employment and Income

### Labor Market Outcomes
- **Unemployment rate for Black Canadians is double** that of white Canadians (consistently across decades)
- Black Canadians earn **75 cents for every dollar** earned by non-racialized workers
- Black workers **overrepresented in precarious employment** (part-time, temporary, contract)
- Black university graduates earn **less than white high school graduates** in some studies

### Hiring Discrimination
- **Résumé studies**: Identical résumés with "Black-sounding" names receive **30-40% fewer callbacks**
- Similar studies show bias in interviews, promotions
- "Canadian experience" requirement disproportionately affects Black immigrants

### Workplace Experience
- Black employees report experiencing **microaggressions, exclusion, tokenism**
- Less likely to be mentored or sponsored
- More likely to face **scrutiny and surveillance**
- **Glass ceiling**: Underrepresented in leadership and executive roles

### Sector Segregation
- Overrepresented in: Healthcare (support roles), security, transportation
- Underrepresented in: Finance, law, STEM (particularly in leadership)

**Impact**: Economic insecurity, wealth gap, stress, limited mobility

## Wealth and Economic Security

### Wealth Gap
- Black Canadian households have **significantly lower net worth** than white households
- Homeownership rates lower
- Investment and savings rates lower

### Contributing Factors
- Historical denial of mortgages and property ownership (redlining, restrictive covenants)
- Ongoing mortgage discrimination
- Lower incomes and higher unemployment → less ability to save/invest
- **Intergenerational wealth transmission**: White families pass down wealth accumulated over generations; Black families couldn't accumulate due to exclusion

### Poverty Rates
- Black Canadians experience **higher poverty rates** than white Canadians
- Black children particularly affected
- Single Black mothers highest poverty rates

**Impact**: Stress, health impacts, limited opportunities, multigenerational disadvantage

## Housing and Homelessness

### Housing Affordability
- Black households spend **higher proportion of income on housing**
- More likely to live in inadequate or unsuitable housing
- Rental discrimination persists

### Homelessness
- Black people **overrepresented among homeless population** (particularly in cities like Toronto)
- Black youth particularly vulnerable

### Neighborhood Segregation
- Residential segregation persists in Canadian cities
- Black Canadians concentrated in higher-poverty neighborhoods with fewer resources
- **"Priority neighborhoods"** in Toronto are disproportionately Black

**Impact**: Health, safety, educational opportunities, social capital

## Health and Healthcare

### Health Outcomes
- Black Canadians have **higher rates of chronic diseases**: diabetes, hypertension, heart disease
- Higher maternal mortality and morbidity rates
- Mental health impacts from racism (anxiety, depression, PTSD)

### Healthcare Access and Quality
- **Medical bias**: Studies show providers underestimate Black patients' pain
- Black patients less likely to receive certain treatments or referrals
- Longer wait times in some studies
- Distrust of healthcare system due to historical and ongoing mistreatment

### COVID-19
- Black Canadians had **higher rates of COVID-19 infection and death**
- Overrepresentation in essential work without adequate protection
- Lived in multigenerational households, higher-density housing

**Impact**: Reduced life expectancy, suffering, economic costs, mistrust

## Child Welfare

### Overrepresentation
- Black children **vastly overrepresented in child welfare system** (varies by province, but significant everywhere)
- In some regions, **Black children apprehended at 3-4 times the rate** of white children
- **One in Five Black Children in Care** report (Nova Scotia) highlighted crisis

### Why This Happens
- Poverty and housing insecurity (results of racism) trigger interventions
- Cultural misunderstanding and bias
- Overpolicing of Black families
- Historical pattern: Controlling Black families (echoes of slavery, segregation)

**Impact**: Family separation, trauma, loss of culture, perpetuation of disadvantage

## Mental Health

### Prevalence
- High rates of **depression, anxiety, PTSD** related to racism
- **Racial trauma**: Ongoing microaggressions, discrimination, violence cause cumulative harm

### Access to Services
- Black Canadians less likely to access mental health services
- Lack of culturally competent providers
- Stigma within some Black communities
- Services often not designed for racialized experiences

**Impact**: Suffering, reduced functioning, physical health impacts

## Representation and Recognition

### Political Representation
- Black Canadians **underrepresented** in Parliament, provincial legislatures, city councils
- Underrepresented in judiciary, police leadership, public sector leadership

### Media Representation
- When Black people appear in media, often in **stereotypical or negative roles**
- Black achievement, leadership, excellence underrepresented
- **"If it bleeds, it leads"**: Crime stories feature Black people disproportionately

### Cultural Erasure
- Black Canadian history not taught in schools
- Black contributions to Canada minimized or erased
- "Multiculturalism" often means white + "ethnic" without centering Blackness

**Impact**: Invisibility, distorted narratives, lack of role models, dehumanization

## Intersectional Vulnerabilities

### Black Women
- Face both anti-Black racism and misogyny (**misogynoir**)
- Higher poverty rates
- Criminalization and sexualization
- Hair discrimination

### Black LGBTQ+ People
- Face racism within LGBTQ+ spaces and homophobia/transphobia within Black spaces
- Higher rates of violence
- Invisibility in movements

### Black People with Disabilities
- Face ableism compounded by racism
- Overrepresented in use-of-force incidents (police often treat disability as threat)

### Black Immigrants and Refugees
- Credential recognition barriers
- "Canadian experience" requirements
- Deportation threats
- Family separation

## Why These Disparities Exist

### Not About Culture or Choices
These gaps are **not** because Black people don't value education, work, family, etc. They're the **result of systemic racism**:

1. **Historical exclusion** created wealth gap
2. **Ongoing discrimination** in hiring, housing, lending perpetuates it
3. **Implicit bias** in schools, healthcare, justice system creates differential treatment
4. **Policies** (neutral-seeming) have disparate racial impacts
5. **Underinvestment** in Black communities
6. **Overpolicing and surveillance** in Black neighborhoods

### Structural Racism at Work
When we see disparities, ask:
- What **systems** produce these outcomes?
- What **policies** create barriers?
- How do **historical patterns** persist?
- Where is **power and resources** concentrated?

## What Needs to Change

### Individual Level
- Recognize these realities (don't deny or minimize)
- Interrupt bias in yourself and others
- Support Black-led organizations and businesses
- Use your privilege to advocate

### Institutional Level
- **Collect race-based data** to identify disparities
- **Equity audits** to find and fix discriminatory practices
- **Representation** in decision-making
- **Accountability** for outcomes, not just intentions
- **Investment** in Black communities

### Systemic Level
- **Reparations**: Compensating for historical and ongoing harm
- **Policy change**: Employment equity, anti-racism legislation, healthcare equity
- **Divest/reinvest**: Reduce police budgets, invest in community services
- **Education reform**: Teach Black history, address streaming, increase Black educators
- **Criminal justice reform**: End carding, reduce incarceration, community alternatives

## Conclusion

These aren't abstract statistics—they're people's lives. Every disparity represents:
- Lost potential
- Suffering
- Injustice
- Wasted talent
- Families separated
- Dreams deferred

Black Canadians have been telling these truths for decades. The question is: Will Canada listen and act?

## Reflection Questions
1. Which statistic surprised you most? Why?
2. How do you see these disparities connected to the historical patterns we studied?
3. What responsibility do you have to address these realities?
4. What's one concrete action you can take in your sphere of influence?`,
    module_number: 4, lesson_number: 2, sort_order: 2
  })

  await createLesson(course.id, m4.id, {
    title: 'Black Excellence and Community Strength',
    slug: 'black-excellence',
    description: 'Celebrate Black Canadian achievements, culture, and resilience.',
    content_type: 'video',
    content_url: 'https://example.com/videos/black-excellence.mp4',
    video_duration_seconds: 540,
    module_number: 4, lesson_number: 3, sort_order: 3
  })

  await createLesson(course.id, m4.id, {
    title: 'Final Assessment',
    slug: 'final-assessment-history',
    description: 'Comprehensive assessment of Black Canadian history.',
    content_type: 'quiz',
    content_data: {
      questions: [
        {
          question: 'What is the primary lesson of Black Canadian history for understanding contemporary racism?',
          options: [
            'Canada has always been better than the United States',
            'Current racial disparities are the result of long-standing systemic exclusion, not culture or individual choices',
            'Racism is a thing of the past',
            'Black people haven\'t been in Canada very long'
          ],
          correct_answer: 1,
          explanation: 'Black Canadian history shows over 400 years of systemic exclusion (slavery, segregation, immigration restrictions, discrimination) that created and perpetuated inequality. Current disparities in wealth, employment, criminal justice, etc. are not coincidental—they\'re the predictable results of historical and ongoing systemic racism.'
        },
        {
          question: 'How should we understand Canada\'s relationship to anti-Black racism historically?',
          options: [
            'Canada was always a sanctuary from racism',
            'Canada had slavery, segregation, and explicit white supremacist policies well into the 20th century',
            'Racism only existed in the United States',
            'Canada solved racism with multiculturalism in 1971'
          ],
          correct_answer: 1,
          explanation: 'Canada practiced slavery for over 200 years, had legally segregated schools until 1965, used restrictive covenants to enforce housing segregation, and maintained explicitly racist immigration policies until 1967. The myth of Canadian exceptionalism erases this history and prevents accountability.'
        },
        {
          question: 'What does current data show about anti-Black racism in Canada?',
          options: [
            'Racial disparities have been eliminated',
            'Black Canadians face measurable disparities in policing, education, employment, health, and nearly every other indicator',
            'Any remaining gaps are due to cultural differences',
            'Canada is now perfectly equal'
          ],
          correct_answer: 1,
          explanation: 'Contemporary data shows Black Canadians are overpoliced, earn less, experience higher unemployment, face education streaming, have worse health outcomes, are overrepresented in child welfare and incarceration, and underrepresented in leadership. These aren\'t cultural—they\'re systemic.'
        },
        {
          question: 'Throughout this history, how have Black Canadians responded to racism?',
          options: [
            'They passively accepted discrimination',
            'They consistently organized, resisted, and fought for justice',
            'They left Canada entirely',
            'They waited for white people to help them'
          ],
          correct_answer: 1,
          explanation: 'At every period, Black Canadians resisted: escaping slavery, building communities despite hostility, organizing politically (National Unity Association, Negro Citizenship Association), legal challenges (Viola Desmond, restrictive covenants), media activism, and contemporary movements like BLM-TO. Resistance is central to Black Canadian history.'
        }
      ],
      passing_score: 80,
      time_limit_minutes: 20
    },
    module_number: 4, lesson_number: 4, sort_order: 4
  })

  console.log('✅ Module 4: 4 lessons')
  console.log('✅ Course 8 complete: 4 modules, 15 lessons\n')
}

console.log('=== PHASE 1 PART 1 POPULATION ===\n')

async function runAll() {
  await populateDifficultConversations()
  await populateBlackCanadianHistory()
}

runAll()
  .then(() => console.log('\n✅ PART 1 COMPLETE: 2 courses populated!'))
  .catch(error => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
