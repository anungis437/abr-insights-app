const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  '***REMOVED***',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.***REMOVED***.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
);

async function comprehensiveCheck() {
  console.log('🔍 COMPREHENSIVE BLIND SPOT CHECK\n');
  console.log('='.repeat(70));
  
  const phase4Slugs = [
    'mental-health-wellness',
    'decolonizing-practice', 
    'intersectionality-frameworks',
    'white-supremacy-culture',
    'trauma-informed-care',
    'building-antiracist-organizations'
  ];

  // 1. Check if courses exist
  console.log('\n1️⃣  PHASE 4 COURSES EXISTENCE');
  console.log('-'.repeat(70));
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, slug, category_id, is_published')
    .in('slug', phase4Slugs)
    .order('title');

  if (!courses || courses.length === 0) {
    console.log('❌ NO PHASE 4 COURSES FOUND!');
    return;
  }

  console.log(`✅ Found ${courses.length} Phase 4 courses:`);
  courses.forEach(c => {
    console.log(`   - ${c.title} (${c.is_published ? 'Published' : 'Unpublished'})`);
  });

  // 2. Check modules
  console.log('\n2️⃣  MODULES CHECK');
  console.log('-'.repeat(70));
  let totalModules = 0;
  let coursesWithoutModules = [];

  for (const course of courses) {
    const { data: modules } = await supabase
      .from('course_modules')
      .select('id, title, sort_order')
      .eq('course_id', course.id)
      .order('sort_order');

    if (!modules || modules.length === 0) {
      coursesWithoutModules.push(course.title);
      console.log(`❌ ${course.title}: NO MODULES`);
    } else {
      totalModules += modules.length;
      console.log(`✅ ${course.title}: ${modules.length} modules`);
    }
  }

  if (coursesWithoutModules.length > 0) {
    console.log(`\n⚠️  ${coursesWithoutModules.length} COURSES MISSING MODULES!`);
  }

  // 3. Check lessons
  console.log('\n3️⃣  LESSONS CHECK');
  console.log('-'.repeat(70));
  let totalLessons = 0;
  let totalQuizzes = 0;
  let modulesWithoutQuizzes = [];

  for (const course of courses) {
    const { data: modules } = await supabase
      .from('course_modules')
      .select('id, title, sort_order')
      .eq('course_id', course.id)
      .order('sort_order');

    if (!modules || modules.length === 0) continue;

    const moduleIds = modules.map(m => m.id);
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title, content_type, module_id')
      .in('module_id', moduleIds);

    const courseLessons = lessons || [];
    const courseQuizzes = courseLessons.filter(l => l.content_type === 'quiz');
    
    totalLessons += courseLessons.length;
    totalQuizzes += courseQuizzes.length;

    console.log(`\n📚 ${course.title}`);
    console.log(`   Total Lessons: ${courseLessons.length} | Quizzes: ${courseQuizzes.length}`);

    for (const mod of modules) {
      const modLessons = courseLessons.filter(l => l.module_id === mod.id);
      const modQuiz = modLessons.find(l => l.content_type === 'quiz');
      
      if (!modQuiz) {
        modulesWithoutQuizzes.push({
          course: course.title,
          module: mod.title
        });
        console.log(`   ❌ Module ${mod.sort_order}: ${mod.title} - NO QUIZ`);
      } else {
        console.log(`   ✅ Module ${mod.sort_order}: ${mod.title} (${modLessons.length} lessons)`);
      }
    }
  }

  // 4. Check quiz questions
  console.log('\n4️⃣  QUIZ QUESTIONS CHECK');
  console.log('-'.repeat(70));
  let quizzesWithoutEnoughQuestions = [];

  for (const course of courses) {
    const { data: modules } = await supabase
      .from('course_modules')
      .select('id')
      .eq('course_id', course.id);

    if (!modules || modules.length === 0) continue;

    const moduleIds = modules.map(m => m.id);
    const { data: quizLessons } = await supabase
      .from('lessons')
      .select('id, title')
      .in('module_id', moduleIds)
      .eq('content_type', 'quiz');

    if (!quizLessons || quizLessons.length === 0) continue;

    for (const quiz of quizLessons) {
      const { data: questions } = await supabase
        .from('quiz_questions')
        .select('id, question_text')
        .eq('lesson_id', quiz.id);

      if (!questions || questions.length < 4) {
        quizzesWithoutEnoughQuestions.push({
          course: course.title,
          quiz: quiz.title,
          count: questions ? questions.length : 0
        });
        console.log(`❌ ${quiz.title}: Only ${questions ? questions.length : 0} questions (need 4)`);
      } else {
        console.log(`✅ ${quiz.title}: ${questions.length} questions`);
      }
    }
  }

  // 5. Check for quiz answer options
  console.log('\n5️⃣  QUIZ ANSWER OPTIONS CHECK');
  console.log('-'.repeat(70));
  let questionsWithoutEnoughOptions = [];

  for (const course of courses) {
    const { data: modules } = await supabase
      .from('course_modules')
      .select('id')
      .eq('course_id', course.id);

    if (!modules || modules.length === 0) continue;

    const moduleIds = modules.map(m => m.id);
    const { data: quizLessons } = await supabase
      .from('lessons')
      .select('id')
      .in('module_id', moduleIds)
      .eq('content_type', 'quiz');

    if (!quizLessons || quizLessons.length === 0) continue;

    for (const quiz of quizLessons) {
      const { data: questions } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('lesson_id', quiz.id);

      if (!questions) continue;

      for (const question of questions) {
        const { data: options } = await supabase
          .from('quiz_options')
          .select('id')
          .eq('question_id', question.id);

        if (!options || options.length < 4) {
          questionsWithoutEnoughOptions.push({
            course: course.title,
            questionId: question.id,
            count: options ? options.length : 0
          });
        }
      }
    }
  }

  if (questionsWithoutEnoughOptions.length > 0) {
    console.log(`❌ ${questionsWithoutEnoughOptions.length} questions missing answer options`);
  } else if (totalQuizzes > 0) {
    console.log(`✅ All quiz questions have sufficient answer options`);
  }

  // SUMMARY
  console.log('\n📊 SUMMARY');
  console.log('='.repeat(70));
  console.log(`Courses: ${courses.length}/6`);
  console.log(`Modules: ${totalModules}/24 expected`);
  console.log(`Lessons: ${totalLessons}/89 expected`);
  console.log(`Quizzes: ${totalQuizzes}/${totalModules} expected`);
  
  console.log('\n🚨 BLIND SPOTS IDENTIFIED:');
  console.log('-'.repeat(70));
  
  let blindSpots = [];
  
  if (coursesWithoutModules.length > 0) {
    blindSpots.push(`❌ ${coursesWithoutModules.length} courses have NO modules`);
  }
  
  if (modulesWithoutQuizzes.length > 0) {
    blindSpots.push(`❌ ${modulesWithoutQuizzes.length} modules missing quizzes`);
  }
  
  if (quizzesWithoutEnoughQuestions.length > 0) {
    blindSpots.push(`❌ ${quizzesWithoutEnoughQuestions.length} quizzes with < 4 questions`);
  }
  
  if (questionsWithoutEnoughOptions.length > 0) {
    blindSpots.push(`❌ ${questionsWithoutEnoughOptions.length} questions with < 4 answer options`);
  }

  if (totalModules < 24) {
    blindSpots.push(`❌ Only ${totalModules}/24 modules created`);
  }

  if (totalLessons < 89) {
    blindSpots.push(`❌ Only ${totalLessons}/89 lessons created`);
  }

  if (blindSpots.length > 0) {
    blindSpots.forEach(spot => console.log(spot));
    console.log('\n⚠️  ACTION REQUIRED: Phase 4 content is incomplete!');
  } else {
    console.log('✅ NO BLIND SPOTS! Phase 4 is complete and ready.');
  }

  // Detailed breakdown of missing content
  if (coursesWithoutModules.length > 0) {
    console.log('\n📋 COURSES NEEDING MODULES:');
    coursesWithoutModules.forEach(c => console.log(`   - ${c}`));
  }

  if (modulesWithoutQuizzes.length > 0) {
    console.log('\n📋 MODULES NEEDING QUIZZES:');
    modulesWithoutQuizzes.forEach(m => console.log(`   - ${m.course} > ${m.module}`));
  }

  if (quizzesWithoutEnoughQuestions.length > 0) {
    console.log('\n📋 QUIZZES NEEDING MORE QUESTIONS:');
    quizzesWithoutEnoughQuestions.forEach(q => 
      console.log(`   - ${q.quiz}: ${q.count}/4 questions`)
    );
  }
}

comprehensiveCheck()
  .then(() => console.log('\n✅ Blind spot check complete'))
  .catch(console.error);
