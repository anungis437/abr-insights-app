-- Check schemas of unrestricted tables to determine correct column names for RLS policies

-- Tables that had RLS disabled
SELECT 
    'achievements' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'achievements'
ORDER BY ordinal_position;

SELECT 
    'bookmarks' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'bookmarks'
ORDER BY ordinal_position;

SELECT 
    'learning_streaks' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'learning_streaks'
ORDER BY ordinal_position;

SELECT 
    'quiz_attempts' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'quiz_attempts'
ORDER BY ordinal_position;

SELECT 
    'quiz_responses' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'quiz_responses'
ORDER BY ordinal_position;

SELECT 
    'user_achievements' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_achievements'
ORDER BY ordinal_position;

SELECT 
    'user_skills' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_skills'
ORDER BY ordinal_position;

SELECT 
    'instructor_communications' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'instructor_communications'
ORDER BY ordinal_position;

SELECT 
    'instructor_earnings' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'instructor_earnings'
ORDER BY ordinal_position;

SELECT 
    'instructor_profiles' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'instructor_profiles'
ORDER BY ordinal_position;

SELECT 
    'course_instructors' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'course_instructors'
ORDER BY ordinal_position;

SELECT 
    'course_workflow_reviews' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'course_workflow_reviews'
ORDER BY ordinal_position;

SELECT 
    'quizzes' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'quizzes'
ORDER BY ordinal_position;
