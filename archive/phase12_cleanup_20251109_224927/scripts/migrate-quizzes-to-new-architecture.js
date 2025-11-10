const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://nuywgvbkgdvngrysqdul.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eXdndmJrZ2R2bmdyeXNxZHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM2MTQ0OSwiZXhwIjoyMDc3OTM3NDQ5fQ.iN8EyRCE9cu5x3mpeC-nDeocv26k6yYFEZi1WHNJeyI'
);

/**
 * COMPREHENSIVE QUIZ MIGRATION SCRIPT
 * 
 * Migrates quiz data from OLD architecture (lessons.content_data JSON)
 * to NEW architecture (quizzes, quiz_questions, quiz_options tables)
 * 
 * Handles:
 * - All 30 courses across Phases 1-4
 * - 38 quiz lessons with content_data
 * - Multiple question formats
 * - Answer options and correct answers
 * - Explanations
 */

async function migrateAllQuizzes() {
  console.log('🚀 STARTING COMPREHENSIVE QUIZ MIGRATION');
  console.log('='.repeat(80));
  console.log('This will migrate all quiz data from JSON to proper database tables\n');

  let stats = {
    coursesProcessed: 0,
    quizLessonsFound: 0,
    quizzesCreated: 0,
    questionsCreated: 0,
    optionsCreated: 0,
    errors: []
  };

  try {
    // Get all courses
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, slug')
      .order('title');

    if (!courses) {
      throw new Error('No courses found');
    }

    console.log(`📚 Found ${courses.length} courses to process\n`);

    for (const course of courses) {
      console.log(`\n📖 Processing: ${course.title}`);
      console.log('-'.repeat(80));

      const { data: modules } = await supabase
        .from('course_modules')
        .select('id, title, sort_order')
        .eq('course_id', course.id)
        .order('sort_order');

      if (!modules || modules.length === 0) {
        console.log('   No modules found, skipping...');
        continue;
      }

      const moduleIds = modules.map(m => m.id);
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, title, content_type, content_data, module_id, course_id, sort_order')
        .in('module_id', moduleIds)
        .eq('content_type', 'quiz');

      if (!lessons || lessons.length === 0) {
        console.log('   No quiz lessons found, skipping...');
        stats.coursesProcessed++;
        continue;
      }

      console.log(`   Found ${lessons.length} quiz lesson(s)`);
      stats.quizLessonsFound += lessons.length;

      for (const lesson of lessons) {
        console.log(`\n   📝 Migrating: ${lesson.title}`);
        
        if (!lesson.content_data) {
          console.log('      ⚠️  No content_data, skipping...');
          continue;
        }

        const contentData = typeof lesson.content_data === 'string' 
          ? JSON.parse(lesson.content_data) 
          : lesson.content_data;

        const questions = contentData.questions || contentData.quiz_questions || [];
        
        if (questions.length === 0) {
          console.log('      ⚠️  No questions found, skipping...');
          continue;
        }

        try {
          // Create quiz record
          const { data: quiz, error: quizError } = await supabase
            .from('quizzes')
            .insert({
              lesson_id: lesson.id,
              course_id: lesson.course_id,
              title: lesson.title,
              description: `Assessment for ${lesson.title}`,
              passing_score_percentage: contentData.passing_score || 75,
              time_limit_minutes: contentData.time_limit_minutes || null,
              max_attempts: contentData.max_attempts || 3,
              randomize_questions: contentData.randomize_questions || false,
              show_correct_answers: contentData.show_correct_answers !== false,
              questions: [] // Will be populated by quiz_questions table
            })
            .select()
            .single();

          if (quizError) {
            // Check if quiz already exists
            if (quizError.code === '23505') { // Unique constraint violation
              console.log('      ⚠️  Quiz already exists, skipping...');
              continue;
            }
            throw quizError;
          }

          console.log(`      ✅ Created quiz: ${quiz.id}`);
          stats.quizzesCreated++;

          // Create questions and options
          for (let qIndex = 0; qIndex < questions.length; qIndex++) {
            const q = questions[qIndex];
            
            // Determine question type
            let questionType = 'multiple_choice';
            let options = [];
            let correctAnswer = null;

            if (Array.isArray(q.options)) {
              options = q.options;
              questionType = 'multiple_choice';
              
              // Find correct answer index
              if (typeof q.correct_answer === 'number') {
                correctAnswer = q.correct_answer;
              } else if (q.correctAnswer !== undefined) {
                correctAnswer = q.correctAnswer;
              } else if (q.correct !== undefined) {
                correctAnswer = q.correct;
              }
            }

            // Create question record
            const { data: question, error: questionError } = await supabase
              .from('quiz_questions')
              .insert({
                quiz_id: quiz.id,
                question_text: q.question || q.question_text || q.text,
                question_type: questionType,
                points: q.points || 1,
                order_index: qIndex,
                explanation: q.explanation || null,
                required: true,
                metadata: {
                  original_data: q
                }
              })
              .select()
              .single();

            if (questionError) {
              console.log(`      ❌ Error creating question ${qIndex + 1}:`, questionError.message);
              stats.errors.push({
                course: course.title,
                lesson: lesson.title,
                question: qIndex + 1,
                error: questionError.message
              });
              continue;
            }

            stats.questionsCreated++;

            // Create option records
            if (options.length > 0) {
              for (let oIndex = 0; oIndex < options.length; oIndex++) {
                const optionText = typeof options[oIndex] === 'string' 
                  ? options[oIndex] 
                  : options[oIndex].text || options[oIndex].option_text;

                const { error: optionError } = await supabase
                  .from('question_options')
                  .insert({
                    question_id: question.id,
                    option_text: optionText,
                    is_correct: oIndex === correctAnswer,
                    order_index: oIndex,
                    explanation: oIndex === correctAnswer && q.explanation 
                      ? q.explanation 
                      : null
                  });

                if (optionError) {
                  console.log(`      ❌ Error creating option ${oIndex + 1}:`, optionError.message);
                  stats.errors.push({
                    course: course.title,
                    lesson: lesson.title,
                    question: qIndex + 1,
                    option: oIndex + 1,
                    error: optionError.message
                  });
                } else {
                  stats.optionsCreated++;
                }
              }
            }
          }

          console.log(`      ✅ Created ${questions.length} questions with options`);

        } catch (error) {
          console.log(`      ❌ Error migrating quiz:`, error.message);
          stats.errors.push({
            course: course.title,
            lesson: lesson.title,
            error: error.message
          });
        }
      }

      stats.coursesProcessed++;
    }

    // Final Report
    console.log('\n' + '='.repeat(80));
    console.log('📊 MIGRATION COMPLETE!');
    console.log('='.repeat(80));
    console.log(`✅ Courses Processed: ${stats.coursesProcessed}/${courses.length}`);
    console.log(`✅ Quiz Lessons Found: ${stats.quizLessonsFound}`);
    console.log(`✅ Quizzes Created: ${stats.quizzesCreated}`);
    console.log(`✅ Questions Created: ${stats.questionsCreated}`);
    console.log(`✅ Options Created: ${stats.optionsCreated}`);
    
    if (stats.errors.length > 0) {
      console.log(`\n⚠️  Errors Encountered: ${stats.errors.length}`);
      console.log('\nError Details:');
      stats.errors.forEach((err, i) => {
        console.log(`${i + 1}. ${err.course} > ${err.lesson}`);
        if (err.question) console.log(`   Question ${err.question}`);
        if (err.option) console.log(`   Option ${err.option}`);
        console.log(`   Error: ${err.error}`);
      });
    } else {
      console.log('\n✅ No errors encountered!');
    }

    // Verify migration
    console.log('\n' + '='.repeat(80));
    console.log('🔍 VERIFYING MIGRATION');
    console.log('='.repeat(80));

    const { data: quizzesCheck } = await supabase
      .from('quizzes')
      .select('id');
    
    const { data: questionsCheck } = await supabase
      .from('quiz_questions')
      .select('id');
    
    const { data: optionsCheck } = await supabase
      .from('question_options')
      .select('id');

    console.log(`Quizzes in database: ${quizzesCheck ? quizzesCheck.length : 0}`);
    console.log(`Questions in database: ${questionsCheck ? questionsCheck.length : 0}`);
    console.log(`Options in database: ${optionsCheck ? optionsCheck.length : 0}`);

    if (quizzesCheck && quizzesCheck.length === stats.quizzesCreated) {
      console.log('\n✅ Migration verified successfully!');
      console.log('\n🎉 All quiz data has been migrated to the new architecture!');
      console.log('   The frontend should now be able to display and use all quizzes.');
    } else {
      console.log('\n⚠️  Verification mismatch - please review errors above');
    }

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
console.log('\n⚠️  WARNING: This will create new records in the database.');
console.log('Make sure you have a backup before proceeding.\n');

migrateAllQuizzes()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
