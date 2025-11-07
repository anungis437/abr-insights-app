/**
 * Enhanced Courses Service
 * 
 * Service layer for world-class course management including:
 * - Course modules and structured content
 * - Enhanced enrollments with certificates
 * - Progress tracking across lessons
 * - Course discussions and Q&A
 * - Learning paths
 * - Bilingual content support (EN/FR)
 * - CE credit tracking
 * 
 * Canadian Standards: WCAG 2.1 AA, PIPEDA, AODA compliance
 */

import { createClient } from '@/lib/supabase/client';
import type {
  CourseModule,
  CourseVersion,
  LearningPath,
  CourseDiscussion,
  LearningPathEnrollment,
  Enrollment,
  LessonProgress,
  QuizAttempt,
  CourseModuleWithLessons,
  EnrollmentWithProgress,
} from '@/lib/types/courses';

// ============================================================================
// COURSE MODULES
// ============================================================================

/**
 * Get all modules for a course with their lessons
 */
export async function getCourseModules(courseId: string): Promise<CourseModuleWithLessons[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('course_modules')
    .select(`
      *,
      lessons:lessons(*)
    `)
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });
  
  if (error) throw error;
  return data as CourseModuleWithLessons[];
}

/**
 * Create a new course module
 */
export async function createCourseModule(module: Partial<CourseModule>): Promise<CourseModule> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('course_modules')
    .insert(module)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Update a course module
 */
export async function updateCourseModule(
  moduleId: string,
  updates: Partial<CourseModule>
): Promise<CourseModule> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('course_modules')
    .update(updates)
    .eq('id', moduleId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Reorder course modules
 */
export async function reorderCourseModules(
  courseId: string,
  moduleOrders: { id: string; order_index: number }[]
): Promise<void> {
  const supabase = createClient();
  
  // Update each module's order
  const promises = moduleOrders.map(({ id, order_index }) =>
    supabase
      .from('course_modules')
      .update({ order_index })
      .eq('id', id)
      .eq('course_id', courseId)
  );
  
  await Promise.all(promises);
}

// ============================================================================
// ENROLLMENTS
// ============================================================================

/**
 * Enroll a user in a course
 */
export async function enrollInCourse(
  userId: string,
  courseId: string,
  learningPathId?: string,
  enrollmentSource?: string
): Promise<Enrollment> {
  const supabase = createClient();
  
  const enrollment = {
    user_id: userId,
    course_id: courseId,
    learning_path_id: learningPathId,
    enrollment_source: enrollmentSource || 'direct',
    enrollment_date: new Date().toISOString(),
    status: 'active',
    progress_percentage: 0,
  };
  
  const { data, error } = await supabase
    .from('enrollments')
    .insert(enrollment)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Get user's enrollment with progress details
 */
export async function getUserEnrollment(
  userId: string,
  courseId: string
): Promise<EnrollmentWithProgress | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      course:courses(*),
      lesson_progress:lesson_progress(*)
    `)
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return data as EnrollmentWithProgress;
}

/**
 * Get all enrollments for a user
 */
export async function getUserEnrollments(userId: string): Promise<EnrollmentWithProgress[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      course:courses(*)
    `)
    .eq('user_id', userId)
    .order('enrollment_date', { ascending: false });
  
  if (error) throw error;
  return data as EnrollmentWithProgress[];
}

/**
 * Update enrollment progress
 */
export async function updateEnrollmentProgress(
  enrollmentId: string,
  progressPercentage: number
): Promise<void> {
  const supabase = createClient();
  
  const updates: Partial<Enrollment> = {
    progress_percentage: progressPercentage,
    last_accessed_at: new Date().toISOString(),
  };
  
  // If completed, mark as such
  if (progressPercentage >= 100) {
    updates.status = 'completed';
    updates.completed_at = new Date().toISOString();
  }
  
  const { error } = await supabase
    .from('enrollments')
    .update(updates)
    .eq('id', enrollmentId);
  
  if (error) throw error;
}

/**
 * Calculate course completion percentage
 */
export async function calculateCourseCompletion(
  userId: string,
  courseId: string
): Promise<number> {
  const supabase = createClient();
  
  // Get all lessons for the course
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id')
    .eq('course_id', courseId);
  
  if (!lessons || lessons.length === 0) return 0;
  
  // Get completed lessons
  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .in('lesson_id', lessons.map(l => l.id));
  
  const completedCount = progress?.length || 0;
  return Math.round((completedCount / lessons.length) * 100);
}

// ============================================================================
// LESSON PROGRESS
// ============================================================================

/**
 * Track lesson progress
 */
export async function trackLessonProgress(
  userId: string,
  lessonId: string,
  enrollmentId: string,
  progress: Partial<LessonProgress>
): Promise<LessonProgress> {
  const supabase = createClient();
  
  // Try to update existing progress first
  const { data: existing } = await supabase
    .from('lesson_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single();
  
  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('lesson_progress')
      .update(progress)
      .eq('id', existing.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    // Create new
    const newProgress = {
      user_id: userId,
      lesson_id: lessonId,
      enrollment_id: enrollmentId,
      ...progress,
    };
    
    const { data, error } = await supabase
      .from('lesson_progress')
      .insert(newProgress)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

/**
 * Get lesson progress for a user
 */
export async function getLessonProgress(
  userId: string,
  lessonId: string
): Promise<LessonProgress | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data;
}

/**
 * Mark lesson as completed
 */
export async function completeLessonProgress(
  userId: string,
  lessonId: string,
  enrollmentId: string
): Promise<void> {
  const supabase = createClient();
  
  await trackLessonProgress(userId, lessonId, enrollmentId, {
    status: 'completed',
    progress_percentage: 100,
    completed_at: new Date().toISOString(),
  });
  
  // Recalculate course progress
  const { data: lesson } = await supabase
    .from('lessons')
    .select('course_id')
    .eq('id', lessonId)
    .single();
  
  if (lesson) {
    const courseProgress = await calculateCourseCompletion(userId, lesson.course_id);
    await updateEnrollmentProgress(enrollmentId, courseProgress);
  }
}

// ============================================================================
// QUIZ ATTEMPTS
// ============================================================================

/**
 * Submit a quiz attempt
 */
export async function submitQuizAttempt(
  userId: string,
  quizId: string,
  lessonId: string,
  enrollmentId: string,
  answers: Record<string, any>,
  score: number,
  passed: boolean
): Promise<QuizAttempt> {
  const supabase = createClient();
  
  // Get previous attempts count
  const { data: previousAttempts } = await supabase
    .from('quiz_attempts')
    .select('attempt_number')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .order('attempt_number', { ascending: false })
    .limit(1);
  
  const attemptNumber = previousAttempts && previousAttempts.length > 0
    ? previousAttempts[0].attempt_number + 1
    : 1;
  
  const attempt: Partial<QuizAttempt> = {
    user_id: userId,
    quiz_id: quizId,
    lesson_id: lessonId,
    enrollment_id: enrollmentId,
    attempt_number: attemptNumber,
    answers,
    score,
    percentage: score,
    passed,
    passing_score_percentage: 70, // Default passing score
    submitted_at: new Date().toISOString(),
  };
  
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert(attempt)
    .select()
    .single();
  
  if (error) throw error;
  
  // Update enrollment quiz stats
  await updateEnrollmentQuizStats(enrollmentId, passed);
  
  return data;
}

/**
 * Update enrollment quiz statistics
 */
async function updateEnrollmentQuizStats(enrollmentId: string, passed: boolean): Promise<void> {
  const supabase = createClient();
  
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('quizzes_passed, quizzes_failed')
    .eq('id', enrollmentId)
    .single();
  
  if (enrollment) {
    const updates = {
      quizzes_passed: passed ? (enrollment.quizzes_passed || 0) + 1 : enrollment.quizzes_passed,
      quizzes_failed: !passed ? (enrollment.quizzes_failed || 0) + 1 : enrollment.quizzes_failed,
    };
    
    await supabase
      .from('enrollments')
      .update(updates)
      .eq('id', enrollmentId);
  }
}

/**
 * Get quiz attempts for a user and quiz
 */
export async function getQuizAttempts(
  userId: string,
  quizId: string
): Promise<QuizAttempt[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .order('attempt_number', { ascending: false });
  
  if (error) throw error;
  return data;
}

// ============================================================================
// COURSE DISCUSSIONS
// ============================================================================

/**
 * Create a discussion post
 */
export async function createDiscussion(
  userId: string,
  courseId: string,
  content: string,
  title?: string,
  lessonId?: string,
  discussionType: 'question' | 'discussion' | 'announcement' = 'discussion'
): Promise<CourseDiscussion> {
  const supabase = createClient();
  
  const discussion: Partial<CourseDiscussion> = {
    user_id: userId,
    course_id: courseId,
    lesson_id: lessonId,
    content,
    title,
    discussion_type: discussionType,
  };
  
  const { data, error } = await supabase
    .from('course_discussions')
    .insert(discussion)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Reply to a discussion
 */
export async function replyToDiscussion(
  userId: string,
  parentId: string,
  content: string
): Promise<CourseDiscussion> {
  const supabase = createClient();
  
  // Get parent discussion to inherit course_id
  const { data: parent } = await supabase
    .from('course_discussions')
    .select('course_id, lesson_id')
    .eq('id', parentId)
    .single();
  
  if (!parent) throw new Error('Parent discussion not found');
  
  const reply: Partial<CourseDiscussion> = {
    user_id: userId,
    course_id: parent.course_id,
    lesson_id: parent.lesson_id,
    parent_id: parentId,
    content,
    discussion_type: 'reply',
  };
  
  const { data, error } = await supabase
    .from('course_discussions')
    .insert(reply)
    .select()
    .single();
  
  if (error) throw error;
  
  // Increment parent's reply count
  await supabase.rpc('increment_discussion_replies', { discussion_id: parentId });
  
  return data;
}

/**
 * Get discussions for a course
 */
export async function getCourseDiscussions(
  courseId: string,
  lessonId?: string,
  limit = 20
): Promise<CourseDiscussion[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('course_discussions')
    .select(`
      *,
      user:profiles(id, display_name, email)
    `)
    .eq('course_id', courseId)
    .is('parent_id', null); // Top-level posts only
  
  if (lessonId) {
    query = query.eq('lesson_id', lessonId);
  }
  
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

/**
 * Get replies for a discussion
 */
export async function getDiscussionReplies(parentId: string): Promise<CourseDiscussion[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('course_discussions')
    .select(`
      *,
      user:profiles(id, display_name, email)
    `)
    .eq('parent_id', parentId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
}

/**
 * Mark discussion as answered (for questions)
 */
export async function markDiscussionAsAnswered(
  discussionId: string,
  bestAnswerId: string,
  markedBy: string
): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('course_discussions')
    .update({
      is_answered: true,
      best_answer_id: bestAnswerId,
      marked_as_answer_at: new Date().toISOString(),
      marked_by: markedBy,
    })
    .eq('id', discussionId);
  
  if (error) throw error;
}

// ============================================================================
// LEARNING PATHS
// ============================================================================

/**
 * Get all published learning paths
 */
export async function getLearningPaths(): Promise<LearningPath[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('learning_paths')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

/**
 * Get learning path with courses
 */
export async function getLearningPath(pathId: string): Promise<LearningPath | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('learning_paths')
    .select(`
      *,
      courses:courses(*)
    `)
    .eq('id', pathId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data;
}

/**
 * Enroll in a learning path
 */
export async function enrollInLearningPath(
  userId: string,
  pathId: string
): Promise<LearningPathEnrollment> {
  const supabase = createClient();
  
  const enrollment: Partial<LearningPathEnrollment> = {
    user_id: userId,
    learning_path_id: pathId,
    progress_percentage: 0,
  };
  
  const { data, error } = await supabase
    .from('learning_path_enrollments')
    .insert(enrollment)
    .select()
    .single();
  
  if (error) throw error;
  
  // Enroll user in all courses in the path
  const path = await getLearningPath(pathId);
  if (path?.course_sequence) {
    const enrollmentPromises = path.course_sequence.map(item =>
      enrollInCourse(userId, item.course_id, pathId, 'learning_path')
    );
    await Promise.all(enrollmentPromises);
  }
  
  return data;
}

/**
 * Get user's learning path progress
 */
export async function getLearningPathProgress(
  userId: string,
  pathId: string
): Promise<LearningPathEnrollment | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('learning_path_enrollments')
    .select('*')
    .eq('user_id', userId)
    .eq('learning_path_id', pathId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data;
}
