const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  '***REMOVED***',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.***REMOVED***.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
);

async function checkPhase4Quizzes() {
  const phase4Slugs = [
    'mental-health-wellness',
    'decolonizing-practice', 
    'intersectionality-frameworks',
    'white-supremacy-culture',
    'trauma-informed-care',
    'building-antiracist-organizations'
  ];

  console.log('🎯 PHASE 4 QUIZ VERIFICATION\n');
  
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, title, slug')
    .in('slug', phase4Slugs)
    .order('title');

  if (error) {
    console.error('Error fetching courses:', error);
    return;
  }

  if (!courses || courses.length === 0) {
    console.log('No Phase 4 courses found');
    return;
  }

  let totalModules = 0;
  let totalQuizzes = 0;
  let missingQuizzes = [];

  for (const course of courses) {
    const { data: modules } = await supabase
      .from('course_modules')
      .select('id, title, order_index')
      .eq('course_id', course.id)
      .order('order_index');

    if (!modules || modules.length === 0) {
      console.log(`📚 ${course.title}`);
      console.log(`   ⚠️  No modules found`);
      continue;
    }

    const moduleIds = modules.map(m => m.id);
    
    const { data: lessons } = await supabase
      .from('course_lessons')
      .select('id, module_id, title, content_type')
      .in('module_id', moduleIds);

    const quizzes = (lessons || []).filter(l => l.content_type === 'quiz');
    
    console.log(`📚 ${course.title}`);
    console.log(`   Modules: ${modules.length} | Quizzes: ${quizzes.length}`);
    
    totalModules += modules.length;
    totalQuizzes += quizzes.length;

    for (const mod of modules) {
      const modLessons = (lessons || []).filter(l => l.module_id === mod.id);
      const modQuiz = modLessons.find(l => l.content_type === 'quiz');
      
      if (modQuiz) {
        console.log(`   ✅ Module ${mod.order_index}: ${mod.title}`);
      } else {
        console.log(`   ❌ Module ${mod.order_index}: ${mod.title} - MISSING QUIZ`);
        missingQuizzes.push({
          course: course.title,
          module: mod.title,
          moduleId: mod.id
        });
      }
    }
    console.log('');
  }

  console.log('📊 SUMMARY:');
  console.log(`   Total Modules: ${totalModules}`);
  console.log(`   Total Quizzes: ${totalQuizzes}`);
  console.log(`   Expected: ${totalModules} (1 quiz per module)`);
  
  if (missingQuizzes.length > 0) {
    console.log(`\n⚠️  MISSING ${missingQuizzes.length} QUIZZES:`);
    missingQuizzes.forEach(mq => {
      console.log(`   - ${mq.course} > ${mq.module}`);
    });
  } else {
    console.log('\n✅ ALL MODULES HAVE QUIZZES!');
  }

  // Check quiz questions
  console.log('\n🔍 CHECKING QUIZ QUESTIONS...\n');
  
  for (const course of courses) {
    const { data: modules } = await supabase
      .from('course_modules')
      .select('id')
      .eq('course_id', course.id);

    const moduleIds = modules.map(m => m.id);
    
    const { data: quizLessons } = await supabase
      .from('course_lessons')
      .select('id, title')
      .in('module_id', moduleIds)
      .eq('content_type', 'quiz');

    for (const quiz of quizLessons) {
      const { data: questions } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('lesson_id', quiz.id);

      if (questions.length < 4) {
        console.log(`   ⚠️  ${quiz.title}: Only ${questions.length} questions (need 4)`);
      }
    }
  }
}

checkPhase4Quizzes()
  .then(() => console.log('\n✅ Check complete'))
  .catch(console.error);
