/**
 * CORRECTED Quiz Migration Script
 * Migrates quiz data from lessons.content_data to new normalized tables:
 * - questions (actual question with explanation)
 * - question_options (answer choices)
 * - quiz_questions (linking table)
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function migrateAllQuizzes() {
  console.log('\n================================================================================')
  console.log('🚀 STARTING QUIZ MIGRATION (CORRECTED VERSION)')
  console.log('================================================================================\n')

  const stats = {
    coursesProcessed: 0,
    quizLessonsFound: 0,
    quizzesFound: 0,
    questionsCreated: 0,
    optionsCreated: 0,
    linksCreated: 0,
    errors: [],
  }

  try {
    // Get all courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title')
      .order('title')

    if (coursesError) throw coursesError

    for (const course of courses) {
      console.log(`\n📖 Processing: ${course.title}`)
      console.log(
        '--------------------------------------------------------------------------------'
      )

      stats.coursesProcessed++

      // Find existing quizzes for this course
      const { data: quizzes, error: quizzesError } = await supabase
        .from('quizzes')
        .select('id, lesson_id, title')
        .eq('course_id', course.id)

      if (quizzesError) {
        console.error(`   ❌ Error fetching quizzes:`, quizzesError.message)
        continue
      }

      if (!quizzes || quizzes.length === 0) {
        console.log('   ℹ️  No quizzes found')
        continue
      }

      stats.quizzesFound += quizzes.length
      console.log(`   Found ${quizzes.length} quiz(zes)`)

      for (const quiz of quizzes) {
        // Get the lesson's content_data
        const { data: lesson, error: lessonError } = await supabase
          .from('lessons')
          .select('title, content_data')
          .eq('id', quiz.lesson_id)
          .single()

        if (lessonError || !lesson) {
          console.log(`   ⚠️  Couldn't find lesson for quiz: ${quiz.title}`)
          continue
        }

        const contentData = lesson.content_data
        if (!contentData || !contentData.questions || contentData.questions.length === 0) {
          console.log(`   ⚠️  No questions in: ${lesson.title}`)
          continue
        }

        console.log(
          `\n   📝 Migrating: ${lesson.title} (${contentData.questions.length} questions)`
        )
        stats.quizLessonsFound++

        // Process each question
        for (let qIndex = 0; qIndex < contentData.questions.length; qIndex++) {
          const q = contentData.questions[qIndex]

          try {
            // Step 1: Create question in questions table
            const { data: question, error: questionError } = await supabase
              .from('questions')
              .insert({
                course_id: course.id,
                lesson_id: quiz.lesson_id,
                question_type: 'multiple_choice',
                difficulty_level: 'intermediate',
                question_text: q.question || q.question_text || q.text,
                explanation: q.explanation || null,
                points: q.points || 1,
                order_index: qIndex,
                is_active: true,
              })
              .select()
              .single()

            if (questionError) {
              console.log(`      ❌ Error creating question ${qIndex + 1}:`, questionError.message)
              stats.errors.push({
                course: course.title,
                lesson: lesson.title,
                question: qIndex + 1,
                step: 'create_question',
                error: questionError.message,
              })
              continue
            }

            stats.questionsCreated++

            // Step 2: Create options for this question
            const options = q.options || []
            const correctAnswerIndex =
              typeof q.correct_answer === 'number'
                ? q.correct_answer
                : q.correctAnswer !== undefined
                  ? q.correctAnswer
                  : q.correct

            for (let oIndex = 0; oIndex < options.length; oIndex++) {
              const optionText =
                typeof options[oIndex] === 'string'
                  ? options[oIndex]
                  : options[oIndex].text || options[oIndex].option_text

              const isCorrect = oIndex === correctAnswerIndex

              const { error: optionError } = await supabase.from('question_options').insert({
                question_id: question.id,
                option_text: optionText,
                is_correct: isCorrect,
                feedback: isCorrect ? q.explanation : null,
                order_index: oIndex,
              })

              if (optionError) {
                console.log(`      ❌ Error creating option ${oIndex + 1}:`, optionError.message)
                stats.errors.push({
                  course: course.title,
                  lesson: lesson.title,
                  question: qIndex + 1,
                  option: oIndex + 1,
                  step: 'create_option',
                  error: optionError.message,
                })
              } else {
                stats.optionsCreated++
              }
            }

            // Step 3: Link question to quiz via quiz_questions
            const { error: linkError } = await supabase.from('quiz_questions').insert({
              quiz_id: quiz.id,
              question_id: question.id,
              points: q.points || 1,
              order_index: qIndex,
              is_required: true,
            })

            if (linkError) {
              console.log(`      ❌ Error linking question to quiz:`, linkError.message)
              stats.errors.push({
                course: course.title,
                lesson: lesson.title,
                question: qIndex + 1,
                step: 'link_question',
                error: linkError.message,
              })
            } else {
              stats.linksCreated++
            }
          } catch (err) {
            console.log(`      ❌ Exception processing question ${qIndex + 1}:`, err.message)
            stats.errors.push({
              course: course.title,
              lesson: lesson.title,
              question: qIndex + 1,
              step: 'exception',
              error: err.message,
            })
          }
        }

        console.log(`      ✅ Completed: ${contentData.questions.length} questions processed`)
      }
    }

    // Final statistics
    console.log(
      '\n================================================================================'
    )
    console.log('📊 MIGRATION COMPLETE!')
    console.log('================================================================================')
    console.log(`✅ Courses Processed: ${stats.coursesProcessed}/${courses.length}`)
    console.log(`✅ Quiz Lessons Found: ${stats.quizLessonsFound}`)
    console.log(`✅ Existing Quizzes: ${stats.quizzesFound}`)
    console.log(`✅ Questions Created: ${stats.questionsCreated}`)
    console.log(`✅ Options Created: ${stats.optionsCreated}`)
    console.log(`✅ Quiz Links Created: ${stats.linksCreated}`)

    if (stats.errors.length > 0) {
      console.log(`\n⚠️  Errors Encountered: ${stats.errors.length}`)
      console.log('\nError Details:')
      stats.errors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.course} > ${err.lesson}`)
        if (err.question) console.log(`   Question ${err.question}`)
        if (err.option) console.log(`   Option ${err.option}`)
        console.log(`   Step: ${err.step}`)
        console.log(`   Error: ${err.error}`)
      })
    }

    // Verify results
    console.log(
      '\n================================================================================'
    )
    console.log('🔍 VERIFYING MIGRATION')
    console.log('================================================================================')

    const { data: questionsCheck } = await supabase.from('questions').select('id')

    const { data: optionsCheck } = await supabase.from('question_options').select('id')

    const { data: linksCheck } = await supabase.from('quiz_questions').select('id')

    console.log(`Questions in database: ${questionsCheck ? questionsCheck.length : 0}`)
    console.log(`Options in database: ${optionsCheck ? optionsCheck.length : 0}`)
    console.log(`Quiz links in database: ${linksCheck ? linksCheck.length : 0}`)

    if (questionsCheck && questionsCheck.length === stats.questionsCreated) {
      console.log('\n✅ Migration verified successfully!')
      console.log('🎉 All quiz data has been migrated to the new architecture!')
      console.log('   The frontend should now be able to display and use all quizzes.')
    } else {
      console.log('\n⚠️  Migration verification mismatch!')
      console.log(
        `   Expected ${stats.questionsCreated} questions, found ${questionsCheck ? questionsCheck.length : 0}`
      )
    }
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error)
    throw error
  }
}

// Run the migration
migrateAllQuizzes()
  .then(() => {
    console.log('\n✅ Migration script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error)
    process.exit(1)
  })
