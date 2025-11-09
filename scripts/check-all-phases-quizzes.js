const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  '***REMOVED***',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.***REMOVED***.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
);

async function checkAllPhases() {
  console.log('🔍 CHECKING ALL PHASES FOR QUIZ DATA\n');
  console.log('='.repeat(80));

  // Get all courses
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, slug')
    .order('title');

  if (!courses) {
    console.log('No courses found!');
    return;
  }

  console.log(`\nFound ${courses.length} total courses\n`);

  let totalModules = 0;
  let totalLessons = 0;
  let lessonsWithQuizType = 0;
  let lessonsWithContentData = 0;
  let quizRecordsInTable = 0;

  // Check quizzes table
  const { data: quizzesTable } = await supabase
    .from('quizzes')
    .select('id, title, lesson_id');
  
  quizRecordsInTable = quizzesTable ? quizzesTable.length : 0;

  console.log('📊 OVERALL STATISTICS:');
  console.log('-'.repeat(80));

  for (const course of courses) {
    const { data: modules } = await supabase
      .from('course_modules')
      .select('id, title')
      .eq('course_id', course.id);

    if (!modules || modules.length === 0) continue;

    const moduleIds = modules.map(m => m.id);
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title, content_type, content_data, module_id')
      .in('module_id', moduleIds);

    if (!lessons) continue;

    totalModules += modules.length;
    totalLessons += lessons.length;

    const quizLessons = lessons.filter(l => l.content_type === 'quiz');
    lessonsWithQuizType += quizLessons.length;

    const lessonsWithData = quizLessons.filter(l => {
      if (!l.content_data) return false;
      const data = typeof l.content_data === 'string' 
        ? JSON.parse(l.content_data) 
        : l.content_data;
      return data && (data.questions || data.quiz_questions);
    });
    lessonsWithContentData += lessonsWithData.length;

    console.log(`${course.title}`);
    console.log(`  Modules: ${modules.length} | Lessons: ${lessons.length} | Quiz Lessons: ${quizLessons.length} | With Data: ${lessonsWithData.length}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY:');
  console.log(`Total Courses: ${courses.length}`);
  console.log(`Total Modules: ${totalModules}`);
  console.log(`Total Lessons: ${totalLessons}`);
  console.log(`Lessons with content_type='quiz': ${lessonsWithQuizType}`);
  console.log(`Quiz lessons with content_data: ${lessonsWithContentData}`);
  console.log(`Records in 'quizzes' table: ${quizRecordsInTable}`);

  console.log('\n🔍 DETAILED QUIZ DATA CHECK:');
  console.log('-'.repeat(80));

  // Check a sample quiz lesson
  const { data: sampleQuiz } = await supabase
    .from('lessons')
    .select('id, title, content_type, content_data')
    .eq('content_type', 'quiz')
    .limit(1)
    .single();

  if (sampleQuiz) {
    console.log('\nSample Quiz Lesson:');
    console.log(`Title: ${sampleQuiz.title}`);
    console.log(`Content Type: ${sampleQuiz.content_type}`);
    
    if (sampleQuiz.content_data) {
      const data = typeof sampleQuiz.content_data === 'string' 
        ? JSON.parse(sampleQuiz.content_data) 
        : sampleQuiz.content_data;
      
      console.log('\nContent Data Structure:');
      console.log(`Has 'questions' field: ${!!data.questions}`);
      console.log(`Has 'quiz_questions' field: ${!!data.quiz_questions}`);
      
      if (data.questions) {
        console.log(`Number of questions: ${data.questions.length}`);
        console.log('\nFirst question sample:');
        console.log(JSON.stringify(data.questions[0], null, 2).slice(0, 500));
      }
    } else {
      console.log('No content_data found');
    }
  }

  // Check quiz_questions table
  const { data: quizQuestions } = await supabase
    .from('quiz_questions')
    .select('id');
  
  console.log(`\nRecords in 'quiz_questions' table: ${quizQuestions ? quizQuestions.length : 0}`);

  // Check quiz_options table
  const { data: quizOptions } = await supabase
    .from('quiz_options')
    .select('id');
  
  console.log(`Records in 'quiz_options' table: ${quizOptions ? quizOptions.length : 0}`);

  console.log('\n' + '='.repeat(80));
  console.log('🎯 ARCHITECTURE ANALYSIS:');
  console.log('-'.repeat(80));
  
  if (lessonsWithContentData > 0 && quizRecordsInTable === 0) {
    console.log('❌ OLD ARCHITECTURE DETECTED:');
    console.log('   - Quiz data stored in lessons.content_data (JSON)');
    console.log('   - No records in quizzes/quiz_questions/quiz_options tables');
    console.log('   - Frontend expects new architecture');
    console.log('\n⚠️  MIGRATION REQUIRED!');
  } else if (quizRecordsInTable > 0) {
    console.log('✅ NEW ARCHITECTURE IN USE:');
    console.log('   - Quiz data in separate tables');
    console.log('   - Compatible with frontend');
  } else {
    console.log('⚠️  NO QUIZ DATA FOUND:');
    console.log('   - No quiz lessons with content_data');
    console.log('   - No records in quizzes table');
  }
}

checkAllPhases()
  .then(() => console.log('\n✅ Check complete'))
  .catch(console.error);
